export function normalizeRole(role) {
  if (!role) return null;

  const normalized = String(role).trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'superadmin') return 'super_admin';
  if (normalized === 'super_admin' || normalized === 'admin' || normalized === 'user') return normalized;

  return null;
}

export function canAccessAdmin(role) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'admin' || normalizedRole === 'super_admin';
}

export function canManageRoles(role) {
  return normalizeRole(role) === 'super_admin';
}
