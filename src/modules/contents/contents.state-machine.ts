import { ContentStatus, UserRole } from '../../shared/types/enums';

/**
 * İçerik durum geçiş makinesi.
 *
 * Geçerli geçişler:
 *   draft       → in_review
 *   in_review   → approved | revise
 *   revise      → in_review
 *   approved    → scheduled
 *   scheduled   → published
 */

interface Transition {
  from: string;
  to: string;
  allowedRoles: string[];
}

const TRANSITIONS: Transition[] = [
  // Designer/Editor içerik oluşturur → onaya gönderir
  { from: ContentStatus.DRAFT, to: ContentStatus.IN_REVIEW, allowedRoles: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR, UserRole.DESIGNER] },

  // Client (veya Owner/Admin) onaylar
  { from: ContentStatus.IN_REVIEW, to: ContentStatus.APPROVED, allowedRoles: [UserRole.OWNER, UserRole.ADMIN, UserRole.CLIENT] },

  // Client (veya Owner/Admin) revize ister
  { from: ContentStatus.IN_REVIEW, to: ContentStatus.REVISE, allowedRoles: [UserRole.OWNER, UserRole.ADMIN, UserRole.CLIENT] },

  // Revize sonrası tekrar onaya gönderilir
  { from: ContentStatus.REVISE, to: ContentStatus.IN_REVIEW, allowedRoles: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR, UserRole.DESIGNER] },

  // Onaylanan içerik planlanır
  { from: ContentStatus.APPROVED, to: ContentStatus.SCHEDULED, allowedRoles: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR] },

  // Planlanan içerik yayınlanır
  { from: ContentStatus.SCHEDULED, to: ContentStatus.PUBLISHED, allowedRoles: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR] },
];

/**
 * Belirli bir geçişin geçerli olup olmadığını ve rolün yetkili olup olmadığını kontrol eder.
 */
export function canTransition(from: string, to: string, role: string): boolean {
  return TRANSITIONS.some((t) => t.from === from && t.to === to && t.allowedRoles.includes(role));
}

/**
 * Belirli bir durum ve rol için yapılabilecek geçişleri döner.
 */
export function getValidTransitions(from: string, role: string): string[] {
  return TRANSITIONS
    .filter((t) => t.from === from && t.allowedRoles.includes(role))
    .map((t) => t.to);
}

/**
 * Geçerli bir durum string'i mi kontrol eder.
 */
export function isValidStatus(status: string): boolean {
  return Object.values(ContentStatus).includes(status as ContentStatus);
}

/**
 * İçerik düzenlenebilir mi? (sadece draft ve revise durumlarında)
 */
export function isEditable(status: string): boolean {
  return status === ContentStatus.DRAFT || status === ContentStatus.REVISE;
}

/**
 * İçerik silinebilir mi? (published içerik silinemez)
 */
export function isDeletable(status: string): boolean {
  return status !== ContentStatus.PUBLISHED;
}
