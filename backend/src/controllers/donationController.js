import Donation from '../models/Donation.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { ROLES } from '../config/roles.js';
import { AppError } from '../middleware/errorHandler.js';

export const createDonation = async (req, res, next) => {
  try {
    const donation = await Donation.create({
      ...req.body,
      donor: req.user?._id,
    });

    if (donation.home) {
      const manager = await User.findOne({ home: donation.home, role: ROLES.HOME_MANAGER });
      if (manager) {
        await Notification.create({
          recipient: manager._id,
          home: donation.home,
          type: 'new_donation',
          title: 'New Donation Received',
          message: `₹${donation.amount} donated for ${donation.purpose}`,
          channels: { email: true, inApp: true },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your donation!',
      data: {
        donation,
        receipt: `/api/donations/${donation._id}/receipt`,
        certificate: `/api/donations/${donation._id}/certificate`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDonations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?.role === ROLES.HOME_MANAGER) {
      filter.home = req.user.home;
    } else if (req.user?.role === ROLES.DONOR) {
      filter.donor = req.user._id;
    }
    if (req.query.home) filter.home = req.query.home;

    const donations = await Donation.find(filter)
      .populate('home', 'name slug')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
};

export const uploadUtilization = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);

    donation.utilization.push({
      ...req.body,
      uploadedBy: req.user._id,
    });
    await donation.save();

    res.json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};
