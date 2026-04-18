// ─── Seller Dashboard Controller — Thulax ──────────────────────────────────
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Product from '../models/Product';
import Order from '../models/Order';
import Review from '../models/Review';
import mongoose from 'mongoose';
import { normalizeOrderStatus, getOrderStatusLabel } from '../utils/orderStatus';

const LOW_STOCK_THRESHOLD = 5;

const getPeriodBounds = (range: 'monthly' | 'weekly') => {
  const now = new Date();
  const currentPeriodStart =
    range === 'weekly'
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
      : new Date(now.getFullYear(), now.getMonth(), 1);

  return { now, currentPeriodStart };
};

const getPeriodLabels = (start: Date, end: Date) => {
  const labels: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const finalDate = new Date(end);
  finalDate.setHours(0, 0, 0, 0);

  while (cursor <= finalDate) {
    labels.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return labels;
};

export const getSellerDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id as mongoose.Types.ObjectId;
    const range = req.query.range === 'weekly' ? 'weekly' : 'monthly';
    const { now, currentPeriodStart } = getPeriodBounds(range);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    
    // For revenue series graph: use full month dates for monthly view, or last 7 days for weekly view
    const revenuePeriodStart = range === 'monthly' ? startOfMonth : currentPeriodStart;
    const revenuePeriodEnd = range === 'monthly' ? endOfMonth : now;

    const [
      totalCompletedRevenueAgg,
      totalCompletedOrders,
      monthlyOrdersAgg,
      monthlyOrderDocs,
      pendingOrdersCount,
      pendingOrders,
      shippedOrdersCount,
      totalOrdersCount,
      currentMonthRevenueAgg,
      previousMonthRevenueAgg,
      revenueSeriesAgg,
      returnOrders,
      monthlyReviews,
      lowStockProducts,
      topSellingProductsAgg,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { seller: sellerId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ seller: sellerId, status: 'completed' }),
      Order.aggregate([
        {
          $match: {
            seller: sellerId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]),
      Order.find({
        seller: sellerId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      })
        .sort({ createdAt: -1 })
        .populate('buyer', 'firstName lastName')
        .lean(),
      Order.countDocuments({ seller: sellerId, status: { $in: ['awaiting_seller_confirmation', 'confirmed', 'processing', 'ready_for_dispatch'] } }),
      Order.find({ seller: sellerId, status: { $in: ['awaiting_seller_confirmation', 'confirmed', 'processing', 'ready_for_dispatch'] } })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('buyer', 'firstName lastName')
        .lean(),
      Order.countDocuments({ seller: sellerId, status: { $in: ['picked_up', 'out_for_delivery', 'delivered', 'completed'] } }),
      Order.countDocuments({ seller: sellerId }),
      Order.aggregate([
        {
          $match: {
            seller: sellerId,
            status: 'completed',
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        {
          $match: {
            seller: sellerId,
            status: 'completed',
            createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        {
          $match: {
            seller: sellerId,
            status: 'completed',
            createdAt: { $gte: revenuePeriodStart, $lte: revenuePeriodEnd },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.find({
        seller: sellerId,
        status: { $in: ['cancelled', 'refunded'] },
        updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
      })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('buyer', 'firstName lastName')
        .lean(),
      Review.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      })
        .populate({
          path: 'productId',
          select: 'name seller',
          match: { seller: sellerId },
        })
        .populate('buyer', 'firstName lastName')
        .sort({ createdAt: -1 })
        .lean(),
      Product.find({
        seller: sellerId,
        type: 'product',
        stock: { $lt: LOW_STOCK_THRESHOLD },
      })
        .select('name stock')
        .sort({ stock: 1, name: 1 })
        .lean(),
      Order.aggregate([
        {
          $match: {
            seller: sellerId,
            status: { $in: ['completed'] },
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            productName: { $first: '$items.name' },
            unitsSold: { $sum: '$items.qty' },
            revenueGenerated: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          },
        },
        { $sort: { unitsSold: -1, revenueGenerated: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const totalCompletedRevenue = totalCompletedRevenueAgg[0]?.total ?? 0;
    const monthlyOrdersSummary = monthlyOrdersAgg[0] ?? { totalOrders: 0, totalAmount: 0 };
    const currentMonthRevenue = currentMonthRevenueAgg[0]?.total ?? 0;
    const previousMonthRevenue = previousMonthRevenueAgg[0]?.total ?? 0;
    const revenueGrowth =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : currentMonthRevenue > 0
          ? 100
          : 0;
    const completionRate = totalOrdersCount > 0 ? (shippedOrdersCount / totalOrdersCount) * 100 : 0;
    const avgOrderValue = totalCompletedOrders > 0 ? totalCompletedRevenue / totalCompletedOrders : 0;
    const revenueMap = new Map(revenueSeriesAgg.map((entry: any) => [entry._id, entry.revenue]));
    const revenueSeries = getPeriodLabels(revenuePeriodStart, revenuePeriodEnd).map((date) => ({
      date,
      revenue: revenueMap.get(date) ?? 0,
    }));

    const monthlyOrderRows = monthlyOrderDocs.map((order: any) => ({
      orderId: order._id,
      customerName: `${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.trim() || 'Customer',
      productName: order.items?.[0]?.name || 'Item',
      orderAmount: order.totalAmount || 0,
      orderDate: order.createdAt,
      orderStatus: getOrderStatusLabel(order.status),
    }));

    const pendingOrderRows = pendingOrders.map((order: any) => ({
      orderId: order._id,
      customerName: `${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.trim() || 'Customer',
      productName: order.items?.[0]?.name || 'Item',
      orderAmount: order.totalAmount || 0,
      orderDate: order.createdAt,
      orderStatus: getOrderStatusLabel(order.status),
    }));

    const returnOrderRows = returnOrders.map((order: any) => {
      const returnedStatus = Array.isArray(order.statusHistory)
        ? [...order.statusHistory].reverse().find((statusItem: any) => ['cancelled', 'refunded'].includes(statusItem.status))
        : null;

      return {
        orderId: order._id,
        productName: order.items?.[0]?.name || 'Item',
        customerName: `${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.trim() || 'Customer',
        returnReason: order.notes || returnedStatus?.note || 'Returned or refunded order',
        returnDate: returnedStatus?.changedAt || order.updatedAt,
        refundAmount: order.totalAmount || 0,
      };
    });

    const monthlyReviewRows = monthlyReviews
      .filter((review: any) => review.productId)
      .map((review: any) => ({
        customerName: `${review.buyer?.firstName || ''} ${review.buyer?.lastName || ''}`.trim() || 'Customer',
        productName: review.productId?.name || 'Product',
        rating: review.rating,
        review: review.comment,
        reviewDate: review.createdAt,
      }));

    const lowStockRows = lowStockProducts.map((product: any) => ({
      productName: product.name,
      currentQuantity: product.stock,
      minimumRequiredQuantity: LOW_STOCK_THRESHOLD,
    }));

    const topSellingRows = topSellingProductsAgg.map((product: any) => ({
      productId: product._id,
      productName: product.productName || 'Product',
      unitsSold: product.unitsSold || 0,
      revenueGenerated: product.revenueGenerated || 0,
    }));

    res.json({
      success: true,
      data: {
        filter: range,
        kpis: {
          totalRevenue: totalCompletedRevenue,
          ordersThisMonth: monthlyOrdersSummary.totalOrders,
          ordersThisMonthAmount: monthlyOrdersSummary.totalAmount,
          pendingOrders: pendingOrdersCount,
          avgOrderValue,
          completionRate,
          revenueGrowth,
        },
        revenueSeries,
        ordersThisMonth: monthlyOrderRows,
        pendingOrders: pendingOrderRows,
        returnOrders: returnOrderRows,
        monthlyReviews: monthlyReviewRows,
        lowStockAlerts: lowStockRows,
        topSellingProducts: topSellingRows,
      },
    });
  } catch (err) {
    console.error('getSellerDashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Overview / Stats ──────────────────────────────────────────────────────

export const getOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id as mongoose.Types.ObjectId;

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenueResult,
      viewsResult,
    ] = await Promise.all([
      Product.countDocuments({ seller: sellerId }),
      Product.countDocuments({ seller: sellerId, status: 'active' }),
      Order.countDocuments({ seller: sellerId }),
      Order.countDocuments({ seller: sellerId, status: { $in: ['pending', 'awaiting_seller_confirmation', 'confirmed', 'processing', 'ready_for_dispatch'] } }),
      Order.countDocuments({ seller: sellerId, status: 'completed' }),
      Order.aggregate([
        { $match: { seller: sellerId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Product.aggregate([
        { $match: { seller: sellerId } },
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
    ]);

    const revenue = revenueResult[0]?.total ?? 0;
    const totalViews = viewsResult[0]?.total ?? 0;

    // Recent orders (last 5)
    const recentOrders = await Order.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyer', 'firstName lastName email')
      .lean();

    // Top products by sales
    const topProducts = await Product.find({ seller: sellerId })
      .sort({ sales: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        stats: {
          revenue,
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalProducts,
          activeProducts,
          totalViews,
        },
        recentOrders,
        topProducts,
      },
    });
  } catch (err) {
    console.error('getOverview error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Analytics ─────────────────────────────────────────────────────────────

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id as mongoose.Types.ObjectId;

    // Last 7 days daily revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          seller: sellerId,
          status: { $in: ['completed'] },
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Last 30 days monthly revenue
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          seller: sellerId,
          status: { $in: ['completed'] },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: { seller: sellerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top categories by revenue
    const topCategories = await Order.aggregate([
      { $match: { seller: sellerId, status: 'completed' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          unitsSold: { $sum: '$items.qty' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: { dailyRevenue, monthlyRevenue, ordersByStatus, topCategories },
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Profile ───────────────────────────────────────────────────────────────

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: (user as unknown as Record<string, unknown>).avatar,
        phone: (user as unknown as Record<string, unknown>).phone,
        shopName: (user as unknown as Record<string, unknown>).shopName,
        shopDescription: (user as unknown as Record<string, unknown>).shopDescription,
        shopLocation: (user as unknown as Record<string, unknown>).shopLocation,
        sellerSpecializations: (user as unknown as Record<string, unknown>).sellerSpecializations,
        sellerBrands: (user as unknown as Record<string, unknown>).sellerBrands,
        role: user.role,
        createdAt: (user as unknown as Record<string, unknown>).createdAt,
      },
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { name, firstName, lastName, phone, shopName, shopDescription, shopLocation, sellerSpecializations, sellerBrands } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    // Support legacy 'name' field: split into firstName/lastName
    if (name && !firstName && !lastName) {
      const parts = name.trim().split(/\s+/);
      user.firstName = parts[0];
      user.lastName = parts.slice(1).join(' ') || '';
    }
    const userRecord = user as unknown as Record<string, unknown>;
    if (phone !== undefined) userRecord.phone = phone;
    if (shopName !== undefined) userRecord.shopName = shopName;
    if (shopDescription !== undefined) userRecord.shopDescription = shopDescription;
    if (shopLocation !== undefined) userRecord.shopLocation = shopLocation;
    if (sellerSpecializations !== undefined) userRecord.sellerSpecializations = Array.isArray(sellerSpecializations) ? sellerSpecializations : [];
    if (sellerBrands !== undefined) userRecord.sellerBrands = Array.isArray(sellerBrands) ? sellerBrands : [];

    await (user as unknown as { save(): Promise<unknown> }).save();

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Seller Reviews ────────────────────────────────────────────────────────

export const getSellerReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id as mongoose.Types.ObjectId;

    // Get all product IDs owned by this seller
    const products = await Product.find({ seller: sellerId }).select('_id name').lean();
    const productIds = products.map((p) => p._id);
    const productMap = new Map(products.map((p) => [p._id.toString(), p.name]));

    // Get all reviews for those products
    const reviews = await Review.find({ productId: { $in: productIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    // Rating distribution
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
    });
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: dist[stars],
      percentage: total > 0 ? Math.round((dist[stars] / total) * 100) : 0,
    }));

    // Recommended: count of 4-5 star reviews
    const recommended = total > 0
      ? Math.round(((dist[4] + dist[5]) / total) * 100)
      : 0;

    // Enrich reviews with product name
    const enrichedReviews = reviews.map((r) => ({
      _id: r._id,
      productId: r.productId,
      productName: r.productId ? productMap.get(r.productId.toString()) || 'Unknown Product' : 'Unknown Product',
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    res.json({
      success: true,
      data: {
        stats: { average, total, recommended },
        distribution,
        reviews: enrichedReviews,
      },
    });
  } catch (err) {
    console.error('getSellerReviews error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
