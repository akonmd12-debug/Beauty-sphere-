import React, { useState, useEffect, useMemo } from 'react';
import { 
  Filter, 
  Sparkles, 
  Heart, 
  ArrowUpDown, 
  Share2, 
  SlidersHorizontal, 
  Check, 
  User, 
  ExternalLink,
  ChevronDown,
  Tag,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  Lock,
  Edit3
} from 'lucide-react';
import { 
  Product, 
  Producer, 
  OfferDiscount, 
  CartItem, 
  Order, 
  UserProfile, 
  ProductCategory,
  ProductReview,
  CustomerAccount,
  SkinProfileOption,
  AuthUser,
  UserRole,
  AuthSession
} from './types';
import { 
  getStoredProducts, 
  saveStoredProducts,
  getStoredProducers,
  saveStoredProducers,
  getStoredOffers,
  saveStoredOffers,
  getStoredProfile,
  saveStoredProfile,
  getStoredOrders,
  saveStoredOrders,
  getStoredCart,
  saveStoredCart,
  getStoredWishlist,
  saveStoredWishlist,
  getStoredReviews,
  saveStoredReviews,
  getStoredAdminActive,
  saveStoredAdminActive,
  getStoredCustomerAccount,
  saveStoredCustomerAccount,
  getStoredSkinOptions,
  saveStoredSkinOptions,
  formatCurrency,
  getActiveAuthSession,
  clearActiveAuthSession
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { UserAccountModal } from './components/UserAccountModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminProfileModal } from './components/AdminProfileModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ProducersModal } from './components/ProducersModal';
import { OffersBannerModal } from './components/OffersBannerModal';
import { Footer } from './components/Footer';
import { SakuraBloomBackground } from './components/SakuraBloomBackground';
import { EditUrlModal } from './components/EditUrlModal';
import { AppRoute, parseCurrentRoute, navigateToRoute } from './utils/router';
import { RouteSwitcherBar } from './components/RouteSwitcherBar';
import { AdminPortalGate } from './components/AdminPortalGate';
import { MerchantPortalGate } from './components/MerchantPortalGate';
import { MerchantDashboard } from './components/MerchantDashboard';
import { evaluateAccessControl } from './utils/accessControl';
import { AccessDeniedScreen } from './components/AccessDeniedScreen';

