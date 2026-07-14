import Event from '../models/Event.js';
import Volunteer from '../models/Volunteer.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';

export const getEvents = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?.home) filter.home = req.user.home;
    if (req.query.type) filter.type = req.query.type;

    const events = await Event.find(filter)
      .populate('home', 'name slug')
      .sort({ date: 1 });

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
