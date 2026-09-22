import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ExternalLink, 
  Copy, 
  Check, 
  Package, 
  Heart, 
  SlidersHorizontal, 
  Globe, 
  Share2, 
  QrCode, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Send,
  Lock,
  LogOut,
  Zap,
  ArrowRight,
  Truck,
  Search,
  Clock,
  AlertCircle,
  Edit3,
  RotateCcw,
  Link as LinkIcon,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { CustomerAccount, Order, Product } from '../types';
import { formatCurrency } from '../utils/storage';
import { canUserPerform } from '../utils/rbac';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  customerAccount: CustomerAccount;
  onUpdateCustomerAccount: (updated: CustomerAccount) => void;
  orders: Order[];
  wishlistProducts: Product[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onRemoveFromWishlist: (productId: string) => void;
  onOpenAdminLogin: () => void;
  isAdminAuthenticated: boolean;
  onOpenAdminDashboard: () => void;
  onLogoutAdmin: () => void;
  websiteUrl: string;
  onUpdateWebsiteUrl?: (newUrl: string) => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
  customerAccount,
  onUpdateCustomerAccount,
  orders,
  wishlistProducts,
  onAddToCart,
  onBuyNow,
  onRemoveFromWishlist,
  onOpenAdminLogin,
  isAdminAuthenticated,
  onOpenAdminDashboard,
  onLogoutAdmin,
  websiteUrl,
  onUpdateWebsiteUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'tracking' | 'wishlist' | 'website-link'>(
    (initialTab as any) || 'profile'
  );
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [searchedTrackingOrder, setSearchedTrackingOrder] = useState<Order | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Customer form state
  const [formData, setFormData] = useState<CustomerAccount>({ ...customerAccount });

  // Custom Website URL Edit State
  const [editableUrl, setEditableUrl] = useState(websiteUrl || '');
  const [urlSaveSuccess, setUrlSaveSuccess] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [isEditingUrlSection, setIsEditingUrlSection] = useState(false);

  useEffect(() => {
    setEditableUrl(websiteUrl || '');
  }, [websiteUrl]);

  if (!isOpen) return null;

  const currentSiteUrl = websiteUrl || (typeof window !== 'undefined' ? window.location.href : 'https://beautysphereshop.com');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentSiteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BEAUTY SPHERE | Korean & Chinese Beauty Boutique',
          text: 'Explore authentic K-Beauty & C-Beauty formulas, Ginseng essences, and snail mucin at BEAUTY SPHERE:',
          url: currentSiteUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSaveCustomerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCustomerAccount(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveCustomUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUrlError('');

    if (!isAdminAuthenticated) {
      setUrlError('Access Denied: Only the store administrator can edit the website URL link.');
      return;
    }

    let trimmed = editableUrl.trim();
    if (!trimmed) {
      setUrlError('Please enter a valid website link.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = `https://${trimmed}`;
      setEditableUrl(trimmed);
    }

    try {
      new URL(trimmed);
    } catch {
      setUrlError('Invalid URL format. Please enter a valid web link (e.g. https://yourdomain.com).');
      return;
    }

    if (onUpdateWebsiteUrl) {
      onUpdateWebsiteUrl(trimmed);
      setUrlSaveSuccess(true);
      setTimeout(() => setUrlSaveSuccess(false), 3000);
    }
  };

  const handleUseBrowserUrl = () => {
    if (!isAdminAuthenticated) {
      setUrlError('Access Denied: Only the store administrator can edit the website URL link.');
      return;
    }
    if (typeof window !== 'undefined') {
      const browserUrl = window.location.href;
      setEditableUrl(browserUrl);
      if (onUpdateWebsiteUrl) {
        onUpdateWebsiteUrl(browserUrl);
        setUrlSaveSuccess(true);
        setTimeout(() => setUrlSaveSuccess(false), 3000);
      }
    }
  };

  const handleResetDefaultUrl = () => {
    if (!isAdminAuthenticated) {
      setUrlError('Access Denied: Only the store administrator can edit the website URL link.');
      return;
    }
    const fallback = typeof window !== 'undefined' ? window.location.origin : 'https://beautysphereshop.com';
    setEditableUrl(fallback);
    if (onUpdateWebsiteUrl) {
      onUpdateWebsiteUrl(fallback);
      setUrlSaveSuccess(true);
      setTimeout(() => setUrlSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        id="user-account-modal-container"
        className="relative bg-[#FAF8F5] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-[#E8DFD3] my-6 flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Sidebar Navigation */}
        <div className="md:w-64 bg-white border-r border-[#EAE3D8] p-5 flex flex-col justify-between">
          <div>
            {/* Customer / Admin Profile Header with RBAC indicator */}
            <div className="pb-5 border-b border-[#F0EAE1] mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif-luxury text-xl mb-2 shadow-xs ${
                isAdminAuthenticated ? 'bg-[#1F1B18] text-[#D4AF37]' : 'bg-[#FAF2E6] text-[#7A5B28]'
              }`}>
                {isAdminAuthenticated ? 'A' : (formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'C')}
              </div>
              <h3 className="font-serif-luxury text-base font-medium text-[#1A1817] leading-tight truncate">
                {isAdminAuthenticated ? 'Akon MD' : (formData.fullName || 'Valued Shopper')}
              </h3>
              <p className="text-[11px] text-[#7A7066] truncate">
                {isAdminAuthenticated ? 'akonmd12@gmail.com' : (formData.email || 'Quick guest checkout active')}
              </p>
              
              <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full border ${
                isAdminAuthenticated 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-[#F2EDE7] text-[#5C534B] border-[#E0D7CC]'
              }`}>
                {isAdminAuthenticated ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Admin</span>
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 text-[#8C6B3E]" />
                    <span>Public Customer</span>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-1 text-xs">
              <button
                id="customer-tab-profile"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'profile'
                    ? 'bg-[#1F1B18] text-white font-medium shadow-2xs'
                    : 'text-[#5A5148] hover:bg-[#F5EFE9]'
                }`}
              >
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>My Details & Address</span>
              </button>

              <button
                id="customer-tab-wishlist"
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'wishlist'
                    ? 'bg-[#1F1B18] text-white font-medium shadow-2xs'
                    : 'text-[#5A5148] hover:bg-[#F5EFE9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Saved Wishlist</span>
                </div>
                {wishlistProducts.length > 0 && (
                  <span className="text-[10px] font-bold bg-[#EAE3D8] text-[#4A423A] px-2 py-0.5 rounded-full">
                    {wishlistProducts.length}
                  </span>
                )}
              </button>

              <button
                id="customer-tab-tracking"
                onClick={() => {
                  setActiveTab('tracking');
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'tracking'
                    ? 'bg-[#1F1B18] text-white font-medium shadow-2xs'
                    : 'text-[#5A5148] hover:bg-[#F5EFE9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Track Specific Order</span>
                </div>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Lookup
                </span>
              </button>

              <button
                id="customer-tab-orders"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'orders'
                    ? 'bg-[#1F1B18] text-white font-medium shadow-2xs'
                    : 'text-[#5A5148] hover:bg-[#F5EFE9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-[#8C6B3E]" />
                  <span>Customer Orders List</span>
                </div>
                {isAdminAuthenticated ? (
                  orders.length > 0 ? (
                    <span className="text-[10px] font-bold bg-[#D4AF37] text-[#1F1B18] px-2 py-0.5 rounded-full">
                      {orders.length}
                    </span>
                  ) : null
                ) : (
                  <span className="text-[9px] uppercase font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Admin
                  </span>
                )}
              </button>

              <button
                id="customer-tab-share"
                onClick={() => setActiveTab('website-link')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'website-link'
                    ? 'bg-[#1F1B18] text-white font-medium shadow-2xs'
                    : 'text-[#5A5148] hover:bg-[#F5EFE9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#5C534B]" />
                  <span>Store Link & Share</span>
                </div>
              </button>
            </div>
          </div>

          {/* Admin Access Panel at bottom */}
          <div className="pt-4 border-t border-[#F0EAE1] mt-4">
            {isAdminAuthenticated ? (
              <div className="p-3 bg-[#FAF5EE] border border-[#DDD3C7] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    ● Admin Active
                  </span>
                  <button
                    onClick={() => {
                      onLogoutAdmin();
                      onClose();
                    }}
                    className="text-[10px] text-rose-700 hover:underline flex items-center gap-0.5"
                    title="Log out of admin session"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Log Out</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminDashboard();
                  }}
                  className="w-full py-2 px-3 bg-[#1F1B18] hover:bg-[#342F2A] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Open Admin Portal</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D8] rounded-xl text-center space-y-1.5">
                <p className="text-[10px] text-[#7A7066] leading-tight">
                  Are you the boutique administrator?
                </p>
                <button
                  id="admin-login-trigger-from-account"
                  onClick={() => {
                    onClose();
                    onOpenAdminLogin();
                  }}
                  className="w-full py-2 px-2 bg-[#EFE8DF] hover:bg-[#E2D8CD] border border-[#D5C9BD] text-[#1F1B18] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-[#8C6B3E]" />
                  <span>Admin Login (Password)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Content View */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {/* Header & Close */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#EAE3D8]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6B3E]">
                {activeTab === 'profile' && 'Customer Profile & Shipping'}
                {activeTab === 'orders' && 'Client Order Center'}
                {activeTab === 'tracking' && 'Live Delivery Tracking'}
                {activeTab === 'wishlist' && 'Saved Formulations'}
                {activeTab === 'website-link' && 'Boutique Public Link'}
              </span>
              <h2 className="font-serif-luxury text-2xl text-[#1A1817] font-medium mt-0.5">
                {activeTab === 'profile' && 'Fast Checkout Profile'}
                {activeTab === 'orders' && 'Your Order History'}
                {activeTab === 'tracking' && 'Order Status Tracking'}
                {activeTab === 'wishlist' && 'Your Saved Asian Formulations'}
                {activeTab === 'website-link' && 'Official Boutique Link'}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#736A61] hover:text-black hover:bg-[#F5EFE9] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TAB 1: CUSTOMER PROFILE & FAST CHECKOUT */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveCustomerProfile} className="space-y-5">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Customer delivery details successfully saved! Instant checkout is now enabled.</span>
                </div>
              )}

              {/* Instant Buy Explainer */}
              <div className="p-4 bg-[#F5EFE9] border border-[#E0D7CC] rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1F1B18] text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1817]">Simple Customer Account</p>
                    <p className="text-[#685E55] text-[11px]">
                      Save your contact and shipping information once. All Korean & Chinese items in your cart list will checkout instantly!
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Contact Info */}
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD3] space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-[0.18em] text-[#8C8075] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>1. Contact Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#5A5149] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Akon MD or Client Name"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8CFC5] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#5A5149] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8CFC5] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-[#5A5149] uppercase tracking-wider mb-1">
                      Phone Number (For Air Courier SMS tracking)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8CFC5] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD3] space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-[0.18em] text-[#8C8075] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>2. Shipping Destination Address</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-[#5A5149] uppercase tracking-wider mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street name, apartment, suite, or box"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8CFC5] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-[#5A5149] uppercase tracking-wider mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8CFC5] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#5A5149] uppercase tracking-wider mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8CFC5] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#5A5149] uppercase tracking-wider mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8CFC5] rounded-lg focus:outline-none focus:border-[#1F1B18]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1F1B18] hover:bg-[#342E29] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  Save Account & Address
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CUSTOMER ORDERS - STRICTLY ENFORCED BY RBAC */}
          {activeTab === 'orders' && (
            !isAdminAuthenticated ? (
              <div id="rbac-orders-restricted-view" className="p-8 bg-white border border-[#E8DFD3] rounded-2xl text-center space-y-4 shadow-sm animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-8 h-8 text-amber-700" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Role-Based Access Control (RBAC) Active</span>
                  </span>
                  <h3 className="font-serif-luxury text-xl font-bold text-[#1A1817]">
                    Customer Orders List: Verified Admin Only
                  </h3>
                  <p className="text-xs text-[#6B6158] leading-relaxed">
                    Under the boutique security architecture, customer order records contain sensitive customer addresses, phone numbers, and transaction logs. Access is strictly limited to the verified store administrator (<strong>Akon MD</strong>).
                  </p>
                  <p className="text-xs text-[#8C8075] bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE3D8]">
                    Public customers can freely browse products and submit orders through the quick checkout form.
                  </p>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    id="rbac-admin-login-button"
                    onClick={() => {
                      onClose();
                      onOpenAdminLogin();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#1F1B18] hover:bg-[#38312B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                    <span>Admin Login to View Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#F5EFE9] hover:bg-[#EAE3D8] text-[#4A423A] text-xs font-semibold rounded-xl transition-all"
                  >
                    Back to Customer Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold text-emerald-900">
                      Administrator Access • {orders.length} Total Customer Orders Logged
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminDashboard();
                    }}
                    className="text-[11px] font-bold text-emerald-900 hover:underline flex items-center gap-1"
                  >
                    <span>Full Orders Manager →</span>
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 bg-white border border-[#E8DFD3] rounded-xl text-center text-[#736B63]">
                    <Package className="w-10 h-10 mx-auto text-[#B8ADA2] mb-2" />
                    <p className="font-serif-luxury text-base text-[#1A1817]">No Orders Placed Yet</p>
                    <p className="text-xs text-[#8C8075] mt-1 max-w-sm mx-auto">
                      Customer orders submitted via the quick checkout will be logged here for the verified admin.
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white border border-[#E8DFD3] rounded-xl p-5 shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0EAE1] gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-[#8C8075] tracking-wider">
                            Tracking Reference
                          </span>
                          <p className="font-mono text-sm font-bold text-[#1A1817]">{order.orderNumber}</p>
                          <p className="text-[11px] text-[#7A7169]">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            ● {order.status}
                          </span>
                          <span className="text-sm font-bold text-[#1A1817]">{formatCurrency(order.total)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-[#3A332E]">
                              {item.quantity}x {item.productName} ({item.producer})
                            </span>
                            <span className="font-medium text-[#1A1817]">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#F0EAE1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#786E64]">
                        <div>
                          <span>Customer: <strong>{order.customer.fullName}</strong> ({order.customer.phone})</span>
                          <span className="mx-1.5">•</span>
                          <span>Address: {order.customer.address}, {order.customer.city}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSearchedTrackingOrder(order);
                            setTrackingNumberInput(order.orderNumber);
                            setActiveTab('tracking');
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-md transition-colors text-xs self-start sm:self-auto"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Status</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
          )}

          {/* TAB: ORDER STATUS TRACKING */}
          {activeTab === 'tracking' && (
            <div className="space-y-5">
              {/* Order Number Search Box */}
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD3] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1817] flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Track Order Status</span>
                    </h3>
                    <p className="text-xs text-[#7A7169] mt-0.5">
                      Enter your order number (e.g. ORD-123456) to see live processing or shipping status.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setTrackSearched(true);
                    const query = trackingNumberInput.trim().toLowerCase();
                    const found = orders.find(
                      (o) =>
                        o.orderNumber.toLowerCase() === query ||
                        o.id.toLowerCase() === query ||
                        o.customer.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '')
                    );
                    setSearchedTrackingOrder(found || null);
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      id="tracking-number-input"
                      type="text"
                      placeholder="Enter Order Number (e.g. ORD-123456)"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-gray-900"
                    />
                  </div>
                  <button
                    id="track-order-submit-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </button>
                </form>

                {/* Quick select from recent orders if admin */}
                {isAdminAuthenticated && orders.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-gray-500 text-[11px]">Admin Quick Select:</span>
                    {orders.slice(0, 4).map((ord) => (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => {
                          setTrackingNumberInput(ord.orderNumber);
                          setSearchedTrackingOrder(ord);
                          setTrackSearched(true);
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
                          searchedTrackingOrder?.id === ord.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        #{ord.orderNumber}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tracking Results View */}
              {searchedTrackingOrder ? (
                <div className="bg-white border border-[#E8DFD3] rounded-xl p-5 shadow-2xs space-y-5">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Order Number:
                        </span>
                        <span className="font-mono text-sm font-extrabold text-[#1A1817]">
                          #{searchedTrackingOrder.orderNumber}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Placed on {new Date(searchedTrackingOrder.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        searchedTrackingOrder.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : searchedTrackingOrder.status === 'Dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : searchedTrackingOrder.status === 'Confirmed'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        ● Current Status: {searchedTrackingOrder.status}
                      </span>
                    </div>
                  </div>

                  {/* Visual Status Stepper */}
                  <div className="py-3 px-2">
                    <div className="grid grid-cols-4 gap-2 text-center relative">
                      {/* Step 1: Order Received */}
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-900 mt-2">Received</span>
                        <span className="text-[10px] text-gray-500">Order Placed</span>
                      </div>

                      {/* Step 2: Confirmed & Processing */}
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          ['Confirmed', 'Dispatched', 'Delivered'].includes(searchedTrackingOrder.status)
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-amber-500 text-white animate-pulse'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-900 mt-2">Processing</span>
                        <span className="text-[10px] text-gray-500">Confirmed & Packing</span>
                      </div>

                      {/* Step 3: Dispatched */}
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          ['Dispatched', 'Delivered'].includes(searchedTrackingOrder.status)
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-900 mt-2">Shipping</span>
                        <span className="text-[10px] text-gray-500">With Courier</span>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          searchedTrackingOrder.status === 'Delivered'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-900 mt-2">Delivered</span>
                        <span className="text-[10px] text-gray-500">Cash Received</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Payment Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Shipping Address */}
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1 text-xs">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        Delivery Information
                      </span>
                      <p className="font-semibold text-gray-900">{searchedTrackingOrder.customer.fullName}</p>
                      <p className="text-gray-700">{searchedTrackingOrder.customer.address}</p>
                      <p className="text-gray-600">Region: {searchedTrackingOrder.customer.city}</p>
                      <p className="text-gray-600">Contact: {searchedTrackingOrder.customer.phone}</p>
                      <p className="text-gray-600">Email: {searchedTrackingOrder.customer.email}</p>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1 text-xs">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        Payment & Pricing
                      </span>
                      <div className="flex justify-between text-gray-600">
                        <span>Payment Method:</span>
                        <span className="font-semibold text-emerald-800">
                          {searchedTrackingOrder.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Items Subtotal:</span>
                        <span className="font-semibold text-gray-900">৳{searchedTrackingOrder.subtotal} TK</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Delivery Fee:</span>
                        <span className="font-semibold text-gray-900">৳{searchedTrackingOrder.shippingFee} TK</span>
                      </div>
                      <div className="border-t border-gray-200 pt-1.5 mt-1 flex justify-between font-bold text-gray-900 text-sm">
                        <span>Total Due on Delivery:</span>
                        <span className="text-emerald-700">৳{searchedTrackingOrder.total} TK</span>
                      </div>
                    </div>
                  </div>

                  {/* Items in this Order */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Ordered Products ({searchedTrackingOrder.items.length})
                    </span>
                    <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                      {searchedTrackingOrder.items.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-2.5">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.productName}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 object-cover rounded-lg border border-gray-200 bg-gray-50 shrink-0"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">{item.productName}</p>
                              <p className="text-[11px] text-gray-500">Qty: {item.quantity} × ৳{item.price} TK</p>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900 shrink-0">
                            ৳{item.price * item.quantity} TK
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : trackSearched ? (
                <div className="p-8 bg-white border border-red-200 rounded-xl text-center space-y-2">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                  <p className="text-sm font-bold text-gray-900">Order Not Found</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    We could not find an order matching &quot;{trackingNumberInput}&quot;. Please double check your order number or check your recent orders list.
                  </p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 bg-white border border-[#E8DFD3] rounded-xl text-center text-[#736B63]">
                  <Package className="w-10 h-10 mx-auto text-[#B8ADA2] mb-2" />
                  <p className="font-serif-luxury text-base text-[#1A1817]">No Orders to Track Yet</p>
                  <p className="text-xs text-[#8C8075] mt-1 max-w-sm mx-auto">
                    Once you place an order using our quick checkout, your tracking details will appear here automatically.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              {wishlistProducts.length === 0 ? (
                <div className="p-8 bg-white border border-[#E8DFD3] rounded-xl text-center text-[#736B63]">
                  <Heart className="w-10 h-10 mx-auto text-[#B8ADA2] mb-2" />
                  <p className="font-serif-luxury text-base text-[#1A1817]">Your Wishlist is Empty</p>
                  <p className="text-xs text-[#8C8075] mt-1 max-w-sm mx-auto">
                    Click the heart icon on any K-Beauty or C-Beauty item to save it here for convenient 1-click purchasing.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((prod) => (
                    <div key={prod.id} className="bg-white border border-[#E8DFD3] rounded-xl p-4 flex gap-3 shadow-2xs">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-16 h-16 object-cover rounded-lg bg-[#FAF8F5] shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] text-[#8C8075] uppercase font-medium">{prod.producer}</p>
                          <h4 className="font-serif-luxury text-sm font-medium text-[#1A1817] line-clamp-1">{prod.name}</h4>
                          <p className="text-xs font-semibold text-[#1A1817] mt-0.5">{formatCurrency(prod.price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            onClick={() => onAddToCart(prod)}
                            className="flex-1 py-1.5 px-2 bg-[#1F1B18] hover:bg-[#38312B] text-white text-[10px] uppercase font-semibold tracking-wider rounded-md flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add to Cart</span>
                          </button>
                          <button
                            onClick={() => {
                              onClose();
                              onBuyNow(prod);
                            }}
                            className="py-1.5 px-2.5 bg-[#D4AF37] hover:bg-[#C49E27] text-[#1F1B18] text-[10px] uppercase font-bold tracking-wider rounded-md"
                            title="Direct Checkout"
                          >
                            Buy Now
                          </button>
                          <button
                            onClick={() => onRemoveFromWishlist(prod.id)}
                            className="p-1.5 text-[#9E9388] hover:text-[#B85D3B]"
                            title="Remove from saved"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STORE LINK */}
          {activeTab === 'website-link' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-[#1F1B18] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#8C6B3E]" />
                    <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#1F1B18]">
                      Public Boutique Store Link
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full">
                    Live
                  </span>
                </div>

                <p className="text-xs text-[#5C534B] mb-4 font-light">
                  Share this verified link with friends, clients, or on social media so shoppers can browse the authentic Korean & Chinese skincare collection:
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E0D7CC] mb-4">
                  <div className="flex-1 px-3 py-1.5 font-mono text-xs text-[#1A1817] truncate select-all bg-white rounded-lg border border-[#E8DFC8]">
                    {currentSiteUrl}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1F1B18] hover:bg-[#38312B] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>

                    <a
                      href={currentSiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white hover:bg-[#F2ECE5] border border-[#DDD3C7] text-[#1F1B18] rounded-lg transition-all"
                      title="Open Live Website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F2EDE7]">
                  {isAdminAuthenticated ? (
                    <button
                      onClick={() => setIsEditingUrlSection(!isEditingUrlSection)}
                      className="px-3 py-1.5 bg-[#FAF5EE] hover:bg-[#F0E6D8] border border-[#DDD3C7] text-[#2C2723] text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#8C6B3E]" />
                      <span>{isEditingUrlSection ? 'Hide URL Editor' : 'Edit URL Link'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAdminLogin();
                      }}
                      className="px-3 py-1.5 bg-[#FAF5EE] hover:bg-[#F0E6D8] border border-[#DDD3C7] text-[#2C2723] text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Only the boutique administrator can change the store link"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit URL (Admin Only)</span>
                    </button>
                  )}

                  <button
                    onClick={handleShareNative}
                    className="px-3 py-1.5 bg-[#FAF5EE] hover:bg-[#F0E6D8] border border-[#DDD3C7] text-[#2C2723] text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share via Device</span>
                  </button>

                  <button
                    onClick={() => setShowQr(!showQr)}
                    className="px-3 py-1.5 bg-[#FAF5EE] hover:bg-[#F0E6D8] border border-[#DDD3C7] text-[#2C2723] text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQr ? 'Hide QR Code' : 'Display QR Code'}</span>
                  </button>
                </div>

                {showQr && (
                  <div className="mt-4 p-4 bg-[#F5EFE9] border border-[#DDD3C7] rounded-xl flex flex-col items-center justify-center text-center animate-fadeIn">
                    <div className="p-3 bg-white rounded-xl shadow-xs border border-[#E0D7CC] mb-2">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentSiteUrl)}`}
                        alt="Store QR Code"
                        className="w-40 h-40"
                      />
                    </div>
                    <p className="text-xs font-semibold text-[#1A1817]">Scan with any Smartphone</p>
                  </div>
                )}
              </div>

              {/* STORE WEBSITE URL SECTION - ADMIN RESTRICTED */}
              {isAdminAuthenticated ? (
                <div className="bg-white border border-[#E8DFD3] rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                    <div>
                      <h3 className="text-xs uppercase font-bold tracking-[0.18em] text-[#1A1817] flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-amber-600" />
                        <span>Edit Website URL Link (Admin Authorized)</span>
                      </h3>
                      <p className="text-xs text-[#7A7169] mt-0.5">
                        You are logged in as Store Administrator. Changes update across all share buttons, barcodes, and receipts.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase rounded border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Admin Mode</span>
                    </span>
                  </div>

                  {urlSaveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Website link updated and saved successfully!</span>
                    </div>
                  )}

                  {urlError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{urlError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveCustomUrl} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Custom Website URL / Domain
                      </label>
                      <div className="relative">
                        <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          id="account-custom-url-input"
                          type="text"
                          value={editableUrl}
                          onChange={(e) => setEditableUrl(e.target.value)}
                          placeholder="e.g. https://munnaofficial.com or your domain"
                          className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#D4AF37] font-mono text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleUseBrowserUrl}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Use Browser URL</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetDefaultUrl}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-gray-500" />
                          <span>Reset Default</span>
                        </button>
                      </div>

                      <button
                        id="save-account-custom-url-btn"
                        type="submit"
                        className="px-4 py-2 bg-[#1F1B18] hover:bg-[#38312A] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Save URL Link</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-amber-100/80 rounded-xl text-amber-800 shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1817]">
                        Store Link Managed by Administrator
                      </h4>
                      <p className="text-xs text-[#7A7169] mt-0.5 max-w-md leading-relaxed">
                        To preserve brand security, only the verified boutique administrator can edit the website URL. Customers can copy, share, and scan the live link.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminLogin();
                    }}
                    className="px-3.5 py-2 bg-[#1F1B18] hover:bg-[#38312A] text-[#D4AF37] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Admin Login to Edit</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
