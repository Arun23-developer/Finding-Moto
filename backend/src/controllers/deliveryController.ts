import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Delivery, { DELIVERY_STATUSES, DeliveryStatus } from '../models/Delivery';
import Order from '../models/Order';
import User from '../models/User';
import { normalizeOrderStatus, getOrderStatusLabel } from '../utils/orderStatus';
import { emitOrderWorkflowEvent } from '../utils/orderWorkflowEvents';

const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  ASSIGNED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: [],
};

const formatDelivery = (delivery: any) => ({
  _id: delivery._id,
  orderId: delivery.orderId?._id || delivery.orderId,
  agentId: delivery.agentId?._id || delivery.agentId,
  status: delivery.status,
  statusHistory: delivery.statusHistory || [],
  deliveredAt: delivery.deliveredAt || null,
  createdAt: delivery.createdAt,
  updatedAt: delivery.updatedAt,
});

export const getDeliveryAgents = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agents = await User.find({
      role: 'delivery_agent',
      approvalStatus: 'approved',
      agent_status: 'ENABLED',
      active_status: { $ne: 'DISABLED' },
      isActive: true,
      isEmailVerified: true,
    })
      .select('firstName lastName email phone')
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
      })),
    });
  } catch (error) {
    console.error('getDeliveryAgents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const assignDelivery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId: requestedOrderId, agentId } = req.body as { orderId?: string; agentId?: string };

    if (!requestedOrderId || !agentId) {
      res.status(400).json({ success: false, message: 'Order ID and agent ID are required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(requestedOrderId) || !mongoose.Types.ObjectId.isValid(agentId)) {
      res.status(400).json({ success: false, message: 'Invalid order or agent ID' });
      return;
    }

    const [order, agent, existingDelivery] = await Promise.all([
      Order.findById(requestedOrderId),
      User.findById(agentId).select('firstName lastName role approvalStatus agent_status active_status isActive isEmailVerified'),
      Delivery.findOne({ orderId: requestedOrderId }),
    ]);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (req.user!.role !== 'admin' && order.seller.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to assign this order' });
      return;
    }

    if (
      !agent ||
      agent.role !== 'delivery_agent' ||
      agent.approvalStatus !== 'approved' ||
      agent.agent_status !== 'ENABLED' ||
      agent.active_status === 'DISABLED' ||
      !agent.isActive ||
      !agent.isEmailVerified
    ) {
      res.status(400).json({ success: false, message: 'Invalid delivery agent' });
      return;
    }

    const currentOrderStatus = normalizeOrderStatus(order.status);
    if (currentOrderStatus !== 'ready_for_dispatch') {
      res.status(400).json({
        success: false,
        message: `Only orders marked as ${getOrderStatusLabel('ready_for_dispatch')} can be assigned for delivery`,
      });
      return;
    }

    if (existingDelivery) {
      res.status(400).json({ success: false, message: 'Delivery already assigned for this order' });
      return;
    }

    const delivery = await Delivery.create({
      orderId: order._id,
      agentId: agent._id,
      status: 'ASSIGNED',
      statusHistory: [{ status: 'ASSIGNED', changedAt: new Date() }],
    });

    order.statusHistory.push({
      status: order.status,
      changedAt: new Date(),
      note: `Assigned to delivery agent ${agent.firstName || ''} ${agent.lastName || ''}`.trim(),
    });
    order.status = 'pickup_assigned';
    await order.save();

    const orderId = order._id.toString();
    const buyerUserId = order.buyer.toString();
    const sellerUserId = order.seller.toString();
    const agentUserId = agent._id.toString();
    const agentName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Delivery agent';

    emitOrderWorkflowEvent({
      userId: buyerUserId,
      audience: 'buyer',
      orderId,
      status: 'pickup_assigned',
      title: 'Delivery agent assigned',
      message: 'A delivery agent has been assigned to your order',
      actorRole: 'seller',
    });

    emitOrderWorkflowEvent({
      userId: sellerUserId,
      audience: 'seller',
      orderId,
      status: 'pickup_assigned',
      title: 'Delivery assigned',
      message: `${agentName} has been assigned for pickup`,
      actorRole: 'seller',
    });

    emitOrderWorkflowEvent({
      userId: agentUserId,
      audience: 'delivery_agent',
      orderId,
      status: 'pickup_assigned',
      title: 'New Pickup Request',
      message: 'You have a new Pickup Request from Seller',
      actorRole: 'seller',
    });

    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('agentId', 'firstName lastName email phone')
      .populate('orderId', 'buyer seller items totalAmount status shippingAddress paymentMethod createdAt');

    res.status(201).json({
      success: true,
      data: formatDelivery(populatedDelivery),
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(400).json({ success: false, message: 'Delivery already assigned for this order' });
      return;
    }
    console.error('assignDelivery error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDeliveryByOrderId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params as { orderId?: string };
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({ success: false, message: 'Invalid order id' });
      return;
    }

    const order = await Order.findById(orderId).select('seller');
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (req.user!.role !== 'admin' && order.seller.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to view this delivery' });
      return;
    }

    const delivery = await Delivery.findOne({ orderId })
      .populate('agentId', 'firstName lastName email phone role')
      .lean();

    if (!delivery) {
      res.status(404).json({ success: false, message: 'Delivery not found' });
      return;
    }

    res.json({ success: true, data: formatDelivery(delivery) });
  } catch (error) {
    console.error('getDeliveryByOrderId error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMyDeliveries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deliveries = await Delivery.find({ agentId: req.user!._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'orderId',
        select: 'buyer items totalAmount shippingAddress paymentMethod createdAt status',
        populate: {
          path: 'buyer',
          select: 'firstName lastName phone address',
        },
      })
      .lean();

    res.json({
      success: true,
      data: deliveries.map((delivery: any) => ({
        ...formatDelivery(delivery),
        order: delivery.orderId
          ? {
              _id: delivery.orderId._id,
              items: delivery.orderId.items || [],
              totalAmount: delivery.orderId.totalAmount,
              status: delivery.orderId.status,
              shippingAddress: delivery.orderId.shippingAddress,
              paymentMethod: delivery.orderId.paymentMethod,
              createdAt: delivery.orderId.createdAt,
              buyer: delivery.orderId.buyer
                ? {
                    firstName: delivery.orderId.buyer.firstName,
                    lastName: delivery.orderId.buyer.lastName,
                    phone: delivery.orderId.buyer.phone || '',
                    address: delivery.orderId.buyer.address || delivery.orderId.shippingAddress,
                  }
                : null,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('getMyDeliveries error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateDeliveryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: DeliveryStatus };

    if (!status || !DELIVERY_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid delivery status' });
      return;
    }

    const delivery = await Delivery.findOne({ _id: id, agentId: req.user!._id });
    if (!delivery) {
      res.status(404).json({ success: false, message: 'Delivery not found' });
      return;
    }

    if (!DELIVERY_TRANSITIONS[delivery.status].includes(status)) {
      res.status(400).json({
        success: false,
        message: `Cannot transition from ${delivery.status} to ${status}`,
      });
      return;
    }

    delivery.statusHistory.push({ status, changedAt: new Date() });
    delivery.status = status;
    if (status === 'DELIVERED') {
      delivery.deliveredAt = new Date();
    }
    await delivery.save();

    const order = await Order.findById(delivery.orderId);
    if (order) {
      const currentOrderStatus = normalizeOrderStatus(order.status);
      const orderId = order._id.toString();
      const buyerUserId = order.buyer.toString();
      const sellerUserId = order.seller.toString();

      if (status === 'PICKED_UP' && currentOrderStatus !== 'picked_up') {
        order.statusHistory.push({ status: order.status, changedAt: new Date(), note: 'Collected by delivery agent' });
        order.status = 'picked_up';
        await order.save();
        emitOrderWorkflowEvent({
          userId: buyerUserId,
          audience: 'buyer',
          orderId,
          status: 'picked_up',
          title: 'Order picked up',
          message: 'Your order has been picked up',
          actorRole: 'delivery_agent',
        });
        emitOrderWorkflowEvent({
          userId: sellerUserId,
          audience: 'seller',
          orderId,
          status: 'picked_up',
          title: 'Order picked up',
          message: 'Delivery agent has picked up the order',
          actorRole: 'delivery_agent',
        });
      } else if (status === 'IN_TRANSIT' && normalizeOrderStatus(order.status) !== 'out_for_delivery') {
        order.statusHistory.push({ status: order.status, changedAt: new Date(), note: 'Out for delivery' });
        order.status = 'out_for_delivery';
        await order.save();
        emitOrderWorkflowEvent({
          userId: buyerUserId,
          audience: 'buyer',
          orderId,
          status: 'out_for_delivery',
          title: 'Out for delivery',
          message: 'Your order is out for delivery',
          actorRole: 'delivery_agent',
        });
        emitOrderWorkflowEvent({
          userId: sellerUserId,
          audience: 'seller',
          orderId,
          status: 'out_for_delivery',
          title: 'Out for delivery',
          message: 'Order is out for delivery',
          actorRole: 'delivery_agent',
        });
      } else if (status === 'DELIVERED' && normalizeOrderStatus(order.status) !== 'delivered') {
        order.statusHistory.push({ status: order.status, changedAt: new Date(), note: 'Delivered by assigned delivery agent' });
        order.status = 'delivered';
        await order.save();
        emitOrderWorkflowEvent({
          userId: buyerUserId,
          audience: 'buyer',
          orderId,
          status: 'delivered',
          title: 'Order delivered',
          message: 'Your order has been successfully delivered',
          actorRole: 'delivery_agent',
        });
        emitOrderWorkflowEvent({
          userId: sellerUserId,
          audience: 'seller',
          orderId,
          status: 'delivered',
          title: 'Order delivered',
          message: 'Order delivered successfully',
          actorRole: 'delivery_agent',
        });
      } else if (status === 'FAILED' && normalizeOrderStatus(order.status) !== 'delivery_failed') {
        order.statusHistory.push({ status: order.status, changedAt: new Date(), note: 'Delivery attempt failed' });
        order.status = 'delivery_failed';
        await order.save();
        emitOrderWorkflowEvent({
          userId: buyerUserId,
          audience: 'buyer',
          orderId,
          status: 'delivery_failed',
          title: 'Delivery failed',
          message: 'Delivery attempt failed',
          actorRole: 'delivery_agent',
        });
        emitOrderWorkflowEvent({
          userId: sellerUserId,
          audience: 'seller',
          orderId,
          status: 'delivery_failed',
          title: 'Delivery failed',
          message: 'Delivery attempt failed',
          actorRole: 'delivery_agent',
        });
      }
    }

    res.json({
      success: true,
      data: formatDelivery(delivery),
    });
  } catch (error) {
    console.error('updateDeliveryStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
