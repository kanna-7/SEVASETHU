import Home from '../models/Home.js';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import Resident from '../models/Resident.js';
import MedicalCamp from '../models/MedicalCamp.js';
import Volunteer from '../models/Volunteer.js';
import Notification from '../models/Notification.js';
import { ROLES } from '../config/roles.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalHomes,
      totalResidents,
      pendingRequests,
      donations,
      donationSum,
      activeEvents,
      medicalCamps,
      volunteers,
    ] = await Promise.all([
      Home.countDocuments({ status: 'approved' }),
      Resident.countDocuments({ isActive: true }),
      Home.countDocuments({ status: 'pending' }),
      Donation.countDocuments({ status: 'completed' }),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      MedicalCamp.countDocuments({ status: { $in: ['approved', 'ongoing'] } }),
      MedicalCamp.countDocuments(),
      Volunteer.countDocuments({ status: 'active' }),
    ]);

    res.json({
      success: true,
      data: {
        totalHomes,
        totalResidents,
        pendingRequests,
        totalDonations: donations,
        totalDonationAmount: donationSum[0]?.total || 0,
        activeEvents,
        medicalCamps,
        activeVolunteers: volunteers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingHomes = async (req, res, next) => {
  try {
    const homes = await Home.find({ status: 'pending' })
      .populate('manager', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: homes });
  } catch (error) {
    next(error);
  }
};

export const getApprovedHomes = async (req, res, next) => {
  try {
    const homes = await Home.find({ status: 'approved' })
      .populate('manager', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: homes });
  } catch (error) {
    next(error);
  }
};

export const approveHome = async (req, res, next) => {
  try {
    const home = await Home.findById(req.params.id);
    if (!home) throw new AppError('Home not found', 404);
    if (home.status !== 'pending') throw new AppError('Home already processed', 400);

    const { approved, rejectionReason, managerEmail, managerPassword } = req.body;

    if (approved) {
      home.status = 'approved';
      home.isVerified = true;
      home.verifiedAt = new Date();
      home.verifiedBy = req.user._id;

      const temporaryPassword = managerPassword || 'ChangeMe@123';
      let manager = await User.findOne({ email: managerEmail || home.email });
      let managerCreated = false;
      if (!manager) {
        manager = await User.create({
          name: home.contactPerson?.name || home.name,
          email: managerEmail || home.email,
          password: temporaryPassword,
          phone: home.phone,
          role: ROLES.HOME_MANAGER,
          home: home._id,
        });
        managerCreated = true;
      } else {
        manager.role = ROLES.HOME_MANAGER;
        manager.home = home._id;
        await manager.save();
      }

      home.manager = manager._id;
      home.temporaryPassword = temporaryPassword;
      await home.save();

      await Notification.create({
        recipient: manager._id,
        home: home._id,
        type: 'home_approved',
        title: 'Home Approved',
        message: `Your home "${home.name}" has been approved. Login credentials have been sent.`,
        channels: { email: true, inApp: true },
      });

      res.json({
        success: true,
        message: 'Home approved',
        data: {
          home,
          manager: { email: manager.email, role: manager.role },
          temporaryPassword: managerCreated ? temporaryPassword : undefined,
        },
      });
    } else {
      home.status = 'rejected';
      await home.save();

      res.json({ success: true, message: 'Home rejected', data: home });
    }
  } catch (error) {
    next(error);
  }
};

export const verifyDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);

    donation.isVerified = true;
    donation.verifiedBy = req.user._id;
    donation.verifiedAt = new Date();
    await donation.save();

    res.json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};

export const approveMedicalCamp = async (req, res, next) => {
  try {
    const camp = await MedicalCamp.findById(req.params.id);
    if (!camp) throw new AppError('Medical camp not found', 404);

    camp.status = 'approved';
    camp.approvedBy = req.user._id;
    camp.approvedAt = new Date();
    await camp.save();

    const managers = await User.find({ role: ROLES.HOME_MANAGER });
    const notifications = managers.map((m) => ({
      recipient: m._id,
      type: 'medical_camp',
      title: 'New Medical Camp',
      message: `Medical camp "${camp.title}" scheduled on ${camp.date.toDateString()}`,
      link: `/medical-camps/${camp._id}`,
      channels: { email: true, inApp: true },
    }));
    await Notification.insertMany(notifications);

    res.json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter)
      .select('-password')
      .populate('home', 'name type')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getAllVolunteers = async (req, res, next) => {
  try {
    const volunteers = await Volunteer.find()
      .populate('preferredHome', 'name type')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: volunteers });
  } catch (error) {
    next(error);
  }
};

export const getPendingNeeds = async (req, res, next) => {
  try {
    const homes = await Home.find({ 'currentNeeds.status': 'pending' }).select('name currentNeeds');
    const pendingNeeds = [];
    homes.forEach((home) => {
      home.currentNeeds.forEach((need) => {
        if (need.status === 'pending') {
          pendingNeeds.push({
            homeId: home._id,
            homeName: home.name,
            needId: need._id,
            item: need.item,
            quantity: need.quantity,
            priority: need.priority,
            createdAt: need.createdAt,
          });
        }
      });
    });
    pendingNeeds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: pendingNeeds });
  } catch (error) {
    next(error);
  }
};

export const approveNeed = async (req, res, next) => {
  try {
    const { homeId, needId } = req.params;
    const home = await Home.findById(homeId);
    if (!home) throw new AppError('Home not found', 404);

    const need = home.currentNeeds.id(needId);
    if (!need) throw new AppError('Need request not found', 404);

    need.status = 'approved';
    await home.save();

    res.json({ success: true, message: 'Need request approved successfully' });
  } catch (error) {
    next(error);
  }
};

export const rejectNeed = async (req, res, next) => {
  try {
    const { homeId, needId } = req.params;
    const home = await Home.findById(homeId);
    if (!home) throw new AppError('Home not found', 404);

    const need = home.currentNeeds.id(needId);
    if (!need) throw new AppError('Need request not found', 404);

    home.currentNeeds.pull(needId);
    await home.save();

    res.json({ success: true, message: 'Need request rejected/removed successfully' });
  } catch (error) {
    next(error);
  }
};
