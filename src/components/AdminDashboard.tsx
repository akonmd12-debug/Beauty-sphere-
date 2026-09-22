import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Package, 
  Users, 
  Percent, 
  TrendingUp, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  AlertTriangle, 
  Share2, 
  ExternalLink, 
  Copy, 
  QrCode, 
  SlidersHorizontal,
  Tag,
  Sparkles,
  ArrowUpDown,
  FileText,
  Star,
  UserCheck,
  ShieldCheck,
  Phone,
  Mail,
  Send,
  MessageSquare,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Layers,
  Edit3,
  RotateCcw,
  Link as LinkIcon,
  Printer,
  Clock,
  Truck,
  CheckCircle2,
  MapPin,
  CreditCard,
  LayoutGrid,
  ListFilter,
  Database,
  Shield,
  Cpu
} from 'lucide-react';
import { Product, Producer, OfferDiscount, Order, ProductCategory, UserProfile, ProductReview, SkinProfileOption, AuthUser, UserRole } from '../types';
import { 
  formatCurrency, 
  changeAdminPassword, 
  getStoredAdminUsername,
  saveStoredAdminUsername,
  getStoredAdminPassword,
  saveStoredAdminPassword,
  getStoredRequireMerchantPassword,
  saveStoredRequireMerchantPassword,
  DEFAULT_SKIN_OPTIONS,
  getStoredSkinOptions,
  saveStoredSkinOptions,
  getDatabaseUsers,
  DATABASE_SCHEMA_METADATA,
  hashPassword,
  verifyPassword,
  updateUserCredentials,
  getAdminUser,
  getMerchantUser
} from '../utils/storage';
import { getSecurityAuditLogs, clearSecurityAuditLogs, SecurityAuditEntry } from '../utils/accessControl';
import { formatOrderDeliveryInfo, formatCustomerAddressOnly, formatBulkOrdersDeliveryInfo, formatEssentialOrderInfo, copyTextToClipboard } from '../utils/delivery';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
  producers: Producer[];
  onSaveProducers: (producers: Producer[]) => void;
  offers: OfferDiscount[];
  onSaveOffers: (offers: OfferDiscount[]) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  websiteUrl: string;
  reviews?: ProductReview[];
  onDeleteReview?: (reviewId: string) => void;
  initialTab?: 'inventory' | 'skin-lists' | 'producers' | 'offers' | 'orders' | 'reviews' | 'admin-profile' | 'website-link' | 'schema';
  openAddProductOnMount?: boolean;
  skinOptions?: SkinProfileOption[];
  onSaveSkinOptions?: (options: SkinProfileOption[]) => void;
  isAdminAuthenticated?: boolean;
  onOpenAdminLogin?: () => void;
  currentRole?: UserRole;
  currentUser?: AuthUser | null;
  isDedicatedRoute?: boolean;
  onNavigateMerchant?: () => void;
}

