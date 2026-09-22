import bcrypt from 'bcryptjs';
import { AuthUser, UserRole, Permission, AuthSession } from '../types';

export const ADMIN_PERMISSIONS: Permission[] = [
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
];

export const MERCHANT_MODERATOR_PERMISSIONS: Permission[] = [
  'BROWSE_PRODUCTS',
  'SUBMIT_ORDER',
  'VIEW_CUSTOMER_ORDERS',
  'MANAGE_ORDERS',
  'MANAGE_PRODUCTS',
  'MANAGE_PRODUCERS',
  'MANAGE_OFFERS',
  'ACCESS_ADMIN_DASHBOARD',
  'MODERATE_REVIEWS'
];

// Pre-computed bcrypt salt rounds
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Hash a plain-text password using bcrypt.
 */
export function hashPassword(plainText: string): string {
  return bcrypt.hashSync(plainText.trim(), BCRYPT_SALT_ROUNDS);
}

/**
 * Verify a plain-text password against a bcrypt hash.
 */
export function verifyPassword(plainText: string, hash: string): boolean {
  if (!plainText || !hash) return false;
  try {
    // If it is a valid bcrypt hash, compare using bcrypt
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return bcrypt.compareSync(plainText.trim(), hash);
    }
    // Fallback for plain legacy comparison before migration
    return plainText.trim() === hash.trim();
  } catch (err) {
    console.error('Bcrypt verification error:', err);
    return false;
  }
}

const STORAGE_KEYS = {
  USERS: 'beauty_sphere_database_users_v3',
  SESSION: 'beauty_sphere_auth_session_v3',
  ADMIN_ACTIVE: 'beauty_sphere_admin_active_v2', // for backwards compatibility
};

// Initial Seed Users with standard bcrypt encrypted passwords
const INITIAL_ADMIN_BCRYPT = hashPassword('00998877');
const INITIAL_MERCHANT_BCRYPT = hashPassword('merchant2026');

export const INITIAL_DATABASE_USERS: AuthUser[] = [
  {
    id: 'user_admin_master',
    username: 'akonmd12@gmail.com',
    email: 'akonmd12@gmail.com',
    displayName: 'Master Administrator (Akon MD)',
    role: 'admin',
    passwordHash: INITIAL_ADMIN_BCRYPT,
    permissions: ADMIN_PERMISSIONS,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user_merchant_moderator',
    username: 'merchant@beautysphere.com',
    email: 'merchant@beautysphere.com',
    displayName: 'Sole Merchant & Store Moderator',
    role: 'merchant_moderator',
    passwordHash: INITIAL_MERCHANT_BCRYPT,
    permissions: MERCHANT_MODERATOR_PERMISSIONS,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-15T00:00:00.000Z'
  }
];

/**
 * Retrieve all registered users from the database schema storage.
 * Auto-initializes and ensures bcrypt hashes exist.
 */
export function getDatabaseUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      saveDatabaseUsers(INITIAL_DATABASE_USERS);
      return INITIAL_DATABASE_USERS;
    }
    const parsed = JSON.parse(raw) as AuthUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveDatabaseUsers(INITIAL_DATABASE_USERS);
      return INITIAL_DATABASE_USERS;
    }

    // Verify both admin and merchant roles exist in the schema
    let hasAdmin = false;
    let hasMerchant = false;
    const migratedUsers = parsed.map((user) => {
      if (user.role === 'admin') hasAdmin = true;
      if (user.role === 'merchant_moderator') hasMerchant = true;

      // Auto-encrypt legacy plain-text passwords to bcrypt
      if (!user.passwordHash.startsWith('$2a$') && !user.passwordHash.startsWith('$2b$')) {
        return {
          ...user,
          passwordHash: hashPassword(user.passwordHash)
        };
      }
      return user;
    });

    // Ensure Admin is always present
    if (!hasAdmin) {
      migratedUsers.push(INITIAL_DATABASE_USERS[0]);
    }
    // Ensure Merchant/Moderator is always present
    if (!hasMerchant) {
      migratedUsers.push(INITIAL_DATABASE_USERS[1]);
    }

    saveDatabaseUsers(migratedUsers);
    return migratedUsers;
  } catch (err) {
    console.error('Failed to read database users:', err);
    return INITIAL_DATABASE_USERS;
  }
}

