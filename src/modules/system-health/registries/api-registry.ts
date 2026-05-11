/**
 * API Endpoint Registry
 * 
 * Static list of all backend API endpoints for health scanning.
 * Only GET endpoints are actually probed (safe, read-only).
 * Non-GET endpoints are listed as "reachable" info items.
 */

export type ApiRegistryEntry = {
  /** Human-readable name */
  name: string;
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Route path (relative to API_PREFIX) */
  path: string;
  /** Whether this endpoint should be actively probed (only safe GETs) */
  probe: boolean;
  /** Module group for UI categorization */
  module: string;
};

export const API_REGISTRY: ApiRegistryEntry[] = [
  // ─── Health ────────────────────────────────────────────────
  { name: 'Health Check', method: 'GET', path: '/health', probe: true, module: 'core' },

  // ─── Auth ──────────────────────────────────────────────────
  { name: 'Login', method: 'POST', path: '/auth/login', probe: false, module: 'auth' },
  { name: 'Register', method: 'POST', path: '/auth/register', probe: false, module: 'auth' },
  { name: 'Refresh Token', method: 'POST', path: '/auth/refresh', probe: false, module: 'auth' },
  { name: 'Logout', method: 'POST', path: '/auth/logout', probe: false, module: 'auth' },
  { name: 'Forgot Password', method: 'POST', path: '/auth/forgot-password', probe: false, module: 'auth' },
  { name: 'Reset Password', method: 'POST', path: '/auth/reset-password', probe: false, module: 'auth' },
  { name: 'Verify Reset Token', method: 'POST', path: '/auth/verify-reset-token', probe: false, module: 'auth' },

  // ─── Users ─────────────────────────────────────────────────
  { name: 'Get Current User', method: 'GET', path: '/users/me', probe: true, module: 'users' },
  { name: 'Update Profile', method: 'PUT', path: '/users/me', probe: false, module: 'users' },
  { name: 'Change Password', method: 'PUT', path: '/users/me/password', probe: false, module: 'users' },
  { name: 'Create User', method: 'POST', path: '/users', probe: false, module: 'users' },
  { name: 'List Users', method: 'GET', path: '/users', probe: true, module: 'users' },

  // ─── Companies ─────────────────────────────────────────────
  { name: 'List Companies', method: 'GET', path: '/companies', probe: true, module: 'companies' },
  { name: 'Create Company', method: 'POST', path: '/companies', probe: false, module: 'companies' },

  // ─── Contents ──────────────────────────────────────────────
  { name: 'List Contents', method: 'GET', path: '/contents', probe: true, module: 'contents' },
  { name: 'Calendar (Global)', method: 'GET', path: '/contents/calendar', probe: true, module: 'contents' },

  // ─── Notifications ─────────────────────────────────────────
  { name: 'List Notifications', method: 'GET', path: '/notifications', probe: true, module: 'notifications' },
  { name: 'Unread Count', method: 'GET', path: '/notifications/unread-count', probe: true, module: 'notifications' },
  { name: 'Mark All Read', method: 'PUT', path: '/notifications/read-all', probe: false, module: 'notifications' },

  // ─── Payments ──────────────────────────────────────────────
  { name: 'List Payments', method: 'GET', path: '/payments', probe: true, module: 'payments' },

  // ─── Activity Logs ─────────────────────────────────────────
  { name: 'List Activity Logs', method: 'GET', path: '/activity-logs', probe: true, module: 'activity-logs' },
];
