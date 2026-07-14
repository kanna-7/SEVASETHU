import Inventory from '../models/Inventory.js';
import Notification from '../models/Notification.js';
import { ROLES } from '../config/roles.js';
import { AppError } from '../middleware/errorHandler.js';

export const getInventory = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?.role === ROLES.HOME_MANAGER) {
      filter.home = req.user.home;
    } else if (req.query.home) {
      filter.home = req.query.home;
    }

    const items = await Inventory.find(filter).sort({ item: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req, res, next) => {
  try {
    const homeId = req.user.home || req.body.home;
    const item = await Inventory.create({ ...req.body, home: homeId });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) throw new AppError('Item not found', 404);

    const { quantity, operation } = req.body;
    if (operation === 'add') {
      item.currentStock += quantity;
      item.lastRestocked = new Date();
    } else if (operation === 'subtract') {
      item.currentStock = Math.max(0, item.currentStock - quantity);
    } else {
      item.currentStock = quantity;
    }

    item.isLowStock = item.currentStock <= item.minimumStock;
    await item.save();

    if (item.isLowStock) {
      await Notification.create({
        home: item.home,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${item.item} is running low (${item.currentStock} ${item.unit} remaining)`,
        channels: { email: true, inApp: true },
      });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const getLowStockAlerts = async (req, res, next) => {
  try {
    const filter = { isLowStock: true };
    if (req.user?.role === ROLES.HOME_MANAGER) filter.home = req.user.home;

    const items = await Inventory.find(filter).populate('home', 'name');
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};
