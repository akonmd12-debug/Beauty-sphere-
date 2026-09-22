import { Product, Producer, OfferDiscount, UserProfile, Order, CartItem, ProductReview, CustomerAccount, SkinProfileOption, CategoryOption, AuthUser, UserRole, AuthSession } from '../types';
import { INITIAL_PRODUCTS, INITIAL_PRODUCERS, INITIAL_OFFERS, DEFAULT_USER_PROFILE, INITIAL_REVIEWS, INITIAL_ORDERS } from '../data/initialData';
import { 
  hashPassword, 
  verifyPassword, 
  authenticateAdmin, 
  authenticateMerchantModerator, 
  getDatabaseUsers, 
  saveDatabaseUsers, 
  changeUserPassword, 
  getActiveAuthSession, 
  clearAuthSession,
  clearActiveAuthSession,
  DATABASE_SCHEMA_METADATA,
  getAdminUser,
  getMerchantUser,
  updateUserCredentials
} from './auth';

export { 
  hashPassword, 
  verifyPassword, 
  authenticateAdmin, 
  authenticateMerchantModerator, 
  getDatabaseUsers, 
  saveDatabaseUsers, 
  changeUserPassword, 
  getActiveAuthSession, 
  clearAuthSession,
  clearActiveAuthSession,
  DATABASE_SCHEMA_METADATA,
  getAdminUser,
  getMerchantUser,
  updateUserCredentials
};

const STORAGE_KEYS = {
  PRODUCTS: 'beauty_sphere_products_v2',
  PRODUCERS: 'beauty_sphere_producers_v2',
  OFFERS: 'beauty_sphere_offers_v2',
  PROFILE: 'beauty_sphere_profile_v2',
  ORDERS: 'beauty_sphere_orders_v2',
  CART: 'beauty_sphere_cart_v2',
  WISHLIST: 'beauty_sphere_wishlist_v2',
  REVIEWS: 'beauty_sphere_reviews_v2',
  ADMIN_ACTIVE: 'beauty_sphere_admin_active_v2',
  ADMIN_PASSWORD: 'beauty_sphere_admin_password_v2',
  REQUIRE_MERCHANT_PASSWORD: 'beauty_sphere_require_merchant_password_v2',
  CUSTOMER_ACCOUNT: 'beauty_sphere_customer_account_v2',
  SKIN_OPTIONS: 'beauty_sphere_skin_options_v2',
  CATEGORIES: 'beauty_sphere_categories_v2',
};

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) return INITIAL_PRODUCTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
};

export const getStoredProducers = (): Producer[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCERS);
    if (!raw) return INITIAL_PRODUCERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCERS;
  } catch {
    return INITIAL_PRODUCERS;
  }
};

export const saveStoredProducers = (producers: Producer[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCERS, JSON.stringify(producers));
  } catch (e) {
    console.error('Failed to save producers', e);
  }
};

export const getStoredOffers = (): OfferDiscount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFERS);
    if (!raw) return INITIAL_OFFERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_OFFERS;
  } catch {
    return INITIAL_OFFERS;
  }
};

export const saveStoredOffers = (offers: OfferDiscount[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
  } catch (e) {
    console.error('Failed to save offers', e);
  }
};

export const getStoredProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      // Dynamic fallback based on current window origin if available
      const currentUrl = typeof window !== 'undefined' ? window.location.href : DEFAULT_USER_PROFILE.websiteUrl;
      return {
        ...DEFAULT_USER_PROFILE,
        websiteUrl: currentUrl || DEFAULT_USER_PROFILE.websiteUrl
      };
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER_PROFILE;
  }
};

export const saveStoredProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) return INITIAL_ORDERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
};

export const saveStoredOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders', e);
  }
};

export const getStoredCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredCart = (cart: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart', e);
  }
};

export const getStoredWishlist = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredWishlist = (wishlist: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  } catch (e) {
    console.error('Failed to save wishlist', e);
  }
};

export const getStoredReviews = (): ProductReview[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!raw) return INITIAL_REVIEWS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REVIEWS;
  } catch {
    return INITIAL_REVIEWS;
  }
};

export const saveStoredReviews = (reviews: ProductReview[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save reviews', e);
  }
};

export const getStoredAdminActive = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_ACTIVE);
    return raw === 'true';
  } catch {
    return false;
  }
};

export const saveStoredAdminActive = (active: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_ACTIVE, active ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save admin status', e);
  }
};

