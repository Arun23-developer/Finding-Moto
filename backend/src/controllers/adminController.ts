


// ─── Admin Management Controller — Sujani ───────────────────────────────────
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Service from '../models/Service';
import Review from '../models/Review';
import { sendApprovalEmail } from '../utils/email';

// Helper: format user for responses
const formatAdminUser = (user: any) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  role: user.role,
  approvalStatus: user.approvalStatus,
  isActive: user.isActive,
  shopName: user.shopName,
  shopDescription: user.shopDescription,
  shopLocation: user.shopLocation,
  specialization: user.specialization,
  experienceYears: user.experienceYears,
  workshopLocation: user.workshopLocation,
  workshopName: user.workshopName,
});

// @desc    Get all pending approvals
// @route   GET /api/admin/pending
// @access  Private/Admin
export const getPendingApprovals = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const roleFilter = req.query.role as string;
    
    const filter: any = { approvalStatus: 'pending' };
    if (roleFilter && ['seller', 'mechanic', 'delivery_agent'].includes(roleFilter)) {
      filter.role = roleFilter;
    } else {
      filter.role = { $in: ['seller', 'mechanic', 'delivery_agent'] };
    }

    const users = await User.find(filter).sort({ createdAt: 1 });

    res.json({
      users: users.map(formatAdminUser),
      count: users.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Approve or reject a user
// @route   PUT /api/admin/approve/:userId
// @access  Private/Admin
export const approveUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { action, notes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ message: 'Action must be "approve" or "reject"' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!['seller', 'mechanic', 'delivery_agent'].includes(user.role)) {
      res.status(400).json({ message: 'Only seller, mechanic, and delivery agent accounts can be approved/rejected' });
      return;
    }

    if (action === 'approve') {
      user.approvalStatus = 'approved';
      user.approvalNotes = notes || 'Approved by admin';
      user.approvedAt = new Date();
      if (user.role === 'delivery_agent') {
        user.agent_status = 'ENABLED';
      }
    } else {
      user.approvalStatus = 'rejected';
      user.approvalNotes = notes || 'Rejected by admin';
      if (user.role === 'delivery_agent') {
        user.agent_status = 'DISABLED';
      }
    }

    await user.save();

    // Send approval/rejection notification email
    try {
      await sendApprovalEmail(
        user.email,
        user.firstName,
        action === 'approve',
        user.approvalNotes || undefined
      );
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    res.json({
      message: `User ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      user: formatAdminUser(user)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Get all users (admin management)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, status, search } = req.query;

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.approvalStatus = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json({
      users: users.map(formatAdminUser),
      count: users.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Get user details by ID
// @route   GET /api/admin/users/:userId
// @access  Private/Admin
export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        ...formatAdminUser(user),
        address: user.address,
        isEmailVerified: user.isEmailVerified,
        approvalNotes: user.approvalNotes,
        approvedAt: user.approvedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/toggle-active/:userId
// @access  Private/Admin
export const toggleUserActive = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: formatAdminUser(user)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// ─── Admin Dashboard Overview ──────────────────────────────────────────────

export const getAdminOverview = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      activeSellers,
      revenueResult,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'out_of_stock' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: { $in: ['confirmed', 'shipped'] } }),
      Order.countDocuments({ status: 'delivered' }),
      User.countDocuments({ role: 'seller', isActive: true, approvalStatus: 'approved' }),
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'confirmed', 'shipped'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const revenue = revenueResult[0]?.total ?? 0;

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyer', 'firstName lastName')
      .populate('seller', 'firstName lastName shopName')
      .lean();

    // Top categories by product count
    const topCategories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const catTotal = topCategories.reduce((s, c) => s + c.count, 0) || 1;
    const categories = topCategories.map((c) => ({
      name: c._id || 'Other',
      value: Math.round((c.count / catTotal) * 100),
    }));

    // Monthly revenue (last 7 months)
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
    sevenMonthsAgo.setDate(1);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'confirmed', 'shipped'] },
          createdAt: { $gte: sevenMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          revenue,
          totalOrders,
          pendingOrders,
          processingOrders,
          deliveredOrders,
          totalProducts,
          activeProducts,
          outOfStockProducts,
          activeSellers,
        },
        recentOrders: recentOrders.map((o: any) => ({
          _id: o._id,
          buyer: o.buyer,
          seller: o.seller,
          totalAmount: o.totalAmount,
          status: o.status,
          itemCount: o.items?.length || 0,
          createdAt: o.createdAt,
        })),
        categories,
        monthlyRevenue,
      },
    });
  } catch (err) {
    console.error('getAdminOverview error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Admin — All Products ──────────────────────────────────────────────────

export const getAdminProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { search, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate('seller', 'firstName lastName shopName')
      .lean();

    res.json({ success: true, data: products, count: products.length });
  } catch (err) {
    console.error('getAdminProducts error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Admin — All Orders ────────────────────────────────────────────────────

export const getAdminOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, search } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('buyer', 'firstName lastName')
      .populate('seller', 'firstName lastName shopName')
      .lean();

    // If search, filter by buyer/seller name client-side (after populate)
    let result = orders;
    if (search) {
      const s = (search as string).toLowerCase();
      result = orders.filter((o: any) => {
        const buyerName = `${o.buyer?.firstName || ''} ${o.buyer?.lastName || ''}`.toLowerCase();
        const sellerName = `${o.seller?.firstName || ''} ${o.seller?.lastName || ''}`.toLowerCase();
        return buyerName.includes(s) || sellerName.includes(s) || o._id.toString().includes(s);
      });
    }

    res.json({ success: true, data: result, count: result.length });
  } catch (err) {
    console.error('getAdminOrders error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Admin — All Services ──────────────────────────────────────────────────

export const getAdminServices = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { search, active } = req.query;
    const filter: Record<string, unknown> = {};

    if (active === 'true') filter.active = true;
    if (active === 'false') filter.active = false;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await Service.find(filter)
      .sort({ createdAt: -1 })
      .populate('mechanic', 'firstName lastName workshopName')
      .lean();

    res.json({ success: true, data: services, count: services.length });
  } catch (err) {
    console.error('getAdminServices error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Admin — All Reviews ───────────────────────────────────────────────────

export const getAdminReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { search, rating } = req.query;
    const filter: Record<string, unknown> = {};

    if (rating) {
      filter.rating = Number(rating);
    }

    // Get all reviews
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .populate('buyer', 'firstName lastName email')
      .populate('productId', 'name')
      .populate('sellerId', 'firstName lastName shopName')
      .populate('mechanicId', 'firstName lastName workshopName')
      .lean();

    // Filter by search if provided
    let filteredReviews = reviews;
    if (search) {
      const s = (search as string).toLowerCase();
      filteredReviews = reviews.filter((r: any) => {
        const buyerName = `${r.buyer?.firstName || ''} ${r.buyer?.lastName || ''}`.toLowerCase();
        const comment = (r.comment || '').toLowerCase();
        const productName = (r.productId?.name || '').toLowerCase();
        return buyerName.includes(s) || comment.includes(s) || productName.includes(s);
      });
    }

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r: any) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r: any) => {
      ratingDistribution[r.rating]++;
    });

    // Top rated products
    const productRatings = await Review.aggregate([
      { $match: { productId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$productId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
    ]);

    const topRatedProducts = productRatings
      .map((p: any) => ({
        name: p.product?.[0]?.name || 'Unknown',
        rating: Math.round(p.avgRating * 10) / 10,
        count: p.count,
      }));

    // Top rated sellers
    const sellerRatings = await Review.aggregate([
      { $match: { sellerId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$sellerId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'seller',
        },
      },
    ]);

    const topRatedSellers = sellerRatings
      .map((s: any) => ({
        name: s.seller?.[0]?.shopName || `${s.seller?.[0]?.firstName} ${s.seller?.[0]?.lastName}` || 'Unknown',
        rating: Math.round(s.avgRating * 10) / 10,
        count: s.count,
      }));

    // Format recent reviews
    const recentReviews = filteredReviews.slice(0, 20).map((r: any) => ({
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      buyer: r.buyer,
      productName: r.productId?.name,
      sellerName: r.sellerId?.shopName || `${r.sellerId?.firstName} ${r.sellerId?.lastName}`,
      mechanicName: r.mechanicId?.workshopName || `${r.mechanicId?.firstName} ${r.mechanicId?.lastName}`,
      createdAt: r.createdAt,
    }));

    res.json({
      success: true,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        topRatedProducts,
        topRatedSellers,
      },
      reviews: recentReviews,
      count: filteredReviews.length,
    });
  } catch (err) {
    console.error('getAdminReviews error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
