import MedicalCamp from '../models/MedicalCamp.js';
import Event from '../models/Event.js';
import Home from '../models/Home.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';
import { ROLES } from '../config/roles.js';
import { getFileUrl } from '../config/upload.js';

export const getMedicalCamps = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    // If manager, only show camps for their home
    if (req.user?.role === ROLES.HOME_MANAGER && req.user.home) {
      filter.homes = req.user.home;
    }

    const camps = await MedicalCamp.find(filter)
      .populate('hospital', 'name organization')
      .populate('homes', 'name slug type')
      .sort({ date: -1 });

    res.json({ success: true, data: camps });
  } catch (error) {
    next(error);
  }
};

// Admin creates a camp for selected homes
export const createMedicalCamp = async (req, res, next) => {
  try {
    const { homes, ...campData } = req.body;

    // Parse homes if sent as JSON string
    let homeIds = homes;
    if (typeof homes === 'string') {
      try { homeIds = JSON.parse(homes); } catch { homeIds = [homes]; }
    }

    const camp = await MedicalCamp.create({
      ...campData,
      homes: homeIds || [],
      hospital: req.user._id,
      hospitalName: req.user.organization || req.user.name,
      status: 'approved', // admin-created camps are auto-approved
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });

    // Create one Event per selected home and notify each home's manager
    if (homeIds && homeIds.length > 0) {
      const selectedHomes = await Home.find({ _id: { $in: homeIds } }).populate('manager');

      for (const home of selectedHomes) {
        // Create event linked to this home
        await Event.create({
          title: camp.title,
          description: camp.description,
          type: 'medical_camp',
          home: home._id,
          date: camp.date,
          endDate: camp.endDate,
          location: camp.location?.address,
          createdBy: req.user._id,
          isPublic: true,
          status: 'pending',
          medicalCamp: camp._id,
          relatedEntity: { type: 'medical_camp', id: camp._id },
        });

        // Notify home manager
        if (home.manager) {
          await Notification.create({
            recipient: home.manager._id || home.manager,
            home: home._id,
            type: 'medical_camp',
            title: '🏥 New Medical Camp Scheduled',
            message: `A medical camp "${camp.title}" is scheduled on ${new Date(camp.date).toLocaleDateString('en-IN')} at ${camp.location?.address || 'TBD'}. Please prepare your residents.`,
            link: `/manager/events`,
            channels: { email: true, inApp: true },
          });
        }
      }
    }

    res.status(201).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

export const registerResidentForCamp = async (req, res, next) => {
  try {
    const camp = await MedicalCamp.findById(req.params.id);
    if (!camp) throw new AppError('Medical camp not found', 404);

    const { residentId, homeId } = req.body;
    const alreadyRegistered = camp.registeredResidents.some(
      (r) => r.resident.toString() === residentId
    );
    if (alreadyRegistered) throw new AppError('Resident already registered', 400);

    camp.registeredResidents.push({ resident: residentId, home: homeId });
    await camp.save();

    res.json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

// Manager marks a medical camp event as complete and uploads images
export const completeMedicalCamp = async (req, res, next) => {
  try {
    const camp = await MedicalCamp.findById(req.params.id);
    if (!camp) throw new AppError('Medical camp not found', 404);

    // Check that this manager's home is part of this camp
    if (req.user.role === ROLES.HOME_MANAGER) {
      const homeMatch = camp.homes.some(
        (h) => h.toString() === req.user.home?.toString()
      );
      if (!homeMatch) throw new AppError('Access denied — your home is not part of this camp', 403);
    }

    // Process uploaded images
    const uploadedImages = req.files?.completionImages?.map(
      (f) => getFileUrl(f)
    ) || [];

    // Update camp
    camp.completionImages = [...(camp.completionImages || []), ...uploadedImages];
    camp.completedBy = req.user._id;
    camp.completedAt = new Date();
    camp.completionNotes = req.body.completionNotes || '';
    camp.status = 'completed';
    await camp.save();

    // Update the linked Event for this manager's home
    const event = await Event.findOne({
      medicalCamp: camp._id,
      home: req.user.home,
    });

    if (event) {
      event.status = 'completed';
      event.completionImages = uploadedImages;
      event.completionNotes = req.body.completionNotes || '';
      event.completedBy = req.user._id;
      event.completedAt = new Date();
      // Also add to main images for public display
      event.images = uploadedImages;
      await event.save();
    }

    res.json({ success: true, message: 'Camp marked as completed', data: camp });
  } catch (error) {
    next(error);
  }
};

export const uploadCampReport = async (req, res, next) => {
  try {
    const { residentId, doctorReport, medicines, images } = req.body;
    const camp = await MedicalCamp.findById(req.params.id);
    if (!camp) throw new AppError('Medical camp not found', 404);

    const entry = camp.registeredResidents.find(
      (r) => r.resident.toString() === residentId
    );
    if (!entry) throw new AppError('Resident not registered for this camp', 404);

    entry.attended = true;
    entry.doctorReport = doctorReport;
    entry.medicines = medicines;
    entry.images = images;
    await camp.save();

    res.json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

// Get all camps for admin with full details
export const getAllCampsAdmin = async (req, res, next) => {
  try {
    const camps = await MedicalCamp.find()
      .populate('hospital', 'name organization email')
      .populate('homes', 'name slug type city')
      .populate('completedBy', 'name')
      .sort({ date: -1 });
    res.json({ success: true, data: camps });
  } catch (error) {
    next(error);
  }
};
