import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Product from '../models/Product';
import Order from '../models/Order';
import Review from '../models/Review';
import Service from '../models/Service';
import ServiceOrder from '../models/ServiceOrder';
import { getOrderStatusLabel } from '../utils/orderStatus';
import { getServiceOrderStatusLabel } from '../utils/serviceOrderStatus';

type MechanicDashboardType = 'product' | 'service';

interface DashboardKpis {
  totalRevenue: number;
  ordersThisMonth: number;
  ordersThisMonthAmount: number;
  pendingOrders: number;
  avgOrderValue: number;
  completionRate: number;
  revenueGrowth: number;
}

const LOW_STOCK_THRESHOLD = 5;
const PRODUCT_PENDING_STATUSES = ['pending', 'awaiting_seller_confirmation', 'confirmed', 'processing', 'ready_for_dispatch'];
const PRODUCT_SUCCESS_STATUSES = ['delivered', 'completed'];
const PRODUCT_RETURN_STATUSES = ['cancelled', 'refunded'];
const SERVICE_SUCCESS_STATUSES = ['SERVICE_COMPLETED', 'PAYMENT_RECEIVED'];
const SERVICE_PENDING_TABLE_STATUSES = ['SERVICE_ORDER_PLACED', 'SERVICE_ORDER_CONFIRMED'];

const getMonthBounds = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  return { now, startOfMonth, endOfMonth, startOfPreviousMonth, endOfPreviousMonth };
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

const getBuyerName = (buyer: any) =>
  `${buyer?.firstName || ''} ${buyer?.lastName || ''}`.trim() || buyer?.name || buyer?.email || 'Customer';

const buildRevenueSeries = (labels: string[], rows: Array<{ _id: string; revenue: number }>) => {
  const revenueMap = new Map(rows.map((entry) => [entry._id, Number(entry.revenue) || 0]));
  return labels.map((date) => ({
    date,
    revenue: revenueMap.get(date) ?? 0,
  }));
};

