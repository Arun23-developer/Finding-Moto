import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Service from '../models/Service';

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
    const { firstName, lastName, phone, specialization, experienceYears, workshopLocation, workshopName } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (specialization !== undefined) user.specialization = specialization;
    if (experienceYears !== undefined) user.experienceYears = experienceYears;
    if (workshopLocation !== undefined) user.workshopLocation = workshopLocation;
    if (workshopName !== undefined) user.workshopName = workshopName;

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
    const { name, description, price, duration, category, active } = req.body;

    if (!name || !price || !duration || !category) {
      res.status(400).json({ success: false, message: 'name, price, duration and category are required' });
      return;
    }

    const service = await Service.create({
      mechanic: req.user!._id,
      name,
      description: description || '',
      price,
      duration,
      category,
      active: active !== undefined ? active : true,
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

    const { name, description, price, duration, category, active } = req.body;

    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = price;
    if (duration !== undefined) service.duration = duration;
    if (category !== undefined) service.category = category;
    if (active !== undefined) service.active = active;

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
