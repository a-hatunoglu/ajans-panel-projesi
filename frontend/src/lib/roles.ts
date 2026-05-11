/**
 * Frontend role utilities for multi-tenancy.
 *
 * User.role values from backend:
 *   - "platform_owner" → Super admin (platform level)
 *   - "user"           → Normal user (agency/company roles determined by context)
 *
 * Session includes agencyRole:
 *   - "agency_admin"   → Agency admin
 *   - "agency_member"  → Agency member
 */

/** Platform-level admin (super admin) */
export function isPlatformOwner(role?: string): boolean {
  return role === 'platform_owner';
}

/** Agency-level admin (manages their agency's companies, users, etc.) */
export function isAgencyAdmin(role?: string, agencyRole?: string): boolean {
  if (role === 'platform_owner') return true;
  return agencyRole === 'agency_admin';
}

/**
 * Can manage companies (create, update, delete, manage users).
 * Both platform owner and agency admin qualify.
 */
export function canManageCompanies(role?: string, agencyRole?: string): boolean {
  return isAgencyAdmin(role, agencyRole);
}

/**
 * Can permanently delete resources.
 * Only platform owner has this authority.
 */
export function canPermanentDelete(role?: string): boolean {
  return isPlatformOwner(role);
}