const buildProductDashboard = async (mechanicId: mongoose.Types.ObjectId) => {
  const { startOfMonth, endOfMonth, startOfPreviousMonth, endOfPreviousMonth } = getMonthBounds();
  const revenueLabels = getPeriodLabels(startOfMonth, endOfMonth);

  const products = await Product.find({ seller: mechanicId, type: 'product' })
    .select('_id name stock')
    .sort({ createdAt: -1 })
    .lean();

  const productIds = products.map((product) => product._id);
  const hasInventory = productIds.length > 0;

  if (!hasInventory) {
    const emptyKpis: DashboardKpis = {
      totalRevenue: 0,
      ordersThisMonth: 0,
      ordersThisMonthAmount: 0,
      pendingOrders: 0,
      avgOrderValue: 0,
      completionRate: 0,
      revenueGrowth: 0,
    };

    return {
      success: true,
      data: {
        type: 'product',
        hasData: false,
        emptyMessage: 'No product data available',
        kpis: emptyKpis,
        revenueSeries: revenueLabels.map((date) => ({ date, revenue: 0 })),
        ordersThisMonth: [],
        pendingOrders: [],
        returnOrders: [],
        monthlyReviews: [],
        lowStockAlerts: [],
        topSellingItems: [],
      },
    };
  }

  const orderTypeMatchStages = [
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'dashboardProduct',
      },
    },
    { $unwind: { path: '$dashboardProduct', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        resolvedOrderType: {
          $ifNull: ['$order_type', '$dashboardProduct.type'],
        },
      },
    },
    {
      $match: {
        'dashboardProduct._id': { $in: productIds },
        resolvedOrderType: 'product',
      },
    },
  ];

  const [
    totalCompletedRevenueAgg,
    totalCompletedOrders,
    monthlyOrdersAgg,
    monthlyOrderDocs,
    pendingOrdersCount,
    pendingOrders,
    successfulOrdersCount,
    totalOrdersCount,
    currentMonthRevenueAgg,
    previousMonthRevenueAgg,
    revenueSeriesAgg,
    returnOrders,
    monthlyReviews,
    topSellingProductsAgg,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { seller: mechanicId, status: { $in: ['completed'] } } },
      ...orderTypeMatchStages,
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { seller: mechanicId, status: { $in: ['completed'] } } },
      ...orderTypeMatchStages,
      { $group: { _id: '$_id' } },
      { $count: 'total' },
    ]),
    Order.aggregate([
      { $match: { seller: mechanicId, createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      ...orderTypeMatchStages,
      {
        $group: {
          _id: null,
          totalOrders: { $addToSet: '$_id' },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
      {
        $project: {
          totalOrders: { $size: '$totalOrders' },
          totalAmount: 1,
        },
      },
    ]),
    Order.find({
      seller: mechanicId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      order_type: 'product',
    })
      .sort({ createdAt: -1 })
      .populate('buyer', 'firstName lastName')
      .lean(),
    Order.aggregate([
      { $match: { seller: mechanicId, status: { $in: PRODUCT_PENDING_STATUSES } } },
      ...orderTypeMatchStages,
      { $group: { _id: '$_id' } },
      { $count: 'total' },
    ]),
    Order.find({
      seller: mechanicId,
      order_type: 'product',
      status: { $in: PRODUCT_PENDING_STATUSES },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('buyer', 'firstName lastName')
      .lean(),
    Order.aggregate([
      { $match: { seller: mechanicId, status: { $in: PRODUCT_SUCCESS_STATUSES } } },
      ...orderTypeMatchStages,
      { $group: { _id: '$_id' } },
      { $count: 'total' },
    ]),
    Order.aggregate([
      { $match: { seller: mechanicId } },
      ...orderTypeMatchStages,
      { $group: { _id: '$_id' } },
      { $count: 'total' },
    ]),
    Order.aggregate([
      {
        $match: {
          seller: mechanicId,
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      ...orderTypeMatchStages,
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      {
        $match: {
          seller: mechanicId,
          status: 'completed',
          createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
        },
      },
      ...orderTypeMatchStages,
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      {
        $match: {
          seller: mechanicId,
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      ...orderTypeMatchStages,
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.find({
      seller: mechanicId,
      order_type: 'product',
      status: { $in: PRODUCT_RETURN_STATUSES },
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('buyer', 'firstName lastName')
      .lean(),
    Review.find({
      productId: { $in: productIds },
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .sort({ createdAt: -1 })
      .populate('buyer', 'firstName lastName')
      .populate('productId', 'name')
      .lean(),
    Order.aggregate([
      {
        $match: {
          seller: mechanicId,
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          order_type: 'product',
        },
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.product': { $in: productIds },
        },
      },
      {
        $group: {
          _id: '$items.product',
          itemName: { $first: '$items.name' },
          unitsSold: { $sum: '$items.qty' },
          revenueGenerated: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        },
      },
      { $sort: { unitsSold: -1, revenueGenerated: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const totalCompletedRevenue = Number(totalCompletedRevenueAgg[0]?.total) || 0;
  const monthlyOrdersSummary = monthlyOrdersAgg[0] || { totalOrders: 0, totalAmount: 0 };
  const currentMonthRevenue = Number(currentMonthRevenueAgg[0]?.total) || 0;
  const previousMonthRevenue = Number(previousMonthRevenueAgg[0]?.total) || 0;
  const completedOrdersCount = Number(totalCompletedOrders[0]?.total) || 0;
  const successfulOrders = Number(successfulOrdersCount[0]?.total) || 0;
  const totalOrders = Number(totalOrdersCount[0]?.total) || 0;
  const pendingOrdersCountValue = Number(pendingOrdersCount[0]?.total) || 0;
  const revenueGrowth =
    previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : currentMonthRevenue > 0
        ? 100
        : 0;
  const completionRate = totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0;
  const avgOrderValue = completedOrdersCount > 0 ? totalCompletedRevenue / completedOrdersCount : 0;

  return {
    success: true,
    data: {
      type: 'product',
      hasData: true,
      emptyMessage: '',
      kpis: {
        totalRevenue: totalCompletedRevenue,
        ordersThisMonth: Number(monthlyOrdersSummary.totalOrders) || 0,
        ordersThisMonthAmount: Number(monthlyOrdersSummary.totalAmount) || 0,
        pendingOrders: pendingOrdersCountValue,
        avgOrderValue,
        completionRate,
        revenueGrowth,
      },
      revenueSeries: buildRevenueSeries(revenueLabels, revenueSeriesAgg as Array<{ _id: string; revenue: number }>),
      ordersThisMonth: monthlyOrderDocs.map((order: any) => ({
        orderId: order._id,
        customerName: getBuyerName(order.buyer),
        itemName: order.items?.[0]?.name || 'Product',
        orderAmount: Number(order.totalAmount) || 0,
        orderDate: order.createdAt,
        orderStatus: getOrderStatusLabel(order.status),
      })),
      pendingOrders: pendingOrders.map((order: any) => ({
        orderId: order._id,
        customerName: getBuyerName(order.buyer),
        itemName: order.items?.[0]?.name || 'Product',
        orderAmount: Number(order.totalAmount) || 0,
        orderDate: order.createdAt,
        orderStatus: getOrderStatusLabel(order.status),
      })),
      returnOrders: returnOrders.map((order: any) => ({
        orderId: order._id,
        itemName: order.items?.[0]?.name || 'Product',
        customerName: getBuyerName(order.buyer),
        reason: order.notes || 'Returned or refunded order',
        actionDate: order.updatedAt,
        amount: Number(order.totalAmount) || 0,
      })),
      monthlyReviews: monthlyReviews.map((review: any) => ({
        reviewId: review._id,
        customerName: getBuyerName(review.buyer),
        itemName: review.productId?.name || 'Product',
        rating: Number(review.rating) || 0,
        review: review.comment || '',
        reviewDate: review.createdAt,
      })),
      lowStockAlerts: products
        .filter((product) => Number(product.stock) < LOW_STOCK_THRESHOLD)
        .sort((a, b) => Number(a.stock) - Number(b.stock))
        .map((product) => ({
          itemName: product.name,
          currentQuantity: Number(product.stock) || 0,
          minimumRequiredQuantity: LOW_STOCK_THRESHOLD,
        })),
      topSellingItems: topSellingProductsAgg.map((item: any) => ({
        itemId: item._id,
        itemName: item.itemName || 'Product',
        unitsSold: Number(item.unitsSold) || 0,
        revenueGenerated: Number(item.revenueGenerated) || 0,
      })),
    },
  };
};

const buildServiceDashboard = async (mechanicId: mongoose.Types.ObjectId) => {
  const { startOfMonth, endOfMonth, startOfPreviousMonth, endOfPreviousMonth } = getMonthBounds();
  const revenueLabels = getPeriodLabels(startOfMonth, endOfMonth);

  const services = await Service.find({ mechanic: mechanicId })
    .select('_id name')
    .sort({ createdAt: -1 })
    .lean();

  const hasServices = services.length > 0;

  if (!hasServices) {
    const emptyKpis: DashboardKpis = {
      totalRevenue: 0,
      ordersThisMonth: 0,
      ordersThisMonthAmount: 0,
      pendingOrders: 0,
      avgOrderValue: 0,
      completionRate: 0,
      revenueGrowth: 0,
    };

    return {
      success: true,
      data: {
        type: 'service',
        hasData: false,
        emptyMessage: 'No service data available',
        kpis: emptyKpis,
        revenueSeries: revenueLabels.map((date) => ({ date, revenue: 0 })),
        ordersThisMonth: [],
        pendingOrders: [],
        returnOrders: [],
        monthlyReviews: [],
        lowStockAlerts: [],
        topSellingItems: [],
      },
    };
  }

  const [
    totalRevenueAgg,
    paidOrdersCount,
    monthlyOrdersAgg,
    monthlyOrders,
    pendingOrdersCount,
    pendingOrders,
    successfulOrdersCount,
    totalOrdersCount,
    currentMonthRevenueAgg,
    previousMonthRevenueAgg,
    revenueSeriesAgg,
    monthlyServiceReviews,
    topServicesAgg,
  ] = await Promise.all([
    ServiceOrder.aggregate([
      { $match: { mechanic: mechanicId, status: 'PAYMENT_RECEIVED' } },
      { $group: { _id: null, total: { $sum: '$servicePrice' } } },
    ]),
    ServiceOrder.countDocuments({ mechanic: mechanicId, status: 'PAYMENT_RECEIVED' }),
    ServiceOrder.aggregate([
      {
        $match: {
          mechanic: mechanicId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$servicePrice' },
        },
      },
    ]),
    ServiceOrder.find({
      mechanic: mechanicId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('buyer', 'firstName lastName')
      .lean(),
    ServiceOrder.countDocuments({
      mechanic: mechanicId,
      status: { $in: SERVICE_PENDING_TABLE_STATUSES },
    }),
    ServiceOrder.find({
      mechanic: mechanicId,
      status: { $in: SERVICE_PENDING_TABLE_STATUSES },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('buyer', 'firstName lastName')
      .lean(),
    ServiceOrder.countDocuments({
      mechanic: mechanicId,
      status: { $in: SERVICE_SUCCESS_STATUSES },
    }),
    ServiceOrder.countDocuments({ mechanic: mechanicId }),
    ServiceOrder.aggregate([
      {
        $match: {
          mechanic: mechanicId,
          status: 'PAYMENT_RECEIVED',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$servicePrice' } } },
    ]),
    ServiceOrder.aggregate([
      {
        $match: {
          mechanic: mechanicId,
          status: 'PAYMENT_RECEIVED',
          createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$servicePrice' } } },
    ]),
    ServiceOrder.aggregate([
      {
        $match: {
          mechanic: mechanicId,
          status: 'PAYMENT_RECEIVED',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$servicePrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Review.find({
      mechanicId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .sort({ createdAt: -1 })
      .populate('buyer', 'firstName lastName')
      .lean(),
    ServiceOrder.aggregate([
      {
        $match: {
          mechanic: mechanicId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $in: ['SERVICE_COMPLETED', 'PAYMENT_RECEIVED'] },
        },
      },
      {
        $group: {
          _id: '$service',
          itemName: { $first: '$serviceName' },
          unitsSold: { $sum: 1 },
          revenueGenerated: { $sum: '$servicePrice' },
        },
      },
      { $sort: { unitsSold: -1, revenueGenerated: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const totalRevenue = Number(totalRevenueAgg[0]?.total) || 0;
  const monthlyOrdersSummary = monthlyOrdersAgg[0] || { totalOrders: 0, totalAmount: 0 };
  const currentMonthRevenue = Number(currentMonthRevenueAgg[0]?.total) || 0;
  const previousMonthRevenue = Number(previousMonthRevenueAgg[0]?.total) || 0;
  const paidOrders = Number(paidOrdersCount) || 0;
  const successfulOrders = Number(successfulOrdersCount) || 0;
  const totalOrders = Number(totalOrdersCount) || 0;
  const revenueGrowth =
    previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : currentMonthRevenue > 0
        ? 100
        : 0;
  const completionRate = totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0;
  const avgOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0;

  return {
    success: true,
    data: {
      type: 'service',
      hasData: true,
      emptyMessage: '',
      kpis: {
        totalRevenue,
        ordersThisMonth: Number(monthlyOrdersSummary.totalOrders) || 0,
        ordersThisMonthAmount: Number(monthlyOrdersSummary.totalAmount) || 0,
        pendingOrders: Number(pendingOrdersCount) || 0,
        avgOrderValue,
        completionRate,
        revenueGrowth,
      },
      revenueSeries: buildRevenueSeries(revenueLabels, revenueSeriesAgg as Array<{ _id: string; revenue: number }>),
      ordersThisMonth: monthlyOrders.map((order: any) => ({
        orderId: order._id,
        customerName: getBuyerName(order.buyer),
        itemName: order.serviceName || 'Service',
        orderAmount: Number(order.servicePrice) || 0,
        orderDate: order.createdAt,
        orderStatus: getServiceOrderStatusLabel(order.status),
      })),
      pendingOrders: pendingOrders.map((order: any) => ({
        orderId: order._id,
        customerName: getBuyerName(order.buyer),
        itemName: order.serviceName || 'Service',
        orderAmount: Number(order.servicePrice) || 0,
        orderDate: order.createdAt,
        orderStatus: getServiceOrderStatusLabel(order.status),
      })),
      returnOrders: [],
      monthlyReviews: monthlyServiceReviews.map((review: any) => ({
        reviewId: review._id,
        customerName: getBuyerName(review.buyer),
        itemName: 'Workshop Service Experience',
        rating: Number(review.rating) || 0,
        review: review.comment || '',
        reviewDate: review.createdAt,
      })),
      lowStockAlerts: [],
      topSellingItems: topServicesAgg.map((item: any) => ({
        itemId: item._id,
        itemName: item.itemName || 'Service',
        unitsSold: Number(item.unitsSold) || 0,
        revenueGenerated: Number(item.revenueGenerated) || 0,
      })),
    },
  };
};

// @desc    Get mechanic dashboard data for a specific tab
// @route   GET /api/mechanic/dashboard?type=product|service
// @access  Private/Mechanic
export const getMechanicDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mechanicId = req.user!._id as mongoose.Types.ObjectId;
    const type: MechanicDashboardType = req.query.type === 'service' ? 'service' : 'product';

    const payload = type === 'service'
      ? await buildServiceDashboard(mechanicId)
      : await buildProductDashboard(mechanicId);

    res.json(payload);
  } catch (err) {
    console.error('getMechanicDashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get mechanic profile
// @route   GET /api/mechanic/profile
// @access  Private/Mechanic
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    res.json({
      success: true,
      data: {
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
        specialization: user.specialization,
        experienceYears: user.experienceYears,
        workshopLocation: user.workshopLocation,
        workshopName: user.workshopName,
        servicesOffered: user.servicesOffered || [],
        mechanicBrands: user.mechanicBrands || [],
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update mechanic profile
// @route   PUT /api/mechanic/profile
// @access  Private/Mechanic
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { firstName, lastName, phone, email, specialization, experienceYears, workshopLocation, workshopName, servicesOffered, mechanicBrands } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (email !== undefined) user.email = email;
    if (specialization !== undefined) user.specialization = specialization;
    if (experienceYears !== undefined) user.experienceYears = experienceYears;
    if (workshopLocation !== undefined) user.workshopLocation = workshopLocation;
    if (workshopName !== undefined) user.workshopName = workshopName;
    if (servicesOffered !== undefined) user.servicesOffered = Array.isArray(servicesOffered) ? servicesOffered : [];
    if (mechanicBrands !== undefined) user.mechanicBrands = Array.isArray(mechanicBrands) ? mechanicBrands : [];

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        specialization: user.specialization,
        experienceYears: user.experienceYears,
        workshopLocation: user.workshopLocation,
        workshopName: user.workshopName,
        servicesOffered: user.servicesOffered || [],
        mechanicBrands: user.mechanicBrands || [],
      },
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get mechanic dashboard overview
// @route   GET /api/mechanic/overview
// @access  Private/Mechanic
export const getOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    res.json({
      success: true,
      data: {
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          specialization: user.specialization,
          experienceYears: user.experienceYears,
          workshopName: user.workshopName,
          workshopLocation: user.workshopLocation,
        },
        stats: {
          totalServices: 0,
          pendingRequests: 0,
          completedServices: 0,
          rating: 0,
        },
      },
    });
  } catch (err) {
    console.error('getOverview error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get mechanic reviews summary
// @route   GET /api/mechanic/reviews
// @access  Private/Mechanic
export const getMechanicReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mechanicId = req.user!._id as mongoose.Types.ObjectId;

    const [products, services, mechanicReviews] = await Promise.all([
      Product.find({ seller: mechanicId, type: 'product' }).select('_id name').lean(),
      Service.find({ mechanic: mechanicId }).select('_id name').lean(),
      Review.find({ mechanicId })
        .sort({ createdAt: -1 })
        .populate('buyer', 'firstName lastName avatar')
        .lean(),
    ]);
    const productIds = products.map((p) => p._id);
    const productMap = new Map(products.map((p) => [p._id.toString(), p.name]));
    const productReviews = productIds.length > 0
      ? await Review.find({ productId: { $in: productIds } })
        .sort({ createdAt: -1 })
        .populate('buyer', 'firstName lastName avatar')
        .lean()
      : [];
    const allReviews = [...productReviews, ...mechanicReviews];
    const total = allReviews.length;
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    const productRatings = products.map((product) => {
      const itemReviews = productReviews.filter((review) => review.productId?.toString() === product._id.toString());
      const reviewCount = itemReviews.length;
      const averageRating = reviewCount > 0
        ? Math.round((itemReviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount) * 10) / 10
        : 0;

      return {
        productId: product._id,
        productName: product.name,
        averageRating,
        totalReviewCount: reviewCount,
      };
    }).sort((a, b) => {
      if (b.totalReviewCount !== a.totalReviewCount) return b.totalReviewCount - a.totalReviewCount;
      return b.averageRating - a.averageRating;
    });

    const directServiceReviewCount = mechanicReviews.length;
    const directServiceAverage = directServiceReviewCount > 0
      ? Math.round((mechanicReviews.reduce((acc, review) => acc + review.rating, 0) / directServiceReviewCount) * 10) / 10
      : 0;

    const serviceRatings = services.map((service) => ({
      serviceId: service._id,
      serviceName: service.name,
      averageRating: 0,
      totalReviewCount: 0,
    }));

    if (directServiceReviewCount > 0) {
      serviceRatings.unshift({
        serviceId: new mongoose.Types.ObjectId(),
        serviceName: 'Workshop Service Experience',
        averageRating: directServiceAverage,
        totalReviewCount: directServiceReviewCount,
      });
    }

    const customerReviews = [
      ...productReviews.map((review) => {
        const buyer = review.buyer as unknown as { firstName?: string; lastName?: string } | null;
        return {
          _id: review._id,
          itemType: 'product',
          itemName: review.productId ? productMap.get(review.productId.toString()) || 'Product' : 'Product',
          customerName: buyer ? `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || 'Customer' : 'Customer',
          rating: review.rating,
          comment: review.comment,
          reviewDate: review.createdAt,
        };
      }),
      ...mechanicReviews.map((review) => {
        const buyer = review.buyer as unknown as { firstName?: string; lastName?: string } | null;
        return {
          _id: review._id,
          itemType: 'service',
          itemName: 'Workshop Service Experience',
          customerName: buyer ? `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || 'Customer' : 'Customer',
          rating: review.rating,
          comment: review.comment,
          reviewDate: review.createdAt,
        };
      }),
    ].sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime());

    res.json({
      success: true,
      data: {
        stats: { average, total },
        productRatings,
        serviceRatings,
        customerReviews,
      },
    });
  } catch (err) {
    console.error('getMechanicReviews error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all services for the logged-in mechanic
// @route   GET /api/mechanic/services
// @access  Private/Mechanic
export const getServices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const services = await Service.find({ mechanic: req.user!._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: services });
  } catch (err) {
    console.error('getServices error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new service
// @route   POST /api/mechanic/services
// @access  Private/Mechanic
export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, originalPrice, duration, category, active, productStatus, images } = req.body;

    if (!name || !price || !duration || !category) {
      res.status(400).json({ success: false, message: 'name, price, duration and category are required' });
      return;
    }

    if (Array.isArray(images) && images.length > 5) {
      res.status(400).json({ success: false, message: 'Maximum 5 photos allowed' });
      return;
    }

    const normalizedProductStatus = productStatus === 'DISABLED' ? 'DISABLED' : 'ENABLED';
    let normalizedActive = active !== undefined ? Boolean(active) : normalizedProductStatus === 'ENABLED';

    if (normalizedProductStatus === 'DISABLED') {
      normalizedActive = false;
    }

    const service = await Service.create({
      mechanic: req.user!._id,
      name,
      description: description || '',
      price,
      originalPrice,
      duration,
      category,
      active: normalizedActive,
      productStatus: normalizedProductStatus,
      images: Array.isArray(images) ? images.slice(0, 5) : [],
    });

    res.status(201).json({ success: true, data: service });
  } catch (err) {
    console.error('createService error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update an existing service
// @route   PUT /api/mechanic/services/:id
// @access  Private/Mechanic
export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findOne({ _id: req.params.id, mechanic: req.user!._id });

    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    const { name, description, price, originalPrice, duration, category, active, productStatus, images } = req.body;

    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = price;
    if (originalPrice !== undefined) service.originalPrice = originalPrice;
    if (duration !== undefined) service.duration = duration;
    if (category !== undefined) service.category = category;
    if (active !== undefined) service.active = active;
    if (productStatus !== undefined) {
      service.productStatus = productStatus === 'DISABLED' ? 'DISABLED' : 'ENABLED';
    }
    if (images !== undefined) {
      if (Array.isArray(images) && images.length > 5) {
        res.status(400).json({ success: false, message: 'Maximum 5 photos allowed' });
        return;
      }
      service.images = Array.isArray(images) ? images.slice(0, 5) : [];
    }

    if (service.productStatus === 'DISABLED') {
      service.active = false;
    } else if (productStatus !== undefined && active === undefined) {
      service.active = true;
    }

    await service.save();

    res.json({ success: true, data: service });
  } catch (err) {
    console.error('updateService error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a service
// @route   DELETE /api/mechanic/services/:id
// @access  Private/Mechanic
export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findOneAndDelete({ _id: req.params.id, mechanic: req.user!._id });

    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    console.error('deleteService error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