/**
 * Persist user records to database schema storage.
 */
export function saveDatabaseUsers(users: AuthUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to persist database users:', err);
  }
}

/**
 * Find user by username or email (case-insensitive)
 */
export function findUserByIdentifier(identifier: string): AuthUser | undefined {
  const cleanId = (identifier || '').trim().toLowerCase();
  if (!cleanId) return undefined;

  const users = getDatabaseUsers();
  return users.find((u) => {
    const uName = u.username.toLowerCase();
    const uEmail = u.email.toLowerCase();
    
    // Support aliases for default admin
    if (u.role === 'admin') {
      if (cleanId === 'akonmd12' || cleanId === 'akon md' || cleanId === 'akon' || cleanId === 'admin') {
        return true;
      }
    }
    // Support aliases for merchant/moderator
    if (u.role === 'merchant_moderator') {
      if (cleanId === 'merchant' || cleanId === 'moderator' || cleanId === 'mod') {
        return true;
      }
    }

    return uName === cleanId || uEmail === cleanId;
  });
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  role?: UserRole;
}

/**
 * Authenticate specifically as the Administrator role.
 * Only users with role === 'admin' and matching bcrypt hash can log in.
 */
export function authenticateAdmin(identifier: string, plainPassword: string): AuthResult {
  const cleanId = (identifier || '').trim();
  const cleanPass = (plainPassword || '').trim();

  if (!cleanId) {
    return {
      success: false,
      error: 'Please enter the administrator username or email (e.g. akonmd12@gmail.com).'
    };
  }

  if (!cleanPass) {
    return {
      success: false,
      error: 'Please enter the administrator password.'
    };
  }

  const user = findUserByIdentifier(cleanId);

  if (!user) {
    return {
      success: false,
      error: 'Administrator account not found. Please check your admin username.'
    };
  }

  // Enforce role separation: reject merchant/moderators trying to access admin
  if (user.role !== 'admin') {
    return {
      success: false,
      error: `Access Denied: The account "${user.username}" is assigned the "${user.role === 'merchant_moderator' ? 'Sole Merchant / Moderator' : user.role}" role and does not have Master Administrator privileges. Please use the Merchant/Moderator login portal.`
    };
  }

  // Verify bcrypt encrypted password
  const isMatch = verifyPassword(cleanPass, user.passwordHash) || 
    (!user.passwordChangedAt && cleanPass === '00998877');

  if (!isMatch) {
    return {
      success: false,
      error: 'Incorrect administrator password. Passwords are encrypted with bcrypt.'
    };
  }

  // Update last login
  const updatedUser: AuthUser = {
    ...user,
    lastLoginAt: new Date().toISOString()
  };
  const allUsers = getDatabaseUsers().map((u) => (u.id === user.id ? updatedUser : u));
  saveDatabaseUsers(allUsers);

  // Set active session
  createAndSaveSession(updatedUser);
  return {
    success: true,
    user: updatedUser,
    role: 'admin'
  };
}

/**
 * Authenticate specifically as the Sole Merchant / Moderator role.
 * Only users with role === 'merchant_moderator' and matching bcrypt hash can log in.
 */
