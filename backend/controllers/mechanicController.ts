import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

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
