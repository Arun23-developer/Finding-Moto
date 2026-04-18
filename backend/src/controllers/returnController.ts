import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import ReturnRequest, {
  RETURN_REASONS,
  RETURN_REQUEST_STATUSES,
  type ReturnReason,
  type ReturnRequestStatus,
} from '../models/ReturnRequest';
import User from '../models/User';
import { normalizeOrderStatus } from '../utils/orderStatus';
import { emitReturnWorkflowEvent } from '../utils/returnWorkflowEvents';

const RETURN_STATUS_TRANSITIONS: Record<ReturnRequestStatus, ReturnRequestStatus[]> = {
  RETURN_REQUESTED: ['RETURN_APPROVED', 'RETURN_REJECTED'],
  RETURN_APPROVED: ['RETURN_PICKUP_ASSIGNED'],
  RETURN_REJECTED: [],
  RETURN_PICKUP_ASSIGNED: ['RETURN_PICKED_UP'],
  RETURN_PICKED_UP: ['RETURN_IN_TRANSIT'],
  RETURN_IN_TRANSIT: ['RETURN_DELIVERED'],
  RETURN_DELIVERED: ['REFUND_INITIATED'],
  REFUND_INITIATED: ['REFUND_COMPLETED'],
  REFUND_COMPLETED: [],
};

const formatReturnRequest = (returnRequest: any) => ({
  _id: returnRequest._id,
  order: returnRequest.order,
  buyer: returnRequest.buyer,
  seller: returnRequest.seller,
  assigned_agent_id: returnRequest.assigned_agent_id || null,
  reason: returnRequest.reason,
  referencePhotos: returnRequest.referencePhotos || [],
  bankDetails: returnRequest.bankDetails,
  pickupAddress: returnRequest.pickupAddress,
  comments: returnRequest.comments || '',
  status: returnRequest.status,
  statusHistory: returnRequest.statusHistory || [],
  createdAt: returnRequest.createdAt,
  updatedAt: returnRequest.updatedAt,
});

const getActorRole = (role: string): 'seller' | 'mechanic' => (role === 'mechanic' ? 'mechanic' : 'seller');