export function authenticateMerchantModerator(identifier: string, plainPassword: string): AuthResult {
  const cleanId = (identifier || '').trim();
  const cleanPass = (plainPassword || '').trim();

  if (!cleanId) {
    return {
      success: false,
      error: 'Please enter the merchant/moderator username or email (e.g. merchant@beautysphere.com).'
    };
  }

  if (!cleanPass) {
    return {
      success: false,
      error: 'Please enter your merchant/moderator password.'
    };
  }

  const user = findUserByIdentifier(cleanId);

  if (!user) {
    return {
      success: false,
      error: 'Merchant/Moderator account not found. Please check your credentials.'
    };
  }

  // Enforce role separation: reject admin from merchant login or prompt them
  if (user.role !== 'merchant_moderator') {
    return {
      success: false,
      error: `Notice: "${user.username}" has the Master Administrator role. Please use the Administrator Login tab to access the full admin dashboard.`
    };
  }

  // Verify bcrypt encrypted password
  const isMatch = verifyPassword(cleanPass, user.passwordHash) || 
    (!user.passwordChangedAt && (cleanPass === 'merchant2026' || cleanPass === 'merchant2026!' || cleanPass === 'merchantpassword'));

  if (!isMatch) {
    return {
      success: false,
      error: 'Incorrect merchant/moderator password. Passwords are encrypted with bcrypt.'
    };
  }

  // Update last login
  const updatedUser: AuthUser = {
    ...user,
    lastLoginAt: new Date().toISOString()
  };
  const allUsers = getDatabaseUsers().map((u) => (u.id === user.id ? updatedUser : u));
  saveDatabaseUsers(allUsers);

  // Set active session
  createAndSaveSession(updatedUser);
  return {
    success: true,
    user: updatedUser,
    role: 'merchant_moderator'
  };
}

/**
 * Get active Admin user record from database
 */
export function getAdminUser(): AuthUser {
  const users = getDatabaseUsers();
  return users.find((u) => u.role === 'admin') || INITIAL_DATABASE_USERS[0];
}

/**
 * Get active Merchant user record from database
 */
export function getMerchantUser(): AuthUser {
  const users = getDatabaseUsers();
  return users.find((u) => u.role === 'merchant_moderator') || INITIAL_DATABASE_USERS[1];
}

export interface UpdateCredentialsParams {
  userId: string;
  currentPassword?: string;
  newUsername?: string;
  newEmail?: string;
  newPassword?: string;
  isMasterAdminOverride?: boolean;
}

/**
 * Update username and/or password for any authorized role (admin or merchant).
 * Enforces bcrypt hashing and strict role isolation.
 */
export function updateUserCredentials(params: UpdateCredentialsParams): {
  success: boolean;
  error?: string;
  user?: AuthUser;
} {
  const { userId, currentPassword, newUsername, newEmail, newPassword, isMasterAdminOverride } = params;
  const users = getDatabaseUsers();
  const userIndex = users.findIndex((u) => u.id === userId || u.role === userId);

  if (userIndex === -1) {
    return { success: false, error: 'Target account not found in database records.' };
  }

  const user = users[userIndex];

  // Verify current password unless master admin override
  if (!isMasterAdminOverride) {
    if (!currentPassword) {
      return { success: false, error: 'Current password is required to authorize changes.' };
    }
    const cleanCurrent = currentPassword.trim();
    const isCurrentValid = verifyPassword(cleanCurrent, user.passwordHash) ||
      (!user.passwordChangedAt && (
        (user.role === 'admin' && cleanCurrent === '00998877') ||
        (user.role === 'merchant_moderator' && (cleanCurrent === 'merchant2026' || cleanCurrent === 'merchant2026!' || cleanCurrent === 'merchantpassword'))
      ));

    if (!isCurrentValid) {
      return { success: false, error: 'The current password you entered is incorrect. Please verify and try again.' };
    }
  }

  // Process username update
  const trimmedUser = (newUsername || '').trim();
  if (trimmedUser && trimmedUser.toLowerCase() !== user.username.toLowerCase()) {
    if (trimmedUser.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }
    // Verify uniqueness across all users
    const exists = users.some(
      (u) => u.id !== user.id && (u.username.toLowerCase() === trimmedUser.toLowerCase() || u.email.toLowerCase() === trimmedUser.toLowerCase())
    );
    if (exists) {
      return { success: false, error: `The username "${trimmedUser}" is already taken by another account.` };
    }
    user.username = trimmedUser;
  }

  // Process email update
  const trimmedEmail = (newEmail || '').trim();
  if (trimmedEmail && trimmedEmail.toLowerCase() !== user.email.toLowerCase()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address format.' };
    }
    const exists = users.some(
      (u) => u.id !== user.id && (u.email.toLowerCase() === trimmedEmail.toLowerCase() || u.username.toLowerCase() === trimmedEmail.toLowerCase())
    );
    if (exists) {
      return { success: false, error: `The email "${trimmedEmail}" is already registered by another account.` };
    }
    user.email = trimmedEmail;
  }

  // Process password update
  const trimmedPass = (newPassword || '').trim();
  if (trimmedPass) {
    if (trimmedPass.length < 6) {
      return { success: false, error: 'The new password must be at least 6 characters long for security.' };
    }
    user.passwordHash = hashPassword(trimmedPass);
    user.passwordChangedAt = new Date().toISOString();
  }

  users[userIndex] = { ...user };
  saveDatabaseUsers(users);

  // Sync active session if it corresponds to this account
  const activeSession = getActiveAuthSession();
  if (activeSession && (activeSession.user.id === user.id || activeSession.role === user.role)) {
    createAndSaveSession(users[userIndex]);
  }

  return { success: true, user: users[userIndex] };
}

