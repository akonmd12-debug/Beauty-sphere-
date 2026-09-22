import { UserRole, Permission } from '../types';

/**
 * Role-Based Access Control (RBAC) Matrix
 * Public / Customers can ONLY browse products and submit orders through the quick checkout form.
 * Only verified Administrator (Akon MD) can view customer orders and manage website settings.
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  customer: [
    'BROWSE_PRODUCTS',
    'SUBMIT_ORDER',
  ],
  merchant_moderator: [
    'BROWSE_PRODUCTS',
    'SUBMIT_ORDER',
    'VIEW_CUSTOMER_ORDERS',
    'MANAGE_ORDERS',
    'MANAGE_PRODUCTS',
    'MANAGE_PRODUCERS',
    'MANAGE_OFFERS',
    'ACCESS_ADMIN_DASHBOARD',
    'ACCESS_ADMIN_ROUTES',
    'MODERATE_REVIEWS',
  ],
  admin: [
    'BROWSE_PRODUCTS',
    'SUBMIT_ORDER',
    'VIEW_CUSTOMER_ORDERS',
    'MANAGE_ORDERS',
    'MANAGE_WEBSITE_SETTINGS',
    'MANAGE_STORE_URL',
    'MANAGE_PRODUCTS',
    'MANAGE_PRODUCERS',
    'MANAGE_OFFERS',
    'ACCESS_ADMIN_ROUTES',
    'ACCESS_ADMIN_DASHBOARD',
    'ACCESS_ADMIN_PROFILE',
    'MANAGE_SECURITY_CREDENTIALS',
    'MODERATE_REVIEWS',
    'VIEW_AUDIT_LOGS'
  ],
};

/**
 * Resolves active role based on administrator authentication state
 */
export function getUserRole(isAdminAuthenticated: boolean): UserRole {
  return isAdminAuthenticated ? 'admin' : 'customer';
}

/**
 * Checks if a role has the specified permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Convenience helper to check if the current user session is authorized for a permission
 */
export function canUserPerform(isAdminAuthenticated: boolean, permission: Permission): boolean {
  const role = getUserRole(isAdminAuthenticated);
  return hasPermission(role, permission);
}

/**
 * Checks access and returns descriptive message when forbidden
 */
export function checkAccess(isAdminAuthenticated: boolean, permission: Permission): {
  allowed: boolean;
  role: UserRole;
  reason?: string;
} {
  const role = getUserRole(isAdminAuthenticated);
  const allowed = hasPermission(role, permission);

  if (!allowed) {
    let reason = 'Access Restricted: You do not have authorization for this resource.';
    if (permission === 'VIEW_CUSTOMER_ORDERS') {
      reason = 'Access Restricted: Only verified boutique administrators can view the customer orders list.';
    } else if (permission === 'MANAGE_WEBSITE_SETTINGS' || permission === 'MANAGE_STORE_URL') {
      reason = 'Access Restricted: Only verified boutique administrators can modify store settings and URLs.';
    } else if (permission === 'ACCESS_ADMIN_DASHBOARD' || permission === 'ACCESS_ADMIN_ROUTES' || permission === 'ACCESS_ADMIN_PROFILE') {
      reason = 'Access Restricted: Administrator verification is required to access administrative portals.';
    }

    return {
      allowed: false,
      role,
      reason,
    };
  }

  return {
    allowed: true,
    role,
  };
}

/**
 * Visual badge metadata for current role in header or modals
 */
export function getRoleBadgeInfo(role: UserRole) {
  if (role === 'admin') {
    return {
      role: 'admin' as const,
      label: 'Verified Admin (Akon MD)',
      shortLabel: 'Admin',
      tag: 'Full Access Granted',
      description: 'Can view customer orders and manage all website settings',
      textColor: 'text-emerald-800',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      badgeBg: 'bg-[#FAF3E8]',
      badgeText: 'text-[#1F1B18]',
      badgeBorder: 'border-[#D4AF37]',
    };
  }

  if (role === 'merchant_moderator') {
    return {
      role: 'merchant_moderator' as const,
      label: 'Sole Merchant / Moderator',
      shortLabel: 'Merchant/Mod',
      tag: 'Catalog & Review Operations',
      description: 'Can manage catalog products, orders fulfillment, and customer reviews',
      textColor: 'text-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-900',
      badgeBorder: 'border-blue-400',
    };
  }

  return {
    role: 'customer' as const,
    label: 'Public Customer',
    shortLabel: 'Customer',
    tag: 'Storefront Access',
    description: 'Browse formulations & submit orders via quick checkout',
    textColor: 'text-[#5C534B]',
    bgColor: 'bg-[#F2EDE7]',
    borderColor: 'border-[#DDD4C8]',
    badgeBg: 'bg-[#F5EFE9]',
    badgeText: 'text-[#5A5148]',
    badgeBorder: 'border-[#D8CFC5]',
  };
}
