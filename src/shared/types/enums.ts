// ─── Multi-Tenancy Role Model ─────────────────────────────
// Platform level: only platform_owner is stored in User.role
// Agency level: agency_admin, agency_member stored in AgencyUser.role
// Company level: editor, designer, client stored in CompanyUserRole.role

export enum UserRole {
  PLATFORM_OWNER = 'platform_owner',
  USER = 'user',
  // Legacy aliases — will be removed after full migration
  /** @deprecated use AgencyRole.AGENCY_ADMIN + agencyScope middleware */
  OWNER = 'platform_owner',
  /** @deprecated use AgencyRole.AGENCY_ADMIN + agencyScope middleware */
  ADMIN = 'platform_owner',
  /** @deprecated use AgencyRole.AGENCY_MEMBER */
  MEMBER = 'user',
}

export enum AgencyRole {
  AGENCY_ADMIN = 'agency_admin',
  AGENCY_MEMBER = 'agency_member',
}

export enum CompanyRole {
  EDITOR = 'editor',
  DESIGNER = 'designer',
  CLIENT = 'client',
}

export enum ContentStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  REVISE = 'revise',
  APPROVED = 'approved',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
}

export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  X = 'x',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

export enum CommentType {
  COMMENT = 'comment',
  APPROVAL = 'approval',
  REJECTION = 'rejection',
}
