import Event from '../models/Event.js';
import Home from '../models/Home.js';
import Volunteer from '../models/Volunteer.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';

export const getEvents = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?.home) filter.home = req.user.home;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const events = await Event.find(filter)
      .populate('home', 'name slug')
      .populate('createdBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

// Public route — get completed events with images for a home (by slug)
export const getPublicEvents = async (req, res, next) => {
  try {
    const home = await Home.findOne({ slug: req.params.slug, status: 'approved' }).select('_id');
    if (!home) throw new AppError('Home not found', 404);

    const events = await Event.find({
      home: home._id,
      isPublic: true,
      status: 'completed',
    })
      .select('title description type date endDate location images completionImages completionNotes completedAt')
      .sort({ completedAt: -1 });

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      home: req.body.home || req.user.home,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const registerVolunteer = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Volunteer registration submitted',
      data: volunteer,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipients: req.user._id }],
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { $or: [{ recipient: req.user._id }, { recipients: req.user._id }], isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