export default function App() {
  // Primary State
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [producers, setProducers] = useState<Producer[]>(getStoredProducers);
  const [offers, setOffers] = useState<OfferDiscount[]>(getStoredOffers);
  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredProfile);
  const [customerAccount, setCustomerAccount] = useState<CustomerAccount>(getStoredCustomerAccount);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(getStoredAdminActive);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getActiveAuthSession()?.user || null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => getActiveAuthSession()?.user.role || (getStoredAdminActive() ? 'admin' : null));
  const [cart, setCart] = useState<CartItem[]>(getStoredCart);
  const [wishlist, setWishlist] = useState<string[]>(getStoredWishlist);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [reviews, setReviews] = useState<ProductReview[]>(getStoredReviews);
  const [skinOptions, setSkinOptions] = useState<SkinProfileOption[]>(getStoredSkinOptions);
  const [appliedDiscount, setAppliedDiscount] = useState<OfferDiscount | null>(null);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProducerFilter, setSelectedProducerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount'>('featured');
  const [skinTypeFilter, setSkinTypeFilter] = useState<string>('all');

  // Modals & Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountInitialTab, setAccountInitialTab] = useState('profile');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'inventory' | 'skin-lists' | 'producers' | 'offers' | 'orders' | 'reviews' | 'admin-profile' | 'website-link' | 'schema'>('inventory');
  const [adminOpenAddProduct, setAdminOpenAddProduct] = useState(false);
  const [isProducersModalOpen, setIsProducersModalOpen] = useState(false);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [productModalTab, setProductModalTab] = useState<'benefits' | 'ritual' | 'ingredients' | 'reviews'>('benefits');
  const [isEditUrlModalOpen, setIsEditUrlModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Active App Route: 'storefront' | 'admin-dashboard' | 'merchant-login'
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(parseCurrentRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(parseCurrentRoute());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('app-route-change', handleLocationChange as EventListener);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('app-route-change', handleLocationChange as EventListener);
    };
  }, []);

  const handleNavigateToRoute = (route: AppRoute) => {
    navigateToRoute(route);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync state to local storage
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredProducers(producers);
  }, [producers]);

  useEffect(() => {
    saveStoredOffers(offers);
  }, [offers]);

  useEffect(() => {
    saveStoredProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  useEffect(() => {
    saveStoredWishlist(wishlist);
  }, [wishlist]);

  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredReviews(reviews);
  }, [reviews]);

  useEffect(() => {
    saveStoredAdminActive(isAdminAuthenticated);
  }, [isAdminAuthenticated]);

  useEffect(() => {
    saveStoredCustomerAccount(customerAccount);
  }, [customerAccount]);

  // Admin Authentication Handling
  const handleOpenAdmin = (tab: any = 'inventory', openAddProduct: boolean = false) => {
    setAdminInitialTab(tab);
    setAdminOpenAddProduct(openAddProduct);
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = (user?: AuthUser, role?: UserRole) => {
    setIsAdminAuthenticated(true);
    saveStoredAdminActive(true);
    if (user) setCurrentUser(user);
    if (role) setCurrentRole(role);
    setIsAdminLoginModalOpen(false);
    setIsAdminOpen(true);
    if (role === 'merchant_moderator') {
      showToast('Sole Merchant / Moderator authenticated with BCrypt. Operations & Moderation active.');
    } else {
      showToast('Master Administrator authenticated with BCrypt. Full system authority active.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    saveStoredAdminActive(false);
    clearActiveAuthSession();
    setCurrentUser(null);
    setCurrentRole(null);
    setIsAdminOpen(false);
    showToast('Secure session logged out.');
  };

  const handleUpdateCustomerAccount = (updated: CustomerAccount) => {
    setCustomerAccount(updated);
    saveStoredCustomerAccount(updated);
    showToast('Customer account & shipping details saved!');
  };

  const [copiedBottomBar, setCopiedBottomBar] = useState(false);
  const handleCopyBottomUrl = () => {
    const url = websiteUrl || (typeof window !== 'undefined' ? window.location.href : '');
    navigator.clipboard.writeText(url);
    setCopiedBottomBar(true);
    setTimeout(() => setCopiedBottomBar(false), 2500);
    showToast('Official boutique URL copied to clipboard!');
  };

  const handleUpdateWebsiteUrl = (newUrl: string) => {
    if (!isAdminAuthenticated) {
      showToast('Access denied: Administrator authorization required to edit the store URL.');
      setIsAdminLoginModalOpen(true);
      return;
    }
    if (currentRole === 'merchant_moderator') {
      showToast('Restricted: Sole Merchant / Moderator cannot alter root domain. Master Admin required.');
      return;
    }
    setUserProfile((prev) => {
      const updated = { ...prev, websiteUrl: newUrl };
      saveStoredProfile(updated);
      return updated;
    });
    showToast('Official store URL updated successfully!');
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product, 1);
    setIsCheckoutOpen(true);
  };

  // Handle Review Operations
  const handleAddReview = (newReview: ProductReview) => {
    setReviews((prev) => [newReview, ...prev]);
    showToast(`Thank you! Your verified review for "${newReview.title}" has been published.`);
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    showToast(`Customer review removed.`);
  };

  // Handle Cart Operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      } else {
        return [...prev, { product, quantity }];
      }
    });
    showToast(`Acquired 1x ${product.name}`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Handle Wishlist Operations
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Removed from saved wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Saved ${product.name} to wishlist`);
        return [...prev, product.id];
      }
    });
  };

  // Apply Discount Promo
  const handleApplyDiscountCode = (code: string) => {
    const found = offers.find(
      (o) => o.code.toUpperCase() === code.toUpperCase() && o.isActive
    );
    if (!found) {
      return { success: false, message: 'Invalid or expired boutique offer code.' };
    }

    const currentSubtotal = cart.reduce((sum, item) => {
      const itemPrice = item.product.discountPercent > 0
        ? item.product.price * (1 - item.product.discountPercent / 100)
        : item.product.price;
      return sum + itemPrice * item.quantity;
    }, 0);

    if (currentSubtotal < found.minimumOrder) {
      return {
        success: false,
        message: `This offer requires a minimum order of ${formatCurrency(found.minimumOrder)}.`,
      };
    }

    setAppliedDiscount(found);
    return { success: true, message: `Offer '${found.code}' applied! Saved ${found.discountPercent}%.` };
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
  };

  // When order completed: log order and deduct stock
  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Deduct stock dynamically
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = newOrder.items.find((it) => it.productId === p.id);
        if (orderedItem) {
          return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
        }
        return p;
      })
    );

    showToast(`Order ${newOrder.orderNumber} successfully confirmed!`);
  };

  // Update order status from Admin
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    if (!isAdminAuthenticated) {
      showToast('Access denied: Administrator authorization required to manage customer orders.');
      setIsAdminLoginModalOpen(true);
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Order status updated to ${newStatus}`);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(q) ||
        product.subtitle.toLowerCase().includes(q) ||
        product.producer.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.nativeName && product.nativeName.toLowerCase().includes(q)) ||
        (product.heritage && product.heritage.toLowerCase().includes(q)) ||
        (product.originCountry && product.originCountry.toLowerCase().includes(q));

      // Category / Origin filter
      let matchesCategory = true;
      if (selectedCategory === 'korea') {
        matchesCategory = Boolean(product.originCountry && product.originCountry.toLowerCase().includes('korea'));
      } else if (selectedCategory === 'china') {
        matchesCategory = Boolean(product.originCountry && product.originCountry.toLowerCase().includes('china'));
      } else if (selectedCategory !== 'all') {
        matchesCategory = product.category === selectedCategory;
      }

      // Producer filter
      const matchesProducer =
        selectedProducerFilter === 'all' || product.producer === selectedProducerFilter;

      // Skin type filter
      const matchesSkinType =
        skinTypeFilter === 'all' ||
        product.skinType.includes('All') ||
        product.skinType.includes(skinTypeFilter);

      return matchesSearch && matchesCategory && matchesProducer && matchesSkinType;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        const priceA = a.discountPercent > 0 ? a.price * (1 - a.discountPercent / 100) : a.price;
        const priceB = b.discountPercent > 0 ? b.price * (1 - b.discountPercent / 100) : b.price;
        return priceA - priceB;
      }
      if (sortBy === 'price-desc') {
        const priceA = a.discountPercent > 0 ? a.price * (1 - a.discountPercent / 100) : a.price;
        const priceB = b.discountPercent > 0 ? b.price * (1 - b.discountPercent / 100) : b.price;
        return priceB - priceA;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'discount') {
        return b.discountPercent - a.discountPercent;
      }
      // 'featured'
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedProducerFilter, skinTypeFilter, sortBy]);

  // Wishlist products
  const wishlistProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const websiteUrl = userProfile.websiteUrl || (typeof window !== 'undefined' ? window.location.href : 'https://beautysphereshop.com');

  // ==========================================
  // ROUTE 1: Secret Admin Portal (/admin-dashboard)
  // ==========================================
  if (currentRoute === 'admin-dashboard') {
    const accessDecision = evaluateAccessControl(
      currentRoute,
      currentUser,
      currentRole,
      isAdminAuthenticated
    );

    // Strict Access Control: If a Merchant attempts to access Admin URL, show Access Denied screen
    if (accessDecision.status === 'ACCESS_DENIED_MERCHANT') {
      return (
        <div className="min-h-screen bg-[#0F0C0A] flex flex-col font-sans">
          <RouteSwitcherBar
            currentRoute={currentRoute}
            onNavigate={handleNavigateToRoute}
            currentRole={currentRole}
            isAdminAuthenticated={isAdminAuthenticated}
            currentUserDisplayName={currentUser?.displayName}
          />
          <AccessDeniedScreen
            user={accessDecision.user}
            targetRoute={currentRoute}
            onNavigateMerchant={() => handleNavigateToRoute('merchant-login')}
            onNavigateStorefront={() => handleNavigateToRoute('storefront')}
            onSwitchToAdminLogin={() => {
              handleAdminLogout();
              handleNavigateToRoute('admin-dashboard');
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#141210] flex flex-col font-sans">
        <RouteSwitcherBar
          currentRoute={currentRoute}
          onNavigate={handleNavigateToRoute}
          currentRole={currentRole}
          isAdminAuthenticated={isAdminAuthenticated}
          currentUserDisplayName={currentUser?.displayName}
        />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1F1B18] text-[#FAF8F5] px-4 py-3 rounded-xl shadow-xl border border-[#3A322C] text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {accessDecision.status === 'GRANTED' && accessDecision.role === 'admin' ? (
          <AdminDashboard
            isOpen={true}
            isDedicatedRoute={true}
            isAdminAuthenticated={isAdminAuthenticated}
            currentRole={currentRole || undefined}
            currentUser={currentUser}
            onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
            onClose={() => handleNavigateToRoute('storefront')}
            onNavigateMerchant={() => handleNavigateToRoute('merchant-login')}
            onLogout={handleAdminLogout}
            products={products}
            onSaveProducts={setProducts}
            skinOptions={skinOptions}
            onSaveSkinOptions={(newOpts) => {
              setSkinOptions(newOpts);
              saveStoredSkinOptions(newOpts);
            }}
            producers={producers}
            onSaveProducers={setProducers}
            offers={offers}
            onSaveOffers={setOffers}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            websiteUrl={websiteUrl}
            reviews={reviews}
            onDeleteReview={handleDeleteReview}
            initialTab={adminInitialTab}
            openAddProductOnMount={adminOpenAddProduct}
          />
        ) : (
          <AdminPortalGate
            onLoginSuccess={(user, role) => handleAdminLoginSuccess(user, role)}
            onNavigateHome={() => handleNavigateToRoute('storefront')}
            onNavigateMerchant={() => handleNavigateToRoute('merchant-login')}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // ROUTE 2: Sole Merchant Portal (/merchant-login)
  // ==========================================
  if (currentRoute === 'merchant-login') {
    const accessDecision = evaluateAccessControl(
      currentRoute,
      currentUser,
      currentRole,
      isAdminAuthenticated
    );

    return (
      <div className="min-h-screen bg-[#0E1526] flex flex-col font-sans">
        <RouteSwitcherBar
          currentRoute={currentRoute}
          onNavigate={handleNavigateToRoute}
          currentRole={currentRole}
          isAdminAuthenticated={isAdminAuthenticated}
          currentUserDisplayName={currentUser?.displayName}
        />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1F1B18] text-[#FAF8F5] px-4 py-3 rounded-xl shadow-xl border border-[#3A322C] text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {accessDecision.status === 'GRANTED' && (accessDecision.role === 'merchant_moderator' || accessDecision.role === 'admin') ? (
          <MerchantDashboard
            products={products}
            onSaveProducts={setProducts}
            producers={producers}
            onSaveProducers={setProducers}
            offers={offers}
            onSaveOffers={setOffers}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            reviews={reviews}
            onDeleteReview={handleDeleteReview}
            currentUser={currentUser}
            currentRole={currentRole || 'merchant_moderator'}
            onLogout={handleAdminLogout}
            onNavigateHome={() => handleNavigateToRoute('storefront')}
            onNavigateAdmin={() => handleNavigateToRoute('admin-dashboard')}
          />
        ) : (
          <MerchantPortalGate
            onLoginSuccess={(user, role) => handleAdminLoginSuccess(user, role)}
            onNavigateHome={() => handleNavigateToRoute('storefront')}
            onNavigateAdmin={() => handleNavigateToRoute('admin-dashboard')}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // ROUTE 3: Public Boutique Storefront (/)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1817] flex flex-col font-sans selection:bg-[#E8DFD8] selection:text-[#1A1817] relative overflow-x-hidden">
      {/* Route Switcher Bar for Seamless Navigation */}
      <RouteSwitcherBar
        currentRoute={currentRoute}
        onNavigate={handleNavigateToRoute}
        currentRole={currentRole}
        isAdminAuthenticated={isAdminAuthenticated}
        currentUserDisplayName={currentUser?.displayName}
      />

      {/* Full Page Sakura Bloom Drifting Animation & Atmospheric Controls */}
      <SakuraBloomBackground />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1B18] text-[#FAF8F5] px-4 py-3 rounded-xl shadow-xl border border-[#3A322C] text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Luxury Navigation Bar */}
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => {
          setAccountInitialTab('wishlist');
          setIsAccountOpen(true);
        }}
        onOpenAccount={(defaultTab = 'profile') => {
          setAccountInitialTab(defaultTab);
          setIsAccountOpen(true);
        }}
        onOpenAdmin={() => handleOpenAdmin('inventory', false)}
        onOpenAdminProfile={() => {
          if (isAdminAuthenticated) {
            setIsAdminProfileOpen(true);
          } else {
            handleOpenAdmin('admin-profile', false);
          }
        }}
        onOpenAddProduct={() => handleOpenAdmin('inventory', true)}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogoutAdmin={handleAdminLogout}
        currentRole={currentRole}
        onNavigateRoute={handleNavigateToRoute}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          if (cat === 'producers') {
            setIsProducersModalOpen(true);
          } else {
            setSelectedCategory(cat);
            setSelectedProducerFilter('all');
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        websiteUrl={websiteUrl}
      />

      {/* Hero Showcase Banner */}
      <HeroBanner
        onShopClick={() => {
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOffersClick={() => setIsOffersModalOpen(true)}
        onOpenAccountLink={() => {
          setAccountInitialTab('website-link');
          setIsAccountOpen(true);
        }}
        websiteUrl={websiteUrl}
      />

      {/* Main Boutique Catalog & Filter Section */}
      <main id="products-section" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Section Headline & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-6 border-b border-[#EAE3D8] gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6B3E] font-semibold block mb-1">
              {selectedProducerFilter !== 'all' 
                ? `Formulated by ${selectedProducerFilter}` 
                : selectedCategory === 'korea'
                  ? 'Seoul & Jeju Island Hanbang Science'
                  : selectedCategory === 'china'
                    ? 'Hangzhou & Yunnan Imperial Apothecary'
                    : 'Curated Korean & Chinese Imports'}
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl text-[#1A1817] font-normal">
              {selectedCategory === 'all' 
                ? 'All Korean & Chinese Formulations' 
                : selectedCategory === 'korea'
                  ? '🇰🇷 Korean Skincare & Hanbang (K-Beauty)'
                  : selectedCategory === 'china'
                    ? '🇨🇳 Chinese Imperial Cosmetics (C-Beauty)'
                    : selectedCategory}
            </h2>
            <p className="text-xs sm:text-sm text-[#70675E] font-light mt-1">
              Showing {filteredProducts.length} certified authentic Asian laboratory creations
            </p>
          </div>

          {/* Sorter & Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Skin Type Filter (Dynamic Skin Profile List) */}
            <select
              id="storefront-skin-type-filter"
              value={skinTypeFilter}
              onChange={(e) => setSkinTypeFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-[#DCD3C7] rounded-lg text-[#3E3731] font-medium focus:outline-none focus:border-[#1F1B18]"
              title="Filter by Skin Profile List"
            >
              <option value="all">All Skin Profiles</option>
              {skinOptions.filter(opt => opt.id !== 'all').map((opt) => (
                <option key={opt.id} value={opt.tag}>
                  {opt.name}
                </option>
              ))}
            </select>

            {/* Sorter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 text-xs bg-white border border-[#DCD3C7] rounded-lg text-[#3E3731] focus:outline-none focus:border-[#1F1B18]"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Largest Savings</option>
            </select>

            {/* Active Filters Reset Button */}
            {(selectedCategory !== 'all' || selectedProducerFilter !== 'all' || skinTypeFilter !== 'all' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedProducerFilter('all');
                  setSkinTypeFilter('all');
                  setSearchQuery('');
                }}
                className="py-2 px-3 text-xs bg-[#EFE8DF] hover:bg-[#E5DDD2] text-[#423A33] rounded-lg font-medium transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Origin Country Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedProducerFilter('all');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#1F1B18] text-white shadow-xs'
                : 'bg-white text-[#5E554D] border border-[#DDD4C7] hover:bg-[#F2ECE5]'
            }`}
          >
            🌸 All Formulations ({products.length})
          </button>

          <button
            onClick={() => {
              setSelectedCategory('korea');
              setSelectedProducerFilter('all');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-1.5 ${
              selectedCategory === 'korea'
                ? 'bg-[#21437D] text-white shadow-xs'
                : 'bg-white text-[#21437D] border border-[#C5D5F0] hover:bg-[#EEF4FF]'
            }`}
          >
            <span>🇰🇷 Korean K-Beauty</span>
            <span className="text-[10px] opacity-75">
              ({products.filter(p => p.originCountry?.includes('Korea')).length})
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('china');
              setSelectedProducerFilter('all');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-1.5 ${
              selectedCategory === 'china'
                ? 'bg-[#9E2828] text-white shadow-xs'
                : 'bg-white text-[#9E2828] border border-[#F5C7C3] hover:bg-[#FFF0EF]'
            }`}
          >
            <span>🇨🇳 Chinese C-Beauty</span>
            <span className="text-[10px] opacity-75">
              ({products.filter(p => p.originCountry?.includes('China')).length})
            </span>
          </button>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-[#E8DFC8] rounded-2xl p-12 text-center text-[#736B63] my-8">
            <div className="w-16 h-16 rounded-full bg-[#FAF5EE] flex items-center justify-center mx-auto mb-3 text-[#A89D93]">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="font-serif-luxury text-xl text-[#1A1817]">No Formulations Match Criteria</h3>
            <p className="text-xs text-[#8C8075] mt-1 max-w-sm mx-auto">
              Try adjusting your category selection, skin concern filters, or search term to view available items.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedProducerFilter('all');
                setSkinTypeFilter('all');
                setSearchQuery('');
              }}
              className="mt-5 px-5 py-2.5 bg-[#1F1B18] text-white text-xs font-semibold uppercase tracking-wider rounded-xl"
            >
              Show All Formulations
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={(p, tab) => {
                  setSelectedProductForModal(p);
                  setProductModalTab(tab || 'benefits');
                }}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}

        {/* Banner: Sole Merchant Admin controls ONLY visible when admin is authenticated */}
        {isAdminAuthenticated ? (
          <div className="mt-16 p-6 sm:p-8 bg-gradient-to-r from-[#F4EDE5] via-[#EDE4DA] to-[#F4EDE5] border border-[#DDD3C7] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6B3E]">
                Sole Merchant Storefront • Producer Authenticity
              </span>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#1A1817]">
                Add Formulations Anytime & Manage Reviews
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5148] font-light max-w-xl">
                As the sole boutique owner, only you (Akon MD) can add product formulations, edit pricing, and adjust inventory. Public posting is restricted to maintain luxury authenticity.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsAdminProfileOpen(true)}
                className="px-4 py-3 bg-[#D4AF37] hover:bg-[#C29E2E] text-[#1A1817] text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Admin Profile</span>
              </button>

              <button
                onClick={() => {
                  setAdminInitialTab('inventory');
                  setAdminOpenAddProduct(true);
                  setIsAdminOpen(true);
                }}
                className="px-4 py-3 bg-[#1F1B18] hover:bg-[#342F2A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>+ Add Product Anytime</span>
              </button>

              <button
                onClick={() => {
                  setAccountInitialTab('website-link');
                  setIsAccountOpen(true);
                }}
                className="px-4 py-3 bg-white hover:bg-[#FAF8F5] border border-[#CFC3B3] text-[#1F1B18] text-xs font-semibold tracking-wider rounded-xl transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-[#8C6B3E]" />
                <span>Store Link</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-16 p-6 sm:p-8 bg-[#FAF6F0] border border-[#E8DFC8] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6B3E]">
                Direct From Seoul & Hangzhou Artisans
              </span>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#1A1817]">
                Authentic Korean & Chinese Luxury Beauty
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5148] font-light max-w-xl">
                Every formulation in BEAUTY SPHERE is carefully curated and directly sourced. Enjoy complimentary white-glove packaging, fast express dispatch, and personal concierge support on all orders.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setAccountInitialTab('profile');
                  setIsAccountOpen(true);
                }}
                className="px-5 py-3 bg-[#1F1B18] hover:bg-[#342F2A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>Client Account</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedDiscount={appliedDiscount}
        onApplyDiscountCode={handleApplyDiscountCode}
        onRemoveDiscount={handleRemoveDiscount}
        availableOffers={offers}
      />

      {/* Product Detail Modal (With Customer Reviews System) */}
      <ProductDetailModal
        product={selectedProductForModal}
        isOpen={!!selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        isWishlisted={selectedProductForModal ? wishlist.includes(selectedProductForModal.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(p, q) => {
          handleAddToCart(p, q);
          setSelectedProductForModal(null);
        }}
        onBuyNow={(p, q) => {
          handleAddToCart(p, q);
          setSelectedProductForModal(null);
          setIsCheckoutOpen(true);
        }}
        websiteUrl={websiteUrl}
        reviews={reviews}
        onAddReview={handleAddReview}
        initialTab={productModalTab}
        defaultReviewerName={userProfile.name}
      />

      {/* Seamless Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        appliedDiscount={appliedDiscount}
        userProfile={userProfile}
        customerAccount={customerAccount}
        onOrderCompleted={handleOrderCompleted}
        onClearCart={handleClearCart}
        onRemoveItem={handleRemoveCartItem}
        onOpenAccountOrders={() => {
          setAccountInitialTab('tracking');
          setIsAccountOpen(true);
        }}
        websiteUrl={websiteUrl}
      />

      {/* Simple Customer Account & Profile Settings Modal */}
      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        initialTab={accountInitialTab}
        customerAccount={customerAccount}
        onUpdateCustomerAccount={handleUpdateCustomerAccount}
        orders={isAdminAuthenticated ? orders : []}
        wishlistProducts={wishlistProducts}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onBuyNow={handleBuyNow}
        onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((i) => i !== id))}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminDashboard={() => setIsAdminOpen(true)}
        onLogoutAdmin={handleAdminLogout}
        websiteUrl={websiteUrl}
        onUpdateWebsiteUrl={handleUpdateWebsiteUrl}
      />

      {/* Admin & Merchant Login Modal (BCrypt Encrypted Credentials) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Merchant Admin Dashboard (Role-Aware: Master Admin vs Sole Merchant / Moderator) */}
      {isAdminOpen && (
        <AdminDashboard
          isOpen={isAdminOpen}
          isAdminAuthenticated={isAdminAuthenticated}
          currentRole={currentRole || 'admin'}
          currentUser={currentUser}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
          onClose={() => {
            setIsAdminOpen(false);
            setAdminOpenAddProduct(false);
          }}
          onLogout={handleAdminLogout}
          products={products}
          onSaveProducts={setProducts}
          skinOptions={skinOptions}
          onSaveSkinOptions={(newOpts) => {
            setSkinOptions(newOpts);
            saveStoredSkinOptions(newOpts);
          }}
          producers={producers}
          onSaveProducers={setProducers}
          offers={offers}
          onSaveOffers={setOffers}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          userProfile={userProfile}
          onUpdateProfile={setUserProfile}
          websiteUrl={websiteUrl}
          reviews={reviews}
          onDeleteReview={handleDeleteReview}
          initialTab={adminInitialTab}
          openAddProductOnMount={adminOpenAddProduct}
        />
      )}

      {/* Admin Profile & Sole Merchant Access Modal */}
      <AdminProfileModal
        isOpen={isAdminProfileOpen}
        onClose={() => setIsAdminProfileOpen(false)}
        userProfile={userProfile}
        productsCount={products.length}
        producersCount={producers.length}
        reviewsCount={reviews.length}
        isAdminAuthenticated={isAdminAuthenticated}
        onAuthenticateAdmin={() => {
          setIsAdminAuthenticated(true);
          saveStoredAdminActive(true);
        }}
        onUpdateProfile={setUserProfile}
        onOpenAdminDashboard={(tab) => {
          handleOpenAdmin((tab as any) || 'inventory', false);
        }}
        onOpenAddProduct={() => {
          handleOpenAdmin('inventory', true);
        }}
        websiteUrl={websiteUrl}
      />

      {/* Producers & Houses Modal */}
      <ProducersModal
        isOpen={isProducersModalOpen}
        onClose={() => setIsProducersModalOpen(false)}
        producers={producers}
        products={products}
        onSelectProducerFilter={(name) => {
          setSelectedProducerFilter(name);
          setSelectedCategory('all');
        }}
      />

      {/* Offers & Discounts Privileges Modal */}
      <OffersBannerModal
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        offers={offers}
        onApplyCode={(code) => {
          handleApplyDiscountCode(code);
          showToast(`Offer ${code} selected`);
        }}
      />

      {/* Boutique Footer */}
      <Footer
        userProfile={userProfile}
        onOpenAccount={(tab = 'profile') => {
          setAccountInitialTab(tab);
          setIsAccountOpen(true);
        }}
        onOpenAdmin={() => handleOpenAdmin('inventory', false)}
        onOpenAdminProfile={() => {
          if (isAdminAuthenticated) {
            setIsAdminProfileOpen(true);
          } else {
            handleOpenAdmin('admin-profile', false);
          }
        }}
        websiteUrl={websiteUrl}
        onNavigateRoute={handleNavigateToRoute}
      />

      {/* Persistent Official Boutique URL Bar at Bottom */}
      <div id="sticky-bottom-store-link-bar" className="sticky bottom-0 z-30 bg-[#161412]/95 backdrop-blur-md border-t border-[#332B24] py-2.5 px-4 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 text-center sm:text-left min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0 animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] shrink-0">
              Official Boutique URL:
            </span>
            <button
              onClick={() => setIsEditUrlModalOpen(true)}
              className="font-mono text-xs text-[#EAE3D8] hover:text-white bg-[#241F1A] hover:bg-[#2F2822] px-2.5 py-0.5 rounded border border-[#3E342B] hover:border-[#D4AF37]/50 truncate max-w-[200px] sm:max-w-md select-all text-left transition-colors cursor-pointer group flex items-center gap-1.5"
              title={isAdminAuthenticated ? "Edit store URL (Admin Verified)" : "Edit store URL (Admin Password Required)"}
            >
              <span className="truncate">{websiteUrl || (typeof window !== 'undefined' ? window.location.href : '')}</span>
              {isAdminAuthenticated ? (
                <Edit3 className="w-3 h-3 text-gray-400 group-hover:text-[#D4AF37] shrink-0" />
              ) : (
                <Lock className="w-3 h-3 text-amber-500/80 group-hover:text-[#D4AF37] shrink-0" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center">
            <button
              id="edit-boutique-url-bottom-btn"
              onClick={() => setIsEditUrlModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#26201B] hover:bg-[#3E342B] text-[#E0D7CC] hover:text-white border border-[#4D4033] text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              title={isAdminAuthenticated ? "Edit official boutique URL link" : "Administrator password required to edit store URL"}
            >
              {isAdminAuthenticated ? (
                <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              )}
              <span>Edit URL</span>
              {!isAdminAuthenticated && (
                <span className="text-[9px] uppercase font-bold text-amber-400/90 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800/60">
                  Admin
                </span>
              )}
            </button>

            <button
              id="copy-boutique-url-bottom-btn"
              onClick={handleCopyBottomUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#C29E2E] text-[#1A1817] text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              {copiedBottomBar ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1A1817]" />
                  <span>URL Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Store Link</span>
                </>
              )}
            </button>

            {/* Merchant Portal Quick Link */}
            <button
              id="bottom-bar-merchant-btn"
              onClick={() => handleNavigateToRoute('merchant-login')}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-700/60 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              title="Sole Merchant Portal (/merchant-login) - Customer orders & inventory"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Merchant</span>
            </button>

            {/* Secret Admin Portal Quick Link */}
            <button
              id="bottom-bar-admin-btn"
              onClick={() => handleNavigateToRoute('admin-dashboard')}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-[#26201B] hover:bg-[#382F27] text-[#D4AF37] border border-[#4D4033] text-xs font-semibold rounded-lg transition-all cursor-pointer"
              title="Secret Admin Portal (/admin-dashboard) - Full site control & user roles"
            >
              {isAdminAuthenticated && currentRole === 'admin' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Admin</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Website URL Link Modal (Admin Protected) */}
      <EditUrlModal
        isOpen={isEditUrlModalOpen}
        onClose={() => setIsEditUrlModalOpen(false)}
        currentUrl={websiteUrl || (typeof window !== 'undefined' ? window.location.href : '')}
        onSaveUrl={handleUpdateWebsiteUrl}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminVerified={() => {
          setIsAdminAuthenticated(true);
          showToast('Administrator session verified.');
        }}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
      />
    </div>
  );
}