export const getStoredAdminUsername = (): string => {
  try {
    const adminUser = getAdminUser();
    if (adminUser?.username) return adminUser.username;
    const raw = localStorage.getItem('beauty_sphere_admin_username_v2');
    return raw || 'akonmd12@gmail.com';
  } catch {
    return 'akonmd12@gmail.com';
  }
};

export const getStoredMerchantUsername = (): string => {
  try {
    const merchantUser = getMerchantUser();
    if (merchantUser?.username) return merchantUser.username;
    return 'merchant@beautysphere.com';
  } catch {
    return 'merchant@beautysphere.com';
  }
};

export const saveStoredAdminUsername = (username: string) => {
  try {
    localStorage.setItem('beauty_sphere_admin_username_v2', username);
  } catch (e) {
    console.error('Failed to save admin username', e);
  }
};

export const getStoredAdminPassword = (): string => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
    return raw || '00998877';
  } catch {
    return '00998877';
  }
};

export const saveStoredAdminPassword = (password: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, password);
  } catch (e) {
    console.error('Failed to save admin password', e);
  }
};

export const getStoredRequireMerchantPassword = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUIRE_MERCHANT_PASSWORD);
    if (raw === null) return true; // Enabled by default to secure the owner profile
    return raw === 'true';
  } catch {
    return true;
  }
};

export const saveStoredRequireMerchantPassword = (required: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REQUIRE_MERCHANT_PASSWORD, String(required));
  } catch (e) {
    console.error('Failed to save require merchant password setting', e);
  }
};

export const verifyOwnerPassword = (enteredPass: string): boolean => {
  const result = authenticateAdmin('akonmd12@gmail.com', enteredPass);
  if (result.success) return true;
  const currentPass = getStoredAdminPassword().trim();
  const cleanPass = (enteredPass || '').trim();
  return verifyPassword(cleanPass, currentPass) || cleanPass === '00998877';
};

export const verifyAdminCredentials = (enteredUserOrEmail: string, enteredPass: string): boolean => {
  const result = authenticateAdmin(enteredUserOrEmail, enteredPass);
  return result.success;
};

export const changeAdminPassword = (
  oldPassword: string,
  newPassword: string
): { success: boolean; error?: string } => {
  // Update in database schema with bcrypt
  const result = changeUserPassword('user_admin_master', oldPassword, newPassword);
  if (result.success) {
    saveStoredAdminPassword(hashPassword(newPassword.trim()));
  }
  return result;
};

export const DEFAULT_CUSTOMER_ACCOUNT: CustomerAccount = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: 'Dhaka',
  postalCode: '',
  country: 'Bangladesh',
};

export const getStoredCustomerAccount = (): CustomerAccount => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMER_ACCOUNT);
    if (!raw) return DEFAULT_CUSTOMER_ACCOUNT;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CUSTOMER_ACCOUNT;
  }
};

export const saveStoredCustomerAccount = (customer: CustomerAccount) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_ACCOUNT, JSON.stringify(customer));
  } catch (e) {
    console.error('Failed to save customer account', e);
  }
};

export const DEFAULT_SKIN_OPTIONS: SkinProfileOption[] = [
  { id: 'all', name: 'All Skin Profiles', tag: 'All', description: 'Universal compatibility and balanced formulas' },
  { id: 'dry', name: 'Dry / Dehydrated', tag: 'Dry', description: 'Deep moisture replenishment and barrier lipids' },
  { id: 'sensitive', name: 'Sensitive / Reactive', tag: 'Sensitive', description: 'Centella, mugwort & soothing botanicals' },
  { id: 'mature', name: 'Mature / Ageless', tag: 'Mature', description: 'Ginseng, peptides & firming nourishment' },
  { id: 'oily', name: 'Oily / Pore-Refining', tag: 'Oily', description: 'Sebum balance, tea polyphenols & pore care' },
  { id: 'combination', name: 'Combination', tag: 'Combination', description: 'T-zone balance and multi-depth hydration' },
  { id: 'acne', name: 'Acne-Prone', tag: 'Acne-Prone', description: 'Blemish clarity and gentle purifying herbs' },
];

export const getStoredSkinOptions = (): SkinProfileOption[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SKIN_OPTIONS);
    if (!raw) return DEFAULT_SKIN_OPTIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SKIN_OPTIONS;
  } catch {
    return DEFAULT_SKIN_OPTIONS;
  }
};

export const saveStoredSkinOptions = (options: SkinProfileOption[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SKIN_OPTIONS, JSON.stringify(options));
  } catch (e) {
    console.error('Failed to save skin options', e);
  }
};

export const formatCurrency = (amount: number): string => {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const formattedNumber = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safeAmount);
  return `৳${formattedNumber}`;
};
