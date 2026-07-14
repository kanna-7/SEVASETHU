import MedicalCamp from '../models/MedicalCamp.js';
import Event from '../models/Event.js';
import { AppError } from '../middleware/errorHandler.js';

export const getMedicalCamps = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const camps = await MedicalCamp.find(filter)
      .populate('hospital', 'name organization')
      .sort({ date: -1 });

    res.json({ success: true, data: camps });
  } catch (error) {
    next(error);
  }
};

export const createMedicalCamp = async (req, res, next) => {
  try {
    const camp = await MedicalCamp.create({
      ...req.body,
      hospital: req.user._id,
      hospitalName: req.user.organization || req.user.name,
    });

    await Event.create({
      title: camp.title,
      type: 'medical_camp',
      date: camp.date,
      endDate: camp.endDate,
      location: camp.location?.address,
      createdBy: req.user._id,
      relatedEntity: { type: 'medical_camp', id: camp._id },
    });

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
