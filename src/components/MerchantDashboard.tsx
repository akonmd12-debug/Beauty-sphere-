import React, { useState } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  CheckCircle2, 
  X, 
  Clock, 
  Check, 
  Sparkles, 
  Eye, 
  Star, 
  ShieldAlert, 
  UserCheck, 
  Shield, 
  LogOut, 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  Truck, 
  MapPin, 
  Mail, 
  Phone,
  AlertTriangle,
  Lock,
  MessageSquare,
  KeyRound,
  EyeOff,
  ShieldCheck,
  Copy
} from 'lucide-react';
import { Product, Producer, OfferDiscount, Order, ProductCategory, ProductReview, AuthUser, UserRole } from '../types';
import { formatCurrency } from '../utils/storage';
import { getMerchantUser, updateUserCredentials } from '../utils/auth';
import { formatOrderDeliveryInfo, formatCustomerAddressOnly, formatBulkOrdersDeliveryInfo, formatEssentialOrderInfo, copyTextToClipboard } from '../utils/delivery';

interface MerchantDashboardProps {
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
  producers: Producer[];
  onSaveProducers: (producers: Producer[]) => void;
  offers: OfferDiscount[];
  onSaveOffers: (offers: OfferDiscount[]) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  reviews?: ProductReview[];
  onDeleteReview?: (reviewId: string) => void;
  currentUser: AuthUser | null;
  currentRole: UserRole;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  products,
  onSaveProducts,
  producers,
  onSaveProducers,
  offers,
  onSaveOffers,
  orders,
  onUpdateOrderStatus,
  reviews = [],
  onDeleteReview,
  currentUser,
  currentRole,
  onLogout,
  onNavigateHome,
  onNavigateAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'producers' | 'offers' | 'reviews' | 'credentials' | 'restrictions'>('orders');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | Order['status']>('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Delivery copy states
  const [copiedEssentialOrderId, setCopiedEssentialOrderId] = useState<string | null>(null);
  const [copiedOrderDeliveryId, setCopiedOrderDeliveryId] = useState<string | null>(null);
  const [copiedAddressOnlyId, setCopiedAddressOnlyId] = useState<string | null>(null);
  const [copiedAllDeliveries, setCopiedAllDeliveries] = useState(false);
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
        setCopiedOrderDeliveryId(order.id);
        setTimeout(() => setCopiedOrderDeliveryId(null), 2500);
      }
    }
  };

  const handleCopyAllDeliveries = async () => {
    if (filteredOrders.length === 0) return;
    const text = formatBulkOrdersDeliveryInfo(filteredOrders);
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedAllDeliveries(true);
      setTimeout(() => setCopiedAllDeliveries(false), 2500);
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

  // Credentials State for Merchant
  const [merchantUser, setMerchantUser] = useState(() => currentUser || getMerchantUser());
  const [newMerchantUsername, setNewMerchantUsername] = useState(() => currentUser?.username || getMerchantUser()?.username || 'merchant@beautysphere.com');
  const [newMerchantEmail, setNewMerchantEmail] = useState(() => currentUser?.email || getMerchantUser()?.email || 'merchant@beautysphere.com');
  const [currentMerchantPassword, setCurrentMerchantPassword] = useState('');
  const [newMerchantPassword, setNewMerchantPassword] = useState('');
  const [confirmMerchantPassword, setConfirmMerchantPassword] = useState('');
  const [showCurrentMerchantPass, setShowCurrentMerchantPass] = useState(false);
  const [showNewMerchantPass, setShowNewMerchantPass] = useState(false);
  const [merchantFeedback, setMerchantFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);

  const handleUpdateMyCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setMerchantFeedback(null);

    if (newMerchantPassword && newMerchantPassword !== confirmMerchantPassword) {
      setMerchantFeedback({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newMerchantPassword && newMerchantPassword.length < 6) {
      setMerchantFeedback({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setIsUpdatingCredentials(true);
    setTimeout(() => {
      const res = updateUserCredentials({
        userId: merchantUser.id || 'merchant_moderator',
        currentPassword: currentMerchantPassword,
        newUsername: newMerchantUsername,
        newEmail: newMerchantEmail,
        newPassword: newMerchantPassword || undefined,
      });

      setIsUpdatingCredentials(false);

      if (res.success && res.user) {
        setMerchantUser(res.user);
        setCurrentMerchantPassword('');
        setNewMerchantPassword('');
        setConfirmMerchantPassword('');
        setMerchantFeedback({
          type: 'success',
          text: `Your Merchant credentials have been updated successfully! Your username is now "${res.user.username}". Use these new credentials for future logins to /merchant-login.`
        });
      } else {
        setMerchantFeedback({
          type: 'error',
          text: res.error || 'Failed to update credentials. Please check your current password.'
        });
      }
    }, 300);
  };

  // Inventory tab states
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Review tab states
  const [reviewSearch, setReviewSearch] = useState('');

  // Form states for adding/editing product
  const [productForm, setProductForm] = useState({
    name: '',
    subtitle: '',
    producer: 'Apothecary Atelier',
    originCountry: 'South Korea',
    category: 'Essences & Serums' as ProductCategory,
    price: 38,
    discountPercent: 0,
    stock: 20,
    rating: 4.9,
    reviewsCount: 1,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
    description: '',
    ingredients: '',
    skinType: 'All Skin Types',
    size: '50ml / 1.69 fl.oz.',
    usageRitual: 'Dispense 3-4 drops onto cleansed skin morning and evening.',
  });

  // Open product edit modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      subtitle: prod.subtitle || '',
      producer: prod.producer,
      originCountry: prod.originCountry || 'South Korea',
      category: prod.category,
      price: prod.price,
      discountPercent: prod.discountPercent || 0,
      stock: prod.stock,
      rating: prod.rating,
      reviewsCount: prod.reviewsCount,
      image: prod.image,
      description: prod.description,
      ingredients: prod.ingredients || '',
      skinType: (prod.skinType || []).join(', '),
      size: prod.size || '50ml',
      usageRitual: prod.usageRitual || 'Dispense 3-4 drops onto cleansed skin.',
    });
    setIsProductModalOpen(true);
  };

  // Open product add modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      subtitle: 'Sovereign Herbal Infusion',
      producer: 'Boutique Exclusive',
      originCountry: 'South Korea',
      category: 'Essences & Serums',
      price: 45,
      discountPercent: 0,
      stock: 25,
      rating: 5.0,
      reviewsCount: 0,
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      description: 'Handcrafted sovereign herbal elixir formulated with rare botanicals.',
      ingredients: 'Ginseng Root, Niacinamide, Camellia Sinensis',
      skinType: 'All Skin Types, Sensitive',
      size: '50ml / 1.69 fl.oz.',
      usageRitual: 'Apply gently over face and neck morning and evening.',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    const splitItems = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

    if (editingProduct) {
      // Update existing
      const updatedList = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: productForm.name,
            subtitle: productForm.subtitle,
            producer: productForm.producer,
            originCountry: productForm.originCountry,
            category: productForm.category,
            price: Number(productForm.price),
            discountPercent: Number(productForm.discountPercent),
            stock: Number(productForm.stock),
            image: productForm.image,
            description: productForm.description,
            ingredients: productForm.ingredients,
            skinType: splitItems(productForm.skinType),
            size: productForm.size,
            usageRitual: productForm.usageRitual,
          };
        }
        return p;
      });
      onSaveProducts(updatedList);
    } else {
      // Create new
      const newProduct: Product = {
        id: `prod-mod-${Date.now()}`,
        name: productForm.name,
        subtitle: productForm.subtitle,
        producer: productForm.producer,
        originCountry: productForm.originCountry,
        category: productForm.category,
        price: Number(productForm.price),
        discountPercent: Number(productForm.discountPercent),
        stock: Number(productForm.stock),
        rating: 5.0,
        reviewsCount: 0,
        image: productForm.image,
        description: productForm.description,
        details: ['Handcrafted', 'Authentic Formulation', 'Small Batch'],
        ingredients: productForm.ingredients,
        usageRitual: productForm.usageRitual,
        skinType: splitItems(productForm.skinType),
        size: productForm.size,
        isFeatured: false,
        isNewArrival: true,
        createdAt: new Date().toISOString(),
      };
      onSaveProducts([newProduct, ...products]);
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to remove this formulation from the boutique catalog?')) {
      onSaveProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleToggleStock = (productId: string) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: p.stock > 0 ? 0 : 25 };
      }
      return p;
    });
    onSaveProducts(updated);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const custName = order.customer?.fullName || '';
    const custEmail = order.customer?.email || '';
    const matchesSearch = 
      order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      custName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      custEmail.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.items.some(item => item.productName.toLowerCase().includes(orderSearchQuery.toLowerCase()));
    
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = 
      prod.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      prod.producer.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(productSearchQuery.toLowerCase());
    const matchesCat = productCategoryFilter === 'all' || prod.category === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered Reviews
  const filteredReviews = reviews.filter((rev) => {
    return rev.comment.toLowerCase().includes(reviewSearch.toLowerCase()) ||
           (rev.customerName || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
           rev.title.toLowerCase().includes(reviewSearch.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1B18] flex flex-col font-sans">
      {/* Top Banner: Route Identification & Role Restrictions */}
      <div className="bg-[#18233C] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-blue-900">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-400/30">
            PATH: /merchant-login
          </span>
          <span className="text-blue-200">
            Sole Merchant & Moderator Portal
          </span>
          <span className="hidden md:inline text-blue-400/80">•</span>
          <span className="hidden md:inline text-[11px] text-blue-300/90 font-medium">
            Authorized for Order Fulfillment & Product Catalog Management
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>No Full Site Admin Privileges</span>
          </span>
          <button
            onClick={onNavigateHome}
            className="text-blue-200 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Storefront (/)</span>
          </button>
        </div>
      </div>

      {/* Portal Main Navigation Header */}
      <header className="bg-white border-b border-[#EAE3D8] shadow-2xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center font-serif text-xl font-bold shadow-xs">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#1F1B18]">
                  BEAUTY SPHERE SHOP
                </h1>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-200 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-blue-600" />
                  <span>Sole Merchant</span>
                </span>
              </div>
              <p className="text-xs text-[#736A61]">
                Moderator Console: Order Processing, Product Inventory, Artisan Houses & Review Moderation
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[#5A5148] font-medium">
                User: <strong className="text-[#1A1817]">{currentUser?.displayName || 'Merchant Moderator'}</strong>
              </span>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="px-3.5 py-1.5 bg-[#1F1B18] hover:bg-[#342F2A] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>+ Add Formulation</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Log out of Sole Merchant session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Portal Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto border-t border-[#F0EAE1] text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'orders'
                ? 'border-blue-700 text-blue-900 font-bold bg-blue-50/50'
                : 'border-transparent text-[#736A61] hover:text-[#1A1817]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'inventory'
                ? 'border-blue-700 text-blue-900 font-bold bg-blue-50/50'
                : 'border-transparent text-[#736A61] hover:text-[#1A1817]'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('producers')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'producers'
                ? 'border-blue-700 text-blue-900 font-bold bg-blue-50/50'
                : 'border-transparent text-[#736A61] hover:text-[#1A1817]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Artisan Houses ({producers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'offers'
                ? 'border-blue-700 text-blue-900 font-bold bg-blue-50/50'
                : 'border-transparent text-[#736A61] hover:text-[#1A1817]'
            }`}
          >
            <Tag className="w-4 h-4 text-purple-600" />
            <span>Promo Discounts ({offers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'reviews'
                ? 'border-blue-700 text-blue-900 font-bold bg-blue-50/50'
                : 'border-transparent text-[#736A61] hover:text-[#1A1817]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-pink-600" />
            <span>Review Moderation ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'credentials'
                ? 'border-blue-700 text-blue-900 font-bold bg-blue-50/50'
                : 'border-transparent text-[#736A61] hover:text-[#1A1817]'
            }`}
          >
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>My Username & Password</span>
          </button>

          <button
            onClick={() => setActiveTab('restrictions')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'restrictions'
                ? 'border-amber-600 text-amber-900 font-bold bg-amber-50/50'
                : 'border-transparent text-amber-700/80 hover:text-amber-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Site Admin Privileges: Locked</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: CUSTOMER ORDERS VIEW & FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EAE3D8] shadow-2xs">
              <div>
                <h2 className="font-serif-luxury text-lg font-bold text-[#1A1817] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <span>Client Orders & Fulfillment</span>
                </h2>
                <p className="text-xs text-[#736A61]">
                  Review customer transactions, shipping destinations, and update delivery status
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8075]" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by customer, order #, or item..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Order Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                </select>

                <button
                  onClick={handleCopyAllDeliveries}
                  disabled={filteredOrders.length === 0}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    copiedAllDeliveries
                      ? 'bg-emerald-700 text-white'
                      : 'bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white'
                  }`}
                  title="Copy formatted customer delivery details for all visible orders"
                >
                  {copiedAllDeliveries ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>All Delivery Info Copied!</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-3.5 h-3.5 text-blue-200" />
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All Deliveries ({filteredOrders.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-[#EAE3D8] shadow-2xs overflow-hidden">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif-luxury text-base font-semibold text-[#1A1817]">No Orders Found</h3>
                  <p className="text-xs text-[#736A61] max-w-sm mx-auto">
                    {orderSearchQuery || orderStatusFilter !== 'all'
                      ? 'No orders match your search and filter criteria.'
                      : 'Customer orders submitted through the storefront will appear here for fulfillment.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] text-[#5A5149] uppercase font-bold text-[10px] tracking-wider border-b border-[#EAE3D8]">
                        <th className="py-3.5 px-4">Order ID & Date</th>
                        <th className="py-3.5 px-4">Customer & Destination</th>
                        <th className="py-3.5 px-4">Items & Summary</th>
                        <th className="py-3.5 px-4">Total Amount</th>
                        <th className="py-3.5 px-4">Fulfillment Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2ECE4]">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="py-4 px-4 font-mono font-medium text-[#1A1817]">
                            <div className="flex items-center gap-1 text-blue-900 font-bold">
                              <span>#{order.id.slice(-8)}</span>
                            </div>
                            <div className="text-[11px] text-[#8C8075]">
                              {new Date(order.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-bold text-[#1A1817] flex items-center gap-1.5">
                              <span>{order.customer?.fullName || 'Customer'}</span>
                            </div>
                            <div className="text-[11px] text-[#2C241E] flex items-center gap-1 mt-0.5 font-medium">
                              <Phone className="w-3 h-3 text-blue-700 shrink-0" />
                              <span className="font-mono">{order.customer?.phone || 'No phone'}</span>
                            </div>
                            <div className="text-[11px] text-[#736A61] flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#8C8075] shrink-0" />
                              <span className="truncate max-w-[160px]">{order.customer?.email || 'No email'}</span>
                            </div>
                            <div className="text-[11px] text-[#5A5149] flex items-start gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-amber-700 shrink-0 mt-0.5" />
                              <span className="truncate max-w-[190px]" title={`${order.customer?.address || ''}, ${order.customer?.city || ''} ${order.customer?.postalCode || ''}`}>
                                {order.customer?.address ? `${order.customer.address}, ${order.customer.city}` : 'Boutique Pickup'}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="text-[11px] text-[#2C241E] font-medium">
                              {order.items.map((it, idx) => (
                                <div key={idx} className="truncate max-w-[200px]">
                                  {it.quantity}x {it.productName}
                                </div>
                              ))}
                            </div>
                            <span className="text-[10px] text-[#8C8075]">
                              {order.items.reduce((s, it) => s + it.quantity, 0)} total formulations
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-bold font-mono text-sm text-[#1A1817]">
                              {formatCurrency(order.total)}
                            </span>
                            <span className="block text-[10px] text-emerald-700 font-medium">
                              Payment Settled
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <select
                              value={order.status}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : order.status === 'Dispatched'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : order.status === 'Confirmed'
                                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Copy Order Info (Strictly: Customer Name, Contact Number, Delivery Address, Ordered Items) */}
                              <button
                                onClick={() => handleCopyEssentialOrderInfo(order)}
                                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                                  copiedEssentialOrderId === order.id
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-400'
                                    : 'bg-[#1F1B18] hover:bg-[#342F2A] text-white border-[#1F1B18]'
                                }`}
                                title="Copy essential order info (Customer Name, Contact Number, Delivery Address, Ordered Items with quantities)"
                              >
                                {copiedEssentialOrderId === order.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Copy Order Info</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => setSelectedOrderForInvoice(order)}
                                className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#EDE5DA] text-[#38312B] text-xs font-medium rounded-lg border border-[#DDD5CB] inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title="View full packing slip"
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-700" />
                                <span>Slip</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT CATALOG MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EAE3D8] shadow-2xs">
              <div>
                <h2 className="font-serif-luxury text-lg font-bold text-[#1A1817] flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <span>Product Formulations Inventory</span>
                </h2>
                <p className="text-xs text-[#736A61]">
                  Add, edit, or remove Korean & Chinese beauty products and control live inventory availability
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8075]" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Search formulations..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Essences & Serums">Essences & Serums</option>
                  <option value="Moisture & Barrier Creams">Moisture Creams</option>
                  <option value="Cleansers & Balms">Cleansers & Balms</option>
                  <option value="Sun Care & Cushions">Sun Care & Cushions</option>
                  <option value="Sheet Masks & Treatments">Sheet Masks</option>
                </select>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-3 py-1.5 bg-[#1F1B18] hover:bg-[#342F2A] text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>+ New Product</span>
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-[#EAE3D8] p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-20 h-20 rounded-xl object-cover border border-[#EAE3D8] shrink-0 bg-[#FAF8F5]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C8075]">
                          {prod.originCountry?.includes('China') ? '🇨🇳 China' : '🇰🇷 Korea'} • {prod.producer}
                        </span>
                        <button
                          onClick={() => handleToggleStock(prod.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            prod.stock > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {prod.stock > 0 ? `In Stock (${prod.stock})` : 'Sold Out'}
                        </button>
                      </div>
                      <h3 className="font-serif-luxury text-sm font-bold text-[#1A1817] truncate mt-0.5">
                        {prod.name}
                      </h3>
                      <p className="text-[11px] text-[#736A61] line-clamp-1 mt-0.5">
                        {prod.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#1A1817]">
                          {formatCurrency(prod.price)}
                        </span>
                        {prod.discountPercent > 0 && (
                          <span className="font-mono text-xs text-[#9E948A] line-through">
                            {formatCurrency(prod.price * (1 + prod.discountPercent / 100))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F2ECE4] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#7A7066] truncate max-w-[150px]">
                      {prod.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-1.5 bg-[#FAF8F5] hover:bg-[#EAE3D8] text-[#38312B] rounded-lg border border-[#DDD5CB] transition-colors cursor-pointer"
                        title="Edit Formulation Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                        title="Delete Formulation"
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

        {/* TAB 3: ARTISAN HOUSES (PRODUCERS) */}
        {activeTab === 'producers' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#EAE3D8] shadow-2xs">
              <h2 className="font-serif-luxury text-lg font-bold text-[#1A1817] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>Artisan Producers & Craft Houses</span>
              </h2>
              <p className="text-xs text-[#736A61]">
                Heritage skincare research labs and botanical dynasties across Korea and China
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {producers.map((producer) => (
                <div key={producer.id} className="bg-white p-5 rounded-2xl border border-[#EAE3D8] shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8075]">
                        {producer.origin} • Est. {producer.foundedYear}
                      </span>
                      <h3 className="font-serif-luxury text-base font-bold text-[#1A1817]">
                        {producer.name}
                      </h3>
                      <p className="text-xs text-[#7A7066] mt-1">{producer.specialty}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold">
                      Verified House
                    </span>
                  </div>
                  <p className="text-xs text-[#524941] leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE3D8]">
                    {producer.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#736A61] pt-1">
                    <span>Origin: <strong>{producer.origin}</strong></span>
                    <span>Status: <strong className="text-emerald-700">Active Supplier</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OFFERS & DISCOUNTS */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#EAE3D8] shadow-2xs">
              <h2 className="font-serif-luxury text-lg font-bold text-[#1A1817] flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <span>Promotional Discounts & Coupon Codes</span>
              </h2>
              <p className="text-xs text-[#736A61]">
                Active client concessions applied during boutique checkout
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-white p-5 rounded-2xl border border-[#EAE3D8] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      {offer.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {offer.discountPercent}% OFF
                    </span>
                  </div>
                  <h3 className="font-serif-luxury text-sm font-bold text-[#1A1817]">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-[#6B5F54] leading-relaxed">
                    Exclusive boutique savings for qualifying orders. Valid through {offer.expiresAt}.
                  </p>
                  <div className="text-[11px] text-[#8C8075] pt-2 border-t border-[#F2ECE4]">
                    Min Order: {formatCurrency(offer.minimumOrder)} • {offer.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EAE3D8] shadow-2xs">
              <div>
                <h2 className="font-serif-luxury text-lg font-bold text-[#1A1817] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-pink-600" />
                  <span>Customer Review Moderation</span>
                </h2>
                <p className="text-xs text-[#736A61]">
                  Inspect community feedback, verify product testimonials, and remove inappropriate submissions
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8075]" />
                <input
                  type="text"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder="Filter reviews by text or user..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl w-60 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.length === 0 ? (
                <div className="col-span-2 bg-white p-8 rounded-2xl border border-[#EAE3D8] text-center text-xs text-[#736A61]">
                  No reviews match your filter.
                </div>
              ) : (
                filteredReviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-5 rounded-2xl border border-[#EAE3D8] shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <h4 className="font-serif-luxury text-xs font-bold text-[#1A1817] mt-1">
                          {rev.title}
                        </h4>
                        <span className="text-[10px] text-[#8C8075]">
                          By {rev.customerName} • {rev.date}
                        </span>
                      </div>

                      {onDeleteReview && (
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this customer review?')) {
                              onDeleteReview(rev.id);
                            }
                          }}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium border border-rose-200 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#524941] italic bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE5DB]">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: PRIVILEGE GUARD & LOCKED ADMIN CONTROLS */}
        {activeTab === 'restrictions' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[#F0EAE1]">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-700">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif-luxury text-lg font-bold text-[#1A1817]">
                    Sole Merchant & Moderator Boundary Controls
                  </h2>
                  <p className="text-xs text-[#736A61]">
                    This portal provides operations, catalog, and order handling without full site admin privileges.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                      Locked: Root Website URL & Boutique Domain Configuration
                    </h4>
                    <p className="text-xs text-rose-800">
                      Sole merchants cannot alter the official store URL or root domain. Only the Master Administrator (Akon MD) via the secret route <code className="bg-white/80 px-1 py-0.5 rounded font-mono">/admin-dashboard</code> possesses root domain authority.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                      Locked: User Roles & BCrypt Passwords Management
                    </h4>
                    <p className="text-xs text-rose-800">
                      Sole merchants cannot reassign system roles, edit admin security hashes, or modify user credentials in the database schema.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Authorized: Operations & Moderation Powers
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Sole merchants possess complete authorization to view customer orders, update delivery tracking statuses, curate the product formulations catalog, manage artisan houses, and moderate customer reviews.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0EAE1] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-[#7A7066]">
                  Need full site administrative privileges?
                </span>
                <button
                  onClick={onNavigateAdmin}
                  className="px-4 py-2 bg-[#1F1B18] hover:bg-[#342F2A] text-[#D4AF37] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Go to Secret Admin Portal (/admin-dashboard)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: MERCHANT CREDENTIALS & PASSWORD MANAGEMENT */}
        {activeTab === 'credentials' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-8">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-2xl border border-blue-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[11px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                  <span>Merchant Account Security & BCrypt</span>
                </div>
                <h2 className="font-serif-luxury text-2xl font-bold tracking-tight text-white">
                  My Username & Password
                </h2>
                <p className="text-xs text-blue-200/90 leading-relaxed max-w-xl">
                  Update your personal login username and password anytime. Once saved, you must use these updated credentials to authenticate at <span className="text-white font-mono font-bold">/merchant-login</span>.
                </p>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-center shrink-0">
                <span className="text-blue-300 text-[10px] block">Role Access</span>
                <span className="text-white font-bold">Sole Merchant</span>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-[#EAE3D8] p-6 shadow-sm space-y-5">
              {/* Account details info banner */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs font-mono space-y-1.5">
                <div className="flex justify-between items-center text-[#5A5149]">
                  <span>Active Username:</span>
                  <span className="font-bold text-[#1A1817]">{merchantUser.username}</span>
                </div>
                <div className="flex justify-between items-center text-[#5A5149]">
                  <span>Active Email:</span>
                  <span className="font-bold text-[#1A1817]">{merchantUser.email}</span>
                </div>
                <div className="flex justify-between items-center text-[#5A5149]">
                  <span>Protection:</span>
                  <span className="text-emerald-700 font-bold">BCrypt Salted Blowfish</span>
                </div>
              </div>

              {/* Feedback toast */}
              {merchantFeedback && (
                <div className={`p-4 rounded-xl flex items-start gap-2.5 text-xs animate-fadeIn ${
                  merchantFeedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border border-rose-300 text-rose-900'
                }`}>
                  {merchantFeedback.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed font-medium">{merchantFeedback.text}</span>
                </div>
              )}

              {/* Update Form */}
              <form onSubmit={handleUpdateMyCredentials} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#4A423B] mb-1">
                    My Username (Login Handle) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMerchantUsername}
                    onChange={(e) => setNewMerchantUsername(e.target.value)}
                    placeholder="e.g. merchant@beautysphere.com or boutique_manager"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-medium focus:outline-none focus:border-blue-700"
                  />
                  <span className="text-[10px] text-[#7A7066] mt-0.5 block">
                    You can log in at /merchant-login using either this username or your email address.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A423B] mb-1">
                    My Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newMerchantEmail}
                    onChange={(e) => setNewMerchantEmail(e.target.value)}
                    placeholder="e.g. merchant@beautysphere.com"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-medium focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="pt-3 border-t border-[#F0EBE3]">
                  <label className="block font-semibold text-[#4A423B] mb-1">
                    Current Password (Required for Security Verification) *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentMerchantPass ? 'text' : 'password'}
                      required
                      value={currentMerchantPassword}
                      onChange={(e) => setCurrentMerchantPassword(e.target.value)}
                      placeholder="Enter your current password (default: merchant2026)..."
                      className="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-mono focus:outline-none focus:border-blue-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentMerchantPass(!showCurrentMerchantPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7066] hover:text-black cursor-pointer"
                    >
                      {showCurrentMerchantPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                        type={showNewMerchantPass ? 'text' : 'password'}
                        value={newMerchantPassword}
                        onChange={(e) => setNewMerchantPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-mono focus:outline-none focus:border-blue-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewMerchantPass(!showNewMerchantPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7066] hover:text-black cursor-pointer"
                      >
                        {showNewMerchantPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#4A423B] mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewMerchantPass ? 'text' : 'password'}
                      value={confirmMerchantPassword}
                      onChange={(e) => setConfirmMerchantPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl text-[#1A1817] font-mono focus:outline-none focus:border-blue-700"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isUpdatingCredentials}
                    id="save-my-merchant-credentials-btn"
                    className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-blue-200" />
                    <span>{isUpdatingCredentials ? 'Saving & Encrypting...' : 'Save My Username & Password'}</span>
                  </button>
                </div>
              </form>

              <div className="pt-3 border-t border-[#EAE3D8] flex items-center justify-between text-[11px] text-[#7A7066]">
                <span>Merchant Login URL: <code className="bg-[#FAF8F5] px-1 py-0.5 rounded text-[#1A1817]">/merchant-login</code></span>
                <button
                  type="button"
                  onClick={() => setCurrentMerchantPassword('merchant2026')}
                  className="text-blue-700 hover:underline cursor-pointer"
                >
                  Fill default password (merchant2026)
                </button>
              </div>
            </div>

            {/* Strict Login Guard Notice */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#EAE3D8] p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#1A1817]">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Strict Access Isolation & Security Rules</span>
              </div>
              <p className="text-[11px] text-[#6B5F54] leading-relaxed">
                Only authenticated accounts with role <code className="text-blue-800 bg-blue-50 px-1 rounded font-bold">merchant_moderator</code> or <code className="text-amber-800 bg-amber-50 px-1 rounded font-bold">admin</code> can access back-office portals. Public store customers are completely restricted from entering.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-[#EAE3D8] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
              <h3 className="font-serif-luxury text-lg font-bold text-[#1A1817]">
                {editingProduct ? 'Edit Formulation' : 'Add New Formulation'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-[#8C8075] hover:text-[#1A1817] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#5A5148] mb-1">Formulation Title:</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  placeholder="e.g. Ginseng Imperial Radiance Serum"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5A5148] mb-1">Origin Country:</label>
                  <select
                    value={productForm.originCountry}
                    onChange={(e) => setProductForm({ ...productForm, originCountry: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="South Korea">🇰🇷 South Korea (K-Beauty)</option>
                    <option value="China">🇨🇳 China (C-Beauty)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#5A5148] mb-1">Artisan Producer:</label>
                  <input
                    type="text"
                    required
                    value={productForm.producer}
                    onChange={(e) => setProductForm({ ...productForm, producer: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Sulwhasoo Hanbang Lab"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5A5148] mb-1">Category:</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Essences & Serums">Essences & Serums</option>
                    <option value="Moisture & Barrier Creams">Moisture & Barrier Creams</option>
                    <option value="Cleansers & Balms">Cleansers & Balms</option>
                    <option value="Sun Care & Cushions">Sun Care & Cushions</option>
                    <option value="Sheet Masks & Treatments">Sheet Masks & Treatments</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#5A5148] mb-1">Volume / Size:</label>
                  <input
                    type="text"
                    value={productForm.size}
                    onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="50ml / 1.69 fl.oz."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#5A5148] mb-1">Price (৳ Taka):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5A5148] mb-1">Discount %:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={productForm.discountPercent}
                    onChange={(e) => setProductForm({ ...productForm, discountPercent: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5A5148] mb-1">Stock Count:</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5A5148] mb-1">Image URL:</label>
                <input
                  type="url"
                  required
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5A5148] mb-1">Botanical Description:</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5A5148] mb-1">Herbal Ingredients:</label>
                <input
                  type="text"
                  value={productForm.ingredients}
                  onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD5CB] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ginseng, Centella Asiatica, Peptides"
                />
              </div>

              <div className="pt-4 border-t border-[#F0EAE1] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#EDE5DA] text-[#38312B] font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-xs"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Formulation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice / Packing Slip Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-[#EAE3D8] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                <h3 className="font-serif-luxury text-base font-bold text-[#1A1817]">
                  Order Slip #{selectedOrderForInvoice.id.slice(-8)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="p-1 text-[#8C8075] hover:text-[#1A1817]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] uppercase text-[#736A61] tracking-wider">Customer Delivery Details</span>
                  <div className="flex items-center gap-1">
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
                      className="px-2 py-1 text-[10px] font-medium bg-white hover:bg-gray-100 text-gray-700 rounded border border-gray-300 transition-colors"
                      title="Copy recipient address & phone only"
                    >
                      {copiedSlipAddress ? 'Address Copied!' : 'Address Only'}
                    </button>
                    <button
                      onClick={() => handleCopySlipDelivery(selectedOrderForInvoice, false)}
                      className={`px-2 py-1 text-[10px] font-semibold rounded border flex items-center gap-1 transition-colors ${
                        copiedSlipDelivery 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                      title="Copy complete delivery text for courier"
                    >
                      {copiedSlipDelivery ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-blue-700" />
                          <span>Copy Info</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-[#1A1817] text-sm">{selectedOrderForInvoice.customer?.fullName || 'Customer'}</div>
                  <div className="text-[#38312B] font-mono text-[11px] mt-0.5">📞 {selectedOrderForInvoice.customer?.phone || 'No phone provided'}</div>
                  <div className="text-[#6B5F54] text-[11px]">✉️ {selectedOrderForInvoice.customer?.email || 'N/A'}</div>
                  <div className="text-[#2C241E] font-medium text-[11px] mt-1 bg-white p-2 rounded-lg border border-[#E8DFD3]">
                    📍 {selectedOrderForInvoice.customer?.address ? `${selectedOrderForInvoice.customer.address}, ${selectedOrderForInvoice.customer.city} ${selectedOrderForInvoice.customer.postalCode || ''}, ${selectedOrderForInvoice.customer.country || ''}` : 'Store Pickup'}
                    {selectedOrderForInvoice.customer?.notes && (
                      <div className="text-amber-900 text-[10px] mt-1 italic">
                        Note: {selectedOrderForInvoice.customer.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[#5A5148] uppercase tracking-wider text-[10px]">Ordered Formulations:</span>
                <div className="divide-y divide-[#F2ECE4] border rounded-xl p-2 bg-white max-h-40 overflow-y-auto">
                  {selectedOrderForInvoice.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between">
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

              <div className="flex items-center justify-between pt-2 text-sm font-bold border-t border-[#F0EAE1]">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-emerald-800">
                  {formatCurrency(selectedOrderForInvoice.total)}
                </span>
              </div>
            </div>

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
                    : 'bg-[#1F1B18] hover:bg-[#38312B] text-white'
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
                className="py-2.5 bg-[#FAF8F5] hover:bg-[#EDE5DA] text-[#1F1B18] border border-[#DDD5CB] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