export const createReturnRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyerId = req.user!._id;
    const {
      orderId,
      reason,
      accountHolderName,
      bankName,
      accountNumber,
      branchName,
      ifscOrSwiftCode,
      fullAddress,
      city,
      district,
      postalCode,
      comments,
    } = req.body as Record<string, string | undefined>;

    const photos = Array.isArray(req.files) ? req.files : [];

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({ success: false, message: 'A valid order is required' });
      return;
    }

    if (!reason || !RETURN_REASONS.includes(reason as ReturnReason)) {
      res.status(400).json({ success: false, message: 'Please select a valid return reason' });
      return;
    }

    if (!photos.length) {
      res.status(400).json({ success: false, message: 'At least one reference photo is required' });
      return;
    }

    const requiredFields = [
      { key: accountHolderName, label: 'Account holder name' },
      { key: bankName, label: 'Bank name' },
      { key: accountNumber, label: 'Account number' },
      { key: fullAddress, label: 'Pickup address' },
      { key: city, label: 'City' },
      { key: district, label: 'District' },
      { key: postalCode, label: 'Postal code' },
    ];

    const missingField = requiredFields.find((field) => !field.key?.trim());
    if (missingField) {
      res.status(400).json({ success: false, message: `${missingField.label} is required` });
      return;
    }

    const [order, existingRequest] = await Promise.all([
      Order.findOne({ _id: orderId, buyer: buyerId }),
      ReturnRequest.findOne({ order: orderId, buyer: buyerId }),
    ]);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (normalizeOrderStatus(order.status) !== 'delivered') {
      res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
      return;
    }

    if (existingRequest) {
      res.status(400).json({ success: false, message: 'A return request already exists for this order' });
      return;
    }

    const referencePhotos = photos.map((file: Express.Multer.File) => `/uploads/returns/${file.filename}`);

    const returnRequest = await ReturnRequest.create({
      order: order._id,
      buyer: buyerId,
      seller: order.seller,
      reason,
      referencePhotos,
      bankDetails: {
        accountHolderName: accountHolderName!.trim(),
        bankName: bankName!.trim(),
        accountNumber: accountNumber!.trim(),
        branchName: branchName?.trim() || '',
        ifscOrSwiftCode: ifscOrSwiftCode?.trim() || '',
      },
      pickupAddress: {
        fullAddress: fullAddress!.trim(),
        city: city!.trim(),
        district: district!.trim(),
        postalCode: postalCode!.trim(),
      },
      comments: comments?.trim() || '',
      status: 'RETURN_REQUESTED',
      statusHistory: [
        {
          status: 'RETURN_REQUESTED',
          changedAt: new Date(),
          note: 'Return request submitted by buyer',
        },
      ],
    });

    const seller = await User.findById(order.seller).select('role');
    const sellerAudience = seller?.role === 'mechanic' ? 'mechanic' : 'seller';

    emitReturnWorkflowEvent({
      userId: String(order.buyer),
      audience: 'buyer',
      returnRequestId: returnRequest._id.toString(),
      orderId: order._id.toString(),
      status: 'RETURN_REQUESTED',
      title: 'Return request submitted',
      message: 'Your return request has been submitted successfully',
      actorRole: 'buyer',
    });

    emitReturnWorkflowEvent({
      userId: String(order.seller),
      audience: sellerAudience,
      returnRequestId: returnRequest._id.toString(),
      orderId: order._id.toString(),
      status: 'RETURN_REQUESTED',
      title: 'New return request',
      message: 'A buyer has submitted a return request for a delivered order',
      actorRole: 'buyer',
    });

    res.status(201).json({ success: true, data: formatReturnRequest(returnRequest) });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(400).json({ success: false, message: 'A return request already exists for this order' });
      return;
    }
    console.error('createReturnRequest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBuyerReturnRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const returns = await ReturnRequest.find({ buyer: req.user!._id })
      .sort({ createdAt: -1 })
      .populate('order', 'items totalAmount status createdAt')
      .populate('seller', 'firstName lastName shopName workshopName role')
      .lean();

    res.json({ success: true, data: returns.map(formatReturnRequest) });
  } catch (error) {
    console.error('getBuyerReturnRequests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getManagedReturnRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const returns = await ReturnRequest.find({ seller: req.user!._id })
      .sort({ createdAt: -1 })
      .populate('order', 'items totalAmount status shippingAddress paymentMethod createdAt')
      .populate('buyer', 'firstName lastName email phone address city postCode')
      .lean();

    res.json({ success: true, data: returns.map(formatReturnRequest) });
  } catch (error) {
    console.error('getManagedReturnRequests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateReturnRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note } = req.body as { status?: ReturnRequestStatus; note?: string };

    if (!status || !RETURN_REQUEST_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid return request status' });
      return;
    }

    const returnRequest = await ReturnRequest.findOne({ _id: id, seller: req.user!._id });
    if (!returnRequest) {
      res.status(404).json({ success: false, message: 'Return request not found' });
      return;
    }

    if (!RETURN_STATUS_TRANSITIONS[returnRequest.status].includes(status)) {
      res.status(400).json({
        success: false,
        message: `Cannot transition from ${returnRequest.status} to ${status}`,
      });
      return;
    }

    returnRequest.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note?.trim() || `Status updated to ${status}`,
    });
    returnRequest.status = status;
    await returnRequest.save();

    const actorRole = getActorRole(req.user!.role);

    emitReturnWorkflowEvent({
      userId: String(returnRequest.buyer),
      audience: 'buyer',
      returnRequestId: returnRequest._id.toString(),
      orderId: returnRequest.order.toString(),
      status,
      title: 'Return status updated',
      message:
        status === 'RETURN_APPROVED'
          ? 'Your return request has been approved'
          : status === 'RETURN_REJECTED'
          ? 'Your return request has been rejected'
          : `Your return request is now ${status.replace(/_/g, ' ').toLowerCase()}`,
      actorRole,
    });

    emitReturnWorkflowEvent({
      userId: String(returnRequest.seller),
      audience: actorRole,
      returnRequestId: returnRequest._id.toString(),
      orderId: returnRequest.order.toString(),
      status,
      title: 'Return status updated',
      message: `Return request updated to ${status.replace(/_/g, ' ')}`,
      actorRole,
    });

    res.json({ success: true, data: formatReturnRequest(returnRequest) });
  } catch (error) {
    console.error('updateReturnRequestStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAvailableDeliveryAgents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agents = await User.find({
      role: 'delivery_agent',
      isActive: true,
      isEmailVerified: true,
      agent_status: 'ENABLED',
      work_status: 'AVAILABLE',
    })
      .select('firstName lastName email phone vehicleType vehicleNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: agents.map((agent: any) => ({
        _id: agent._id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        fullName: `${agent.firstName || ''} ${agent.lastName || ''}`.trim(),
        email: agent.email,
        phone: agent.phone || '',
        vehicleType: agent.vehicleType || '',
        vehicleNumber: agent.vehicleNumber || '',
      })),
    });
  } catch (error) {
    console.error('getAvailableDeliveryAgents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const assignReturnDeliveryAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { agentId, note } = req.body as { agentId?: string; note?: string };

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid return request ID' });
      return;
    }

    if (!agentId || !mongoose.Types.ObjectId.isValid(agentId)) {
      res.status(400).json({ success: false, message: 'Agent ID is required' });
      return;
    }

    const [returnRequest, agent] = await Promise.all([
      ReturnRequest.findOne({ _id: id, seller: req.user!._id }),
      User.findById(agentId).select(
        'firstName lastName role isActive isEmailVerified agent_status work_status vehicleType vehicleNumber'
      ),
    ]);

    if (!returnRequest) {
      res.status(404).json({ success: false, message: 'Return request not found' });
      return;
    }

    if (returnRequest.status !== 'RETURN_APPROVED') {
      res.status(400).json({
        success: false,
        message: 'Delivery agent can only be assigned to approved return requests',
      });
      return;
    }

    if (
      !agent ||
      agent.role !== 'delivery_agent' ||
      !agent.isActive ||
      !agent.isEmailVerified ||
      agent.agent_status !== 'ENABLED' ||
      agent.work_status !== 'AVAILABLE'
    ) {
      res.status(400).json({ success: false, message: 'Invalid or unavailable delivery agent' });
      return;
    }

    returnRequest.assigned_agent_id = agent._id as mongoose.Types.ObjectId;
    returnRequest.statusHistory.push({
      status: 'RETURN_PICKUP_ASSIGNED',
      changedAt: new Date(),
      note: note?.trim() || `Assigned to delivery agent ${agent.firstName || ''} ${agent.lastName || ''}`.trim(),
    });
    returnRequest.status = 'RETURN_PICKUP_ASSIGNED';
    await returnRequest.save();

    const actorRole = getActorRole(req.user!.role);
    const agentName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Delivery agent';
    const returnRequestId = returnRequest._id.toString();
    const orderId = returnRequest.order.toString();

    emitReturnWorkflowEvent({
      userId: String(returnRequest.buyer),
      audience: 'buyer',
      returnRequestId,
      orderId,
      status: 'RETURN_PICKUP_ASSIGNED',
      title: 'Delivery agent assigned for pickup',
      message: `${agentName} has been assigned to pick up your return package`,
      actorRole,
    });

    emitReturnWorkflowEvent({
      userId: String(returnRequest.seller),
      audience: actorRole,
      returnRequestId,
      orderId,
      status: 'RETURN_PICKUP_ASSIGNED',
      title: 'Delivery agent assigned',
      message: `${agentName} has been assigned for return pickup`,
      actorRole,
    });

    emitReturnWorkflowEvent({
      userId: String(agent._id),
      audience: 'delivery_agent',
      returnRequestId,
      orderId,
      status: 'RETURN_PICKUP_ASSIGNED',
      title: 'New return pickup assigned',
      message: `You have been assigned a return pickup from ${returnRequest.pickupAddress.city}`,
      actorRole: 'seller',
    });

    res.json({
      success: true,
      data: {
        ...formatReturnRequest(returnRequest),
        assigned_agent_id: agent._id,
        assigned_agent: {
          _id: agent._id,
          firstName: agent.firstName,
          lastName: agent.lastName,
          fullName: agentName,
          vehicleType: agent.vehicleType,
          vehicleNumber: agent.vehicleNumber,
        },
      },
    });
  } catch (error) {
    console.error('assignReturnDeliveryAgent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDeliveryAgentReturnPickups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'delivery_agent') {
      res.status(403).json({ success: false, message: 'Only delivery agents can view their pickups' });
      return;
    }

    const returns = await ReturnRequest.find({
      assigned_agent_id: req.user!._id,
      status: { $in: ['RETURN_PICKUP_ASSIGNED', 'RETURN_PICKED_UP', 'RETURN_IN_TRANSIT'] },
    })
      .sort({ createdAt: -1 })
      .populate('order', 'items totalAmount')
      .populate('buyer', 'firstName lastName email phone address city postCode')
      .populate('seller', 'firstName lastName shopName workshopName role')
      .lean();

    res.json({ success: true, data: returns.map(formatReturnRequest) });
  } catch (error) {
    console.error('getDeliveryAgentReturnPickups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateDeliveryAgentReturnStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note } = req.body as { status?: ReturnRequestStatus; note?: string };

    if (!status || !RETURN_REQUEST_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid return request status' });
      return;
    }

    if (req.user!.role !== 'delivery_agent') {
      res.status(403).json({ success: false, message: 'Only delivery agents can update return status' });
      return;
    }

    const returnRequest = await ReturnRequest.findOne({ _id: id, assigned_agent_id: req.user!._id });
    if (!returnRequest) {
      res.status(404).json({ success: false, message: 'Return request not found or not assigned to you' });
      return;
    }

    // Delivery agent can only update: PICKED_UP, IN_TRANSIT
    const allowedStatuses = ['RETURN_PICKED_UP', 'RETURN_IN_TRANSIT'];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Delivery agent can only update to PICKED_UP or IN_TRANSIT status',
      });
      return;
    }

    if (!RETURN_STATUS_TRANSITIONS[returnRequest.status].includes(status)) {
      res.status(400).json({
        success: false,
        message: `Cannot transition from ${returnRequest.status} to ${status}`,
      });
      return;
    }

    returnRequest.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note?.trim() || `Status updated to ${status}`,
    });
    returnRequest.status = status;
    await returnRequest.save();

    const agent = await User.findById(req.user!._id).select('firstName lastName');
    const agentName = `${agent?.firstName || ''} ${agent?.lastName || ''}`.trim() || 'Delivery agent';
    const returnRequestId = returnRequest._id.toString();
    const orderId = returnRequest.order.toString();

    emitReturnWorkflowEvent({
      userId: String(returnRequest.buyer),
      audience: 'buyer',
      returnRequestId,
      orderId,
      status,
      title: 'Return pickup status updated',
      message: `Your return package is now ${status.replace(/_/g, ' ').toLowerCase()}`,
      actorRole: 'delivery_agent',
    });

    emitReturnWorkflowEvent({
      userId: String(returnRequest.seller),
      audience: getActorRole(returnRequest.seller.toString()),
      returnRequestId,
      orderId,
      status,
      title: 'Return pickup status updated',
      message: `Return package is now ${status.replace(/_/g, ' ').toLowerCase()} by ${agentName}`,
      actorRole: 'delivery_agent',
    });

    res.json({ success: true, data: formatReturnRequest(returnRequest) });
  } catch (error) {
    console.error('updateDeliveryAgentReturnStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const completeReturnDelivery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user!.role !== 'delivery_agent') {
      res.status(403).json({ success: false, message: 'Only delivery agents can mark returns as delivered' });
      return;
    }

    const returnRequest = await ReturnRequest.findOne({ _id: id, assigned_agent_id: req.user!._id });
    if (!returnRequest) {
      res.status(404).json({ success: false, message: 'Return request not found or not assigned to you' });
      return;
    }

    if (returnRequest.status !== 'RETURN_IN_TRANSIT') {
      res.status(400).json({
        success: false,
        message: 'Return package must be in transit before marking as delivered',
      });
      return;
    }

    returnRequest.statusHistory.push({
      status: 'RETURN_DELIVERED',
      changedAt: new Date(),
      note: 'Return package delivered to seller/mechanic',
    });
    returnRequest.status = 'RETURN_DELIVERED';
    await returnRequest.save();

    const agent = await User.findById(req.user!._id).select('firstName lastName');
    const agentName = `${agent?.firstName || ''} ${agent?.lastName || ''}`.trim() || 'Delivery agent';
    const returnRequestId = returnRequest._id.toString();
    const orderId = returnRequest.order.toString();

    emitReturnWorkflowEvent({
      userId: String(returnRequest.buyer),
      audience: 'buyer',
      returnRequestId,
      orderId,
      status: 'RETURN_DELIVERED',
      title: 'Return package delivered',
      message: 'Your return package has been delivered to the seller/mechanic',
      actorRole: 'delivery_agent',
    });

    emitReturnWorkflowEvent({
      userId: String(returnRequest.seller),
      audience: getActorRole(returnRequest.seller.toString()),
      returnRequestId,
      orderId,
      status: 'RETURN_DELIVERED',
      title: 'Return package received',
      message: `Return package has been delivered by ${agentName}`,
      actorRole: 'delivery_agent',
    });

    res.json({ success: true, data: formatReturnRequest(returnRequest) });
  } catch (error) {
    console.error('completeReturnDelivery error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
