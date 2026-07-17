import Resident from '../models/Resident.js';
import Home from '../models/Home.js';
import Notification from '../models/Notification.js';
import { ROLES } from '../config/roles.js';
import { AppError } from '../middleware/errorHandler.js';
import { getFileUrl } from '../config/upload.js';

export const getResidents = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === ROLES.HOME_MANAGER) {
      filter.home = req.user.home;
    } else {
      filter.isActive = true;
      if (req.query.home) {
        filter.home = req.query.home;
      }
    }

    const residents = await Resident.find(filter)
      .populate('home', 'name type')
      .sort({ name: 1 });

    res.json({ success: true, count: residents.length, data: residents });
  } catch (error) {
    next(error);
  }
};

export const getResident = async (req, res, next) => {
  try {
    const resident = await Resident.findById(req.params.id).populate('home', 'name type');
    if (!resident) throw new AppError('Resident not found', 404);

    if (req.user.role === ROLES.HOME_MANAGER && resident.home._id.toString() !== req.user.home?.toString()) {
      throw new AppError('Access denied', 403);
    }

    res.json({ success: true, data: resident });
  } catch (error) {
    next(error);
  }
};

export const createResident = async (req, res, next) => {
  try {
    const homeId = req.user.home || req.body.home;
    if (!homeId) throw new AppError('Home ID required', 400);

    const residentData = { ...req.body };
    const objectsToParse = ['guardian', 'emergencyContact', 'health', 'governmentSchemes', 'financial', 'education'];
    for (const key of objectsToParse) {
      if (typeof residentData[key] === 'string') {
        try {
          residentData[key] = JSON.parse(residentData[key]);
        } catch (err) {
          console.error(`Failed to parse ${key} field:`, err);
        }
      }
    }

    if (req.file) {
      residentData.photo = getFileUrl(req.file);
    }

    const resident = await Resident.create({ ...residentData, home: homeId });

    await Home.findByIdAndUpdate(homeId, { $inc: { residentCount: 1 } });

    const admins = await Notification.insertMany([
      {
        type: 'resident_added',
        title: 'New Resident Added',
        message: `New resident "${resident.name}" has been added.`,
        home: homeId,
        channels: { inApp: true },
      },
    ]);

    res.status(201).json({ success: true, data: resident });
  } catch (error) {
    next(error);
  }
};

export const updateResident = async (req, res, next) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) throw new AppError('Resident not found', 404);

    if (req.user.role === ROLES.HOME_MANAGER && resident.home.toString() !== req.user.home?.toString()) {
      throw new AppError('Access denied', 403);
    }

    const residentData = { ...req.body };
    const objectsToParse = ['guardian', 'emergencyContact', 'health', 'governmentSchemes', 'financial', 'education'];
    for (const key of objectsToParse) {
      if (typeof residentData[key] === 'string') {
        try {
          residentData[key] = JSON.parse(residentData[key]);
        } catch (err) {
          console.error(`Failed to parse ${key} field:`, err);
        }
      }
    }

    if (req.file) {
      // Only update photo when a new file is explicitly uploaded
      residentData.photo = getFileUrl(req.file);
    } else {
      // Preserve existing photo — remove from update data to prevent overwrite
      delete residentData.photo;
    }

    const oldIsActive = resident.isActive;

    Object.assign(resident, residentData);

    if (resident.status === 'expired' || resident.status === 'discharged') {
      resident.isActive = false;
      if (resident.status === 'discharged') {
        resident.dischargedDate = resident.dischargedDate || new Date();
      }
    } else {
      resident.isActive = true;
    }

    await resident.save();

    if (oldIsActive && !resident.isActive) {
      await Home.findByIdAndUpdate(resident.home, { $inc: { residentCount: -1 } });
    } else if (!oldIsActive && resident.isActive) {
      await Home.findByIdAndUpdate(resident.home, { $inc: { residentCount: 1 } });
    }

    res.json({ success: true, data: resident });
  } catch (error) {
    next(error);
  }
};

export const removeResident = async (req, res, next) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) throw new AppError('Resident not found', 404);

    resident.isActive = false;
    resident.dischargedDate = new Date();
    await resident.save();

    await Home.findByIdAndUpdate(resident.home, { $inc: { residentCount: -1 } });

    res.json({ success: true, message: 'Resident removed' });
  } catch (error) {
    next(error);
  }
};

export const addDailyRecord = async (req, res, next) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) throw new AppError('Resident not found', 404);

    resident.dailyRecords.push(req.body);
    await resident.save();

    res.json({ success: true, data: resident.dailyRecords });
  } catch (error) {
    next(error);
  }
};

export const updateSchemeStatus = async (req, res, next) => {
  try {
    const { scheme, status, reason } = req.body;
    const resident = await Resident.findById(req.params.id);
    if (!resident) throw new AppError('Resident not found', 404);

    if (resident.governmentSchemes[scheme]) {
      resident.governmentSchemes[scheme].status = status;
      resident.governmentSchemes[scheme].reason = reason;
      if (status === 'applied') resident.governmentSchemes[scheme].appliedDate = new Date();
      if (status === 'approved') resident.governmentSchemes[scheme].approvedDate = new Date();
    }

    await resident.save();

    if (status === 'approved') {
      await Notification.create({
        recipient: req.user._id,
        type: 'pension_approved',
        title: 'Scheme Approved',
        message: `${scheme} approved for ${resident.name}`,
        channels: { email: true, inApp: true },
      });
    }

    res.json({ success: true, data: resident.governmentSchemes });
  } catch (error) {
    next(error);
  }
};
