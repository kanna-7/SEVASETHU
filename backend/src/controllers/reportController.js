import Donation from '../models/Donation.js';
import Resident from '../models/Resident.js';
import Inventory from '../models/Inventory.js';
import Home from '../models/Home.js';
import { AppError } from '../middleware/errorHandler.js';

export const generateReport = async (req, res, next) => {
  try {
    const { type, homeId, month, year } = req.query;
    const home = homeId || req.user?.home;
    const startDate = month && year ? new Date(year, month - 1, 1) : null;
    const endDate = month && year ? new Date(year, month, 0, 23, 59, 59) : null;

    let data = {};

    switch (type) {
      case 'donation': {
        const filter = { status: 'completed' };
        if (home) filter.home = home;
        if (startDate) filter.createdAt = { $gte: startDate, $lte: endDate };
        data = await Donation.find(filter).populate('home', 'name');
        break;
      }
      case 'resident': {
        const filter = { isActive: true };
        if (home) filter.home = home;
        data = await Resident.find(filter).populate('home', 'name');
        break;
      }
      case 'inventory': {
        const filter = {};
        if (home) filter.home = home;
        data = await Inventory.find(filter).populate('home', 'name');
        break;
      }
      case 'expense': {
        const homeDoc = await Home.findById(home);
        data = homeDoc?.monthlyExpenses || [];
        break;
      }
      case 'health': {
        const filter = { isActive: true };
        if (home) filter.home = home;
        data = await Resident.find(filter).select('name health governmentSchemes financial');
        break;
      }
      case 'pension': {
        const filter = { isActive: true };
        if (home) filter.home = home;
        const residents = await Resident.find(filter).select('name governmentSchemes financial');
        data = residents.map((r) => ({
          name: r.name,
          schemes: r.governmentSchemes,
          financial: r.financial,
        }));
        break;
      }
      default:
        throw new AppError('Invalid report type', 400);
    }

    res.json({
      success: true,
      reportType: type,
      generatedAt: new Date(),
      count: Array.isArray(data) ? data.length : 1,
      data,
    });
  } catch (error) {
    next(error);
  }
};
