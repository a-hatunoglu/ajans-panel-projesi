/**
 * Frontend Page Registry
 * 
 * Static list of all frontend routes for informational display.
 * These are NOT probed via HTTP — they exist as a reference list
 * so the owner/admin can see every page in the system.
 */

export type PageRegistryEntry = {
  /** Human-readable name */
  name: string;
  /** Route path */
  path: string;
  /** Route group for UI categorization */
  group: 'app' | 'auth' | 'legal';
  /** Which roles can access this page */
  accessRoles: string[];
  /** Brief description */
  description: string;
};

export const PAGE_REGISTRY: PageRegistryEntry[] = [
  // ─── App (authenticated) ───────────────────────────────────
  { name: 'Dashboard', path: '/app', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'agency_member', 'editor', 'designer', 'client'], description: 'Ana panel — istatistikler ve widget\'lar' },
  { name: 'Companies', path: '/app/companies', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'agency_member', 'editor', 'designer', 'client'], description: 'Şirket listesi' },
  { name: 'Company Detail', path: '/app/companies/[id]', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'agency_member', 'editor', 'designer', 'client'], description: 'Şirket detay sayfası' },
  { name: 'Contents', path: '/app/contents', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'agency_member', 'editor', 'designer', 'client'], description: 'İçerik listesi' },
  { name: 'New Content', path: '/app/contents/new', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'editor', 'designer'], description: 'Yeni içerik oluşturma' },
  { name: 'Content Detail', path: '/app/contents/[id]', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'agency_member', 'editor', 'designer', 'client'], description: 'İçerik detay ve iş akışı' },
  { name: 'Content Edit', path: '/app/contents/[id]/edit', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'editor', 'designer'], description: 'İçerik düzenleme' },
  { name: 'Content Schedule', path: '/app/contents/[id]/schedule', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'editor'], description: 'İçerik planlama' },
  { name: 'Content Publish', path: '/app/contents/[id]/publish', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'editor'], description: 'İçerik yayınlama' },
  { name: 'Calendar', path: '/app/calendar', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'agency_member', 'editor', 'designer', 'client'], description: 'Haftalık takvim görünümü' },
  { name: 'Notifications', path: '/app/notifications', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'agency_member', 'editor', 'designer', 'client'], description: 'Bildirimler' },
  { name: 'Payments', path: '/app/payments', group: 'app', accessRoles: ['platform_owner', 'agency_admin'], description: 'Ödeme yönetimi' },
  { name: 'Activity', path: '/app/activity', group: 'app', accessRoles: ['platform_owner', 'agency_admin'], description: 'Aktivite logları' },
  { name: 'Settings', path: '/app/settings', group: 'app', accessRoles: ['platform_owner', 'agency_admin', 'agency_member', 'editor', 'designer', 'client'], description: 'Profil ayarları' },
  { name: 'User Management', path: '/app/settings/users', group: 'app', accessRoles: ['platform_owner', 'agency_admin'], description: 'Kullanıcı yönetimi' },
  { name: 'System Health', path: '/app/system-health', group: 'app', accessRoles: ['platform_owner'], description: 'Sistem sağlığı monitörü' },

  // ─── Auth ──────────────────────────────────────────────────
  { name: 'Login', path: '/login', group: 'auth', accessRoles: ['*'], description: 'Giriş sayfası' },
  { name: 'Forgot Password', path: '/forgot-password', group: 'auth', accessRoles: ['*'], description: 'Şifre sıfırlama talebi' },
  { name: 'Reset Password', path: '/reset-password', group: 'auth', accessRoles: ['*'], description: 'Yeni şifre belirleme' },
  { name: 'Accept Invite', path: '/accept-invite', group: 'auth', accessRoles: ['*'], description: 'Davet kabul' },
  { name: 'Force Password', path: '/force-password', group: 'auth', accessRoles: ['*'], description: 'Zorunlu şifre değişikliği' },

  // ─── Legal ─────────────────────────────────────────────────
  { name: 'Terms', path: '/terms', group: 'legal', accessRoles: ['*'], description: 'Kullanım koşulları' },
  { name: 'Privacy', path: '/privacy', group: 'legal', accessRoles: ['*'], description: 'Gizlilik politikası' },
  { name: 'Cookies', path: '/cookies', group: 'legal', accessRoles: ['*'], description: 'Çerez politikası' },
];