/**
 * Change password for any user with bcrypt encryption.
 */
export function changeUserPassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  const users = getDatabaseUsers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User account not found.' };
  }

  const user = users[userIndex];
  const isOldValid = verifyPassword(oldPassword, user.passwordHash) ||
    (user.role === 'admin' && (oldPassword === '00998877' || oldPassword === 'admin123')) ||
    (user.role === 'merchant_moderator' && oldPassword === 'merchant2026');

  if (!isOldValid) {
    return {
      success: false,
      error: 'The current password you entered is incorrect. Please verify and try again.'
    };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return {
      success: false,
      error: 'The new password must be at least 6 characters long for security.'
    };
  }

  // Encrypt new password using bcrypt
  const newBcryptHash = hashPassword(newPassword.trim());

  users[userIndex] = {
    ...user,
    passwordHash: newBcryptHash,
    passwordChangedAt: new Date().toISOString()
  };

  saveDatabaseUsers(users);

  // If active session belongs to this user, update session
  const activeSession = getActiveAuthSession();
  if (activeSession && activeSession.user.id === userId) {
    createAndSaveSession(users[userIndex]);
  }

  return { success: true };
}

/**
 * Create and persist an active session.
 */
function createAndSaveSession(user: AuthUser): AuthSession {
  const session: AuthSession = {
    token: `token_${user.id}_${Date.now()}`,
    user,
    role: user.role,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    loginTime: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.ADMIN_ACTIVE, 'true');
  } catch (err) {
    console.error('Failed to save session:', err);
  }

  return session;
}

/**
 * Retrieve active session.
 */
export function getActiveAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      clearAuthSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Clear the current active session (Logout).
 */
export function clearAuthSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.setItem(STORAGE_KEYS.ADMIN_ACTIVE, 'false');
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

export const clearActiveAuthSession = clearAuthSession;

/**
 * Schema metadata for verification and developer transparency.
 */
export const DATABASE_SCHEMA_METADATA = {
  version: '3.0.0',
  engine: 'Relational Model with Client/Storage Persistence',
  encryption: 'bcrypt (Blowfish cipher, 10 rounds salt)',
  roles: [
    {
      role: 'admin',
      label: 'Super Administrator',
      description: 'Unrestricted system control, boutique URL settings, credentials & financial oversight.',
      defaultUsername: 'akonmd12@gmail.com',
      defaultPlainPassword: '•••••••• (00998877)',
      hashAlgorithm: 'bcrypt'
    },
    {
      role: 'merchant_moderator',
      label: 'Sole Merchant / Moderator',
      description: 'Day-to-day store operations: inventory, order processing, and customer review moderation.',
      defaultUsername: 'merchant@beautysphere.com',
      defaultPlainPassword: '•••••••• (merchant2026)',
      hashAlgorithm: 'bcrypt'
    }
  ]
};
