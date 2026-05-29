export type UserRole = 'admin' | 'employee' | 'client' | 'auditor';

export function canManageUsers(role: UserRole) {
  return role === 'admin';
}

export function canCreateCase(role: UserRole) {
  return role === 'admin' || role === 'employee';
}

export function canUploadDocument(role: UserRole) {
  return role === 'admin' || role === 'employee' || role === 'client';
}

export function canGenerateReport(role: UserRole) {
  return role === 'admin' || role === 'employee' || role === 'auditor';
}

export function canUseAi(role: UserRole) {
  return role === 'admin' || role === 'employee';
}
