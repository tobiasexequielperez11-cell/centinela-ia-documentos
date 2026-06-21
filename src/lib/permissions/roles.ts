export type UserRole = 'admin' | 'employee' | 'client' | 'auditor';

const USER_ROLES: UserRole[] = ['admin', 'employee', 'client', 'auditor'];

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && USER_ROLES.includes(role as UserRole);
}

export function canManageUsers(role: UserRole) {
  return role === 'admin';
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
