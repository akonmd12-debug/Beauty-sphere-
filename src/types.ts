export type ProductCategory = string;

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  description?: string;
  badge?: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  nativeName?: string;
  originCountry?: 'South Korea' | 'China' | 'Korea' | string;
  heritage?: string;
  producer: string;
  producerId?: string;
  category: ProductCategory;
  price: number;
  discountPercent: number; // 0 to 100
  stock: number;
  rating: number;
  reviewsCount: number;
  description: string;
  details: string[];
  ingredients: string;
  usageRitual: string;
  image: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  badge?: string;
  size: string;
  skinType: string[];
  createdAt: string;
}

export interface SkinProfileOption {
  id: string;
  name: string;
  tag: string;
  description?: string;
}

export interface Producer {
  id: string;
  name: string;
  origin: string;
  specialty: string;
  description: string;
  foundedYear: number;
  websiteUrl?: string;
  productCount?: number;
  active: boolean;
}

export interface OfferDiscount {
  id: string;
  code: string;
  title: string;
  discountPercent: number;
  minimumOrder: number;
  expiresAt: string;
  isActive: boolean;
  usageCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  producer: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  appliedCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Dispatched' | 'Shipped' | 'Delivered';
  paymentMethod: string;
  notes?: string;
  trackingNumber?: string;
  carrier?: string;
}

export interface MockEmailNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  recipientEmail: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  statusTrigger: 'Shipped' | 'Dispatched' | 'Delivered';
  subject: string;
  trackingNumber: string;
  carrier: string;
  sentAt: string;
  items: OrderItem[];
  total: number;
}

export interface CustomerAccount {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  telegram?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  websiteUrl: string;
  boutiqueName: string;
  storeTagline: string;
  instagramHandle: string;
  supportEmail: string;
  isStoreOwner?: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  date: string;
  skinType?: string;
  verifiedPurchase: boolean;
  recommend: boolean;
}

// Role-Based Access Control (RBAC) & Database Schema Types
export type UserRole = 'admin' | 'merchant_moderator' | 'customer';

export type Permission =
  | 'BROWSE_PRODUCTS'
  | 'SUBMIT_ORDER'
  | 'VIEW_CUSTOMER_ORDERS'
  | 'MANAGE_ORDERS'
  | 'MANAGE_WEBSITE_SETTINGS'
  | 'MANAGE_STORE_URL'
  | 'MANAGE_PRODUCTS'
  | 'MANAGE_PRODUCERS'
  | 'MANAGE_OFFERS'
  | 'ACCESS_ADMIN_ROUTES'
  | 'ACCESS_ADMIN_DASHBOARD'
  | 'ACCESS_ADMIN_PROFILE'
  | 'MANAGE_SECURITY_CREDENTIALS'
  | 'MODERATE_REVIEWS'
  | 'VIEW_AUDIT_LOGS';

/**
 * Database User Entity Schema (Stored with bcrypt-hashed passwords)
 */
export interface AuthUser {
  id: string;
  username: string; // Unique username (e.g. 'akonmd12@gmail.com' for Admin, 'merchant' for Merchant/Moderator)
  email: string; // Primary email address
  displayName: string;
  role: UserRole; // Distinct 'admin' vs 'merchant_moderator'
  passwordHash: string; // Encrypted bcrypt hash ($2a$10$...)
  permissions: Permission[];
  status: 'active' | 'suspended';
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  passwordChangedAt?: string;
}

/**
 * Active Session Token & Role Payload
 */
export interface AuthSession {
  token: string;
  user: AuthUser;
  role: UserRole;
  expiresAt: string;
  loginTime: string;
}


