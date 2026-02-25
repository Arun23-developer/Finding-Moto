import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Product, { IProduct } from '../models/Product';
import Order, { OrderStatus } from '../models/Order';
import mongoose from 'mongoose';

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
      Order.countDocuments({ seller: sellerId, status: 'pending' }),
      Order.countDocuments({ seller: sellerId, status: 'delivered' }),
      Order.aggregate([
        { $match: { seller: sellerId, status: { $in: ['delivered', 'confirmed', 'shipped'] } } },
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
      .populate('buyer', 'name email')
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
          status: { $in: ['delivered', 'confirmed', 'shipped'] },
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
          status: { $in: ['delivered', 'confirmed', 'shipped'] },
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
      { $match: { seller: sellerId, status: { $in: ['delivered', 'confirmed', 'shipped'] } } },
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

// ─── Products ──────────────────────────────────────────────────────────────

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id as mongoose.Types.ObjectId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const query: Record<string, unknown> = { seller: sellerId };
    if (status && status !== 'all') query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id;
    const { name, description, category, brand, price, originalPrice, stock, images, sku } = req.body;

    const product = await Product.create({
      seller: sellerId,
      name,
      description,
      category,
      brand,
      price,
      originalPrice,
      stock: stock ?? 0,
      images: images ?? [],
      sku,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err: unknown) {
    console.error('createProduct error:', err);
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'ValidationError') {
      res.status(400).json({ success: false, message: (err as Error).message });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id;
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, seller: sellerId });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const allowedFields = [
      'name', 'description', 'category', 'brand', 'price', 'originalPrice',
      'stock', 'images', 'status', 'sku',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (product as unknown as Record<string, unknown>)[field] = req.body[field];
      }
    });

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('updateProduct error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id;
    const { id } = req.params;

    const product = await Product.findOneAndDelete({ _id: id, seller: sellerId });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('deleteProduct error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Orders ────────────────────────────────────────────────────────────────

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id as mongoose.Types.ObjectId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const query: Record<string, unknown> = { seller: sellerId };
    if (status && status !== 'all') query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('buyer', 'name email phone')
        .lean(),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: orders,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getOrders error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id;
    const { id } = req.params;
    const { status, note } = req.body as { status: OrderStatus; note?: string };

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    const order = await Order.findOne({ _id: id, seller: sellerId });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (!validTransitions[order.status].includes(status)) {
      res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.status} to ${status}`,
      });
      return;
    }

    order.statusHistory.push({ status: order.status, changedAt: new Date(), note });
    order.status = status;
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
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
        phone: (user as unknown as Record<string, unknown>).phone,
        shopName: (user as unknown as Record<string, unknown>).shopName,
        shopDescription: (user as unknown as Record<string, unknown>).shopDescription,
        shopLocation: (user as unknown as Record<string, unknown>).shopLocation,
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
    const { name, firstName, lastName, phone, shopName, shopDescription, shopLocation } = req.body;

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

    await (user as unknown as { save(): Promise<unknown> }).save();

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
