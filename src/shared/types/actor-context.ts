export interface ActorContext {
  userId: string;
  role: string;            // Global system role (platform_owner, user)
  agencyId?: string;       // Current agency context (resolved by agencyScope)
  agencyRole?: string;     // Role within the agency (agency_admin, agency_member)
  companyRoles?: string[]; // Operational roles scoped to the activated company (editor, designer, client)
  ipAddress?: string;
  userAgent?: string;
}