const PRESET_IMAGES = [
  { label: 'Seoul Red Ginseng Amber Dropper', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Song Dynasty Peony & Jade Cushion', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Jeju Island Snail & Cica Essence Vial', url: 'https://images.unsplash.com/photo-1608248597359-52d3a3dbdff5?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Imperial Lingzhi & Cordyceps Jar', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Joseon Rice Water & Probiotics Sun Fluid', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Yunnan White Camellia Melting Cleansing Balm', url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Gangwon Birch Sap & Heartleaf Barrier Cream', url: 'https://images.unsplash.com/photo-1567928805192-d35d641494b8?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Shangri-La Snow Lotus Bio-Cellulose Mask', url: 'https://images.unsplash.com/photo-1512290900672-1f0233329f79?auto=format&fit=crop&w=1000&q=80' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onLogout,
  products,
  onSaveProducts,
  producers,
  onSaveProducers,
  offers,
  onSaveOffers,
  orders,
  onUpdateOrderStatus,
  userProfile,
  onUpdateProfile,
  websiteUrl,
  reviews = [],
  onDeleteReview,
  initialTab = 'inventory',
  openAddProductOnMount = false,
  skinOptions,
  onSaveSkinOptions,
  isAdminAuthenticated = true,
  onOpenAdminLogin,
  currentRole = 'admin',
  currentUser = null,
  isDedicatedRoute = false,
  onNavigateMerchant,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'skin-lists' | 'producers' | 'offers' | 'orders' | 'reviews' | 'credentials' | 'admin-profile' | 'website-link' | 'schema'>(initialTab as any);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Dynamic Skin Profile Lists state
  const [internalSkinOptions, setInternalSkinOptions] = useState<SkinProfileOption[]>(() => {
    return skinOptions || getStoredSkinOptions();
  });

  useEffect(() => {
    if (skinOptions) {
      setInternalSkinOptions(skinOptions);
    }
  }, [skinOptions]);

  const updateSkinOptions = (newOpts: SkinProfileOption[]) => {
    setInternalSkinOptions(newOpts);
    saveStoredSkinOptions(newOpts);
    if (onSaveSkinOptions) {
      onSaveSkinOptions(newOpts);
    }
  };

  // RBAC Guard: If not authenticated as administrator, show strict access denial screen
  if (!isAdminAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl p-6 text-center space-y-4 shadow-2xl border border-[#E8DFD3] animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8 text-amber-700" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role-Based Access Control (RBAC)
            </span>
            <h3 className="font-serif-luxury text-xl font-bold text-[#1A1817]">
              Admin Credentials Required
            </h3>
            <p className="text-xs text-[#6B6158] leading-relaxed">
              Administrative routes, customer order records, and boutique settings are strictly restricted to the verified store administrator (<strong>Akon MD</strong>).
            </p>
            <p className="text-xs text-[#8C8075] bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE3D8]">
              Public customers are authorized to browse products and submit orders through the quick checkout form.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            {onOpenAdminLogin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminLogin();
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1F1B18] hover:bg-[#38312B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                <span>Enter Admin Password</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#F5EFE9] hover:bg-[#EAE3D8] text-[#4A423A] text-xs font-semibold rounded-xl transition-all"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [selectedSkinFilter, setSelectedSkinFilter] = useState<string>('all');

  // Inline product title rename state (allows admin to rename any product anytime directly)
  const [renamingProductId, setRenamingProductId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');

  const handleStartRename = (product: Product) => {
    setRenamingProductId(product.id);
    setRenamingName(product.name);
  };

  const handleSaveRename = (productId: string) => {
    if (!renamingName.trim()) {
      setRenamingProductId(null);
      return;
    }
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, name: renamingName.trim() };
      }
      return p;
    });
    onSaveProducts(updated);
    setRenamingProductId(null);
  };

  // Quick toggle product skin compatibility tags
  const handleToggleProductSkinType = (productId: string, tag: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const current = p.skinType || [];
        let next: string[];
        if (current.includes(tag)) {
          next = current.filter(t => t !== tag);
          if (next.length === 0) next = ['All'];
        } else {
          next = [...current, tag];
        }
        return { ...p, skinType: next };
      }
      return p;
    });
    onSaveProducts(updated);
  };

  // Skin profile editing / renaming state
  const [editingSkinId, setEditingSkinId] = useState<string | null>(null);
  const [editingSkinName, setEditingSkinName] = useState('');
  const [editingSkinDesc, setEditingSkinDesc] = useState('');
  const [newSkinName, setNewSkinName] = useState('');
  const [newSkinTag, setNewSkinTag] = useState('');
  const [newSkinDesc, setNewSkinDesc] = useState('');
  const [showAddSkinForm, setShowAddSkinForm] = useState(false);

  // Review filter state
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | 'all'>('all');

  // Admin profile edit form state
  const [profileFormData, setProfileFormData] = useState({
    name: userProfile.name || 'Akon MD',
    email: userProfile.email || 'akonmd12@gmail.com',
    phone: userProfile.phone || '+1 (555) 382-9011',
    whatsapp: userProfile.whatsapp || '+1 (555) 382-9011',
    telegram: userProfile.telegram || '@beautysphereshop',
    address: userProfile.address || '742 Evergreen Botanical Way',
    city: userProfile.city || 'Beverly Hills',
  });
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Credentials Manager State
  const [adminCredUser, setAdminCredUser] = useState(() => getAdminUser());
  const [merchantCredUser, setMerchantCredUser] = useState(() => getMerchantUser());

  // Admin credentials inputs
  const [adminUsernameInput, setAdminUsernameInput] = useState(() => getAdminUser()?.username || 'akonmd12@gmail.com');
  const [adminEmailInput, setAdminEmailInput] = useState(() => getAdminUser()?.email || 'akonmd12@gmail.com');
  const [adminCurrentPasswordInput, setAdminCurrentPasswordInput] = useState('');
  const [adminNewPasswordInput, setAdminNewPasswordInput] = useState('');
  const [adminConfirmPasswordInput, setAdminConfirmPasswordInput] = useState('');
  const [showAdminCurrentPass, setShowAdminCurrentPass] = useState(false);
  const [showAdminNewPass, setShowAdminNewPass] = useState(false);
  const [adminCredMsg, setAdminCredMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAdminCredSaving, setIsAdminCredSaving] = useState(false);

  // Merchant credentials inputs (Admin master supervisory control)
  const [merchantUsernameInput, setMerchantUsernameInput] = useState(() => getMerchantUser()?.username || 'merchant@beautysphere.com');
  const [merchantEmailInput, setMerchantEmailInput] = useState(() => getMerchantUser()?.email || 'merchant@beautysphere.com');
  const [merchantNewPasswordInput, setMerchantNewPasswordInput] = useState('');
  const [merchantConfirmPasswordInput, setMerchantConfirmPasswordInput] = useState('');
  const [showMerchantNewPass, setShowMerchantNewPass] = useState(false);
  const [merchantCredMsg, setMerchantCredMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isMerchantCredSaving, setIsMerchantCredSaving] = useState(false);

  // Refresh credential users whenever activeTab switches to 'credentials'
  useEffect(() => {
    if (activeTab === 'credentials') {
      const a = getAdminUser();
      const m = getMerchantUser();
      setAdminCredUser(a);
      setMerchantCredUser(m);
      setAdminUsernameInput(a.username);
      setAdminEmailInput(a.email);
      setMerchantUsernameInput(m.username);
      setMerchantEmailInput(m.email);
    }
  }, [activeTab]);

  const handleUpdateAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCredMsg(null);

    if (adminNewPasswordInput && adminNewPasswordInput !== adminConfirmPasswordInput) {
      setAdminCredMsg({ type: 'error', text: 'New admin password and confirmation do not match.' });
      return;
    }

    if (adminNewPasswordInput && adminNewPasswordInput.length < 6) {
      setAdminCredMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setIsAdminCredSaving(true);
    setTimeout(() => {
      const res = updateUserCredentials({
        userId: adminCredUser.id || 'admin',
        currentPassword: adminCurrentPasswordInput,
        newUsername: adminUsernameInput,
        newEmail: adminEmailInput,
        newPassword: adminNewPasswordInput || undefined,
      });

      setIsAdminCredSaving(false);

      if (res.success && res.user) {
        setAdminCredUser(res.user);
        saveStoredAdminUsername(res.user.username);
        if (adminNewPasswordInput) {
          saveStoredAdminPassword(adminNewPasswordInput);
        }
        setAdminCurrentPasswordInput('');
        setAdminNewPasswordInput('');
        setAdminConfirmPasswordInput('');
        setAdminCredMsg({
          type: 'success',
          text: `Master Administrator credentials successfully updated! Username is now "${res.user.username}". Use these new credentials for future logins.`
        });
      } else {
        setAdminCredMsg({
          type: 'error',
          text: res.error || 'Failed to update credentials. Please check current password.'
        });
      }
    }, 300);
  };

  const handleUpdateMerchantCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setMerchantCredMsg(null);

    if (merchantNewPasswordInput && merchantNewPasswordInput !== merchantConfirmPasswordInput) {
      setMerchantCredMsg({ type: 'error', text: 'New merchant password and confirmation do not match.' });
      return;
    }

    if (merchantNewPasswordInput && merchantNewPasswordInput.length < 6) {
      setMerchantCredMsg({ type: 'error', text: 'New merchant password must be at least 6 characters long.' });
      return;
    }

    setIsMerchantCredSaving(true);
    setTimeout(() => {
      const res = updateUserCredentials({
        userId: merchantCredUser.id || 'merchant_moderator',
        newUsername: merchantUsernameInput,
        newEmail: merchantEmailInput,
        newPassword: merchantNewPasswordInput || undefined,
        isMasterAdminOverride: true,
      });

      setIsMerchantCredSaving(false);

      if (res.success && res.user) {
        setMerchantCredUser(res.user);
        setMerchantNewPasswordInput('');
        setMerchantConfirmPasswordInput('');
        setMerchantCredMsg({
          type: 'success',
          text: `Merchant credentials successfully updated! Username is now "${res.user.username}". The merchant must use these new credentials to log into /merchant-login.`
        });
      } else {
        setMerchantCredMsg({
          type: 'error',
          text: res.error || 'Failed to update merchant credentials.'
        });
      }
    }, 300);
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (openAddProductOnMount) {
      setEditingProduct(null);
      setIsProductModalOpen(true);
    }
  }, [initialTab, openAddProductOnMount]);

  // Modal for adding/editing product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [productViewMode, setProductViewMode] = useState<'table' | 'cards'>('table');
  const [productActionFeedback, setProductActionFeedback] = useState<string | null>(null);

  // Orders Dashboard filters, invoice & dispatch states
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered'>('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [copiedEssentialOrderId, setCopiedEssentialOrderId] = useState<string | null>(null);
  const [copiedOrderDispatchId, setCopiedOrderDispatchId] = useState<string | null>(null);
  const [copiedAddressOnlyId, setCopiedAddressOnlyId] = useState<string | null>(null);
  const [copiedAllOrdersDelivery, setCopiedAllOrdersDelivery] = useState(false);
  const [copiedSlipDelivery, setCopiedSlipDelivery] = useState(false);
  const [copiedSlipAddress, setCopiedSlipAddress] = useState(false);
  const [copiedSlipEssential, setCopiedSlipEssential] = useState(false);

  const handleCopyEssentialOrderInfo = async (order: Order) => {
    const text = formatEssentialOrderInfo(order);
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedEssentialOrderId(order.id);
      setTimeout(() => setCopiedEssentialOrderId(null), 2500);
    }
  };

  const filteredAdminOrders = orders.filter((ord) => {
    const query = orderSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(query)) ||
      ord.id.toLowerCase().includes(query) ||
      (ord.customer?.fullName && ord.customer.fullName.toLowerCase().includes(query)) ||
      (ord.customer?.phone && ord.customer.phone.toLowerCase().includes(query)) ||
      (ord.customer?.address && ord.customer.address.toLowerCase().includes(query)) ||
      (ord.customer?.city && ord.customer.city.toLowerCase().includes(query)) ||
      ord.items.some((it) => it.productName.toLowerCase().includes(query));

    const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyOrderDelivery = async (order: Order, addressOnly = false) => {
    const text = addressOnly 
      ? formatCustomerAddressOnly(order.customer, order.orderNumber || order.id.slice(-8))
      : formatOrderDeliveryInfo(order);
    const success = await copyTextToClipboard(text);
    if (success) {
      if (addressOnly) {
        setCopiedAddressOnlyId(order.id);
        setTimeout(() => setCopiedAddressOnlyId(null), 2500);
      } else {
        setCopiedOrderDispatchId(order.id);
        setTimeout(() => setCopiedOrderDispatchId(null), 2500);
      }
    }
  };

  const handleCopyAllAdminOrders = async () => {
    if (filteredAdminOrders.length === 0) return;
    const text = formatBulkOrdersDeliveryInfo(filteredAdminOrders);
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedAllOrdersDelivery(true);
      setTimeout(() => setCopiedAllOrdersDelivery(false), 2500);
    }
  };

  const handleCopySlipDelivery = async (order: Order, addressOnly = false) => {
    const text = addressOnly
      ? formatCustomerAddressOnly(order.customer, order.orderNumber || order.id.slice(-8))
      : formatOrderDeliveryInfo(order);
    const success = await copyTextToClipboard(text);
    if (success) {
      if (addressOnly) {
        setCopiedSlipAddress(true);
        setTimeout(() => setCopiedSlipAddress(false), 2500);
      } else {
        setCopiedSlipDelivery(true);
        setTimeout(() => setCopiedSlipDelivery(false), 2500);
      }
    }
  };

  // Modal for adding/editing producer
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [isProducerModalOpen, setIsProducerModalOpen] = useState(false);

  // Modal for adding/editing offer
  const [editingOffer, setEditingOffer] = useState<OfferDiscount | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Editable Website URL State
  const [editUrlInput, setEditUrlInput] = useState(websiteUrl || '');
  const [editUrlSuccess, setEditUrlSuccess] = useState(false);
  const [editUrlError, setEditUrlError] = useState('');

  useEffect(() => {
    setEditUrlInput(websiteUrl || '');
  }, [websiteUrl]);

  // BCrypt Interactive Testing Sandbox states
  const [bcryptTestInput, setBcryptTestInput] = useState('00998877');
  const [bcryptGeneratedHash, setBcryptGeneratedHash] = useState(() => hashPassword('00998877'));
  const [bcryptVerifyInput, setBcryptVerifyInput] = useState('00998877');
  const [bcryptVerifyResult, setBcryptVerifyResult] = useState<{ match: boolean; checked: boolean }>({ match: true, checked: true });
  const [databaseUsersList, setDatabaseUsersList] = useState<AuthUser[]>(() => getDatabaseUsers());
  const [securityAuditLogs, setSecurityAuditLogs] = useState<SecurityAuditEntry[]>(() => getSecurityAuditLogs());

  const handleRefreshSecurityLogs = () => {
    setSecurityAuditLogs(getSecurityAuditLogs());
  };

  const handleClearSecurityLogs = () => {
    clearSecurityAuditLogs();
    setSecurityAuditLogs([]);
  };

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentLiveUrl = websiteUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyWebsiteLink = () => {
    navigator.clipboard.writeText(currentLiveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveStoreUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEditUrlError('');
    let trimmed = editUrlInput.trim();
    if (!trimmed) {
      setEditUrlError('Please enter a valid website URL.');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = `https://${trimmed}`;
      setEditUrlInput(trimmed);
    }
    try {
      new URL(trimmed);
    } catch {
      setEditUrlError('Invalid URL format. Please provide a valid web address (e.g. https://yourdomain.com).');
      return;
    }
    if (onUpdateProfile) {
      onUpdateProfile({
        ...userProfile,
        websiteUrl: trimmed
      });
      setEditUrlSuccess(true);
      setTimeout(() => setEditUrlSuccess(false), 3000);
    }
  };

  const handleUseCurrentBrowserUrl = () => {
    if (typeof window !== 'undefined') {
      const browserUrl = window.location.href;
      setEditUrlInput(browserUrl);
      if (onUpdateProfile) {
        onUpdateProfile({
          ...userProfile,
          websiteUrl: browserUrl
        });
        setEditUrlSuccess(true);
        setTimeout(() => setEditUrlSuccess(false), 3000);
      }
    }
  };

  const handleResetStoreUrl = () => {
    const fallback = typeof window !== 'undefined' ? window.location.origin : 'https://beautysphereshop.com';
    setEditUrlInput(fallback);
    if (onUpdateProfile) {
      onUpdateProfile({
        ...userProfile,
        websiteUrl: fallback
      });
      setEditUrlSuccess(true);
      setTimeout(() => setEditUrlSuccess(false), 3000);
    }
  };

  // Metrics
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  // Quick stock adjuster
  const handleStockUpdate = (productId: string, delta: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock };
      }
      return p;
    });
    onSaveProducts(updated);
  };

  const handleStockSet = (productId: string, value: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: Math.max(0, value) };
      }
      return p;
    });
    onSaveProducts(updated);
  };

  // Price adjuster (Only admin can change price up and down)
  const handlePriceUpdate = (productId: string, delta: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const newPrice = Math.max(1, Math.round((p.price + delta) * 100) / 100);
        return { ...p, price: newPrice };
      }
      return p;
    });
    onSaveProducts(updated);
  };

  const handlePriceSet = (productId: string, value: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, price: Math.max(1, value) };
      }
      return p;
    });
    onSaveProducts(updated);
  };

  // Admin Password Change state
  const [oldAdminPassword, setOldAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [adminPasswordMsg, setAdminPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [showCurrentStoredAdminPw, setShowCurrentStoredAdminPw] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [requireMerchantPw, setRequireMerchantPw] = useState<boolean>(() => getStoredRequireMerchantPassword());

  const handleToggleRequireMerchantPw = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setRequireMerchantPw(val);
    saveStoredRequireMerchantPassword(val);
    setAdminPasswordMsg({
      type: 'success',
      text: val 
        ? 'Option updated: Owner password is now required to open the Merchant Profile.'
        : 'Option updated: Password prompt is now bypassed for the Merchant Profile.'
    });
  };

  const handleAdminPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasswordMsg(null);

    if (newAdminPassword !== confirmAdminPassword) {
      setAdminPasswordMsg({ type: 'error', text: 'New password and confirmation password do not match.' });
      return;
    }

    if (newAdminPassword.length < 4) {
      setAdminPasswordMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    setIsSavingPassword(true);
    setTimeout(() => {
      const res = changeAdminPassword(oldAdminPassword, newAdminPassword);
      setIsSavingPassword(false);
      if (res.success) {
        setAdminPasswordMsg({ type: 'success', text: 'Admin login password updated successfully! Keep this password safe.' });
        setOldAdminPassword('');
        setNewAdminPassword('');
        setConfirmAdminPassword('');
      } else {
        setAdminPasswordMsg({ type: 'error', text: res.error || 'Failed to update admin password. Check your old password.' });
      }
    }, 300);
  };

  // Delete product with in-app confirmation modal
  const handlePromptDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    const deletedName = productToDelete.name;
    const updated = products.filter(p => p.id !== productToDelete.id);
    onSaveProducts(updated);
    setProductToDelete(null);
    setProductActionFeedback(`"${deletedName}" was permanently removed from the website catalog.`);
    setTimeout(() => setProductActionFeedback(null), 3500);
  };

  // Direct delete by ID fallback
  const handleDeleteProduct = (productId: string) => {
    const target = products.find(p => p.id === productId);
    if (target) {
      setProductToDelete(target);
    } else {
      const updated = products.filter(p => p.id !== productId);
      onSaveProducts(updated);
    }
  };

  // Delete producer
  const handleDeleteProducer = (producerId: string) => {
    if (window.confirm('Are you sure you want to remove this producer?')) {
      const updated = producers.filter(p => p.id !== producerId);
      onSaveProducers(updated);
    }
  };

  // Delete offer
  const handleDeleteOffer = (offerId: string) => {
    const updated = offers.filter(o => o.id !== offerId);
    onSaveOffers(updated);
  };

  // Toggle offer active state
  const handleToggleOfferActive = (offerId: string) => {
    const updated = offers.map(o => o.id === offerId ? { ...o, isActive: !o.isActive } : o);
    onSaveOffers(updated);
  };

  // Filtered products (incorporating category, search, skin profile, and stock filters)
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.producer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.ingredients && p.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    const matchesSkin = selectedSkinFilter === 'all' || 
      (p.skinType && (p.skinType.includes('All') || p.skinType.includes(selectedSkinFilter)));
    const matchesStock = 
      productStockFilter === 'all' ? true :
      productStockFilter === 'in_stock' ? p.stock > 5 :
      productStockFilter === 'low_stock' ? (p.stock > 0 && p.stock <= 5) :
      p.stock === 0;
    return matchesSearch && matchesCat && matchesSkin && matchesStock;
  });

  // Filtered customer orders for Orders Dashboard
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;
    const matchesCustomer = 
      ord.customer.fullName.toLowerCase().includes(q) ||
      ord.customer.phone.toLowerCase().includes(q) ||
      (ord.customer.email && ord.customer.email.toLowerCase().includes(q)) ||
      ord.customer.city.toLowerCase().includes(q) ||
      ord.orderNumber.toLowerCase().includes(q);
    const matchesItems = ord.items.some(
      item => item.productName.toLowerCase().includes(q) || item.producer.toLowerCase().includes(q)
    );
    return matchesStatus && (matchesCustomer || matchesItems);
  });

  if (!isOpen) return null;

  return (
    <div className={`${isDedicatedRoute ? 'min-h-screen bg-[#141210] flex flex-col' : 'fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-fadeIn'}`}>
      {isDedicatedRoute && (
        <div className="bg-[#0D0B0A] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/40">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/30">
              SECRET PATH: /admin-dashboard
            </span>
            <span className="text-amber-200 font-semibold">
              Master Administrator Portal
            </span>
            <span className="text-[#8C8075] hidden sm:inline">•</span>
            <span className="text-[#B8ADA2] text-[11px] hidden sm:inline">
              Full System Control: Domain URLs, User Roles, BCrypt Passwords, Catalog & Orders
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateMerchant && (
              <button
                onClick={onNavigateMerchant}
                className="text-blue-300 hover:text-blue-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Merchant Portal (/merchant-login)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#D1C7BD] hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Back to Storefront (/)</span>
            </button>
          </div>
        </div>
      )}

      <div 
        id="admin-dashboard-container"
        className={`relative bg-[#FAF8F5] w-full ${isDedicatedRoute ? 'max-w-7xl mx-auto flex-1 my-4 sm:my-6 rounded-2xl shadow-2xl border border-[#E8DFD3]' : 'max-w-6xl rounded-2xl shadow-2xl border border-[#E8DFD3] my-4 max-h-[94vh]'} overflow-hidden flex flex-col`}
      >
        {/* Top Header Bar */}
        <div className="bg-[#1F1B18] text-[#FAF8F5] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#38312B]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2D2723] rounded-lg border border-[#453D37]">
              <SlidersHorizontal className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-luxury text-xl sm:text-2xl font-normal text-white">
                  BEAUTY SPHERE SHOP
                </h1>
                {currentRole === 'admin' ? (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-[#1F1B18] text-[10px] uppercase font-extrabold tracking-wider rounded-md shadow-xs flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#1F1B18]" />
                    <span>Master Admin</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-[10px] uppercase font-extrabold tracking-wider rounded-md shadow-xs flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-blue-200" />
                    <span>Sole Merchant / Mod</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#B8ADA2]">
                {currentRole === 'admin' 
                  ? 'Master System Authority: BCrypt Credentials, Root Domain, Catalog & Orders' 
                  : 'Sole Merchant / Moderator: Inventory Catalog, Artisan Houses, Orders & Review Moderation'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Owner Identity Pill */}
            <button
              onClick={() => setActiveTab('admin-profile')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2A241F] hover:bg-[#38312B] text-[#D4AF37] border border-[#52453A] rounded-lg text-xs transition-colors"
              title="View Active Role & Profile"
            >
              {currentRole === 'admin' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin: {currentUser?.displayName || userProfile.name || 'Akon MD'}</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Merchant: {currentUser?.displayName || 'Store Operator'}</span>
                </>
              )}
            </button>

            {/* + Add Product Formulation Anytime */}
            <button
              id="admin-header-add-product-btn"
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#C29E2E] text-[#1F1B18] font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#1F1B18]" />
              <span>+ Add Product</span>
            </button>

            {/* Direct Website URL link copy pill in Admin Header */}
            <button
              onClick={handleCopyWebsiteLink}
              title="Copy official storefront link"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C2723] hover:bg-[#3B342F] text-[#D4AF37] border border-[#4A3F36] rounded-lg text-xs transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied!" : "Store URL"}</span>
            </button>

            <a
              href={currentLiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-[#2C2723] hover:bg-[#3B342F] text-white border border-[#4A3F36] rounded-lg text-xs"
              title="Open storefront preview"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {onLogout && (
              <button
                id="admin-dashboard-logout-btn"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3B1F1F] hover:bg-[#4E2828] text-[#FCA5A5] border border-[#6E3232] rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                title="Log out of Admin Portal"
              >
                <Lock className="w-3.5 h-3.5 text-[#F87171]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[#A89D93] hover:text-white hover:bg-[#2C2723] rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3 p-4 bg-white border-b border-[#EAE3D8] text-xs">
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB]">
            <span className="text-[10px] uppercase tracking-wider text-[#8C8075] font-medium">Catalog Items</span>
            <p className="text-lg font-bold text-[#1A1817] mt-0.5">{products.length} Formulations</p>
            <span className="text-[10px] text-[#7A7169]">{totalStockCount} units in stock</span>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB]">
            <span className="text-[10px] uppercase tracking-wider text-[#8C8075] font-medium">Inventory Value</span>
            <p className="text-lg font-bold text-[#1A1817] mt-0.5">{formatCurrency(totalInventoryValue)}</p>
            <span className="text-[10px] text-emerald-700 font-medium">Active retail capital</span>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB]">
            <span className="text-[10px] uppercase tracking-wider text-[#8C8075] font-medium">Stock Alerts</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-lg font-bold ${lowStockCount > 0 ? 'text-[#B85D3B]' : 'text-emerald-700'}`}>
                {lowStockCount} Low
              </span>
              <span className="text-xs text-[#8C8075]">/</span>
              <span className={`text-lg font-bold ${outOfStockCount > 0 ? 'text-rose-600' : 'text-[#8C8075]'}`}>
                {outOfStockCount} Out
              </span>
            </div>
            <span className="text-[10px] text-[#7A7169]">Dynamic alert thresholds</span>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB]">
            <span className="text-[10px] uppercase tracking-wider text-[#8C8075] font-medium">Artisan Producers</span>
            <p className="text-lg font-bold text-[#1A1817] mt-0.5">{producers.length} Houses</p>
            <span className="text-[10px] text-[#7A7169]">Grasse, Kyoto, Alps</span>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB]">
            <span className="text-[10px] uppercase tracking-wider text-[#8C8075] font-medium">Customer Reviews</span>
            <p className="text-lg font-bold text-[#1A1817] mt-0.5">{reviews.length} Reviews</p>
            <span className="text-[10px] text-[#D4AF37] font-medium">Verified customer feedback</span>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB]">
            <span className="text-[10px] uppercase tracking-wider text-[#8C8075] font-medium">Orders & Revenue</span>
            <p className="text-lg font-bold text-[#1A1817] mt-0.5">{formatCurrency(totalRevenue)}</p>
            <span className="text-[10px] text-emerald-700 font-medium">{orders.length} logged acquisitions</span>
          </div>
        </div>

        {/* Tab Selector Navigation */}
        <div className="flex border-b border-[#E8DFD3] bg-[#F5EFE9] px-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-semibold uppercase tracking-wider">
          <button
            id="admin-orders-tab-btn"
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#1F1B18] text-[#1F1B18] bg-white rounded-t-lg shadow-2xs font-bold'
                : 'border-transparent text-[#736A61] hover:text-black'
            }`}
          >
            <FileText className="w-4 h-4 text-[#8C6B3E]" />
            <span>Orders Dashboard</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'orders' ? 'bg-[#1F1B18] text-[#D4AF37]' : 'bg-[#E5DDD2] text-[#4A423A]'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            id="admin-inventory-tab-btn"
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'inventory'
                ? 'border-[#1F1B18] text-[#1F1B18] bg-white rounded-t-lg shadow-2xs font-bold'
                : 'border-transparent text-[#736A61] hover:text-black'
            }`}
          >
            <Package className="w-4 h-4 text-[#8C6B3E]" />
            <span>Product Management</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'inventory' ? 'bg-[#1F1B18] text-[#D4AF37]' : 'bg-[#E5DDD2] text-[#4A423A]'
            }`}>
              {products.length}
            </span>
          </button>

          <button
            id="admin-producers-tab-btn"
            onClick={() => setActiveTab('producers')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'producers'
                ? 'border-[#1F1B18] text-[#1F1B18] bg-white rounded-t-lg'
                : 'border-transparent text-[#736A61] hover:text-black'
            }`}
          >
            <Users className="w-4 h-4 text-[#8C6B3E]" />
            <span>Producers & Houses ({producers.length})</span>
          </button>

          <button
            id="admin-offers-tab-btn"
            onClick={() => setActiveTab('offers')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'offers'
                ? 'border-[#1F1B18] text-[#1F1B18] bg-white rounded-t-lg'
                : 'border-transparent text-[#736A61] hover:text-black'
            }`}
          >
            <Percent className="w-4 h-4 text-[#8C6B3E]" />
            <span>Offers & Discounts ({offers.length})</span>
          </button>

          <button
            id="admin-skin-lists-tab-btn"
            onClick={() => setActiveTab('skin-lists')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'skin-lists'
                ? 'border-[#1F1B18] text-[#1F1B18] bg-white rounded-t-lg'
                : 'border-transparent text-[#736A61] hover:text-black'
            }`}
          >
            <Tag className="w-4 h-4 text-[#8C6B3E]" />
            <span>Skin Lists & Profiles ({internalSkinOptions.length})</span>
          </button>

          <button
            id="admin-reviews-tab-btn"
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'reviews'
                ? 'border-[#1F1B18] text-[#1F1B18] bg-white rounded-t-lg'
                : 'border-transparent text-[#736A61] hover:text-black'
            }`}
          >
            <Star className="w-4 h-4 text-[#D4AF37]" />
            <span>Customer Reviews ({reviews.length})</span>
          </button>

          <button
            id="admin-owner-profile-tab-btn"
            onClick={() => setActiveTab('admin-profile')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'admin-profile'
                ? 'border-[#1F1B18] text-[#1F1B18] bg-white rounded-t-lg'
                : 'border-transparent text-[#736A61] hover:text-black'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Admin Profile (Akon MD)</span>
          </button>

          <button
            id="admin-credentials-tab-btn"
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'credentials'
                ? 'border-[#1F1B18] text-[#1F1B18] bg-white rounded-t-lg font-bold shadow-xs'
                : 'border-transparent text-[#736A61] hover:text-black'
            }`}
          >
            <KeyRound className="w-4 h-4 text-[#D4AF37]" />
            <span>Security & Passwords</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-100 text-amber-900 font-bold">
              Admin & Merchant
            </span>
          </button>

          <button
            id="admin-store-link-tab-btn"
            onClick={() => setActiveTab('website-link')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'website-link'
                ? 'border-[#1F1B18] text-[#1F1B18] bg-white rounded-t-lg'
                : 'border-transparent text-[#736A61] hover:text-black'
            }`}
          >
            <Share2 className="w-4 h-4 text-[#8C6B3E]" />
            <span>Store Link & Sharing</span>
          </button>

          <button
            id="admin-schema-tab-btn"
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'schema'
                ? 'border-[#1F1B18] text-[#1F1B18] bg-white rounded-t-lg font-bold'
                : 'border-transparent text-[#736A61] hover:text-black'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Roles & BCrypt Schema</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800 font-bold">
              bcrypt
            </span>
          </button>
        </div>

        {/* Tab Body Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: PRODUCT MANAGEMENT (ADD, UPDATE, REMOVE) */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {/* Product Action Feedback Banner */}
              {productActionFeedback && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-2xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{productActionFeedback}</span>
                  </div>
                  <button 
                    onClick={() => setProductActionFeedback(null)}
                    className="p-1 text-emerald-600 hover:text-emerald-900 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Section Header & Metrics */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#F0EAE1]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif-luxury text-xl font-bold text-[#1A1817]">Product Management</h3>
                    <span className="px-2.5 py-0.5 bg-[#F0E6D8] text-[#735028] text-[10px] font-bold uppercase rounded-md tracking-wider">
                      Add • Update • Remove
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Live Storefront Sync
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7169] mt-0.5">
                    Add new formulations, update pricing and stock levels, or remove items directly from the website storefront.
                  </p>
                </div>

                {/* Quick Metrics Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3 py-1.5 bg-white border border-[#E5DDD2] rounded-lg text-xs">
                    <span className="text-[#8C8075]">Total: </span>
                    <strong className="text-[#1A1817]">{products.length}</strong>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                    <span className="text-emerald-700">In Stock: </span>
                    <strong className="text-emerald-900">{products.filter(p => p.stock > 5).length}</strong>
                  </div>
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                    <span className="text-amber-700">Low Stock: </span>
                    <strong className="text-amber-900">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</strong>
                  </div>
                  <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs">
                    <span className="text-rose-700">Out: </span>
                    <strong className="text-rose-900">{products.filter(p => p.stock === 0).length}</strong>
                  </div>
                </div>
              </div>

              {/* Top Controls: Search, Filters, View Switch, and Add Product Button */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5DDD2] shadow-2xs">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {/* Search bar */}
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="w-4 h-4 text-[#8C8075] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-product-search-input"
                      type="text"
                      placeholder="Search by title, producer, ingredients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD3C7] rounded-lg focus:outline-none focus:bg-white focus:border-[#1F1B18]"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    id="admin-category-filter"
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="py-2 px-3 text-xs bg-[#FAF8F5] border border-[#DCD3C7] rounded-lg focus:outline-none focus:bg-white focus:border-[#1F1B18]"
                  >
                    <option value="all">All Categories</option>
                    <option value="Serums & Elixirs">Serums & Elixirs</option>
                    <option value="Hydration & Creams">Hydration & Creams</option>
                    <option value="Luxury Oils">Luxury Oils</option>
                    <option value="Sun Care">Sun Care</option>
                    <option value="Cleansers & Toners">Cleansers & Toners</option>
                    <option value="Masks & Treatments">Masks & Treatments</option>
                  </select>

                  {/* Stock Filter */}
                  <select
                    id="admin-stock-filter"
                    value={productStockFilter}
                    onChange={(e) => setProductStockFilter(e.target.value as any)}
                    className="py-2 px-3 text-xs bg-[#FAF8F5] border border-[#DCD3C7] rounded-lg focus:outline-none focus:bg-white focus:border-[#1F1B18]"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="in_stock">In Stock (&gt;5)</option>
                    <option value="low_stock">Low Stock (≤5)</option>
                    <option value="out_of_stock">Out of Stock (0)</option>
                  </select>

                  {/* Skin Profile List Filter */}
                  <select
                    id="admin-skin-type-filter"
                    value={selectedSkinFilter}
                    onChange={(e) => setSelectedSkinFilter(e.target.value)}
                    className="py-2 px-3 text-xs bg-[#FAF8F5] border border-[#DCD3C7] rounded-lg focus:outline-none focus:bg-white focus:border-[#1F1B18] font-medium text-[#2E2823]"
                    title="Filter all products by Skin Profile List"
                  >
                    <option value="all">All Skin Profiles ({products.length})</option>
                    {internalSkinOptions.filter(o => o.id !== 'all').map(opt => {
                      const count = products.filter(p => p.skinType?.includes('All') || p.skinType?.includes(opt.tag)).length;
                      return (
                        <option key={opt.id} value={opt.tag}>
                          {opt.name} ({count})
                        </option>
                      );
                    })}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center border border-[#DCD3C7] rounded-lg p-0.5 bg-[#FAF8F5]">
                    <button
                      type="button"
                      onClick={() => setProductViewMode('table')}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        productViewMode === 'table' ? 'bg-white text-[#1F1B18] shadow-2xs font-semibold' : 'text-[#736A61] hover:text-black'
                      }`}
                      title="Spreadsheet Table View"
                    >
                      <ListFilter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductViewMode('cards')}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        productViewMode === 'cards' ? 'bg-white text-[#1F1B18] shadow-2xs font-semibold' : 'text-[#736A61] hover:text-black'
                      }`}
                      title="Product Cards Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main + Add Formulation Button */}
                <button
                  id="add-new-product-btn"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F1B18] hover:bg-[#342F2B] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" />
                  <span>+ Add Formulation</span>
                </button>
              </div>

              {/* Empty State when no formulations match */}
              {filteredProducts.length === 0 && (
                <div className="p-8 bg-white border border-[#E8DFD3] rounded-xl text-center text-[#736B63]">
                  <Package className="w-10 h-10 mx-auto text-[#B8ADA2] mb-2" />
                  <p className="font-serif-luxury text-base text-[#1A1817]">No Formulations Match Criteria</p>
                  <p className="text-xs text-[#8C8075] mt-1">
                    Try adjusting your search query or filter settings, or add a new product formulation to the store.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategoryFilter('all');
                        setSelectedSkinFilter('all');
                        setProductStockFilter('all');
                      }}
                      className="px-3 py-1.5 bg-[#F5EFE9] hover:bg-[#EAE3D8] text-[#4A423A] text-xs font-semibold rounded-lg transition-all"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setIsProductModalOpen(true);
                      }}
                      className="px-4 py-1.5 bg-[#1F1B18] text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Add Formulation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TABLE VIEW */}
              {productViewMode === 'table' && filteredProducts.length > 0 && (
                <div className="bg-white border border-[#E5DDD2] rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F3EE] text-[#6E645A] uppercase tracking-wider text-[10px] font-bold border-b border-[#E5DDD2]">
                        <tr>
                          <th className="py-3 px-4">Formulation Details</th>
                          <th className="py-3 px-4">Artisan Producer</th>
                          <th className="py-3 px-4">Price & Modifier</th>
                          <th className="py-3 px-4 text-center">Live Stock</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions (Edit / Remove)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EAE1]">
                        {filteredProducts.map((p) => {
                          const hasDiscount = p.discountPercent > 0;
                          const discountedPrice = hasDiscount ? p.price * (1 - p.discountPercent / 100) : p.price;
                          const isLow = p.stock > 0 && p.stock <= 5;
                          const isOut = p.stock === 0;

                          return (
                            <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                              {/* Product Info with Image & Inline Quick Rename */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-12 h-12 rounded-lg object-cover bg-[#FAF8F5] border border-[#E5DDD2] shrink-0"
                                  />
                                  <div className="min-w-[190px]">
                                    {renamingProductId === p.id ? (
                                      <div className="flex items-center gap-1.5 my-0.5">
                                        <input
                                          type="text"
                                          value={renamingName}
                                          onChange={(e) => setRenamingName(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveRename(p.id);
                                            if (e.key === 'Escape') setRenamingProductId(null);
                                          }}
                                          autoFocus
                                          className="text-xs px-2 py-1 border border-[#8C6B3E] rounded bg-white text-[#1A1817] font-medium w-full focus:outline-none ring-1 ring-[#8C6B3E]"
                                          placeholder="Rename product..."
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleSaveRename(p.id)}
                                          className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                                          title="Save product name"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setRenamingProductId(null)}
                                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                          title="Cancel"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 group">
                                        <p className="font-serif-luxury font-medium text-sm text-[#1A1817] line-clamp-1">{p.name}</p>
                                        <button
                                          type="button"
                                          onClick={() => handleStartRename(p)}
                                          className="text-[#8C8075] hover:text-[#1F1B18] p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
                                          title="Rename this product directly"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                      <span className="text-[11px] text-[#7A7169]">{p.category} • {p.size}</span>
                                      {p.skinType && p.skinType.length > 0 && (
                                        <span className="text-[9px] px-1.5 py-0.2 bg-[#F5EDE1] text-[#785429] rounded font-medium">
                                          Skin: {p.skinType.join(', ')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Producer */}
                              <td className="py-3 px-4 font-medium text-[#4A423A]">
                                <div>{p.producer}</div>
                                <div className="text-[10px] text-[#8C8075]">{p.originCountry || 'Imported'}</div>
                              </td>

                              {/* Price & Up/Down Controls */}
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handlePriceUpdate(p.id, -1)}
                                      className="w-6 h-6 rounded bg-[#F2EDE7] hover:bg-[#E5DDD3] text-[#2C2723] flex items-center justify-center font-bold text-xs shadow-2xs active:scale-95"
                                      title="Decrease price by ৳1"
                                    >
                                      -
                                    </button>
                                    <div className="flex items-center">
                                      <span className="text-[11px] text-[#7A7169] mr-0.5 font-bold">৳</span>
                                      <input
                                        type="number"
                                        min="1"
                                        step="0.5"
                                        value={p.price}
                                        onChange={(e) => handlePriceSet(p.id, parseFloat(e.target.value) || 1)}
                                        className="w-14 text-center py-0.5 px-1 text-xs border border-[#D5CBC0] rounded-md font-bold bg-[#FAF8F5] text-[#1A1817]"
                                        title="Admin: Click to type exact formulation price"
                                      />
                                    </div>
                                    <button
                                      onClick={() => handlePriceUpdate(p.id, 1)}
                                      className="w-6 h-6 rounded bg-[#F2EDE7] hover:bg-[#E5DDD3] text-[#2C2723] flex items-center justify-center font-bold text-xs shadow-2xs active:scale-95"
                                      title="Increase price by ৳1"
                                    >
                                      +
                                    </button>
                                  </div>
                                  {hasDiscount && (
                                    <div className="text-[10px] text-[#B85D3B] font-semibold flex items-center gap-1">
                                      <span>Sale: {formatCurrency(discountedPrice)}</span>
                                      <span className="px-1 py-0.2 bg-[#F5E8E4] rounded text-[9px]">-{p.discountPercent}%</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Dynamic Stock Adjuster */}
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleStockUpdate(p.id, -1)}
                                    className="w-6 h-6 rounded bg-[#F2EDE7] hover:bg-[#E5DDD3] text-[#2C2723] flex items-center justify-center font-bold text-xs"
                                    title="Decrease stock by 1"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={p.stock}
                                    onChange={(e) => handleStockSet(p.id, parseInt(e.target.value) || 0)}
                                    className="w-14 text-center py-1 px-1 text-xs border border-[#D5CBC0] rounded-md font-semibold bg-[#FAF8F5]"
                                    title="Direct stock count"
                                  />
                                  <button
                                    onClick={() => handleStockUpdate(p.id, 1)}
                                    className="w-6 h-6 rounded bg-[#F2EDE7] hover:bg-[#E5DDD3] text-[#2C2723] flex items-center justify-center font-bold text-xs"
                                    title="Increase stock by 1"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Stock Status Badge */}
                              <td className="py-3 px-4 text-center">
                                {isOut ? (
                                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                                    Out of Stock
                                  </span>
                                ) : isLow ? (
                                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                                    Low Stock ({p.stock})
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase bg-emerald-100 text-emerald-800">
                                    In Stock ({p.stock})
                                  </span>
                                )}
                              </td>

                              {/* Actions: Edit and Remove */}
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setIsProductModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 text-xs bg-[#FAF5EE] hover:bg-[#F2ECE5] text-[#4A423A] hover:text-black border border-[#DDD3C7] rounded-md flex items-center gap-1 transition-colors"
                                    title="Update formulation details, photos, or description"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-[#8C6B3E]" />
                                    <span>Update</span>
                                  </button>
                                  <button
                                    onClick={() => handlePromptDeleteProduct(p)}
                                    className="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md flex items-center gap-1 transition-colors"
                                    title="Remove formulation from website storefront"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CARDS GRID VIEW */}
              {productViewMode === 'cards' && filteredProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((p) => {
                    const hasDiscount = p.discountPercent > 0;
                    const discountedPrice = hasDiscount ? p.price * (1 - p.discountPercent / 100) : p.price;
                    const isLow = p.stock > 0 && p.stock <= 5;
                    const isOut = p.stock === 0;

                    return (
                      <div key={p.id} className="bg-white border border-[#E5DDD2] rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-16 h-16 rounded-xl object-cover bg-[#FAF8F5] border border-[#E5DDD2] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] uppercase font-bold text-[#8C6B3E] tracking-wider truncate">
                                {p.category}
                              </span>
                              {isOut ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-100 text-rose-800 shrink-0">
                                  Out of Stock
                                </span>
                              ) : isLow ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800 shrink-0">
                                  Low ({p.stock})
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase bg-emerald-100 text-emerald-800 shrink-0">
                                  Stock: {p.stock}
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif-luxury font-medium text-sm text-[#1A1817] line-clamp-1 mt-0.5">
                              {p.name}
                            </h4>
                            <p className="text-[11px] text-[#7A7169] truncate">{p.producer} • {p.size}</p>
                          </div>
                        </div>

                        {/* Price & Stock Row */}
                        <div className="pt-2 border-t border-[#F2EDE7] flex items-center justify-between text-xs">
                          <div>
                            <div className="font-serif-luxury font-bold text-base text-[#1A1817]">
                              {formatCurrency(discountedPrice)}
                            </div>
                            {hasDiscount && (
                              <div className="text-[10px] text-[#7A7169] line-through">
                                {formatCurrency(p.price)}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-[#FAF5EE] hover:bg-[#F2ECE5] text-[#4A423A] border border-[#DDD3C7] rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#8C6B3E]" />
                              <span>Update</span>
                            </button>
                            <button
                              onClick={() => handlePromptDeleteProduct(p)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: SKIN LISTS & PROFILES (ADMIN CAN EDIT OR RENAME ANYTIME) */}
          {activeTab === 'skin-lists' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif-luxury text-xl font-medium text-[#1A1817]">Skin Profile Lists & Formulation Types</h3>
                    <span className="px-2 py-0.5 bg-[#F0E6D8] text-[#735028] text-[10px] font-bold uppercase rounded-md tracking-wider">
                      Live Store Sync
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7169] mt-1 max-w-2xl">
                    Configure, edit, or rename all skin list categories anytime. Changes dynamically update the storefront filter dropdown, product card tags, and consultation matching across BEAUTY SPHERE SHOP.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddSkinForm(!showAddSkinForm)}
                    className="px-3.5 py-2 bg-[#1F1B18] hover:bg-[#342F2B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#D4AF37]" />
                    <span>Add Custom Skin Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Reset all skin profiles to boutique default categories?')) {
                        updateSkinOptions(DEFAULT_SKIN_OPTIONS);
                      }
                    }}
                    className="px-3 py-2 bg-[#FAF5EE] hover:bg-[#EFE7DC] text-[#635546] border border-[#DDD3C7] text-xs font-medium rounded-xl transition-colors"
                    title="Reset to default skin profile list"
                  >
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              {/* Add New Skin Profile Form (Expandable) */}
              {showAddSkinForm && (
                <div className="bg-[#FAF5EE] p-5 rounded-2xl border border-[#D5C7B8] space-y-3 animate-fadeIn">
                  <h4 className="font-serif-luxury text-sm font-medium text-[#1A1817]">Create New Skin Profile List</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Display Name / Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Barrier Recovery / Cica Care"
                        value={newSkinName}
                        onChange={(e) => setNewSkinName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D8CFC5] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Matching Tag Key</label>
                      <input
                        type="text"
                        placeholder="e.g. Barrier"
                        value={newSkinTag}
                        onChange={(e) => setNewSkinTag(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D8CFC5] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Clinical Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Cellular barrier lipid restoration"
                        value={newSkinDesc}
                        onChange={(e) => setNewSkinDesc(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D8CFC5] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddSkinForm(false)}
                      className="px-3 py-1.5 bg-white border border-[#D8CFC5] rounded-lg text-xs text-[#5C534A]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSkinName.trim()) return;
                        const tag = newSkinTag.trim() || newSkinName.trim().split(' ')[0];
                        const newOption: SkinProfileOption = {
                          id: `skin-${Date.now()}`,
                          name: newSkinName.trim(),
                          tag: tag,
                          description: newSkinDesc.trim() || 'Custom formulation skin profile'
                        };
                        updateSkinOptions([...internalSkinOptions, newOption]);
                        setNewSkinName('');
                        setNewSkinTag('');
                        setNewSkinDesc('');
                        setShowAddSkinForm(false);
                      }}
                      className="px-4 py-1.5 bg-[#1F1B18] text-white rounded-lg text-xs font-semibold"
                    >
                      Save Skin Profile
                    </button>
                  </div>
                </div>
              )}

              {/* Skin Profile Lists Table / Cards */}
              <div className="bg-white border border-[#E5DDD2] rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-5 py-3.5 bg-[#FBF9F6] border-b border-[#E8DFD3] flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#63574A]">
                    Available Skin Profile Lists ({internalSkinOptions.length})
                  </span>
                  <span className="text-[11px] text-[#8C8075]">
                    Click Rename on any profile to edit its label anytime
                  </span>
                </div>

                <div className="divide-y divide-[#EFE8DF]">
                  {internalSkinOptions.map((opt) => {
                    const isEditing = editingSkinId === opt.id;
                    const matchingProducts = products.filter(p =>
                      opt.tag === 'All'
                        ? true
                        : (p.skinType && (p.skinType.includes('All') || p.skinType.includes(opt.tag)))
                    );

                    return (
                      <div key={opt.id} className="p-4 sm:p-5 hover:bg-[#FAF8F5] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-[240px]">
                          {isEditing ? (
                            <div className="space-y-2 max-w-md">
                              <div>
                                <label className="text-[10px] uppercase font-bold text-[#736A61]">Rename Skin List Label:</label>
                                <input
                                  type="text"
                                  value={editingSkinName}
                                  onChange={(e) => setEditingSkinName(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#8C6B3E] rounded-lg font-medium text-[#1A1817] focus:outline-none ring-1 ring-[#8C6B3E]"
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase font-bold text-[#736A61]">Description:</label>
                                <input
                                  type="text"
                                  value={editingSkinDesc}
                                  onChange={(e) => setEditingSkinDesc(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#D5CBC0] rounded-lg text-[#3E3731]"
                                />
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!editingSkinName.trim()) return;
                                    const updated = internalSkinOptions.map(o =>
                                      o.id === opt.id
                                        ? { ...o, name: editingSkinName.trim(), description: editingSkinDesc.trim() || o.description }
                                        : o
                                    );
                                    updateSkinOptions(updated);
                                    setEditingSkinId(null);
                                  }}
                                  className="px-3 py-1 bg-[#1F1B18] text-white rounded-md text-xs font-medium flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Save Changes</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSkinId(null)}
                                  className="px-2.5 py-1 bg-white border border-[#DDD3C7] rounded-md text-xs text-[#63574A]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2.5">
                                <h4 className="font-serif-luxury font-medium text-base text-[#1A1817]">
                                  {opt.name}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 bg-[#FAF0E6] text-[#785429] border border-[#E8DACB] rounded-md font-mono">
                                  Tag: {opt.tag}
                                </span>
                              </div>
                              <p className="text-xs text-[#7A7169] mt-0.5">
                                {opt.description || 'Skin compatibility profile for boutique clients.'}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          {/* Count Badge */}
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#1F1B18]">
                              {matchingProducts.length} formulations
                            </span>
                            <span className="block text-[10px] text-[#8C8075]">in this skin profile</span>
                          </div>

                          {/* Quick Filter Formulations */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSkinFilter(opt.id === 'all' ? 'all' : opt.tag);
                              setActiveTab('inventory');
                            }}
                            className="px-3 py-1.5 bg-[#FAF5EE] hover:bg-[#EFE7DC] border border-[#D5CBC0] text-[#3E3731] rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            title="View formulations for this skin type"
                          >
                            <span>View Products</span>
                            <ExternalLink className="w-3 h-3 text-[#8C6B3E]" />
                          </button>

                          {/* Edit / Rename Skin Profile */}
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSkinId(opt.id);
                                setEditingSkinName(opt.name);
                                setEditingSkinDesc(opt.description || '');
                              }}
                              className="px-3 py-1.5 bg-[#1F1B18] hover:bg-[#342F2B] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                              title="Rename skin profile anytime"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Rename</span>
                            </button>
                          )}

                          {/* Delete if custom */}
                          {opt.id !== 'all' && !['dry', 'sensitive', 'mature', 'oily'].includes(opt.id) && !isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete skin profile "${opt.name}"?`)) {
                                  updateSkinOptions(internalSkinOptions.filter(o => o.id !== opt.id));
                                }
                              }}
                              className="p-1.5 text-[#9C9287] hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete skin profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: All Skin List Formulations Manager (Inline Rename and Quick Skin List Tagging) */}
              <div className="bg-white border border-[#E5DDD2] rounded-2xl overflow-hidden shadow-2xs space-y-3 p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#EFE8DF]">
                  <div>
                    <h4 className="font-serif-luxury text-base font-medium text-[#1A1817]">All Skin List Formulations ({products.length})</h4>
                    <p className="text-xs text-[#7A7169]">
                      Rename any product anytime directly, and toggle skin profile tags with a single click.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#63574A] font-medium">Filter by Skin:</span>
                    <select
                      value={selectedSkinFilter}
                      onChange={(e) => setSelectedSkinFilter(e.target.value)}
                      className="py-1.5 px-2.5 text-xs bg-[#FAF8F5] border border-[#D5CBC0] rounded-lg text-[#1F1B18] font-medium"
                    >
                      <option value="all">All Skin List Formulations ({products.length})</option>
                      {internalSkinOptions.filter(o => o.id !== 'all').map(opt => (
                        <option key={opt.id} value={opt.tag}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] text-[#7A7169] uppercase font-bold tracking-wider text-[10px] border-b border-[#E8DFD3]">
                        <th className="py-2.5 px-3">Formulation Name (Click to Rename)</th>
                        <th className="py-2.5 px-3">Producer</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Assigned Skin Profiles</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE8DF]">
                      {filteredProducts.map((p) => {
                        const isRenaming = renamingProductId === p.id;
                        return (
                          <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                            {/* Name & Quick Rename */}
                            <td className="py-3 px-3 min-w-[260px]">
                              {isRenaming ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={renamingName}
                                    onChange={(e) => setRenamingName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveRename(p.id);
                                      if (e.key === 'Escape') setRenamingProductId(null);
                                    }}
                                    autoFocus
                                    className="px-2 py-1 text-xs border border-[#8C6B3E] rounded bg-white text-[#1A1817] font-medium w-full focus:outline-none ring-1 ring-[#8C6B3E]"
                                    placeholder="Enter new formulation name..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveRename(p.id)}
                                    className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                                    title="Save name"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRenamingProductId(null)}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 group">
                                  <img src={p.image} alt={p.name} className="w-9 h-9 rounded-md object-cover border border-[#E5DDD2] shrink-0" />
                                  <div>
                                    <p className="font-serif-luxury font-medium text-xs text-[#1A1817] line-clamp-1">{p.name}</p>
                                    <span className="text-[10px] text-[#8C8075]">{p.size}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleStartRename(p)}
                                    className="text-[#8C8075] hover:text-[#1F1B18] p-1 rounded transition-colors opacity-70 hover:opacity-100"
                                    title="Rename product anytime"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-3 text-[#4A423A] font-medium">{p.producer}</td>
                            <td className="py-3 px-3 text-[#7A7169]">{p.category}</td>

                            {/* Clickable Skin Compatibility Chips */}
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap items-center gap-1">
                                {['All', 'Dry', 'Sensitive', 'Mature', 'Oily', 'Combination'].map((tag) => {
                                  const isActive = p.skinType?.includes(tag);
                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() => handleToggleProductSkinType(p.id, tag)}
                                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium border transition-colors ${
                                        isActive
                                          ? 'bg-[#1F1B18] text-white border-[#1F1B18]'
                                          : 'bg-[#FAF8F5] text-[#7A7169] border-[#DDD3C7] hover:border-[#8C6B3E]'
                                      }`}
                                      title={`Click to ${isActive ? 'remove' : 'add'} ${tag} skin compatibility`}
                                    >
                                      {tag}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-[#FAF5EE] hover:bg-[#EFE7DC] border border-[#DDD3C7] text-[#2C2723] rounded-md text-[11px] font-medium"
                              >
                                Full Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCERS & BRANDS */}
          {activeTab === 'producers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-luxury text-lg text-[#1A1817]">Artisan Formulation Houses</h3>
                  <p className="text-xs text-[#7A7169]">Manage the laboratories and botanical producers featured on BEAUTY SPHERE SHOP.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProducer(null);
                    setIsProducerModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F1B18] text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#38312B]"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" />
                  <span>Add Producer / Brand</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {producers.map((prod) => {
                  const productCount = products.filter(p => p.producer === prod.name).length;
                  return (
                    <div key={prod.id} className="bg-white border border-[#E5DDD2] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C6B3E]">{prod.origin}</span>
                            <h4 className="font-serif-luxury text-xl font-medium text-[#1A1817]">{prod.name}</h4>
                          </div>
                          <span className="px-2 py-0.5 bg-[#FAF5EE] border border-[#E0D7CC] text-[10px] font-bold rounded-md text-[#4A423A]">
                            Est. {prod.foundedYear}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-[#5A524A] mt-2">{prod.specialty}</p>
                        <p className="text-xs text-[#786F66] mt-1 line-clamp-2 font-light">{prod.description}</p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#F2EDE7] flex items-center justify-between">
                        <span className="text-xs text-[#7A7169] font-medium">{productCount} Formulations in boutique</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingProducer(prod);
                              setIsProducerModalOpen(true);
                            }}
                            className="p-1.5 text-[#5C534A] hover:text-black hover:bg-[#F2ECE5] rounded-md"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProducer(prod.id)}
                            className="p-1.5 text-[#9C9287] hover:text-rose-700 hover:bg-rose-50 rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: OFFERS & DISCOUNTS */}
          {activeTab === 'offers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-luxury text-lg text-[#1A1817]">Promotional Offers & Discount Codes</h3>
                  <p className="text-xs text-[#7A7169]">Adjust promotional codes, seasonal customer discounts, and boutique offers.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingOffer(null);
                    setIsOfferModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F1B18] text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#38312B]"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" />
                  <span>Create New Offer</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="bg-white border border-[#E5DDD2] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-bold bg-[#F4EDE5] border border-[#DDD3C7] px-2.5 py-1 rounded-md text-[#1A1817]">
                          {offer.code}
                        </span>
                        <button
                          onClick={() => handleToggleOfferActive(offer.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            offer.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {offer.isActive ? 'Active' : 'Paused'}
                        </button>
                      </div>

                      <h4 className="font-medium text-sm text-[#1A1817] mt-1">{offer.title}</h4>
                      <p className="text-2xl font-serif-luxury font-bold text-[#8C6B3E] my-2">
                        {offer.discountPercent}% OFF
                      </p>
                      <p className="text-xs text-[#7A7169]">
                        Minimum order: {formatCurrency(offer.minimumOrder)}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#F2EDE7] flex items-center justify-between text-xs">
                      <span className="text-[#8C8075]">{offer.usageCount} clients redeemed</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingOffer(offer);
                            setIsOfferModalOpen(true);
                          }}
                          className="p-1.5 text-[#5C534A] hover:text-black hover:bg-[#F2ECE5] rounded-md"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-1.5 text-[#9C9287] hover:text-rose-700 hover:bg-rose-50 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS & FULFILLMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0EAE1] gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif-luxury text-lg text-[#1A1817]">Customer Orders & Logistics</h3>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Admin Access
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7169]">
                    Manage incoming customer orders, courier manifests, delivery destinations, and copy customer info for shipping.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold text-[#1A1817] bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#E8DFD3]">
                    Orders: <strong>{filteredAdminOrders.length}</strong> / {orders.length}
                  </div>

                  <button
                    onClick={handleCopyAllAdminOrders}
                    disabled={filteredAdminOrders.length === 0}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                      copiedAllOrdersDelivery
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#1F1B18] hover:bg-[#342F2A] disabled:opacity-40 text-white'
                    }`}
                    title="Copy delivery manifests for all visible orders"
                  >
                    {copiedAllOrdersDelivery ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>All Delivery Info Copied!</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-3.5 h-3.5 text-amber-300" />
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy All Deliveries ({filteredAdminOrders.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE3D8]">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8075]" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by customer name, phone, address, city, or order #..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D5CBC0] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                    className="px-3 py-1.5 text-xs bg-white border border-[#D5CBC0] rounded-lg font-medium focus:outline-none focus:border-[#1F1B18]"
                  >
                    <option value="all">All Fulfillment Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                  </select>

                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="px-2.5 py-1.5 text-xs text-[#7A7169] hover:text-black bg-white border border-[#D5CBC0] rounded-lg"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 bg-white border border-[#E8DFD3] rounded-xl text-center text-[#736B63]">
                  <Package className="w-10 h-10 mx-auto text-[#B8ADA2] mb-2" />
                  <p className="font-serif-luxury text-base text-[#1A1817]">No Customer Orders Yet</p>
                  <p className="text-xs text-[#8C8075] mt-1">
                    Customer orders placed via quick checkout will automatically be recorded here for the store administrator.
                  </p>
                </div>
              ) : filteredAdminOrders.length === 0 ? (
                <div className="p-8 bg-white border border-[#E8DFD3] rounded-xl text-center text-[#736B63]">
                  <Search className="w-8 h-8 mx-auto text-[#B8ADA2] mb-2" />
                  <p className="font-serif-luxury text-base text-[#1A1817]">No Orders Match Filter</p>
                  <p className="text-xs text-[#8C8075] mt-1">
                    Try clearing your search query or selecting "All Fulfillment Statuses".
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAdminOrders.map((ord) => (
                    <div key={ord.id} className="bg-white border border-[#E5DDD2] rounded-xl p-5 shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F2EDE7]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {ord.orderNumber}
                            </span>
                            <span className="text-xs text-[#7A7169]">• {new Date(ord.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold font-mono text-[#1A1817]">{formatCurrency(ord.total)}</span>
                          <select
                            value={ord.status}
                            onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as any)}
                            className={`py-1 px-2.5 text-xs font-bold rounded-lg border focus:outline-none ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : ord.status === 'Dispatched'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : ord.status === 'Confirmed'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer & Delivery Details Block */}
                      <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE2D7] space-y-1.5 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="font-bold text-[#1A1817] text-sm flex items-center gap-2">
                            <span>{ord.customer.fullName}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#4A423A]">
                            <span className="flex items-center gap-1 font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-[#DDD4C8]">
                              <Phone className="w-3 h-3 text-blue-700" />
                              {ord.customer.phone || 'No phone'}
                            </span>
                            {ord.customer.email && (
                              <span className="flex items-center gap-1 text-[#6E6358]">
                                <Mail className="w-3 h-3 text-[#8C8075]" />
                                {ord.customer.email}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-[#38312B] flex items-start gap-1.5 pt-1 border-t border-[#EAE1D5]">
                          <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">
                              {ord.customer.address}, {ord.customer.city} {ord.customer.postalCode || ''}, {ord.customer.country || ''}
                            </span>
                            {ord.customer.notes && (
                              <div className="text-amber-900 text-[11px] mt-0.5 italic">
                                Special instructions: {ord.customer.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 text-xs">
                        <div className="text-[10px] uppercase font-bold text-[#7A7169] tracking-wider">Ordered Formulations:</div>
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[#4A423B] bg-white px-2 py-1 rounded border border-[#F2ECE5]">
                            <span>{item.quantity}x {item.productName} <span className="text-[#8C8075] text-[10px]">({item.producer})</span></span>
                            <span className="font-medium font-mono">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Bar with Copy Delivery Info Button */}
                      <div className="pt-2.5 border-t border-[#F2EDE7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-[11px] text-[#7A7169] flex items-center gap-2">
                          <span>Payment Method: <strong className="text-[#1A1817]">{ord.paymentMethod}</strong></span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Copy Order Info (Strictly: Customer Name, Contact Number, Delivery Address, Ordered Items) */}
                          <button
                            onClick={() => handleCopyEssentialOrderInfo(ord)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                              copiedEssentialOrderId === ord.id
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-400'
                                : 'bg-[#1F1B18] hover:bg-[#38322B] text-white border-[#1F1B18]'
                            }`}
                            title="Copy essential order info strictly: Customer Name, Contact Number, Delivery Address, and Ordered Items"
                          >
                            {copiedEssentialOrderId === ord.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Order Info Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-amber-300" />
                                <span>Copy Order Info</span>
                              </>
                            )}
                          </button>

                          {/* Address Only Copy */}
                          <button
                            onClick={() => handleCopyOrderDelivery(ord, true)}
                            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-gray-100 text-[#4A423A] border border-[#D5CBC0] rounded-lg transition-colors cursor-pointer"
                            title="Copy customer name, phone and street address only"
                          >
                            {copiedAddressOnlyId === ord.id ? (
                              <span className="text-emerald-700 font-bold">Address Copied!</span>
                            ) : (
                              <span>Address Only</span>
                            )}
                          </button>

                          {/* Delivery Slip Modal Trigger */}
                          <button
                            onClick={() => setSelectedOrderForInvoice(ord)}
                            className="px-2.5 py-1.5 text-xs font-medium bg-[#FAF8F5] hover:bg-[#EDE5DA] text-[#1F1B18] border border-[#D5CBC0] rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            title="View and print delivery slip"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-700" />
                            <span>Slip</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: WEBSITE LINK & SHARING */}
          {activeTab === 'website-link' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-white border-2 border-[#1F1B18] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#1F1B18] flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#8C6B3E]" />
                    Official Boutique Website Link
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full">
                    Live Platform URL
                  </span>
                </div>

                <p className="text-xs text-[#5A5148] mb-4 font-light leading-relaxed">
                  This is the direct, shareable URL to your live BEAUTY SPHERE SHOP. Share this link on your social media profiles, business cards, messaging apps, and email campaigns so customers can directly visit your boutique and purchase products.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#E0D7CC] mb-4">
                  <div className="flex-1 px-3 py-2 font-mono text-xs text-[#1A1817] truncate select-all bg-white rounded-lg border border-[#E2D8CC]">
                    {currentLiveUrl}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyWebsiteLink}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1F1B18] hover:bg-[#342F2B] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>

                    <a
                      href={currentLiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white hover:bg-[#F2ECE5] border border-[#DDD3C7] text-[#1F1B18] rounded-lg transition-all"
                      title="Open Live Boutique"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F2EDE7]">
                  <button
                    onClick={() => setShowQr(!showQr)}
                    className="px-3 py-1.5 bg-[#FAF5EE] hover:bg-[#F0E6D8] border border-[#DDD3C7] text-[#2C2723] text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQr ? 'Hide Storefront QR' : 'Show Storefront QR'}</span>
                  </button>
                </div>

                {showQr && (
                  <div className="mt-4 p-4 bg-[#F5EFE9] border border-[#DDD3C7] rounded-xl flex flex-col items-center justify-center text-center animate-fadeIn">
                    <div className="p-3 bg-white rounded-xl shadow-xs border border-[#E0D7CC] mb-2">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentLiveUrl)}`}
                        alt="Storefront QR Code"
                        className="w-40 h-40"
                      />
                    </div>
                    <p className="text-xs font-semibold text-[#1A1817]">Direct Smartphone Scanner</p>
                    <p className="text-[11px] text-[#786E64]">Customers can scan to directly open your site</p>
                  </div>
                )}
              </div>

              {/* DEDICATED STORE URL EDIT CARD (ANYTIME) */}
              <div className="bg-white border border-[#E0D7CC] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1F1B18] flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#D4AF37]" />
                      <span>Change or Edit Store URL Link</span>
                    </h3>
                    <p className="text-xs text-[#6B5F54] mt-0.5">
                      You can edit or change the store website URL anytime. It updates across all share buttons, bottom sticky bars, and QR codes.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase rounded-full">
                    Editable Anytime
                  </span>
                </div>

                {editUrlSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Store website URL successfully saved and updated across the entire boutique!</span>
                  </div>
                )}

                {editUrlError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{editUrlError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveStoreUrl} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3D352F] mb-1.5">
                      Store Website URL / Custom Domain
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        id="admin-store-url-input"
                        type="text"
                        value={editUrlInput}
                        onChange={(e) => setEditUrlInput(e.target.value)}
                        placeholder="e.g. https://munnaofficial.com or your custom domain"
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleUseCurrentBrowserUrl}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Auto-fill with current browser URL link"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Use Current Browser Link</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetStoreUrl}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Reset URL to default"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                        <span>Reset Default</span>
                      </button>
                    </div>

                    <button
                      id="admin-save-url-btn"
                      type="submit"
                      className="px-5 py-2.5 bg-[#1F1B18] hover:bg-[#38312B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span>Save New URL Link</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMER REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-5">
              {/* Top Banner & Stats */}
              <div className="bg-white p-5 rounded-2xl border border-[#EAE3D8] shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#F0EBE3]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                      <h2 className="font-serif-luxury text-lg font-medium text-[#1A1817]">
                        Customer Reviews & Client Ratings
                      </h2>
                    </div>
                    <p className="text-xs text-[#7A7066] mt-0.5">
                      Live customer feedback submitted by clients across the BEAUTY SPHERE catalog
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#FAF5EE] text-[#8C6B3E] px-3 py-1.5 rounded-lg border border-[#E2D6C6] font-medium">
                      Total Reviews: {reviews.length}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-center text-xs">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB]">
                    <span className="text-[10px] uppercase tracking-wider text-[#8C8075]">Overall Rating</span>
                    <p className="text-xl font-bold text-[#1A1817] mt-0.5">
                      {reviews.length > 0 
                        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                        : '5.0'} / 5.0
                    </p>
                    <span className="text-[10px] text-[#D4AF37] font-semibold">Across all products</span>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB]">
                    <span className="text-[10px] uppercase tracking-wider text-[#8C8075]">5-Star Ratio</span>
                    <p className="text-xl font-bold text-[#1A1817] mt-0.5">
                      {reviews.length > 0
                        ? `${Math.round((reviews.filter(r => r.rating === 5).length / reviews.length) * 100)}%`
                        : '100%'}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-medium">Exceptional tier</span>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB]">
                    <span className="text-[10px] uppercase tracking-wider text-[#8C8075]">Client Endorsements</span>
                    <p className="text-xl font-bold text-[#1A1817] mt-0.5">
                      {reviews.length > 0
                        ? `${Math.round((reviews.filter(r => r.recommend).length / reviews.length) * 100)}%`
                        : '100%'}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-medium">Would recommend</span>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB]">
                    <span className="text-[10px] uppercase tracking-wider text-[#8C8075]">Verified Clients</span>
                    <p className="text-xl font-bold text-[#1A1817] mt-0.5">
                      {reviews.filter(r => r.verifiedPurchase).length}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-medium">Authenticated</span>
                  </div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-[#8C8075] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search reviews by client, keyword, or title..."
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#DCD3C7] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                    />
                  </div>

                  <select
                    value={reviewRatingFilter}
                    onChange={(e) => setReviewRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="py-2 px-3 text-xs bg-white border border-[#DCD3C7] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                  >
                    <option value="all">All Star Ratings</option>
                    <option value="5">5 Stars Only</option>
                    <option value="4">4 Stars Only</option>
                    <option value="3">3 Stars Only</option>
                    <option value="2">2 Stars Only</option>
                    <option value="1">1 Star Only</option>
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              {(() => {
                const filtered = reviews.filter((r) => {
                  const matchesSearch = 
                    r.customerName.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
                    r.title.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
                    r.comment.toLowerCase().includes(reviewSearchQuery.toLowerCase());
                  const matchesRating = reviewRatingFilter === 'all' || r.rating === reviewRatingFilter;
                  return matchesSearch && matchesRating;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white p-8 rounded-xl border border-dashed border-[#DDD4C7] text-center">
                      <Star className="w-8 h-8 text-[#D4AF37] mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-semibold text-[#1A1817]">No Customer Reviews Found</p>
                      <p className="text-[11px] text-[#7A7066] mt-0.5">
                        Customers can submit verified reviews directly on each product's page.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filtered.map((rev) => {
                      const matchedProduct = products.find(p => p.id === rev.productId);
                      return (
                        <div 
                          key={rev.id}
                          className="bg-white p-4 rounded-xl border border-[#E8DFD3] shadow-2xs space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            {/* Product tag & date */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-semibold text-[#8C6B3E] bg-[#FAF5EE] px-2 py-0.5 rounded border border-[#EDE3D6] truncate max-w-[200px]">
                                {matchedProduct ? matchedProduct.name : `Product ID: ${rev.productId}`}
                              </span>
                              <span className="text-[10px] text-[#9E9388] shrink-0">{rev.date}</span>
                            </div>

                            {/* Client & Rating */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#1F1B18] text-[#D4AF37] text-[10px] font-bold flex items-center justify-center">
                                  {rev.customerName.charAt(0)}
                                </div>
                                <span className="text-xs font-semibold text-[#1A1817]">{rev.customerName}</span>
                                {rev.verifiedPurchase && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Verified</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center text-[#D4AF37]">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < rev.rating
                                        ? 'fill-[#D4AF37] text-[#D4AF37]'
                                        : 'text-[#E5DDD2]'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Title & Comment */}
                            <h4 className="text-xs font-semibold text-[#1A1817]">
                              {rev.title}
                            </h4>
                            <p className="text-xs text-[#5C534B] leading-relaxed font-light">
                              {rev.comment}
                            </p>

                            {/* Skin Type & Recommendation */}
                            <div className="flex items-center gap-2 pt-1">
                              {rev.skinType && (
                                <span className="text-[10px] bg-[#F5EFE9] text-[#7A6F64] px-2 py-0.5 rounded font-medium">
                                  Skin: {rev.skinType}
                                </span>
                              )}
                              {rev.recommend && (
                                <span className="text-[10px] text-emerald-700 font-medium">
                                  ✓ Recommends formulation
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Moderation Controls */}
                          {onDeleteReview && (
                            <div className="pt-2 border-t border-[#F2ECE4] flex justify-end">
                              <button
                                onClick={() => onDeleteReview(rev.id)}
                                className="inline-flex items-center gap-1 text-[11px] text-[#A84A3B] hover:text-rose-700 font-medium"
                                title="Remove customer review"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete Review</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 8: ROLES & BCRYPT SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Header Overview Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#EAE3D8] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EAE1]">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <Database className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif-luxury text-xl font-bold text-[#1A1817]">
                          Database Schema & Role-Based Authentication
                        </h2>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-md">
                          v3.0 Secure
                        </span>
                      </div>
                      <p className="text-xs text-[#7A7066] mt-0.5">
                        Clear separation between Master Admin and Sole Merchant / Moderator roles with BCrypt Blowfish password encryption.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-xs font-mono text-[#38312B]">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                      <span>bcrypt: 10 Salt Rounds</span>
                    </span>
                  </div>
                </div>

                {/* Architecture Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8075]">Blowfish Cipher</span>
                    <p className="text-xs font-semibold text-[#1A1817]">Cryptographic Salt & Hash</p>
                    <p className="text-[11px] text-[#6B6158]">
                      Passwords are never stored in plaintext. Uses 10 computational salt rounds ($2a$10$) immune to rainbow tables.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8075]">Distinct Identities</span>
                    <p className="text-xs font-semibold text-[#1A1817]">Separate Credentials</p>
                    <p className="text-[11px] text-[#6B6158]">
                      Master Admin (<span className="font-mono text-[10px]">akonmd12@gmail.com</span>) and Sole Merchant (<span className="font-mono text-[10px]">merchant@beautysphere.com</span>) have unique logins.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EDE5DB] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8075]">Permission Isolation</span>
                    <p className="text-xs font-semibold text-[#1A1817]">RBAC Enforcement</p>
                    <p className="text-[11px] text-[#6B6158]">
                      Root store URL reconfiguration and security administration are restricted exclusively to the Master Administrator.
                    </p>
                  </div>
                </div>
              </div>

              {/* ROLE DISTINCTION MATRIX */}
              <div className="bg-white p-6 rounded-2xl border border-[#EAE3D8] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                  <div>
                    <h3 className="font-serif-luxury text-base font-semibold text-[#1A1817] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#D4AF37]" />
                      <span>Role Distinction & Permission Matrix</span>
                    </h3>
                    <p className="text-xs text-[#7A7066]">
                      Comparison of system capabilities between Master Administrator and Sole Merchant / Moderator
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-[#FAF8F5] text-[#5A5149] uppercase font-bold text-[10px] tracking-wider border-b border-[#EAE3D8]">
                        <th className="py-3 px-4">Feature / Scope</th>
                        <th className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                            <Shield className="w-3 h-3 text-amber-700" />
                            Admin Role
                          </span>
                        </th>
                        <th className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                            <UserCheck className="w-3 h-3 text-blue-700" />
                            Sole Merchant / Moderator Role
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2ECE4]">
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Designated Identity</td>
                        <td className="py-3 px-4 text-[#38312B]">Akon MD (Owner)</td>
                        <td className="py-3 px-4 text-[#38312B]">Beauty Sphere Merchant / Moderator</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Default Username / Email</td>
                        <td className="py-3 px-4 font-mono text-emerald-800 bg-emerald-50/50">akonmd12@gmail.com</td>
                        <td className="py-3 px-4 font-mono text-blue-800 bg-blue-50/50">merchant@beautysphere.com</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Default Password</td>
                        <td className="py-3 px-4 font-mono text-[#6B5F54]">00998877</td>
                        <td className="py-3 px-4 font-mono text-[#6B5F54]">merchant2026!</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Password Hashing Method</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                            bcrypt ($2a$10$)
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                            bcrypt ($2a$10$)
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Product Catalog & Formulas</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Create / Edit / Delete</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Create / Edit / Delete</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Skin Compatibility Profiles</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Control</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Control</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Artisan Houses & Producers</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Control</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Control</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Discounts & Promo Offers</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Control</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Control</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Client Order Fulfillment</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Status & Invoicing</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Status & Invoicing</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Customer Reviews Moderation</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Moderation / Deletion</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Full Moderation / Deletion</td>
                      </tr>
                      <tr className="bg-amber-50/40">
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Boutique Official URL Domain Editing</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Authorized (Full Master)</td>
                        <td className="py-3 px-4 text-rose-600 font-bold">Restricted (View / Copy only)</td>
                      </tr>
                      <tr className="bg-amber-50/40">
                        <td className="py-3 px-4 font-semibold text-[#1A1817]">Security Credentials & Schema Inspection</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">Authorized (Full Master)</td>
                        <td className="py-3 px-4 text-amber-700 font-bold">Read-Only Oversight</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LIVE DATABASE USERS IN LOCAL STORAGE */}
              <div className="bg-white p-6 rounded-2xl border border-[#EAE3D8] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EAE1]">
                  <div>
                    <h3 className="font-serif-luxury text-base font-semibold text-[#1A1817] flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      <span>Live Database User Entities (BCrypt Encrypted)</span>
                    </h3>
                    <p className="text-xs text-[#7A7066]">
                      Records stored securely with Blowfish hashed password signatures in the database schema.
                    </p>
                  </div>

                  <button
                    onClick={() => setDatabaseUsersList(getDatabaseUsers())}
                    className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F0EAE1] text-xs font-semibold rounded-lg border border-[#DCD3C7] text-[#38312B] transition-colors"
                  >
                    ↻ Refresh Schema Records
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {databaseUsersList.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 rounded-xl border-2 space-y-3 ${
                        user.role === 'admin'
                          ? 'bg-[#FAF6EE] border-[#D4AF37]/60'
                          : 'bg-[#F4F7FB] border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                              user.role === 'admin'
                                ? 'bg-[#1F1B18] text-[#D4AF37]'
                                : 'bg-blue-700 text-white'
                            }`}
                          >
                            {user.displayName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#1A1817]">{user.displayName}</h4>
                            <p className="text-[11px] text-[#6B5F54] font-mono">{user.email}</p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {user.role === 'admin' ? 'Master Admin' : 'Sole Merchant / Mod'}
                        </span>
                      </div>

                      {/* BCrypt Hash Display */}
                      <div className="bg-white/80 p-3 rounded-lg border border-black/5 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#6B5F54] uppercase">Stored BCrypt Hash:</span>
                          <span className="text-emerald-700 font-mono font-bold">Valid $2a$10$ Signature</span>
                        </div>
                        <p className="font-mono text-[10px] text-[#241F1A] bg-black/5 p-1.5 rounded break-all select-all">
                          {user.passwordHash}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#6B5F54] pt-1">
                        <span>Username: <strong className="font-mono text-[#1A1817]">{user.username}</strong></span>
                        <span>Permissions: <strong className="text-[#1A1817]">{user.permissions.length} active</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REAL-TIME BCRYPT ENCRYPTION & VERIFICATION SANDBOX */}
              <div className="bg-white p-6 rounded-2xl border border-[#EAE3D8] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                  <div>
                    <h3 className="font-serif-luxury text-base font-semibold text-[#1A1817] flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-600" />
                      <span>Interactive BCrypt Blowfish Crypto Sandbox</span>
                    </h3>
                    <p className="text-xs text-[#7A7066]">
                      Test real-time password hashing and verification using the live <code className="bg-gray-100 px-1 py-0.5 rounded">bcryptjs</code> library.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Test Hashing */}
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DDD5CB] space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#38312B] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>1. Generate BCrypt Hash</span>
                    </span>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#6B5F54] mb-1">Plaintext Input Password:</label>
                      <input
                        type="text"
                        value={bcryptTestInput}
                        onChange={(e) => setBcryptTestInput(e.target.value)}
                        placeholder="Type any password..."
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCC1] rounded-lg font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const hash = hashPassword(bcryptTestInput);
                        setBcryptGeneratedHash(hash);
                        const match = verifyPassword(bcryptVerifyInput, hash);
                        setBcryptVerifyResult({ match, checked: true });
                      }}
                      className="w-full py-2 bg-[#1F1B18] hover:bg-[#342F2B] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Compute BCrypt Hash (Salt Rounds: 10)
                    </button>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#6B5F54] uppercase">Generated 60-Char Hash:</span>
                      <p className="p-2 bg-white rounded border border-[#E0D7CC] font-mono text-[10px] text-emerald-800 break-all select-all">
                        {bcryptGeneratedHash}
                      </p>
                    </div>
                  </div>

                  {/* Test Verifying */}
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DDD5CB] space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#38312B] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>2. Verify Against Stored Hash</span>
                    </span>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#6B5F54] mb-1">Candidate Password to Check:</label>
                      <input
                        type="text"
                        value={bcryptVerifyInput}
                        onChange={(e) => setBcryptVerifyInput(e.target.value)}
                        placeholder="Type candidate password..."
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5CCC1] rounded-lg font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const match = verifyPassword(bcryptVerifyInput, bcryptGeneratedHash);
                        setBcryptVerifyResult({ match, checked: true });
                      }}
                      className="w-full py-2 bg-[#D4AF37] hover:bg-[#C29E2E] text-[#1F1B18] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Verify Password Match
                    </button>

                    <div className="pt-1">
                      {bcryptVerifyResult.checked && (
                        <div
                          className={`p-3 rounded-lg border flex items-center gap-2 text-xs ${
                            bcryptVerifyResult.match
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-rose-50 border-rose-300 text-rose-800'
                          }`}
                        >
                          {bcryptVerifyResult.match ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold">Match confirmed! BCrypt verified correctly.</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span className="font-semibold">Authentication failed: Password does not match hash.</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* REAL-TIME RBAC & ACCESS CONTROL AUDIT LOGS */}
              <div className="bg-white p-6 rounded-2xl border border-[#EAE3D8] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EAE1]">
                  <div>
                    <h3 className="font-serif-luxury text-base font-semibold text-[#1A1817] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-rose-600" />
                      <span>Security Middleware & Access Denial Audit Log</span>
                    </h3>
                    <p className="text-xs text-[#7A7066]">
                      Records every attempt by merchants or public visitors to access restricted portal routes.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRefreshSecurityLogs}
                      className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F0EAE1] text-xs font-semibold rounded-lg border border-[#DCD3C7] text-[#38312B] transition-colors cursor-pointer"
                    >
                      ↻ Refresh Logs
                    </button>
                    {securityAuditLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearSecurityLogs}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-xs font-semibold rounded-lg border border-rose-200 text-rose-700 transition-colors cursor-pointer"
                      >
                        Clear Audit History
                      </button>
                    )}
                  </div>
                </div>

                {securityAuditLogs.length === 0 ? (
                  <div className="text-center py-8 bg-[#FAF8F5] rounded-xl border border-dashed border-[#DDD5CB] text-xs text-[#7A7066]">
                    <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-[#2B2623]">Security Perimeter Clean & Active</p>
                    <p className="text-[11px] mt-0.5">No unauthorized portal breaches or access denials recorded in this browser session.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[#EAE3D8]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FAF8F5] text-[#5A5149] uppercase tracking-wider text-[10px] border-b border-[#EAE3D8]">
                          <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                          <th className="py-2.5 px-3 font-semibold">Attempted Route</th>
                          <th className="py-2.5 px-3 font-semibold">User Identity</th>
                          <th className="py-2.5 px-3 font-semibold">Role</th>
                          <th className="py-2.5 px-3 font-semibold">Security Action</th>
                          <th className="py-2.5 px-3 font-semibold">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EAE1]">
                        {securityAuditLogs.map((log) => {
                          const isBlocked = log.action === 'BLOCKED';
                          return (
                            <tr key={log.id} className={isBlocked ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-[#FAF8F5]'}>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-[#7A7066] whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#1A1817]">
                                /{log.route}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-medium text-[#1A1817]">{log.userDisplayName || 'Anonymous Client'}</div>
                                {log.userEmail && <div className="text-[10px] text-[#7A7066] font-mono">{log.userEmail}</div>}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  log.role === 'admin'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : log.role === 'merchant_moderator'
                                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                                }`}>
                                  {log.role || 'public_visitor'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  log.action === 'BLOCKED'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-[#5A5149]">
                                {log.reason}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: ADMIN PROFILE & STORE OWNER SETTINGS */}
          {activeTab === 'admin-profile' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Store Owner Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#EAE3D8] shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#F0EAE1]">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#1F1B18] text-[#D4AF37] font-serif-luxury text-2xl flex items-center justify-center border-2 border-[#D4AF37]/50 shadow-xs">
                      {profileFormData.name.charAt(0) || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif-luxury text-xl sm:text-2xl font-normal text-[#1A1817]">
                          {profileFormData.name}
                        </h2>
                        <span className="px-2.5 py-0.5 bg-[#D4AF37] text-[#1F1B18] text-[10px] font-bold uppercase tracking-wider rounded">
                          Sole Merchant
                        </span>
                      </div>
                      <p className="text-xs text-[#8C6B3E] font-medium flex items-center gap-1.5 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Store Owner & Exclusive Curator of BEAUTY SPHERE SHOP</span>
                      </p>
                      <p className="text-xs text-[#7A7066] font-mono mt-0.5">
                        {profileFormData.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F1B18] hover:bg-[#342F2A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4 text-[#D4AF37]" />
                    <span>+ Add Formulation Anytime</span>
                  </button>
                </div>

                {/* Authorization & Posting Rules Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-5 text-xs">
                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EDE5DA] space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Sole Seller Authority</span>
                    </div>
                    <p className="text-[11px] text-[#5C534B] leading-relaxed">
                      Only you (Akon MD) have access to list products, adjust pricing, and edit inventory.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EDE5DA] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#8C6B3E] font-semibold">
                      <SlidersHorizontal className="w-4 h-4 text-[#8C6B3E]" />
                      <span>Anytime Product Posting</span>
                    </div>
                    <p className="text-[11px] text-[#5C534B] leading-relaxed">
                      Easily add new formulations from certified artisan producers anytime with photo, ritual, and ingredients.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EDE5DA] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#1F1B18] font-semibold">
                      <Star className="w-4 h-4 text-[#D4AF37]" />
                      <span>Live Customer Reviews</span>
                    </div>
                    <p className="text-[11px] text-[#5C534B] leading-relaxed">
                      Clients can submit 1-5 star reviews on any product. Public posting of items is locked.
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Store Owner Profile Form */}
              <div className="bg-white p-6 rounded-2xl border border-[#EAE3D8] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                  <div>
                    <h3 className="font-serif-luxury text-base font-medium text-[#1A1817]">
                      Merchant Contact Information & Details
                    </h3>
                    <p className="text-xs text-[#7A7066]">
                      Displayed on client invoices, order confirmations, and storefront footer
                    </p>
                  </div>

                  {profileSavedToast && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Profile updated successfully!</span>
                    </span>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (onUpdateProfile) {
                      onUpdateProfile({
                        ...userProfile,
                        name: profileFormData.name,
                        email: profileFormData.email,
                        phone: profileFormData.phone,
                        whatsapp: profileFormData.whatsapp,
                        telegram: profileFormData.telegram,
                        address: profileFormData.address,
                        city: profileFormData.city,
                        isStoreOwner: true,
                      });
                    }
                    setProfileSavedToast(true);
                    setTimeout(() => setProfileSavedToast(false), 3000);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A423B] uppercase tracking-wider mb-1">
                        Store Owner / Merchant Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileFormData.name}
                        onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A423B] uppercase tracking-wider mb-1">
                        Merchant Official Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={profileFormData.email}
                        onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A423B] uppercase tracking-wider mb-1">
                        WhatsApp Contact Number
                      </label>
                      <input
                        type="text"
                        value={profileFormData.whatsapp}
                        onChange={(e) => setProfileFormData({ ...profileFormData, whatsapp: e.target.value })}
                        placeholder="+1 (555) 382-9011"
                        className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A423B] uppercase tracking-wider mb-1">
                        Telegram Handle
                      </label>
                      <input
                        type="text"
                        value={profileFormData.telegram}
                        onChange={(e) => setProfileFormData({ ...profileFormData, telegram: e.target.value })}
                        placeholder="@beautysphereshop"
                        className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A423B] uppercase tracking-wider mb-1">
                        Boutique Studio Address
                      </label>
                      <input
                        type="text"
                        value={profileFormData.address}
                        onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A423B] uppercase tracking-wider mb-1">
                        City & Country
                      </label>
                      <input
                        type="text"
                        value={profileFormData.city}
                        onChange={(e) => setProfileFormData({ ...profileFormData, city: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      id="save-admin-profile-btn"
                      className="px-5 py-2.5 bg-[#1F1B18] hover:bg-[#342F2B] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all"
                    >
                      Save Admin Profile Updates
                    </button>
                  </div>
                </form>
              </div>

              {/* DEDICATED ADMIN & MERCHANT PASSWORD CHANGE CARD */}
              <div id="admin-password-security-card" className="bg-[#FAF4ED] p-6 rounded-2xl border-2 border-[#D4AF37]/60 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE1D5]">
                  <div>
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-[#D4AF37]" />
                      <h3 className="font-serif-luxury text-base font-semibold text-[#1A1817]">
                        Merchant Profile Password & Master Security
                      </h3>
                    </div>
                    <p className="text-xs text-[#6B5F54] mt-0.5">
                      Only you (the owner) can enter and manage sensitive merchant controls. You can change your username and password anytime.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('credentials')}
                      className="px-3 py-1.5 bg-[#1F1B18] text-[#D4AF37] hover:bg-[#342F2B] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Security & Passwords Tab</span>
                    </button>
                    <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1F1B18] text-[#D4AF37] border border-[#D4AF37]/40 shadow-xs">
                      Sole Owner (Akon MD)
                    </span>
                  </div>
                </div>

                {/* Option: Require Password to Open Merchant Profile */}
                <div className="p-4 bg-white rounded-xl border border-[#E5DACD] flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <p className="text-xs font-bold text-[#1A1817] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#8C6B3E]" />
                      <span>Option: Require Password to Open Merchant Profile</span>
                    </p>
                    <p className="text-[11px] text-[#6B5F54] mt-0.5">
                      When turned on, opening the Merchant Profile modal requires entering your owner password before viewing or editing proprietary boutique details.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={requireMerchantPw}
                      onChange={handleToggleRequireMerchantPw}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.75 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1F1B18]"></div>
                  </label>
                </div>

                {adminPasswordMsg && (
                  <div className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-fadeIn ${
                    adminPasswordMsg.type === 'success' 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}>
                    {adminPasswordMsg.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{adminPasswordMsg.text}</span>
                  </div>
                )}

                {/* Password Change Form */}
                <form onSubmit={handleAdminPasswordChange} className="bg-white p-5 rounded-xl border border-[#E5DACD] space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE3]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1817]">
                      Change Owner Password Anytime
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCurrentStoredAdminPw(!showCurrentStoredAdminPw)}
                      className="text-[11px] text-[#8C6B3E] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {showCurrentStoredAdminPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showCurrentStoredAdminPw ? `Current: ${getStoredAdminPassword()}` : 'Reveal Current Password'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A423B] uppercase tracking-wider mb-1">
                        Current (Old) Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showAdminPw ? 'text' : 'password'}
                          required
                          value={oldAdminPassword}
                          onChange={(e) => setOldAdminPassword(e.target.value)}
                          placeholder="Enter old password..."
                          className="w-full pl-3.5 pr-9 py-2.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg text-[#1A1817] focus:outline-none focus:border-[#1F1B18]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPw(!showAdminPw)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A7066] hover:text-black p-0.5 cursor-pointer"
                        >
                          {showAdminPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A423B] uppercase tracking-wider mb-1">
                        New Password *
                      </label>
                      <input
                        type={showAdminPw ? 'text' : 'password'}
                        required
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="New password (min 4 chars)..."
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg text-[#1A1817] focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A423B] uppercase tracking-wider mb-1">
                        Confirm New Password *
                      </label>
                      <input
                        type={showAdminPw ? 'text' : 'password'}
                        required
                        value={confirmAdminPassword}
                        onChange={(e) => setConfirmAdminPassword(e.target.value)}
                        placeholder="Re-type new password..."
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg text-[#1A1817] focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-3 text-[11px] text-[#7A7169]">
                      <button
                        type="button"
                        onClick={() => setOldAdminPassword(getStoredAdminPassword())}
                        className="text-[#8C6B3E] hover:underline font-medium cursor-pointer"
                      >
                        ⚡ Fill Current Password
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          saveStoredAdminPassword('00998877');
                          setAdminPasswordMsg({
                            type: 'success',
                            text: 'Owner password reset to default (00998877). You can change it anytime.'
                          });
                          setOldAdminPassword('');
                          setNewAdminPassword('');
                          setConfirmAdminPassword('');
                        }}
                        className="text-rose-700 hover:underline cursor-pointer"
                      >
                        Reset to 00998877
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      id="update-admin-password-btn"
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#1F1B18] hover:bg-[#342F2B] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{isSavingPassword ? 'Updating...' : 'Set & Save New Password'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: CREDENTIALS & ACCESS CONTROL (ADMIN & MERCHANT USERNAMES & PASSWORDS) */}
          {activeTab === 'credentials' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-8">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-[#1F1B18] to-[#2B241E] text-white p-6 rounded-2xl border border-[#3E342B] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Role-Based Access Control & BCrypt Security</span>
                  </div>
                  <h2 className="font-serif-luxury text-2xl font-bold tracking-tight text-[#FAF8F5]">
                    Login Credentials & Password Manager
                  </h2>
                  <p className="text-xs text-[#C7BDB3] max-w-2xl leading-relaxed">
                    Change usernames and passwords for the <span className="text-white font-semibold">Master Administrator</span> and <span className="text-white font-semibold">Sole Merchant</span> accounts anytime. Only authorized Admin and Merchant accounts are permitted to authenticate into protected back-office systems.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-center">
                    <span className="text-[#8C8075] text-[10px] block">Algorithm</span>
                    <span className="text-[#D4AF37] font-bold">BCrypt (10 Rounds)</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-center">
                    <span className="text-emerald-400 text-[10px] block">Guard Status</span>
                    <span className="text-emerald-300 font-bold">Strict Isolation</span>
                  </div>
                </div>
              </div>

              {/* Grid with 2 Primary Panels: Admin and Merchant */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PANEL 1: MASTER ADMIN CREDENTIALS */}
                <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/40 p-6 shadow-sm flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#1F1B18] text-[#D4AF37] flex items-center justify-center font-bold">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif-luxury text-lg font-bold text-[#1A1817]">
                            Master Admin Account
                          </h3>
                          <p className="text-[11px] text-[#7A7066]">
                            Full owner authority over products, settings, and team
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        Admin Role
                      </span>
                    </div>

                    {/* Current info badge */}
                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EAE3D8] text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between items-center text-[#5A5149]">
                        <span>Current Username:</span>
                        <span className="font-bold text-[#1A1817]">{adminCredUser.username}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#5A5149]">
                        <span>Current Email:</span>
                        <span className="font-bold text-[#1A1817]">{adminCredUser.email}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#5A5149]">
                        <span>Password Hash:</span>
                        <span className="text-emerald-700 font-bold">Encrypted Blowfish</span>
                      </div>
                    </div>

                    {/* Feedback Toast */}
                    {adminCredMsg && (
                      <div className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-fadeIn ${
                        adminCredMsg.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                          : 'bg-rose-50 border border-rose-300 text-rose-900'
                      }`}>
                        {adminCredMsg.type === 'success' ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed">{adminCredMsg.text}</span>
                      </div>
                    )}

                    {/* Admin Credential Form */}
                    <form onSubmit={handleUpdateAdminCredentials} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-[#4A423B] mb-1">
                          Admin Username (Login Identifier) *
                        </label>
                        <input
                          type="text"
                          required
                          value={adminUsernameInput}
                          onChange={(e) => setAdminUsernameInput(e.target.value)}
                          placeholder="e.g. akonmd12@gmail.com or akon_master"
                          className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-medium focus:outline-none focus:border-[#1F1B18]"
                        />
                        <span className="text-[10px] text-[#7A7066] mt-0.5 block">
                          You can log in using either this username or your email address.
                        </span>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#4A423B] mb-1">
                          Admin Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={adminEmailInput}
                          onChange={(e) => setAdminEmailInput(e.target.value)}
                          placeholder="e.g. akonmd12@gmail.com"
                          className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-medium focus:outline-none focus:border-[#1F1B18]"
                        />
                      </div>

                      <div className="pt-2 border-t border-[#F0EBE3]">
                        <label className="block font-semibold text-[#4A423B] mb-1">
                          Current Admin Password (Required for Verification) *
                        </label>
                        <div className="relative">
                          <input
                            type={showAdminCurrentPass ? 'text' : 'password'}
                            required
                            value={adminCurrentPasswordInput}
                            onChange={(e) => setAdminCurrentPasswordInput(e.target.value)}
                            placeholder="Enter current password (default: 00998877)..."
                            className="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-mono focus:outline-none focus:border-[#1F1B18]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminCurrentPass(!showAdminCurrentPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7066] hover:text-black cursor-pointer"
                          >
                            {showAdminCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-[#4A423B] mb-1">
                            New Password (Optional)
                          </label>
                          <div className="relative">
                            <input
                              type={showAdminNewPass ? 'text' : 'password'}
                              value={adminNewPasswordInput}
                              onChange={(e) => setAdminNewPasswordInput(e.target.value)}
                              placeholder="Leave blank to keep current"
                              className="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-mono focus:outline-none focus:border-[#1F1B18]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowAdminNewPass(!showAdminNewPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7066] hover:text-black cursor-pointer"
                            >
                              {showAdminNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-[#4A423B] mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type={showAdminNewPass ? 'text' : 'password'}
                            value={adminConfirmPasswordInput}
                            onChange={(e) => setAdminConfirmPasswordInput(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-mono focus:outline-none focus:border-[#1F1B18]"
                          />
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          disabled={isAdminCredSaving}
                          id="save-admin-cred-btn"
                          className="w-full py-3 bg-[#1F1B18] hover:bg-[#342F2B] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4 text-[#D4AF37]" />
                          <span>{isAdminCredSaving ? 'Saving & Encrypting...' : 'Save Admin Username & Password'}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="pt-3 border-t border-[#EAE3D8] flex items-center justify-between text-[11px] text-[#7A7066]">
                    <span>Admin Gate URL: <code className="bg-[#FAF8F5] px-1 py-0.5 rounded text-[#1A1817]">/admin-login</code></span>
                    <button
                      type="button"
                      onClick={() => setAdminCurrentPasswordInput('00998877')}
                      className="text-[#8C6B3E] hover:underline cursor-pointer"
                    >
                      Fill default (00998877)
                    </button>
                  </div>
                </div>

                {/* PANEL 2: SOLE MERCHANT & MODERATOR CREDENTIALS */}
                <div className="bg-white rounded-2xl border-2 border-blue-600/30 p-6 shadow-sm flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-900 text-blue-200 flex items-center justify-center font-bold">
                          <UserCheck className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-serif-luxury text-lg font-bold text-[#1A1817]">
                            Sole Merchant / Moderator
                          </h3>
                          <p className="text-[11px] text-[#7A7066]">
                            Dedicated operations, order fulfillment, and review moderation
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
                        Merchant Role
                      </span>
                    </div>

                    {/* Current info badge */}
                    <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between items-center text-[#5A5149]">
                        <span>Current Username:</span>
                        <span className="font-bold text-[#1A1817]">{merchantCredUser.username}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#5A5149]">
                        <span>Current Email:</span>
                        <span className="font-bold text-[#1A1817]">{merchantCredUser.email}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#5A5149]">
                        <span>Authorized Portal:</span>
                        <span className="text-blue-800 font-bold">/merchant-login</span>
                      </div>
                    </div>

                    {/* Feedback Toast */}
                    {merchantCredMsg && (
                      <div className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-fadeIn ${
                        merchantCredMsg.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                          : 'bg-rose-50 border border-rose-300 text-rose-900'
                      }`}>
                        {merchantCredMsg.type === 'success' ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed">{merchantCredMsg.text}</span>
                      </div>
                    )}

                    {/* Merchant Credential Form */}
                    <form onSubmit={handleUpdateMerchantCredentials} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-[#4A423B] mb-1">
                          Merchant Username (Login Identifier) *
                        </label>
                        <input
                          type="text"
                          required
                          value={merchantUsernameInput}
                          onChange={(e) => setMerchantUsernameInput(e.target.value)}
                          placeholder="e.g. merchant@beautysphere.com"
                          className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-medium focus:outline-none focus:border-blue-700"
                        />
                        <span className="text-[10px] text-[#7A7066] mt-0.5 block">
                          The merchant uses this to log into the Merchant Portal (/merchant-login).
                        </span>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#4A423B] mb-1">
                          Merchant Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={merchantEmailInput}
                          onChange={(e) => setMerchantEmailInput(e.target.value)}
                          placeholder="e.g. merchant@beautysphere.com"
                          className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-medium focus:outline-none focus:border-blue-700"
                        />
                      </div>

                      <div className="pt-2 border-t border-[#F0EBE3]">
                        <p className="text-[11px] text-blue-900/80 bg-blue-50 p-2.5 rounded-lg border border-blue-100 mb-3">
                          <span className="font-bold">Master Admin Supervisory Authority:</span> You can directly assign or reset the merchant password without needing their existing password.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-[#4A423B] mb-1">
                              New Merchant Password
                            </label>
                            <div className="relative">
                              <input
                                type={showMerchantNewPass ? 'text' : 'password'}
                                value={merchantNewPasswordInput}
                                onChange={(e) => setMerchantNewPasswordInput(e.target.value)}
                                placeholder="Leave blank to keep current"
                                className="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-mono focus:outline-none focus:border-blue-700"
                              />
                              <button
                                type="button"
                                onClick={() => setShowMerchantNewPass(!showMerchantNewPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7066] hover:text-black cursor-pointer"
                              >
                                {showMerchantNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block font-semibold text-[#4A423B] mb-1">
                              Confirm Merchant Password
                            </label>
                            <input
                              type={showMerchantNewPass ? 'text' : 'password'}
                              value={merchantConfirmPasswordInput}
                              onChange={(e) => setMerchantConfirmPasswordInput(e.target.value)}
                              placeholder="Re-enter merchant password"
                              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-mono focus:outline-none focus:border-blue-700"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          disabled={isMerchantCredSaving}
                          id="save-merchant-cred-btn"
                          className="w-full py-3 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4 text-blue-300" />
                          <span>{isMerchantCredSaving ? 'Updating Merchant...' : 'Update Merchant Credentials'}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="pt-3 border-t border-[#EAE3D8] flex items-center justify-between text-[11px] text-[#7A7066]">
                    <span>Merchant Gate URL: <code className="bg-[#FAF8F5] px-1 py-0.5 rounded text-[#1A1817]">/merchant-login</code></span>
                    <button
                      type="button"
                      onClick={() => {
                        setMerchantNewPasswordInput('merchant2026');
                        setMerchantConfirmPasswordInput('merchant2026');
                      }}
                      className="text-blue-700 hover:underline cursor-pointer"
                    >
                      Fill default (merchant2026)
                    </button>
                  </div>
                </div>
              </div>

              {/* SECURITY SUMMARY & ACCESS ISOLATION POLICY */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#EAE3D8] p-5 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-[#1A1817]">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Access Control & Security Policy Enforcement</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[#5A5149] pt-1">
                  <div className="p-3 bg-white rounded-xl border border-[#E5DACD] space-y-1">
                    <span className="font-bold text-[#1A1817] block">1. Admin Isolation</span>
                    <p className="text-[11px]">Only the account with role <code className="text-amber-800 bg-amber-50 px-1 rounded">admin</code> can view the master Admin Dashboard. Merchant accounts cannot enter.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5DACD] space-y-1">
                    <span className="font-bold text-[#1A1817] block">2. Merchant Isolation</span>
                    <p className="text-[11px]">Only accounts with role <code className="text-blue-800 bg-blue-50 px-1 rounded">merchant_moderator</code> can view the Merchant Dashboard. Sensitive owner settings are locked.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E5DACD] space-y-1">
                    <span className="font-bold text-[#1A1817] block">3. Customer Block</span>
                    <p className="text-[11px]">Public store customers and unauthenticated visitors cannot access back-office portals under any circumstance.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: ADD / EDIT PRODUCT */}
        {isProductModalOpen && (
          <ProductFormModal
            isOpen={isProductModalOpen}
            onClose={() => {
              setIsProductModalOpen(false);
              setEditingProduct(null);
            }}
            product={editingProduct}
            producers={producers}
            skinOptions={internalSkinOptions}
            onSave={(savedProduct) => {
              if (editingProduct) {
                const updated = products.map(p => p.id === savedProduct.id ? savedProduct : p);
                onSaveProducts(updated);
              } else {
                onSaveProducts([savedProduct, ...products]);
              }
              setIsProductModalOpen(false);
              setEditingProduct(null);
            }}
          />
        )}

        {/* MODAL: ADD / EDIT PRODUCER */}
        {isProducerModalOpen && (
          <ProducerFormModal
            isOpen={isProducerModalOpen}
            onClose={() => {
              setIsProducerModalOpen(false);
              setEditingProducer(null);
            }}
            producer={editingProducer}
            onSave={(savedProducer) => {
              if (editingProducer) {
                const updated = producers.map(p => p.id === savedProducer.id ? savedProducer : p);
                onSaveProducers(updated);
              } else {
                onSaveProducers([...producers, savedProducer]);
              }
              setIsProducerModalOpen(false);
              setEditingProducer(null);
            }}
          />
        )}

        {/* MODAL: ADD / EDIT OFFER */}
        {isOfferModalOpen && (
          <OfferFormModal
            isOpen={isOfferModalOpen}
            onClose={() => {
              setIsOfferModalOpen(false);
              setEditingOffer(null);
            }}
            offer={editingOffer}
            onSave={(savedOffer) => {
              if (editingOffer) {
                const updated = offers.map(o => o.id === savedOffer.id ? savedOffer : o);
                onSaveOffers(updated);
              } else {
                onSaveOffers([...offers, savedOffer]);
              }
              setIsOfferModalOpen(false);
              setEditingOffer(null);
            }}
          />
        )}

        {/* MODAL: ORDER INVOICE & COURIER DISPATCH SLIP */}
        {selectedOrderForInvoice && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-[#E5DDD2] my-6 flex flex-col">
              <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E5DDD2] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#1F1B18] text-white rounded-lg">
                    <Truck className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-base font-bold text-[#1A1817]">
                      Order Delivery Manifest & Packing Slip
                    </h3>
                    <span className="font-mono text-xs text-blue-900 font-bold">
                      {selectedOrderForInvoice.orderNumber}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="p-1 text-[#7A7066] hover:text-black rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* Customer delivery card with copy buttons */}
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE2D7] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase text-[#736A61] tracking-wider">
                      Customer Delivery Address & Contact
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={async () => {
                          const text = formatEssentialOrderInfo(selectedOrderForInvoice);
                          const ok = await copyTextToClipboard(text);
                          if (ok) {
                            setCopiedSlipEssential(true);
                            setTimeout(() => setCopiedSlipEssential(false), 2500);
                          }
                        }}
                        className={`px-2 py-1 text-[10px] font-bold rounded border flex items-center gap-1 transition-colors cursor-pointer ${
                          copiedSlipEssential
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-[#1F1B18] text-white border-[#1F1B18]'
                        }`}
                        title="Copy essential order info strictly: Customer Name, Contact Number, Delivery Address, Ordered Items"
                      >
                        {copiedSlipEssential ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-amber-300" />
                            <span>Copy Order Info</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleCopySlipDelivery(selectedOrderForInvoice, true)}
                        className="px-2 py-1 text-[10px] font-medium bg-white hover:bg-gray-100 text-gray-700 rounded border border-gray-300 transition-colors cursor-pointer"
                        title="Copy name, phone and address only"
                      >
                        {copiedSlipAddress ? 'Address Copied!' : 'Address Only'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-[#1A1817] text-sm">{selectedOrderForInvoice.customer.fullName}</div>
                    <div className="font-mono text-xs font-bold text-gray-900 mt-0.5">📞 {selectedOrderForInvoice.customer.phone || 'No phone provided'}</div>
                    <div className="text-[#6B5F54] text-[11px]">✉️ {selectedOrderForInvoice.customer.email || 'No email provided'}</div>
                    <div className="text-[#2C241E] font-medium text-xs mt-1.5 bg-white p-2.5 rounded-lg border border-[#E8DFD3]">
                      📍 {selectedOrderForInvoice.customer.address}, {selectedOrderForInvoice.customer.city} {selectedOrderForInvoice.customer.postalCode || ''}, {selectedOrderForInvoice.customer.country || ''}
                      {selectedOrderForInvoice.customer.notes && (
                        <div className="text-amber-900 text-[11px] mt-1 italic">
                          Special notes: {selectedOrderForInvoice.customer.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="space-y-2">
                  <span className="font-bold text-[#5A5148] uppercase tracking-wider text-[10px]">Ordered Formulations:</span>
                  <div className="divide-y divide-[#F2ECE4] border rounded-xl p-2.5 bg-white max-h-44 overflow-y-auto">
                    {selectedOrderForInvoice.items.map((it, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <div>
                          <span className="font-medium text-[#1A1817]">{it.productName}</span>
                          <span className="text-[#8C8075] block text-[10px]">Qty: {it.quantity} • {it.producer}</span>
                        </div>
                        <span className="font-mono font-bold text-[#1A1817]">
                          {formatCurrency(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Status */}
                <div className="flex items-center justify-between pt-2 text-sm font-bold border-t border-[#F0EAE1]">
                  <span>Total Amount ({selectedOrderForInvoice.paymentMethod}):</span>
                  <span className="font-mono text-emerald-800 text-base">
                    {formatCurrency(selectedOrderForInvoice.total)}
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={async () => {
                      const text = formatEssentialOrderInfo(selectedOrderForInvoice);
                      const ok = await copyTextToClipboard(text);
                      if (ok) {
                        setCopiedSlipEssential(true);
                        setTimeout(() => setCopiedSlipEssential(false), 2500);
                      }
                    }}
                    className={`py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      copiedSlipEssential
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#1F1B18] hover:bg-[#38322B] text-white'
                    }`}
                  >
                    {copiedSlipEssential ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Order Info Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-300" />
                        <span>Copy Order Info</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedOrderForInvoice(null)}
                    className="py-2.5 bg-[#FAF8F5] hover:bg-[#EDE5DA] text-[#1F1B18] border border-[#D5CBC0] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Close Slip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* Sub-modal: Product Add & Edit with Photo Upload */
interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  producers: Producer[];
  onSave: (product: Product) => void;
  skinOptions?: SkinProfileOption[];
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  producers,
  onSave,
  skinOptions = [],
}) => {
  const [name, setName] = useState(product?.name || '');
  const [subtitle, setSubtitle] = useState(product?.subtitle || '');
  const [nativeName, setNativeName] = useState(product?.nativeName || '');
  const [originCountry, setOriginCountry] = useState(product?.originCountry || 'South Korea');
  const [heritage, setHeritage] = useState(product?.heritage || 'Korean Hanbang Herbal Medicine');
  const [producer, setProducer] = useState(product?.producer || producers[0]?.name || 'Amore Hanbang Botanical Institute');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Essences & Serums');
  const [price, setPrice] = useState(product?.price || 95);
  const [discountPercent, setDiscountPercent] = useState(product?.discountPercent || 0);
  const [stock, setStock] = useState(product?.stock || 20);
  const [size, setSize] = useState(product?.size || '50 ml / 1.7 fl. oz.');
  const [description, setDescription] = useState(product?.description || '');
  const [ingredients, setIngredients] = useState(product?.ingredients || '');
  const [usageRitual, setUsageRitual] = useState(product?.usageRitual || '');
  const [badge, setBadge] = useState(product?.badge || '');
  const [image, setImage] = useState(product?.image || PRESET_IMAGES[0].url);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>(() => {
    if (product?.skinType && product.skinType.length > 0) {
      return product.skinType;
    }
    return ['All'];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savedProduct: Product = {
      id: product ? product.id : `prod-custom-${Date.now()}`,
      name,
      subtitle,
      nativeName: nativeName || undefined,
      originCountry,
      heritage: heritage || undefined,
      producer,
      category,
      price: Number(price),
      discountPercent: Number(discountPercent),
      stock: Number(stock),
      rating: product ? product.rating : 5.0,
      reviewsCount: product ? product.reviewsCount : 1,
      description,
      details: [
        'Bioactive molecular cellular nourishment',
        'Imparts lasting luminous bounce and skin barrier defense',
        'Authentic laboratory formulation direct from origin'
      ],
      ingredients: ingredients || 'Panax Ginseng Root Water, Camellia Sinensis Hydrosol, Squalane, Niacinamide, Tocopherol.',
      usageRitual: usageRitual || 'Warm 3 to 4 drops in palms, breathe deeply, and gently press across face and neck morning and evening.',
      image: image || PRESET_IMAGES[0].url,
      isFeatured: product ? product.isFeatured : true,
      isNewArrival: product ? product.isNewArrival : true,
      badge: badge || undefined,
      size,
      skinType: selectedSkinTypes.length > 0 ? selectedSkinTypes : ['All'],
      createdAt: product ? product.createdAt : new Date().toISOString().split('T')[0]
    };
    onSave(savedProduct);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-[#E5DDD2] my-6 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-white border-b border-[#E5DDD2] flex items-center justify-between">
          <h3 className="font-serif-luxury text-xl font-medium text-[#1A1817]">
            {product ? 'Edit Formulation Details' : 'Add New Formulation to Boutique'}
          </h3>
          <button onClick={onClose} className="p-1 text-[#7A7066] hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Photo Upload Section */}
          <div className="bg-white p-4 rounded-xl border border-[#E5DDD2] space-y-3">
            <label className="block text-[11px] uppercase font-bold tracking-wider text-[#70665D]">
              Product Photo Upload
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-[#FAF8F5] border border-[#DDD3C7] overflow-hidden shrink-0 flex items-center justify-center">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#B5ABA0]" />
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-[#1F1B18] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Upload from Device</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPresetPicker(!showPresetPicker)}
                    className="px-3 py-2 bg-[#FAF5EE] border border-[#DDD3C7] text-[#2C2723] rounded-lg text-xs font-semibold"
                  >
                    <span>Choose from Luxury Presets</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-[#7A7169]">Or provide image URL:</label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1 text-xs bg-[#FAF8F5] border border-[#DDD3C7] rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Luxury Preset Picker */}
            {showPresetPicker && (
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E0D7CC] grid grid-cols-4 gap-2 mt-2">
                {PRESET_IMAGES.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setImage(preset.url);
                      setShowPresetPicker(false);
                    }}
                    className="cursor-pointer group relative aspect-square rounded-lg overflow-hidden border border-[#D5CBC0]"
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Product Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Concentrated Ginseng Renewing Serum EX"
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Subtitle / Key Function</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Seoul Hanbang Red Ginseng Saponin Glass-Skin Elixir"
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              />
            </div>
          </div>

          {/* Asian Heritage & Origin Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Origin Country</label>
              <select
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg font-medium"
              >
                <option value="South Korea">🇰🇷 South Korea (K-Beauty)</option>
                <option value="China">🇨🇳 China (C-Beauty)</option>
                <option value="Other">Other Origin</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Native Script (Hangul / Hanzi)</label>
              <input
                type="text"
                value={nativeName}
                onChange={(e) => setNativeName(e.target.value)}
                placeholder="e.g. 자음생 에센스 or 花西子 玉养睡莲"
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Heritage / Tradition</label>
              <input
                type="text"
                value={heritage}
                onChange={(e) => setHeritage(e.target.value)}
                placeholder="e.g. Korean Hanbang Herbal Medicine"
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              />
            </div>
          </div>

          {/* Producer & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Producer / Brand</label>
              <select
                value={producer}
                onChange={(e) => setProducer(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              >
                {producers.map((pr) => (
                  <option key={pr.id} value={pr.name}>{pr.name} ({pr.origin})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              >
                <option value="Essences & Serums">Essences & Serums</option>
                <option value="Moisture & Barrier Creams">Moisture & Barrier Creams</option>
                <option value="Cleansers & Balms">Cleansers & Balms</option>
                <option value="Sun Care & Cushions">Sun Care & Cushions</option>
                <option value="Sheet Masks & Treatments">Sheet Masks & Treatments</option>
                <option value="Imperial Oils & Elixirs">Imperial Oils & Elixirs</option>
                <option value="Serums & Elixirs">Serums & Elixirs (Classic)</option>
                <option value="Hydration & Creams">Hydration & Creams (Classic)</option>
                <option value="Luxury Oils">Luxury Oils (Classic)</option>
                <option value="Sun Care">Sun Care (Classic)</option>
                <option value="Cleansers & Toners">Cleansers & Toners (Classic)</option>
                <option value="Masks & Treatments">Masks & Treatments (Classic)</option>
              </select>
            </div>
          </div>

          {/* Price, Discount, Stock, Size */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Price (৳ Taka)</label>
              <input
                type="number"
                min="1"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Discount (% Off)</label>
              <input
                type="number"
                min="0"
                max="90"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Stock Count</label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Size / Volume</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="50 ml / 1.7 fl. oz."
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              />
            </div>
          </div>

          {/* Badge */}
          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Luxury Badge (Optional)</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. Best Seller, Limited Reserve, Award Winner, New Formula"
              className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
            />
          </div>

          {/* Skin Compatibility & Skin Profile Lists */}
          <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#E0D5C7] space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] uppercase font-bold tracking-wider text-[#5A5149]">
                Skin Compatibility & Skin Profile Lists
              </label>
              <span className="text-[10px] text-[#8C8075]">Select all that apply</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {/* If skinOptions provided, map over them; also include default fallbacks */}
              {(skinOptions.length > 0 ? skinOptions : [
                { id: 'all', name: 'All Skin Types', tag: 'All' },
                { id: 'dry', name: 'Dry & Dehydrated', tag: 'Dry' },
                { id: 'sensitive', name: 'Sensitive & Reactive', tag: 'Sensitive' },
                { id: 'mature', name: 'Mature & Aging', tag: 'Mature' },
                { id: 'oily', name: 'Oily & Acne-Prone', tag: 'Oily' },
                { id: 'combination', name: 'Combination', tag: 'Combination' }
              ]).map((skinOpt) => {
                const isSelected = selectedSkinTypes.includes(skinOpt.tag);
                return (
                  <button
                    key={skinOpt.id}
                    type="button"
                    onClick={() => {
                      if (skinOpt.tag === 'All') {
                        setSelectedSkinTypes(['All']);
                      } else {
                        const withoutAll = selectedSkinTypes.filter(t => t !== 'All');
                        if (isSelected) {
                          const remaining = withoutAll.filter(t => t !== skinOpt.tag);
                          setSelectedSkinTypes(remaining.length > 0 ? remaining : ['All']);
                        } else {
                          setSelectedSkinTypes([...withoutAll, skinOpt.tag]);
                        }
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-[#1F1B18] text-white border-[#1F1B18] shadow-xs'
                        : 'bg-white text-[#4A423A] border-[#D8CFC5] hover:border-[#1F1B18]'
                    }`}
                  >
                    {skinOpt.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe formulation texture, cellular benefits, and sensory notes..."
              className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
            />
          </div>

          {/* Ingredients & Ritual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Key Ingredients</label>
              <textarea
                rows={2}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="INCI ingredient listing..."
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Ritual of Use</label>
              <textarea
                rows={2}
                value={usageRitual}
                onChange={(e) => setUsageRitual(e.target.value)}
                placeholder="Application steps for clients..."
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5DDD2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#D8CFC5] rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1F1B18] text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-[#342F2A]"
            >
              Save Formulation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* Sub-modal: Producer Add & Edit */
interface ProducerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  producer: Producer | null;
  onSave: (producer: Producer) => void;
}

const ProducerFormModal: React.FC<ProducerFormModalProps> = ({
  isOpen,
  onClose,
  producer,
  onSave,
}) => {
  const [name, setName] = useState(producer?.name || '');
  const [origin, setOrigin] = useState(producer?.origin || 'Grasse, France');
  const [specialty, setSpecialty] = useState(producer?.specialty || '');
  const [description, setDescription] = useState(producer?.description || '');
  const [foundedYear, setFoundedYear] = useState(producer?.foundedYear || 2020);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: producer ? producer.id : `prod-${Date.now()}`,
      name,
      origin,
      specialty,
      description,
      foundedYear: Number(foundedYear),
      active: true,
    });
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-[#E5DDD2]">
        <div className="px-6 py-4 bg-white border-b border-[#E5DDD2] flex items-center justify-between">
          <h3 className="font-serif-luxury text-xl font-medium text-[#1A1817]">
            {producer ? 'Edit Producer' : 'Add New Producer / Brand'}
          </h3>
          <button onClick={onClose} className="p-1 text-[#7A7066] hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3 text-xs">
          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">House / Producer Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Atelier L’Éclat"
              className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Country / Region of Origin</label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Geneva, Switzerland or Kyoto, Japan"
              className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Specialty Formulation Technique</label>
            <input
              type="text"
              required
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g. Cold-Pressed Phyto-actives & Bio-ferments"
              className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Founded Year</label>
            <input
              type="number"
              value={foundedYear}
              onChange={(e) => setFoundedYear(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">House Philosophy & Bio</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Heritage, ethical botanical sourcing, and laboratory craftsmanship..."
              className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5DDD2]">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-[#D8CFC5] rounded-lg text-xs">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-[#1F1B18] text-white rounded-lg text-xs font-semibold uppercase tracking-wider">
              Save Producer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* Sub-modal: Offer / Discount Add & Edit */
interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: OfferDiscount | null;
  onSave: (offer: OfferDiscount) => void;
}

const OfferFormModal: React.FC<OfferFormModalProps> = ({
  isOpen,
  onClose,
  offer,
  onSave,
}) => {
  const [code, setCode] = useState(offer?.code || '');
  const [title, setTitle] = useState(offer?.title || '');
  const [discountPercent, setDiscountPercent] = useState(offer?.discountPercent || 15);
  const [minimumOrder, setMinimumOrder] = useState(offer?.minimumOrder || 50);
  const [expiresAt, setExpiresAt] = useState(offer?.expiresAt || '2026-12-31');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: offer ? offer.id : `off-${Date.now()}`,
      code: code.toUpperCase().trim(),
      title,
      discountPercent: Number(discountPercent),
      minimumOrder: Number(minimumOrder),
      expiresAt,
      isActive: true,
      usageCount: offer ? offer.usageCount : 0,
    });
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-[#E5DDD2]">
        <div className="px-6 py-4 bg-white border-b border-[#E5DDD2] flex items-center justify-between">
          <h3 className="font-serif-luxury text-xl font-medium text-[#1A1817]">
            {offer ? 'Edit Offer & Discount' : 'Create Special Discount Code'}
          </h3>
          <button onClick={onClose} className="p-1 text-[#7A7066] hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3 text-xs">
          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Coupon Promo Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SPHERE20"
              className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Offer Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Radiance Privilege"
              className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Discount %</label>
              <input
                type="number"
                min="1"
                max="90"
                required
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Minimum Order ($)</label>
              <input
                type="number"
                min="0"
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-semibold text-[#5A5149] mb-1">Expiration Date</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8CFC5] rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5DDD2]">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-[#D8CFC5] rounded-lg text-xs">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-[#1F1B18] text-white rounded-lg text-xs font-semibold uppercase tracking-wider">
              Save Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
