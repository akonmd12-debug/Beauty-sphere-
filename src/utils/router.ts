/**
 * Lightweight SPA Route Manager supporting both browser pathname and hash routing
 * for seamless operation in iframes, Cloud Run, and standalone tabs.
 */

export type AppRoute = 'storefront' | 'admin-dashboard' | 'merchant-login';

export const ROUTES = {
  STOREFRONT: '/' as const,
  ADMIN: '/admin' as const,
  ADMIN_LOGIN: '/admin/login' as const,
  ADMIN_DASHBOARD: '/admin-dashboard' as const,
  MERCHANT: '/merchant' as const,
  MERCHANT_LOGIN: '/merchant/login' as const,
  MERCHANT_PORTAL: '/merchant-portal' as const,
};

/**
 * Determine the active route based on window.location.pathname and window.location.hash
 */
export function parseCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') return 'storefront';

  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase().replace(/^#/, '');
  const search = window.location.search.toLowerCase();
  const searchParams = new URLSearchParams(search);
  const routeParam = (searchParams.get('route') || searchParams.get('portal') || searchParams.get('p') || searchParams.get('view') || '').toLowerCase();

  // Check Master Admin portal route (via path, hash, or query parameter)
  if (
    pathname === '/admin' ||
    pathname === '/admin/' ||
    pathname.startsWith('/admin/') ||
    pathname.includes('admin-dashboard') ||
    pathname.includes('admin-login') ||
    hash === 'admin' ||
    hash === '/admin' ||
    hash === 'admin/login' ||
    hash.includes('admin-dashboard') ||
    routeParam === 'admin' ||
    routeParam === 'admin-dashboard' ||
    routeParam === 'admin-login' ||
    search.includes('route=admin') ||
    search.includes('portal=admin')
  ) {
    return 'admin-dashboard';
  }

  // Check Sole Merchant / Moderator portal route (via path, hash, or query parameter)
  if (
    pathname === '/merchant' ||
    pathname === '/merchant/' ||
    pathname.startsWith('/merchant/') ||
    pathname.includes('merchant-login') ||
    pathname.includes('merchant-portal') ||
    pathname.includes('merchant-dashboard') ||
    hash === 'merchant' ||
    hash === '/merchant' ||
    hash === 'merchant/login' ||
    hash.includes('merchant-login') ||
    hash.includes('merchant-portal') ||
    routeParam === 'merchant' ||
    routeParam === 'merchant-login' ||
    routeParam === 'merchant-portal' ||
    search.includes('route=merchant') ||
    search.includes('portal=merchant')
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
    route === 'admin-dashboard' ? '/admin' :
    route === 'merchant-login' ? '/merchant' : '/';

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
      return '/admin';
    case 'merchant-login':
      return '/merchant';
    default:
      return '/';
  }
}

/**
 * Get full accessible URL for the Admin Portal login page
 */
export function getAdminPortalUrl(): string {
  if (typeof window === 'undefined') return 'https://beautysphereshop.com/admin';
  return `${window.location.origin}/admin`;
}

/**
 * Get full accessible URL for the Merchant Portal login page
 */
export function getMerchantPortalUrl(): string {
  if (typeof window === 'undefined') return 'https://beautysphereshop.com/merchant';
  return `${window.location.origin}/merchant`;
}
