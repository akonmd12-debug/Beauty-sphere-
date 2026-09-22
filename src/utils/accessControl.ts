import { AppRoute } from './router';
import { AuthUser, UserRole } from '../types';

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  route: AppRoute;
  eventType: 'ACCESS_GRANTED' | 'ACCESS_DENIED_MERCHANT_ON_ADMIN' | 'UNAUTHORIZED_PUBLIC_CHALLENGE' | 'FAILED_LOGIN_ATTEMPT';
  userIdentifier?: string;
  userDisplayName?: string;
  userEmail?: string;
  userRole?: UserRole | 'anonymous_customer';
  role?: UserRole | 'anonymous_customer' | null;
  action: 'BLOCKED' | 'GRANTED' | 'CHALLENGED';
  severity: 'info' | 'warning' | 'critical';
  details: string;
  reason?: string;
}

const AUDIT_STORAGE_KEY = 'beauty_sphere_access_audit_logs_v1';

/**
 * Retrieve persistent security audit logs.
 */
export function getAccessControlAuditLogs(): SecurityAuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Clear security audit logs.
 */
export function clearAccessControlAuditLogs(): void {
  try {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  } catch {
    // Ignore error
  }
}

export const getSecurityAuditLogs = getAccessControlAuditLogs;
export const clearSecurityAuditLogs = clearAccessControlAuditLogs;

/**
 * Record an access control event to the audit trail.
 */
export function logSecurityAccessEvent(
  route: AppRoute,
  eventType: SecurityAuditEntry['eventType'],
  details: string,
  user?: AuthUser | null,
  severity: SecurityAuditEntry['severity'] = 'warning'
): void {
  try {
    const logs = getAccessControlAuditLogs();
    const action: SecurityAuditEntry['action'] = 
      eventType === 'ACCESS_GRANTED' 
        ? 'GRANTED' 
        : eventType === 'ACCESS_DENIED_MERCHANT_ON_ADMIN' 
        ? 'BLOCKED' 
        : 'CHALLENGED';

    const newEntry: SecurityAuditEntry = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      route,
      eventType,
      userIdentifier: user ? user.email : 'Public Visitor (Unauthenticated)',
      userDisplayName: user ? user.displayName : 'Public Customer',
      userEmail: user ? user.email : undefined,
      userRole: user ? user.role : 'anonymous_customer',
      role: user ? user.role : 'anonymous_customer',
      action,
      severity,
      details,
      reason: details
    };
    
    // Maintain last 50 security events
    const updated = [newEntry, ...logs.slice(0, 49)];
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to record security audit log:', err);
  }
}

export type AccessControlDecision =
  | {
      status: 'GRANTED';
      user: AuthUser;
      role: UserRole;
    }
  | {
      status: 'ACCESS_DENIED_MERCHANT';
      reason: string;
      user: AuthUser;
      currentRole: 'merchant_moderator';
      requiredRole: 'admin';
      targetRoute: AppRoute;
    }
  | {
      status: 'PUBLIC_CUSTOMER_BLOCKED_ADMIN';
      reason: string;
      targetRoute: 'admin-dashboard';
      requiredRole: 'admin';
    }
  | {
      status: 'PUBLIC_CUSTOMER_BLOCKED_MERCHANT';
      reason: string;
      targetRoute: 'merchant-login';
      requiredRole: 'merchant_moderator';
    }
  | {
      status: 'PUBLIC_STOREFRONT_ALLOWED';
    };

/**
 * Core Access Control Middleware:
 * Enforces strict boundaries between:
 * 1. Master Administrator (exclusive access to /admin-dashboard)
 * 2. Sole Merchant / Moderator (strictly prohibited from /admin-dashboard, permitted on /merchant-login)
 * 3. Public Customers (strictly locked out of both portals, permitted only on Storefront /)
 */
export function evaluateAccessControl(
  targetRoute: AppRoute,
  currentUser: AuthUser | null,
  currentRole: UserRole | null,
  isAuthenticated: boolean
): AccessControlDecision {
  // Public Storefront: universally accessible to shoppers and personnel
  if (targetRoute === 'storefront') {
    return { status: 'PUBLIC_STOREFRONT_ALLOWED' };
  }

  // TARGET: Secret Admin Portal (/admin-dashboard)
  if (targetRoute === 'admin-dashboard') {
    // Condition 1: User is logged in as a Merchant/Moderator -> STRICTLY DENY!
    if (isAuthenticated && currentUser && currentRole === 'merchant_moderator') {
      logSecurityAccessEvent(
        'admin-dashboard',
        'ACCESS_DENIED_MERCHANT_ON_ADMIN',
        `Blocked Merchant "${currentUser.email}" from accessing Master Admin URL (/admin-dashboard). Insufficient privileges.`,
        currentUser,
        'critical'
      );
      return {
        status: 'ACCESS_DENIED_MERCHANT',
        reason: 'Merchant accounts do not possess Master Administrator privileges. Administrative settings, site domain config, and user roles are restricted.',
        user: currentUser,
        currentRole: 'merchant_moderator',
        requiredRole: 'admin',
        targetRoute: 'admin-dashboard',
      };
    }

    // Condition 2: User is authenticated as Master Admin -> GRANT ACCESS
    if (isAuthenticated && currentUser && currentRole === 'admin') {
      return {
        status: 'GRANTED',
        user: currentUser,
        role: 'admin',
      };
    }

    // Condition 3: Public customer (unauthenticated) -> STRICT PRIVATE GATE CHALLENGE
    logSecurityAccessEvent(
      'admin-dashboard',
      'UNAUTHORIZED_PUBLIC_CHALLENGE',
      'Public customer attempted to visit private Master Admin portal (/admin-dashboard). Challenged with credential gate.',
      null,
      'warning'
    );
    return {
      status: 'PUBLIC_CUSTOMER_BLOCKED_ADMIN',
      reason: 'This portal is strictly private for the boutique owner. Public customers are not permitted.',
      targetRoute: 'admin-dashboard',
      requiredRole: 'admin',
    };
  }

  // TARGET: Sole Merchant Portal (/merchant-login)
  if (targetRoute === 'merchant-login') {
    // Condition 1: Authenticated as Merchant or Admin -> GRANT ACCESS
    if (isAuthenticated && currentUser && (currentRole === 'merchant_moderator' || currentRole === 'admin')) {
      return {
        status: 'GRANTED',
        user: currentUser,
        role: currentRole,
      };
    }

    // Condition 2: Public customer (unauthenticated) -> STRICT PRIVATE GATE CHALLENGE
    logSecurityAccessEvent(
      'merchant-login',
      'UNAUTHORIZED_PUBLIC_CHALLENGE',
      'Public customer attempted to visit private Sole Merchant portal (/merchant-login). Challenged with credential gate.',
      null,
      'warning'
    );
    return {
      status: 'PUBLIC_CUSTOMER_BLOCKED_MERCHANT',
      reason: 'This portal is strictly private for authorized store staff. Public customers cannot access merchant records.',
      targetRoute: 'merchant-login',
      requiredRole: 'merchant_moderator',
    };
  }

  return { status: 'PUBLIC_STOREFRONT_ALLOWED' };
}
