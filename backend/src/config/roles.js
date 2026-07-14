export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  HOME_MANAGER: 'home_manager',
  MEDICAL_PARTNER: 'medical_partner',
  VOLUNTEER: 'volunteer',
  DONOR: 'donor',
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.ADMIN]: [
    'homes:read', 'homes:approve', 'homes:update',
    'donations:read', 'donations:verify',
    'residents:read', 'reports:read', 'reports:generate',
    'medical_camps:approve', 'users:manage', 'notifications:send',
  ],
  [ROLES.HOME_MANAGER]: [
    'home:own:read', 'home:own:update',
    'residents:own:manage', 'inventory:own:manage',
    'donations:own:read', 'events:own:manage',
    'expenses:own:manage', 'notifications:read',
  ],
  [ROLES.MEDICAL_PARTNER]: [
    'medical_camps:read', 'medical_camps:create',
    'residents:camp:read', 'medical_reports:upload',
  ],
  [ROLES.VOLUNTEER]: [
    'events:read', 'activities:read', 'notifications:read',
  ],
  [ROLES.DONOR]: [
    'homes:public:read', 'donations:own:read',
  ],
};

export const HOME_TYPES = ['orphanage', 'old_age_home'];
export const HOME_STATUS = ['pending', 'approved', 'rejected', 'suspended'];
export const CONDITION_STATUS = ['excellent', 'good', 'needs_support', 'critical'];
export const SCHEME_STATUS = ['eligible', 'applied', 'approved', 'rejected'];
