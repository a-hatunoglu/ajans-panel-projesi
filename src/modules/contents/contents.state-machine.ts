import { ContentStatus, UserRole, AgencyRole, CompanyRole } from '../../shared/types/enums';

/**
 * İçerik durum geçiş makinesi.
 *
 * Geçerli geçişler:
 *   draft       → in_review
 *   in_review   → approved | revise
 *   revise      → in_review
 *   approved    → scheduled
 *   scheduled   → published
 *   scheduled   → draft       (plandan geri çekme)
 */

interface Transition {
  from: string;
  to: string;
  allowedRoles: string[];
}

const TRANSITIONS: Transition[] = [
  // Designer/Editor içerik oluşturur → onaya gönderir
  { from: ContentStatus.DRAFT, to: ContentStatus.IN_REVIEW, allowedRoles: [UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN, CompanyRole.EDITOR, CompanyRole.DESIGNER] },

  // Client (veya Platform Owner / Agency Admin) onaylar
  { from: ContentStatus.IN_REVIEW, to: ContentStatus.APPROVED, allowedRoles: [UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN, CompanyRole.CLIENT] },

  // Client (veya Platform Owner / Agency Admin) revize ister
  { from: ContentStatus.IN_REVIEW, to: ContentStatus.REVISE, allowedRoles: [UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN, CompanyRole.CLIENT] },

  // Revize sonrası tekrar onaya gönderilir
  { from: ContentStatus.REVISE, to: ContentStatus.IN_REVIEW, allowedRoles: [UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN, CompanyRole.EDITOR, CompanyRole.DESIGNER] },

  // Onaylanan içerik planlanır
  { from: ContentStatus.APPROVED, to: ContentStatus.SCHEDULED, allowedRoles: [UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN, CompanyRole.EDITOR] },

  // Planlanan içerik yayınlanır
  { from: ContentStatus.SCHEDULED, to: ContentStatus.PUBLISHED, allowedRoles: [UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN, CompanyRole.EDITOR] },

  // Planlanan içerik geri çekilir (draft'a döner, tekrar onay gerekir)
  { from: ContentStatus.SCHEDULED, to: ContentStatus.DRAFT, allowedRoles: [UserRole.PLATFORM_OWNER, AgencyRole.AGENCY_ADMIN, CompanyRole.EDITOR] },
];

/**
 * Belirli bir geçişin geçerli olup olmadığını ve rol/rollerden en az birinin yetkili olup olmadığını kontrol eder.
 */
export function canTransition(from: string, to: string, actorRanks: string | string[]): boolean {
  const roles = Array.isArray(actorRanks) ? actorRanks : [actorRanks];
  return TRANSITIONS.some(
    (t) => t.from === from && t.to === to && roles.some((r) => t.allowedRoles.includes(r))
  );
}

/**
 * Belirli bir durum ve roller için yapılabilecek geçişleri döner.
 */
export function getValidTransitions(from: string, actorRanks: string | string[]): string[] {
  const roles = Array.isArray(actorRanks) ? actorRanks : [actorRanks];
  
  // A set to avoid duplicate transitions if multiple roles allow the same transition
  const validTransitions = new Set<string>();

  TRANSITIONS.forEach((t) => {
    if (t.from === from && roles.some((r) => t.allowedRoles.includes(r))) {
      validTransitions.add(t.to);
    }
  });

  return Array.from(validTransitions);
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
