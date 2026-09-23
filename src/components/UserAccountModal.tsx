import React, { useState } from 'react';
import { 
  X, 
  User, 
  ExternalLink, 
  Copy, 
  Check, 
  Package, 
  Heart, 
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
  Zap,
  ArrowRight,
  Truck,
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  RotateCcw
} from 'lucide-react';
import { CustomerAccount, Order, Product } from '../types';
import { formatCurrency } from '../utils/storage';
import { useLanguage } from '../context/LanguageContext';

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
  websiteUrl: string;
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
  websiteUrl,
}) => {
  const { language, setLanguage, toggleLanguage, t, isBangla } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'tracking' | 'wishlist' | 'website-link'>(
    (initialTab as any) || 'profile'
  );
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [searchedTrackingOrder, setSearchedTrackingOrder] = useState<Order | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // My Orders Filtering & Search State
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderSearchText, setOrderSearchText] = useState<string>('');
  const [orderScope, setOrderScope] = useState<'mine' | 'all'>('mine');
  const [copiedOrderRef, setCopiedOrderRef] = useState<string | null>(null);

  // Customer form state
  const [formData, setFormData] = useState<CustomerAccount>({ ...customerAccount });

  if (!isOpen) return null;

  const currentSiteUrl = websiteUrl || (typeof window !== 'undefined' ? window.location.href : 'https://beautysphereshop.com');

  const handleCopyOrderRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedOrderRef(ref);
    setTimeout(() => setCopiedOrderRef(null), 2000);
  };

  const userEmail = (formData.email || customerAccount.email || '').trim().toLowerCase();
  const userPhone = (formData.phone || customerAccount.phone || '').trim().replace(/[^0-9]/g, '');
  const userName = (formData.fullName || customerAccount.fullName || '').trim().toLowerCase();

  const isUserOrder = (order: Order) => {
    const oEmail = (order.customer?.email || '').trim().toLowerCase();
    const oPhone = (order.customer?.phone || '').trim().replace(/[^0-9]/g, '');
    const oName = (order.customer?.fullName || '').trim().toLowerCase();

    if (userEmail && oEmail && oEmail === userEmail) return true;
    if (userPhone && oPhone && (oPhone.includes(userPhone) || userPhone.includes(oPhone))) return true;
    if (userName && oName && oName === userName) return true;
    return false;
  };

  const userMatchedOrders = orders.filter(isUserOrder);
  const hasMatchedOrders = userMatchedOrders.length > 0;

  const ordersToDisplay = (orderScope === 'mine' && hasMatchedOrders)
    ? userMatchedOrders
    : orders;

  const filteredOrders = ordersToDisplay.filter((order) => {
    if (orderFilterStatus !== 'all' && order.status !== orderFilterStatus) {
      return false;
    }
    if (orderSearchText.trim()) {
      const q = orderSearchText.trim().toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchTrack = (order.trackingNumber || '').toLowerCase().includes(q);
      const matchCarrier = (order.carrier || '').toLowerCase().includes(q);
      const matchItem = order.items.some(
        (it) => it.productName.toLowerCase().includes(q) || it.producer.toLowerCase().includes(q)
      );
      if (!matchNum && !matchTrack && !matchCarrier && !matchItem) {
        return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: t('status.pending', 'Pending'),
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'Confirmed':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          label: t('status.confirmed', 'Confirmed'),
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
        };
      case 'Shipped':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500 animate-pulse',
          label: t('status.shipped', 'Shipped'),
          icon: <Truck className="w-3.5 h-3.5 text-purple-600" />
        };
      case 'Dispatched':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500 animate-pulse',
          label: t('status.dispatched', 'Dispatched'),
          icon: <Truck className="w-3.5 h-3.5 text-sky-600" />
        };
      case 'Delivered':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: t('status.delivered', 'Delivered'),
          icon: <Package className="w-3.5 h-3.5 text-emerald-600" />
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-800 border-gray-200',
          dot: 'bg-gray-400',
          label: status,
          icon: <Clock className="w-3.5 h-3.5" />
        };
    }
  };

  const getStatusStepIndex = (status: Order['status']): number => {
    switch (status) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Shipped':
      case 'Dispatched': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        id="user-account-modal-container"
        className="relative bg-[#FAF8F5] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-[#E8DFD3] my-6 flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Sidebar Navigation */}
        <div className="md:w-64 bg-white border-r border-[#EAE3D8] p-5 flex flex-col justify-between">
          <div>
            {/* Customer Profile Header */}
            <div className="pb-5 border-b border-[#F0EAE1] mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-serif-luxury text-xl mb-2 shadow-xs bg-[#FAF2E6] text-[#7A5B28]">
                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'C'}
              </div>
              <h3 className="font-serif-luxury text-base font-medium text-[#1A1817] leading-tight truncate">
                {formData.fullName || 'Valued Shopper'}
              </h3>
              <p className="text-[11px] text-[#7A7066] truncate">
                {formData.email || 'Quick guest checkout active'}
              </p>
              
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full border bg-[#F2EDE7] text-[#5C534B] border-[#E0D7CC]">
                <User className="w-3 h-3 text-[#8C6B3E]" />
                <span>Boutique Client</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-1 text-xs">
              <button
                id="customer-tab-profile"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#1F1B18] text-white font-medium shadow-2xs'
                    : 'text-[#5A5148] hover:bg-[#F5EFE9]'
                }`}
              >
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('account.tab.profile', 'My Details & Address')}</span>
              </button>

              <button
                id="customer-tab-orders"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#1F1B18] text-white font-medium shadow-2xs'
                    : 'text-[#5A5148] hover:bg-[#F5EFE9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-[#8C6B3E]" />
                  <span>{t('account.tab.orders', 'My Orders')}</span>
                </div>
                {orders.length > 0 && (
                  <span className="text-[10px] font-bold bg-[#D4AF37] text-[#1F1B18] px-2 py-0.5 rounded-full">
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                id="customer-tab-tracking"
                onClick={() => setActiveTab('tracking')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  activeTab === 'tracking'
                    ? 'bg-[#1F1B18] text-white font-medium shadow-2xs'
                    : 'text-[#5A5148] hover:bg-[#F5EFE9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>{t('account.tab.tracking', 'Track Specific Order')}</span>
                </div>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  {isBangla ? 'অনুসন্ধান' : 'Lookup'}
                </span>
              </button>

              <button
                id="customer-tab-wishlist"
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-[#1F1B18] text-white font-medium shadow-2xs'
                    : 'text-[#5A5148] hover:bg-[#F5EFE9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>{t('account.tab.wishlist', 'Saved Wishlist')}</span>
                </div>
                {wishlistProducts.length > 0 && (
                  <span className="text-[10px] font-bold bg-[#EAE3D8] text-[#4A423A] px-2 py-0.5 rounded-full">
                    {wishlistProducts.length}
                  </span>
                )}
              </button>

              <button
                id="customer-tab-share"
                onClick={() => setActiveTab('website-link')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  activeTab === 'website-link'
                    ? 'bg-[#1F1B18] text-white font-medium shadow-2xs'
                    : 'text-[#5A5148] hover:bg-[#F5EFE9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#5C534B]" />
                  <span>{t('account.tab.share', 'Store Link & Share')}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Language Switcher Option inside Sidebar Bottom */}
          <div className="pt-4 border-t border-[#F0EAE1] mt-4">
            <div className="flex items-center justify-between text-xs text-[#7A7066] mb-2 px-1">
              <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-[#8C6B3E]" />
                <span>{t('lang.switch', 'Language / ভাষা')}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-[#F5EFE9] p-1 rounded-xl">
              <button
                type="button"
                id="modal-lang-en-btn"
                onClick={() => setLanguage('en')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-[#1F1B18] shadow-xs border border-[#DDD5CA]'
                    : 'text-[#7A7066] hover:text-[#1F1B18]'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button
                type="button"
                id="modal-lang-bn-btn"
                onClick={() => setLanguage('bn')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  language === 'bn'
                    ? 'bg-white text-[#1F1B18] shadow-xs border border-[#DDD5CA]'
                    : 'text-[#7A7066] hover:text-[#1F1B18]'
                }`}
              >
                <span>🇧🇩</span>
                <span>বাংলা</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content View */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {/* Header & Close */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#EAE3D8]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6B3E]">
                {activeTab === 'profile' && (isBangla ? 'গ্রাহক তথ্য ও ডেলিভারি ঠিকানা' : 'Customer Profile & Shipping')}
                {activeTab === 'orders' && (isBangla ? 'আমার অর্ডার পোর্টাল' : 'My Orders & Purchase Records')}
                {activeTab === 'tracking' && (isBangla ? 'রিয়েল-টাইম ট্র্যাকিং' : 'Live Delivery Tracking')}
                {activeTab === 'wishlist' && (isBangla ? 'সংরক্ষিত প্রসাধন' : 'Saved Formulations')}
                {activeTab === 'website-link' && (isBangla ? 'স্টোর পাবলিক লিংক' : 'Boutique Public Link')}
              </span>
              <h2 className="font-serif-luxury text-2xl text-[#1A1817] font-medium mt-0.5">
                {activeTab === 'profile' && (isBangla ? 'দ্রুত চেকআউট প্রোফাইল' : 'Fast Checkout Profile')}
                {activeTab === 'orders' && (isBangla ? 'আমার অর্ডারসমূহ' : 'My Orders')}
                {activeTab === 'tracking' && (isBangla ? 'অর্ডার স্ট্যাটাস সন্ধান' : 'Order Status Tracking')}
                {activeTab === 'wishlist' && (isBangla ? 'আপনার পছন্দের প্রসাধনী তালিকা' : 'Your Saved Asian Formulations')}
                {activeTab === 'website-link' && (isBangla ? 'অফিসিয়াল বুটিক লিঙ্ক' : 'Official Boutique Link')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher pill in header */}
              <button
                type="button"
                id="modal-header-language-toggle"
                onClick={toggleLanguage}
                className="px-2.5 py-1 bg-white hover:bg-[#FAF5EE] border border-[#DDD5CA] hover:border-[#D4AF37] rounded-full text-xs font-semibold text-[#2B2623] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title={language === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
              >
                <Globe className="w-3.5 h-3.5 text-[#8C6B3E]" />
                <span className="text-[11px]">{language === 'en' ? 'বাংলা' : 'EN'}</span>
              </button>

              <button
                id="close-user-account-modal-btn"
                onClick={onClose}
                className="p-1.5 text-[#736A61] hover:text-black hover:bg-[#F5EFE9] rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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

          {/* TAB 2: MY ORDERS & HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Header and Quick Lookup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0EAE1] gap-2">
                <div>
                  <h3 className="font-serif-luxury text-lg text-[#1A1817] flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#8C6B3E]" />
                    <span>{t('orders.title', 'My Orders & Purchase Records')}</span>
                  </h3>
                  <p className="text-xs text-[#7A7169]">
                    {t('orders.description', 'Review your past order status, items, delivery details, and total amount.')}
                  </p>
                </div>
                <button
                  id="my-orders-lookup-tracking-btn"
                  onClick={() => setActiveTab('tracking')}
                  className="px-3 py-1.5 bg-[#FAF5EE] hover:bg-[#F0E6D8] border border-[#DDD3C7] text-[#1F1B18] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{isBangla ? 'ট্র্যাকিং নম্বর দিয়ে খুঁজুন' : 'Lookup by Tracking #'}</span>
                </button>
              </div>

              {/* Order Scope & Filters Bar */}
              <div className="bg-[#FAF5EE] p-3 rounded-xl border border-[#E8DFD3] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Scope Switcher: My Account Orders vs All Orders */}
                  {hasMatchedOrders ? (
                    <div className="inline-flex p-1 bg-white rounded-lg border border-[#DDD5CA] text-xs">
                      <button
                        type="button"
                        onClick={() => setOrderScope('mine')}
                        className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          orderScope === 'mine'
                            ? 'bg-[#1F1B18] text-white shadow-2xs'
                            : 'text-[#685E55] hover:text-[#1F1B18]'
                        }`}
                      >
                        {isBangla ? `আমার অ্যাকাউন্ট (${userMatchedOrders.length})` : `My Account (${userMatchedOrders.length})`}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderScope('all')}
                        className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          orderScope === 'all'
                            ? 'bg-[#1F1B18] text-white shadow-2xs'
                            : 'text-[#685E55] hover:text-[#1F1B18]'
                        }`}
                      >
                        {isBangla ? `সকল অর্ডার (${orders.length})` : `All Orders (${orders.length})`}
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-[#7A7066] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{isBangla ? `মোট ${orders.length}টি অর্ডার পাওয়া গেছে` : `Total ${orders.length} order(s) placed in store`}</span>
                    </div>
                  )}

                  {/* Search orders */}
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="w-3.5 h-3.5 text-[#8C8075] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={isBangla ? 'অর্ডার বা পণ্যের নাম খুঁজুন...' : 'Search by order # or product...'}
                      value={orderSearchText}
                      onChange={(e) => setOrderSearchText(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#DDD5CA] rounded-lg focus:outline-none focus:border-[#C5A880] text-[#1A1817]"
                    />
                  </div>
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-[#8C8075] font-semibold text-[10px] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-[#8C6B3E]" />
                    <span>{isBangla ? 'অবস্থা:' : 'Status:'}</span>
                  </span>
                  {[
                    { key: 'all', label: isBangla ? 'সকল' : 'All' },
                    { key: 'Pending', label: isBangla ? 'অপেক্ষমান' : 'Pending' },
                    { key: 'Confirmed', label: isBangla ? 'নিশ্চিত' : 'Confirmed' },
                    { key: 'Shipped', label: isBangla ? 'প্রেরিত' : 'Shipped' },
                    { key: 'Delivered', label: isBangla ? 'সম্পন্ন' : 'Delivered' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setOrderFilterStatus(tab.key)}
                      className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                        orderFilterStatus === tab.key
                          ? 'bg-[#1F1B18] text-white font-semibold shadow-2xs'
                          : 'bg-white hover:bg-[#F0EAE1] text-[#5A5148] border border-[#E0D7CC]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="p-8 bg-white border border-[#E8DFD3] rounded-xl text-center text-[#736B63] space-y-3">
                  <Package className="w-10 h-10 mx-auto text-[#B8ADA2]" />
                  <p className="font-serif-luxury text-base text-[#1A1817]">
                    {orders.length === 0 
                      ? (isBangla ? 'এখনও কোনো অর্ডার করা হয়নি' : 'No Orders Placed Yet')
                      : (isBangla ? 'কোনো অর্ডার মিলছে না' : 'No Matching Orders Found')}
                  </p>
                  <p className="text-xs text-[#8C8075] max-w-sm mx-auto">
                    {orders.length === 0
                      ? (isBangla ? 'আপনার পছন্দের এশিয়ান প্রসাধনী অর্ডার করুন, এখানে লাইভ ট্র্যাকিং সহ বিস্তারিত দেখতে পাবেন।' : 'Customer orders placed through our checkout will appear here with live tracking, item breakdowns, and status.')
                      : (isBangla ? 'অনুসন্ধান বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।' : 'Try clearing your search query or adjusting status filter.')}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {orders.length > 0 && orderFilterStatus !== 'all' && (
                      <button
                        onClick={() => {
                          setOrderFilterStatus('all');
                          setOrderSearchText('');
                        }}
                        className="px-3 py-1.5 bg-[#FAF5EE] hover:bg-[#F0E6D8] border border-[#DDD3C7] text-[#1F1B18] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        {isBangla ? 'ফিল্টার মুছুন' : 'Clear Filters'}
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('tracking')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F1B18] hover:bg-[#38312B] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{isBangla ? 'ট্র্যাকিং নম্বর দিয়ে ট্র্যাক করুন' : 'Track Order by Number'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  const stepIdx = getStatusStepIndex(order.status);
                  const isCopied = copiedOrderRef === order.orderNumber;

                  return (
                    <div 
                      key={order.id} 
                      className="bg-white border border-[#E8DFD3] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4 transition-all hover:border-[#D4AF37]/50"
                    >
                      {/* Order Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0EAE1] gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-[#8C8075] tracking-wider">
                              {isBangla ? 'অর্ডার নম্বর:' : 'Order Ref:'}
                            </span>
                            <span className="font-mono text-sm font-bold text-[#1A1817] bg-[#FAF5EE] px-2 py-0.5 rounded border border-[#E8DFD3]">
                              {order.orderNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyOrderRef(order.orderNumber)}
                              className="p-1 hover:bg-[#F2ECE4] rounded text-[#8C8075] hover:text-[#1A1817] transition-colors cursor-pointer"
                              title={isBangla ? 'অর্ডার নম্বর কপি করুন' : 'Copy Order Number'}
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-[#7A7169] flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-[#A3978B]" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </p>
                        </div>

                        {/* Status Badge & Total Amount */}
                        <div className="flex items-center gap-3 self-start sm:self-auto">
                          <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${statusInfo.bg}`}>
                            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                            <span>{statusInfo.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#8C8075] uppercase block font-semibold">
                              {isBangla ? 'সর্বমোট' : 'Total'}
                            </span>
                            <span className="text-base font-bold text-[#1A1817] font-serif-luxury">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Order Status Progression Pipeline */}
                      <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EDE5DB]">
                        <div className="grid grid-cols-4 gap-1 sm:gap-2 text-[10px] text-center">
                          <div className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 ${
                            stepIdx >= 1 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold' : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}>
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] bg-emerald-600 text-white font-bold">✓</span>
                            <span>{isBangla ? '১. গ্রহণ' : '1. Placed'}</span>
                          </div>
                          <div className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 ${
                            stepIdx >= 2 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold' : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              stepIdx >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>{stepIdx >= 2 ? '✓' : '2'}</span>
                            <span>{isBangla ? '২. নিশ্চিত' : '2. Confirmed'}</span>
                          </div>
                          <div className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 ${
                            stepIdx >= 3 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold' : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              stepIdx >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>{stepIdx >= 3 ? '✓' : '3'}</span>
                            <span>{isBangla ? '৩. প্রেরিত' : '3. Shipped'}</span>
                          </div>
                          <div className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 ${
                            stepIdx >= 4 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold' : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              stepIdx >= 4 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>{stepIdx >= 4 ? '✓' : '4'}</span>
                            <span>{isBangla ? '৪. সম্পন্ন' : '4. Delivered'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Purchased Items List */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C8075] block">
                          {isBangla ? `অর্ডারের পণ্যসমূহ (${order.items.length}টি)` : `Ordered Formulations (${order.items.length} items)`}
                        </span>
                        <div className="space-y-2 divide-y divide-[#F5EFE9]">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-lg bg-[#FAF5EE] border border-[#E8DFD3] overflow-hidden shrink-0 flex items-center justify-center">
                                  {item.image ? (
                                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                  ) : (
                                    <Sparkles className="w-4 h-4 text-[#8C6B3E]" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-[#1A1817] truncate">{item.productName}</p>
                                  <div className="flex items-center gap-2 text-[11px] text-[#786E64] mt-0.5">
                                    <span className="bg-[#FAF2E6] text-[#7A5B28] px-1.5 py-0.2 rounded font-semibold text-[10px]">
                                      {item.producer}
                                    </span>
                                    <span>
                                      {item.quantity} × {formatCurrency(item.price)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-semibold text-[#1A1817]">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financial Breakdown & Delivery Summary */}
                      <div className="pt-3 border-t border-[#F0EAE1] bg-[#FAF8F5] p-3 rounded-xl space-y-2 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[#6E645A]">
                          <div>
                            <p className="font-semibold text-[#1A1817] mb-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#D4AF37]" />
                              <span>{isBangla ? 'ডেলিভারি গন্তব্য:' : 'Shipping Address:'}</span>
                            </p>
                            <p className="text-[#4A423A]">
                              {order.customer.fullName} • {order.customer.phone}
                            </p>
                            <p className="text-[#786E64]">
                              {order.customer.address}, {order.customer.city}
                            </p>
                          </div>

                          <div className="sm:text-right space-y-0.5">
                            <div className="flex justify-between sm:justify-end gap-3 text-[#786E64]">
                              <span>{isBangla ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                              <span className="font-medium text-[#1A1817]">{formatCurrency(order.subtotal || order.total)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between sm:justify-end gap-3 text-emerald-700">
                                <span>{isBangla ? `ছাড় (${order.appliedCode || 'প্রোমো'}):` : `Discount (${order.appliedCode || 'Promo'}):`}</span>
                                <span>-{formatCurrency(order.discountAmount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between sm:justify-end gap-3 text-[#786E64]">
                              <span>{isBangla ? 'ডেলিভারি চার্জ:' : 'Shipping Fee:'}</span>
                              <span className="font-medium text-[#1A1817]">
                                {order.shippingFee === 0 
                                  ? (isBangla ? 'ফ্রি' : 'Complimentary') 
                                  : formatCurrency(order.shippingFee)}
                              </span>
                            </div>
                            <div className="flex justify-between sm:justify-end gap-3 pt-1 border-t border-[#E8DFD3] font-bold text-sm text-[#1A1817]">
                              <span>{isBangla ? 'মোট প্রদেয়:' : 'Total Amount:'}</span>
                              <span className="text-[#8C6B3E] font-serif-luxury">{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Logistics Carrier and Action buttons */}
                        <div className="pt-2 border-t border-[#EDE5DB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-[11px] text-[#786E64] flex items-center gap-2">
                            <span className="font-semibold text-[#1A1817] flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-[#8C6B3E]" />
                              <span>{order.carrier || 'CJ Logistics / Hanghzou Air Express'}</span>
                            </span>
                            {order.trackingNumber && (
                              <span className="font-mono text-[#5A5148] bg-white px-1.5 py-0.5 rounded border border-[#DDD5CA]">
                                {order.trackingNumber}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              id={`track-order-btn-${order.id}`}
                              onClick={() => {
                                setSearchedTrackingOrder(order);
                                setTrackingNumberInput(order.orderNumber);
                                setActiveTab('tracking');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F1B18] hover:bg-[#38312B] text-white font-semibold rounded-lg transition-colors text-xs cursor-pointer shadow-2xs"
                            >
                              <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>{isBangla ? 'লাইভ ট্র্যাক করুন' : 'Track Status'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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

                {/* Quick select from recent orders */}
                {orders.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-gray-500 text-[11px]">Recent Orders:</span>
                    {orders.slice(0, 4).map((ord) => (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => {
                          setTrackingNumberInput(ord.orderNumber);
                          setSearchedTrackingOrder(ord);
                          setTrackSearched(true);
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
