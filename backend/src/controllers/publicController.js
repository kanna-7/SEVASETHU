import Home from '../models/Home.js';
import Resident from '../models/Resident.js';
import Donation from '../models/Donation.js';
import MedicalCamp from '../models/MedicalCamp.js';
import Volunteer from '../models/Volunteer.js';
import Event from '../models/Event.js';
import { AppError } from '../middleware/errorHandler.js';

export const getPublicStats = async (req, res, next) => {
  try {
    const [
      totalHomes,
      totalResidents,
      totalDonations,
      donationSum,
      medicalCamps,
      volunteers,
    ] = await Promise.all([
      Home.countDocuments({ status: 'approved' }),
      Resident.countDocuments({ isActive: true }),
      Donation.countDocuments({ status: 'completed' }),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      MedicalCamp.countDocuments({ status: 'completed' }),
      Volunteer.countDocuments({ status: 'active' }),
    ]);

    res.json({
      success: true,
      data: {
        totalHomes,
        totalResidents,
        totalDonations,
        totalDonationAmount: donationSum[0]?.total || 0,
        medicalCampsConducted: medicalCamps,
        activeVolunteers: volunteers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHomes = async (req, res, next) => {
  try {
    const { type, city, condition, search } = req.query;
    const filter = { status: 'approved' };

    if (type) filter.type = type;
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (condition) filter.conditionStatus = condition;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
      ];
    }

    const homes = await Home.find(filter)
      .select('name type slug address phone email residentCount images.gallery currentNeeds conditionStatus isVerified qrCode averageRating')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: homes.length, data: homes });
  } catch (error) {
    next(error);
  }
};

export const getHomeBySlug = async (req, res, next) => {
  try {
    const home = await Home.findOne({ slug: req.params.slug, status: 'approved' })
      .populate('manager', 'name email phone');

    if (!home) throw new AppError('Home not found', 404);

    const [donations, events, residents] = await Promise.all([
      Donation.find({ home: home._id, status: 'completed' })
        .select('donorName amount purpose createdAt isAnonymous')
        .sort({ createdAt: -1 })
        .limit(20),
      Event.find({ home: home._id, isPublic: true })
        .sort({ date: -1 })
        .limit(10),
      Resident.find({ home: home._id, isActive: { $ne: false } })
        .select('name photo gender age bloodGroup disability')
        .sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      data: { home, recentDonations: donations, events, residents },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicCalendar = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const filter = { isPublic: true };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const events = await Event.find(filter)
      .populate('home', 'name slug')
      .sort({ date: 1 });

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const getDonationTracker = async (req, res, next) => {
  try {
    const donations = await Donation.find({ status: 'completed', isAnonymous: false })
      .populate('home', 'name slug')
      .select('donorName amount purpose createdAt home isVerified')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
};
