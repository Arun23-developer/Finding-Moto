import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Service from '../models/Service';
import Product from '../models/Product';
import Review from '../models/Review';
import mongoose from 'mongoose';

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
        // Placeholder stats — expand when service-request model is added
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

// ─── Service CRUD ──────────────────────────────────────────────────────────

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
