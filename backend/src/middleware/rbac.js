import { ROLE_PERMISSIONS, ROLES } from '../config/roles.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    next();
  };
};

export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const permissions = ROLE_PERMISSIONS[req.user.role] || [];
    if (permissions.includes('*') || permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  };
};

export const isSuperAdmin = authorize(ROLES.SUPER_ADMIN);
export const isAdmin = authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN);
export const isHomeManager = authorize(ROLES.HOME_MANAGER);
export const isMedicalPartner = authorize(ROLES.MEDICAL_PARTNER);
