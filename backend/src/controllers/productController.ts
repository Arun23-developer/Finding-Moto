// ─── Product Management Controller — Arun ──────────────────────────────────
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Product from '../models/Product';
import mongoose from 'mongoose';
import { refreshProductEmbedding } from '../utils/embeddings';
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_SET } from '../constants/productCategories';
import { createNotification } from '../utils/notifications';

const LOW_STOCK_THRESHOLD = 5;

const normalizeImagesInput = (input: unknown): string[] => {
  const toCleanList = (values: string[]): string[] => {
    const cleaned = values
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    return Array.from(new Set(cleaned));
  };

  if (Array.isArray(input)) {
    return toCleanList(input.filter((item): item is string => typeof item === 'string'));
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          return toCleanList(parsed.filter((item): item is string => typeof item === 'string'));
        }
      } catch {
        // Fall through to comma-separated parsing.
      }
    }

    if (trimmed.includes(',')) {
      return toCleanList(trimmed.split(','));
    }

    return [trimmed];
  }

  return [];
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  return Number(value);
};

const rejectNegativeNumber = (
  value: unknown,
  label: string,
  res: Response,
  required = false
): boolean => {
  const numberValue = toOptionalNumber(value);

  if (numberValue === undefined) {
    if (required) {
      res.status(400).json({ success: false, message: `${label} is required.` });
      return true;
    }
    return false;
  }

  if (!Number.isFinite(numberValue)) {
    res.status(400).json({ success: false, message: `${label} must be a valid number.` });
    return true;
  }

  if (numberValue < 0) {
    res.status(400).json({ success: false, message: `${label} must be 0 or greater.` });
    return true;
  }

  return false;
};

const rejectInvalidProductCategory = (value: unknown, res: Response, required = false): boolean => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    if (required) {
      res.status(400).json({ success: false, message: 'Product category is required.' });
      return true;
    }
    return false;
  }

  if (!PRODUCT_CATEGORY_SET.has(value.trim())) {
    res.status(400).json({
      success: false,
      message: `Product category must be one of: ${PRODUCT_CATEGORIES.join(', ')}.`,
    });
    return true;
  }

  return false;
};

const maybeNotifyLowStock = async (product: any, ownerRole: string) => {
  if (product.type === 'service') return;
  const stock = Number(product.stock ?? 0);
  if (!Number.isFinite(stock) || stock > LOW_STOCK_THRESHOLD) return;
  if (ownerRole !== 'seller' && ownerRole !== 'mechanic') return;

  await createNotification({
    recipient: product.seller,
    role: ownerRole as 'seller' | 'mechanic',
    category: ownerRole === 'mechanic' ? 'PARTS_ALERT' : 'LOW_STOCK',
    title: stock === 0 ? 'Product out of stock' : 'Low stock alert',
    message: `${product.name} has ${stock} unit${stock === 1 ? '' : 's'} remaining.`,
    link: ownerRole === 'mechanic' ? '/mechanic/products' : '/seller/products',
    metadata: {
      source: 'product_inventory',
      productId: product._id,
      stock,
    },
  });
};

// @desc    Get seller's products (paginated, filterable)
// @route   GET /api/products/seller
// @access  Private/Seller
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id as mongoose.Types.ObjectId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const query: Record<string, unknown> = { seller: sellerId };
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

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

// @desc    Create a new product
// @route   POST /api/products/seller
// @access  Private/Seller
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id;
    const {
      name,
      description,
      category,
      brand,
      price,
      originalPrice,
      stock,
      images,
      image,
      sku,
      type,
      status,
      productStatus,
    } = req.body;
    const normalizedImages = normalizeImagesInput(images ?? image).slice(0, 5);

    if (rejectNegativeNumber(price, 'Product price', res, true)) return;
    if (type !== 'service' && rejectNegativeNumber(stock ?? 0, 'Product stock', res, true)) return;
    if (rejectNegativeNumber(originalPrice, 'Original price', res)) return;
    if (rejectInvalidProductCategory(category, res, true)) return;

    if (normalizeImagesInput(images ?? image).length > 5) {
      res.status(400).json({ success: false, message: 'Maximum 5 photos allowed' });
      return;
    }

    const product = await Product.create({
      seller: sellerId,
      name,
      description,
      category,
      brand,
      price,
      originalPrice,
      stock: type === 'service' ? 99 : (stock ?? 0),
      images: normalizedImages,
      sku,
      type: type || 'product',
      status,
      productStatus,
    });

    await refreshProductEmbedding(product);
    await product.save();
    await maybeNotifyLowStock(product, req.user!.role);

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

// @desc    Update a product
// @route   PUT /api/products/seller/:id
// @access  Private/Seller
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user!._id;
    const { id } = req.params;
    const nextImages = req.body.images;

    if (req.body.price !== undefined && rejectNegativeNumber(req.body.price, 'Product price', res)) return;
    if (req.body.stock !== undefined && rejectNegativeNumber(req.body.stock, 'Product stock', res)) return;
    if (req.body.originalPrice !== undefined && rejectNegativeNumber(req.body.originalPrice, 'Original price', res)) return;
    if (req.body.category !== undefined && rejectInvalidProductCategory(req.body.category, res)) return;

    const product = await Product.findOne({ _id: id, seller: sellerId });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (Array.isArray(nextImages) && nextImages.length > 5) {
      res.status(400).json({ success: false, message: 'Maximum 5 photos allowed' });
      return;
    }

    const allowedFields = [
      'name', 'description', 'category', 'brand', 'price', 'originalPrice',
      'stock', 'images', 'status', 'productStatus', 'sku', 'type',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'images') {
          (product as unknown as Record<string, unknown>)[field] = normalizeImagesInput(req.body[field]);
          return;
        }
        (product as unknown as Record<string, unknown>)[field] = req.body[field];
      }
    });

    await product.save();
    await maybeNotifyLowStock(product, req.user!.role);

    if (
      req.body.name !== undefined ||
      req.body.description !== undefined ||
      req.body.category !== undefined ||
      req.body.brand !== undefined
    ) {
      await refreshProductEmbedding(product);
      await product.save();
    }

    res.json({ success: true, data: product });
  } catch (err: unknown) {
    console.error('updateProduct error:', err);
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'ValidationError') {
      res.status(400).json({ success: false, message: (err as Error).message });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/seller/:id
// @access  Private/Seller
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
