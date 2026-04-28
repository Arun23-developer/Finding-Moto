import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Report, { ReportCategory, ReportStatus } from '../models/Report';
import User from '../models/User';
import Product from '../models/Product';
import Service from '../models/Service';
import Delivery from '../models/Delivery';
import Order from '../models/Order';

const isObjectId = (value: string): boolean => mongoose.Types.ObjectId.isValid(value);

// @desc    Create a marketplace report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const reporterRole = req.user.role;
    if (!['buyer', 'seller', 'mechanic'].includes(reporterRole)) {
      res.status(403).json({ message: 'Your account is not allowed to submit reports' });
      return;
    }

    const { category, targetId, reason } = req.body as {
      category: ReportCategory;
      targetId: string;
      reason: string;
    };

    if (!category || !targetId || !reason?.trim()) {
      res.status(400).json({ message: 'category, targetId and reason are required' });
      return;
    }

    if (!['ACCOUNT', 'PRODUCT', 'SERVICE', 'DELIVERY'].includes(category)) {
      res.status(400).json({ message: 'Invalid report category' });
      return;
    }

    // Role-based permissions
    if (reporterRole === 'buyer') {
      if (!['ACCOUNT', 'PRODUCT', 'SERVICE'].includes(category)) {
        res.status(403).json({ message: 'Buyers can only report accounts, products, or services' });
        return;
      }
    }
    if (reporterRole === 'seller' || reporterRole === 'mechanic') {
      if (!['ACCOUNT', 'DELIVERY'].includes(category)) {
        res.status(403).json({ message: 'Sellers and mechanics can only report delivery agents or delivery behavior' });
        return;
      }
    }

    if (!isObjectId(targetId)) {
      res.status(400).json({ message: 'Invalid targetId' });
      return;
    }

    const trimmedReason = reason.trim().slice(0, 500);

    let reportedUserId: mongoose.Types.ObjectId | null = null;
    let reportedProductId: mongoose.Types.ObjectId | null = null;
    let reportedServiceId: mongoose.Types.ObjectId | null = null;
    let reportedDeliveryId: mongoose.Types.ObjectId | null = null;

    if (category === 'ACCOUNT') {
      const targetUser = await User.findById(targetId);
      if (!targetUser) {
        res.status(404).json({ message: 'Reported account not found' });
        return;
      }
      if (!['seller', 'mechanic', 'delivery_agent'].includes(targetUser.role)) {
        res.status(400).json({ message: 'Only seller, mechanic, or delivery agent accounts can be reported' });
        return;
      }

      // Role-based target enforcement
      if (reporterRole === 'buyer') {
        // buyer can report seller/mechanic/delivery_agent (already checked)
      } else {
        // seller/mechanic can only report delivery agent accounts
        if (targetUser.role !== 'delivery_agent') {
          res.status(403).json({ message: 'You can only report delivery agent accounts' });
          return;
        }
      }
      reportedUserId = targetUser._id;
    }

    if (category === 'PRODUCT') {
      if (reporterRole !== 'buyer') {
        res.status(403).json({ message: 'Only buyers can report products' });
        return;
      }
      const product = await Product.findById(targetId);
      if (!product) {
        res.status(404).json({ message: 'Reported product not found' });
        return;
      }
      const sellerUser = await User.findById(product.seller).select('role');
      if (!sellerUser || !['seller', 'mechanic'].includes(sellerUser.role)) {
        res.status(400).json({ message: 'Only seller or mechanic products can be reported' });
        return;
      }
      reportedUserId = product.seller as any;
      reportedProductId = product._id;
    }

    if (category === 'SERVICE') {
      if (reporterRole !== 'buyer') {
        res.status(403).json({ message: 'Only buyers can report services' });
        return;
      }
      const service = await Service.findById(targetId);
      if (!service) {
        res.status(404).json({ message: 'Reported service not found' });
        return;
      }
      const mechanicUser = await User.findById(service.mechanic).select('role');
      if (!mechanicUser || mechanicUser.role !== 'mechanic') {
        res.status(400).json({ message: 'Only mechanic services can be reported' });
        return;
      }
      reportedUserId = service.mechanic as any;
      reportedServiceId = service._id;
    }

    if (category === 'DELIVERY') {
      if (reporterRole !== 'seller' && reporterRole !== 'mechanic') {
        res.status(403).json({ message: 'Only sellers and mechanics can report delivery behavior' });
        return;
      }
      const delivery = await Delivery.findById(targetId);
      if (!delivery) {
        res.status(404).json({ message: 'Reported delivery not found' });
        return;
      }

      // Must be related to the underlying order (unless admin, which is not allowed to create reports here)
      const order = await Order.findById(delivery.orderId).select('seller');
      if (!order || order.seller.toString() !== req.user._id.toString()) {
        res.status(403).json({ message: 'You can only report deliveries for your own orders' });
        return;
      }
      reportedUserId = delivery.agentId as any;
      reportedDeliveryId = delivery._id;
    }

    if (!reportedUserId) {
      res.status(400).json({ message: 'Unable to determine reported user' });
      return;
    }

    if (reportedUserId.toString() === req.user._id.toString()) {
      res.status(400).json({ message: 'You cannot report your own account' });
      return;
    }

    const report = await Report.create({
      category,
      reason: trimmedReason,
      reportedBy: req.user._id,
      reportedUser: reportedUserId,
      reportedProduct: reportedProductId,
      reportedService: reportedServiceId,
      reportedDelivery: reportedDeliveryId,
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    console.error('createReport error:', error);
    res.status(500).json({ message: 'Failed to submit report' });
  }
};

