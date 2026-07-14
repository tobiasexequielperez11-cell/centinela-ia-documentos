export type UserRole = 'admin' | 'employee' | 'client' | 'auditor';

const USER_ROLES: UserRole[] = ['admin', 'employee', 'client', 'auditor'];
const ORG_ADMIN_INVITABLE_ROLES: UserRole[] = [
  'employee',
  'auditor',
  'client',
];

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && USER_ROLES.includes(role as UserRole);
}

export function canManageUsers(role: UserRole) {
  return role === 'admin';
}

export function canOrgAdminAssignRole(role: unknown): role is UserRole {
  return isUserRole(role) && ORG_ADMIN_INVITABLE_ROLES.includes(role);
}

export function canCreateCase(role: UserRole) {
  return role === 'admin' || role === 'employee';
}

export function canUpdateCase(role: UserRole) {
  return role === 'admin' || role === 'employee';
}

export function canUploadDocument(role: UserRole) {
  return role === 'admin' || role === 'employee';
}

export function canGenerateReport(role: UserRole) {
  return role === 'admin' || role === 'employee' || role === 'auditor';
}

export function canUseAi(role: UserRole) {
  return role === 'admin' || role === 'employee';
}

export function canViewAudit(role: UserRole) {
  return role === 'admin' || role === 'auditor';
}

export function isReadOnlyRole(role: UserRole) {
  return role === 'auditor' || role === 'client';
}

export function canArchiveCase(role: UserRole) {
  return role === 'admin' || role === 'employee';
}

export function canDeleteCase(role: UserRole) {
  return role === 'admin';
}

export function canArchiveDocument(role: UserRole) {
  return role === 'admin' || role === 'employee';
}

export function canDeleteDocument(role: UserRole) {
  return role === 'admin';
}

export function canManageProperty(role: UserRole) {
  return role === 'admin' || role === 'employee';
}

export function canManageClient(role: UserRole) {
  return role === 'admin' || role === 'employee';
}

export function canManageRental(role: UserRole) {
  return role === 'admin' || role === 'employee';
}
