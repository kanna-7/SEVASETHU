import Home from '../models/Home.js';
import Resident from '../models/Resident.js';
import Donation from '../models/Donation.js';
import Inventory from '../models/Inventory.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import jwt from 'jsonwebtoken';
import { ROLES } from '../config/roles.js';
import { AppError } from '../middleware/errorHandler.js';

export const registerHome = async (req, res, next) => {
  try {
    const { googleVerificationToken, ...homeData } = req.body;
    if (!googleVerificationToken) throw new AppError('Please sign in with Google before submitting your request', 401);
    let profile;
    try {
      profile = jwt.verify(googleVerificationToken, process.env.JWT_SECRET);
    } catch {
      throw new AppError('Your Google verification expired. Please sign in again.', 401);
    }

    if (profile?.purpose !== 'guardian_application' || !profile.email || profile.email.toLowerCase() !== homeData.email?.toLowerCase()) {
      throw new AppError('Use the same verified Google email for this request', 401);
    }
    for (const key of ['address', 'contactPerson', 'documents']) {
      if (typeof homeData[key] === 'string') homeData[key] = JSON.parse(homeData[key]);
    }
    if (!req.files?.homeImages?.length || !req.files?.guardianPhoto?.length) {
      throw new AppError('Please upload at least one home image and one guardian photo', 400);
    }

    homeData.email = profile.email;
    homeData.contactPerson = {
      ...homeData.contactPerson,
      name: homeData.contactPerson?.name || profile.name,
      email: profile.email,
    };
    homeData.status = 'pending';
    homeData.isVerified = false;
    const urls = req.files.homeImages.map((file) => `/api/uploads/${file.filename}`);
    homeData.images = { building: urls.slice(0, 3), gallery: urls };
    homeData.contactPerson.photo = `/api/uploads/${req.files.guardianPhoto[0].filename}`;

    const home = await Home.create(homeData);

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Awaiting admin verification.',
      data: home,
    });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    console.error('Home registration failed:', error.message);
    return next(new AppError(`Home registration failed: ${error.message}`, 400));
  }
};


export const getManagerDashboard = async (req, res, next) => {
  try {
    const homeId = req.user.home;
    if (!homeId) throw new AppError('No home assigned', 400);

    const [home, residents, donations, lowStock, events, notifications] = await Promise.all([
      Home.findById(homeId),
      Resident.countDocuments({ home: homeId, isActive: true }),
      Donation.aggregate([
        { $match: { home: homeId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Inventory.countDocuments({ home: homeId, isLowStock: true }),
      Event.countDocuments({ home: homeId, date: { $gte: new Date() } }),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    res.json({
      success: true,
      data: {
        home,
        totalResidents: residents,
        totalDonations: donations[0]?.count || 0,
        totalDonationAmount: donations[0]?.total || 0,
        lowStockItems: lowStock,
        upcomingEvents: events,
        unreadNotifications: notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateHome = async (req, res, next) => {
  try {
    const home = await Home.findOne({ _id: req.user.home });
    if (!home) throw new AppError('Home not found', 404);

    const homeData = { ...req.body };

    // Parse stringified JSON fields
    for (const key of ['address', 'contactPerson', 'documents']) {
      if (typeof homeData[key] === 'string') {
        try {
          homeData[key] = JSON.parse(homeData[key]);
        } catch (err) {
          console.error(`Failed to parse ${key} field:`, err);
        }
      }
    }

    // Merge nested objects to avoid overwriting existing properties
    if (homeData.contactPerson) {
      home.contactPerson = {
        ...home.contactPerson?.toObject(),
        ...homeData.contactPerson,
      };
    }
    
    // Handle file uploads
    if (req.files?.guardianPhoto?.length) {
      home.contactPerson = {
        ...home.contactPerson?.toObject(),
        photo: `/api/uploads/${req.files.guardianPhoto[0].filename}`,
      };
    }

    if (homeData.address) {
      home.address = {
        ...home.address?.toObject(),
        ...homeData.address,
      };
    }
    if (homeData.documents) {
      home.documents = {
        ...home.documents?.toObject(),
        ...homeData.documents,
      };
    }

    if (req.files?.homeImages?.length) {
      const urls = req.files.homeImages.map((file) => `/api/uploads/${file.filename}`);
      home.images = {
        ...home.images?.toObject(),
        building: urls.slice(0, 3),
        gallery: [...(home.images?.gallery || []), ...urls],
      };
    }

    // Clean up nested fields so Object.assign does not overwrite
    delete homeData.contactPerson;
    delete homeData.address;
    delete homeData.documents;
    delete homeData.images;

    Object.assign(home, homeData);
    await home.save();

    res.json({ success: true, data: home });
  } catch (error) {
    next(error);
  }
};

export const addNeed = async (req, res, next) => {
  try {
    const home = await Home.findById(req.user.home);
    if (!home) throw new AppError('Home not found', 404);

    home.currentNeeds.push(req.body);
    await home.save();

    res.json({ success: true, data: home.currentNeeds });
  } catch (error) {
    next(error);
  }
};

export const getMyNeeds = async (req, res, next) => {
  try {
    const home = await Home.findById(req.user.home).select('currentNeeds');
    if (!home) throw new AppError('Home not found', 404);
    res.json({ success: true, data: home.currentNeeds });
  } catch (error) {
    next(error);
  }
};

export const addMonthlyExpense = async (req, res, next) => {
  try {
    const home = await Home.findById(req.user.home);
    if (!home) throw new AppError('Home not found', 404);

    home.monthlyExpenses.push(req.body);
    await home.save();

    res.json({ success: true, data: home.monthlyExpenses });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const home = await Home.findOne({ slug: req.params.slug, status: 'approved' });
    if (!home) throw new AppError('Home not found', 404);

    const { donorName, rating, comment } = req.body;
    home.reviews.push({ donorName, rating, comment });

    const total = home.reviews.reduce((sum, r) => sum + r.rating, 0);
    home.averageRating = total / home.reviews.length;
    await home.save();

    res.json({ success: true, data: home.reviews });
  } catch (error) {
    next(error);
  }
};
