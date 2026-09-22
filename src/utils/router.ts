/**
 * Lightweight SPA Route Manager supporting both browser pathname and hash routing
 * for seamless operation in iframes, Cloud Run, and standalone tabs.
 */

export type AppRoute = 'storefront' | 'admin-dashboard' | 'merchant-login';

export const ROUTES = {
  STOREFRONT: '/' as const,
  ADMIN_DASHBOARD: '/admin-dashboard' as const,
  MERCHANT_LOGIN: '/merchant-login' as const,
  MERCHANT_PORTAL: '/merchant-portal' as const,
};

/**
 * Determine the active route based on window.location.pathname and window.location.hash
 */
export function parseCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') return 'storefront';

  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase().replace(/^#/, '');

  // Check secret admin route
  if (
    pathname.includes('admin-dashboard') ||
    hash.includes('admin-dashboard') ||
    pathname === '/admin' ||
    hash === '/admin'
  ) {
    return 'admin-dashboard';
  }

  // Check sole merchant route
  if (
    pathname.includes('merchant-login') ||
    hash.includes('merchant-login') ||
    pathname.includes('merchant-portal') ||
    hash.includes('merchant-portal') ||
    pathname.includes('merchant-dashboard') ||
    hash.includes('merchant-dashboard') ||
    pathname === '/merchant' ||
    hash === '/merchant'
  ) {
    return 'merchant-login';
  }

  return 'storefront';
}

/**
 * Navigate to a specific route and update both history and hash
 */
export function navigateToRoute(route: AppRoute): void {
  if (typeof window === 'undefined') return;

  const targetPath = 
    route === 'admin-dashboard' ? '/admin-dashboard' :
    route === 'merchant-login' ? '/merchant-login' : '/';

  try {
    // Update browser URL via pushState
    window.history.pushState({ route }, '', targetPath);
    // Also dispatch a popstate-like custom event so all listeners immediately update
    window.dispatchEvent(new CustomEvent('app-route-change', { detail: { route, path: targetPath } }));
  } catch (e) {
    // Fallback to hash if pushState is restricted in iframe
    window.location.hash = targetPath;
  }
}

/**
 * Get human-readable path label
 */
export function getRoutePath(route: AppRoute): string {
  switch (route) {
    case 'admin-dashboard':
      return '/admin-dashboard';
    case 'merchant-login':
      return '/merchant-login';
    default:
      return '/';
  }
}