// @desc    Admin: list reports
// @route   GET /api/admin/reports
// @access  Private/Admin
export const adminListReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, status, reportedUserRole } = req.query as {
      category?: ReportCategory;
      status?: ReportStatus;
      reportedUserRole?: string;
    };

    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    let reportedUserIds: mongoose.Types.ObjectId[] | undefined;
    if (reportedUserRole) {
      const users = await User.find({ role: reportedUserRole }).select('_id');
      reportedUserIds = users.map((u) => u._id);
      filter.reportedUser = { $in: reportedUserIds };
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('reportedUser', 'firstName lastName fullName email role isActive approvalStatus')
      .populate('reportedBy', 'firstName lastName fullName email role')
      .populate('reviewedBy', 'firstName lastName fullName email role')
      .populate('reportedProduct', 'name price')
      .populate('reportedService', 'name price duration')
      .populate({ path: 'reportedDelivery', select: 'orderId agentId status createdAt', populate: { path: 'agentId', select: 'fullName email role' } });

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('adminListReports error:', error);
    res.status(500).json({ message: 'Failed to load reports' });
  }
};

// @desc    Admin: get report
// @route   GET /api/admin/reports/:reportId
// @access  Private/Admin
export const adminGetReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    if (!isObjectId(reportId)) {
      res.status(400).json({ message: 'Invalid report id' });
      return;
    }

    const report = await Report.findById(reportId)
      .populate('reportedUser', 'firstName lastName fullName email role isActive approvalStatus phone address')
      .populate('reportedBy', 'firstName lastName fullName email role')
      .populate('reviewedBy', 'firstName lastName fullName email role')
      .populate('reportedProduct', 'name price description')
      .populate('reportedService', 'name price duration description')
      .populate({ path: 'reportedDelivery', select: 'orderId agentId status statusHistory createdAt', populate: { path: 'agentId', select: 'fullName email role' } });

    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('adminGetReport error:', error);
    res.status(500).json({ message: 'Failed to load report' });
  }
};

// @desc    Admin: update report status
// @route   PUT /api/admin/reports/:reportId/status
// @access  Private/Admin
export const adminUpdateReportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { reportId } = req.params;
    const { status, adminNotes } = req.body as { status: ReportStatus; adminNotes?: string };

    if (!isObjectId(reportId)) {
      res.status(400).json({ message: 'Invalid report id' });
      return;
    }

    if (!status || !['RESOLVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ message: 'Invalid status. Use RESOLVED or REJECTED.' });
      return;
    }

    const report = await Report.findById(reportId);
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    report.status = status;
    report.adminAction = status === 'RESOLVED' ? 'RESOLVED' : 'REJECTED';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    if (typeof adminNotes === 'string') report.adminNotes = adminNotes.trim().slice(0, 1000);

    await report.save();

    res.json({ success: true, message: 'Report updated', data: report });
  } catch (error) {
    console.error('adminUpdateReportStatus error:', error);
    res.status(500).json({ message: 'Failed to update report' });
  }
};

// @desc    Admin: block reported user account from report
// @route   PUT /api/admin/reports/:reportId/block
// @access  Private/Admin
export const adminBlockReportedAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { reportId } = req.params;
    if (!isObjectId(reportId)) {
      res.status(400).json({ message: 'Invalid report id' });
      return;
    }

    const report = await Report.findById(reportId);
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    const user = await User.findById(report.reportedUser);
    if (!user) {
      res.status(404).json({ message: 'Reported user not found' });
      return;
    }

    user.isActive = false;
    user.active_status = 'DISABLED';
    if (user.role === 'delivery_agent') {
      user.agent_status = 'DISABLED';
    }
    await user.save();

    report.status = 'RESOLVED';
    report.adminAction = 'BLOCKED_ACCOUNT';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    res.json({
      success: true,
      message: 'Account blocked and report resolved',
      data: { report, user: { _id: user._id, isActive: user.isActive, role: user.role } },
    });
  } catch (error) {
    console.error('adminBlockReportedAccount error:', error);
    res.status(500).json({ message: 'Failed to block account' });
  }
};
