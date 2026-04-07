export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
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
