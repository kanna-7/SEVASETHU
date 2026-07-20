import HomeStatus from '../models/HomeStatus.js';
import Home from '../models/Home.js';
import { AppError } from '../middleware/errorHandler.js';
import { ROLES } from '../config/roles.js';

// Manager — get current status for their home
export const getMyHomeStatus = async (req, res, next) => {
  try {
    const homeId = req.user.home;
    if (!homeId) throw new AppError('No home assigned to your account', 400);

    const status = await HomeStatus.findOne({ home: homeId })
      .populate('submittedBy', 'name');

    res.json({ success: true, data: status || null });
  } catch (error) {
    next(error);
  }
};

// Manager — create or update status (upsert)
export const upsertHomeStatus = async (req, res, next) => {
  try {
    const homeId = req.user.home;
    if (!homeId) throw new AppError('No home assigned to your account', 400);

    const payload = {
      ...req.body,
      home: homeId,
      submittedBy: req.user._id,
      submittedByName: req.user.name,
    };

    // Parse array fields if sent as JSON strings
    for (const field of ['immediateSupport', 'activeIssues']) {
      if (typeof payload[field] === 'string') {
        try { payload[field] = JSON.parse(payload[field]); } catch { /* keep as is */ }
      }
    }

    const status = await HomeStatus.findOneAndUpdate(
      { home: homeId },
      payload,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

// Public — get status by home slug (shown on public home detail page)
export const getPublicHomeStatus = async (req, res, next) => {
  try {
    const home = await Home.findOne({ slug: req.params.slug, status: 'approved' }).select('_id');
    if (!home) throw new AppError('Home not found', 404);

    const status = await HomeStatus.findOne({ home: home._id })
      .select('-submittedBy')
      .lean();

    res.json({ success: true, data: status || null });
  } catch (error) {
    next(error);
  }
};

// Admin — get status for any home by homeId
export const getHomeStatusAdmin = async (req, res, next) => {
  try {
    const status = await HomeStatus.findOne({ home: req.params.homeId })
      .populate('submittedBy', 'name email');
    res.json({ success: true, data: status || null });
  } catch (error) {
    next(error);
  }
};

// Admin — get all homes with their status summary
export const getAllHomeStatuses = async (req, res, next) => {
  try {
    const statuses = await HomeStatus.find()
      .populate('home', 'name slug type address')
      .populate('submittedBy', 'name')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: statuses });
  } catch (error) {
    next(error);
  }
};
