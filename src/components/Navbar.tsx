import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Share2, 
  Check, 
  Menu, 
  X, 
  Sparkles, 
  ExternalLink,
  Package,
  ArrowRight
} from 'lucide-react';
import { ProductCategory } from '../types';
import { AppRoute } from '../utils/router';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: (defaultTab?: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  websiteUrl: string;
  activeAnnouncement?: string;
  onNavigateRoute?: (route: AppRoute) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAccount,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  websiteUrl,
  activeAnnouncement = "Complimentary White-Glove Delivery on orders over ৳1,500 • Authentic Seoul & Hangzhou Luxury Imports • Code: KBEAUTY15",
  onNavigateRoute,
}) => {
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const urlToCopy = websiteUrl || window.location.href;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const navCategories = [
    { label: 'All Collections', value: 'all' },
    { label: '🇰🇷 K-Beauty (Korea)', value: 'korea' },
    { label: '🇨🇳 C-Beauty (China)', value: 'china' },
    { label: 'Essences & Serums', value: 'Essences & Serums' },
    { label: 'Moisture Creams', value: 'Moisture & Barrier Creams' },
    { label: 'Cleansers & Balms', value: 'Cleansers & Balms' },
    { label: 'Sun Care & Cushions', value: 'Sun Care & Cushions' },
    { label: 'Sheet Masks', value: 'Sheet Masks & Treatments' },
    { label: 'Artisan Houses', value: 'producers' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/98 backdrop-blur-md border-b border-[#EAE5DF] shadow-xs transition-all">
      {/* Luxury Top Announcement Ribbon (Clean Announcement without Copy URL bar) */}
      <div className="bg-[#1F1B18] text-[#E8DFD8] text-[11px] md:text-xs tracking-wider uppercase py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="font-light tracking-widest">{activeAnnouncement}</span>
          </div>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
          {/* 3-Step Door Portal Window Trigger (Accessible on all screens) */}
          <div className="flex items-center">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:px-3 text-[#2B2623] hover:text-black hover:bg-[#F2EDE7] border border-[#DDD5CA] rounded-full transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer shadow-2xs"
              aria-label="Open 3-Step Door Portal Window"
              title="Open 3-Step Door Portal Window"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#8C6B3E]" /> : <Menu className="w-5 h-5 text-[#8C6B3E]" />}
              <span className="text-xs uppercase tracking-wider font-semibold text-[#1A1817] hidden sm:inline">
                3-Step Door
              </span>
            </button>
          </div>

          {/* Desktop Search input */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-products-input"
                type="text"
                placeholder="Search Ginseng, Snail Mucin, Cica, Florasis, Pearl..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F2EDE7] border border-transparent rounded-full focus:outline-none focus:border-[#C5A880] focus:bg-white transition-all text-[#2B2623] placeholder-[#8C827A]"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C827A] hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Brand Logo & Editorial Wordmark */}
          <div className="text-center cursor-pointer flex-shrink-0" onClick={() => onSelectCategory('all')}>
            <span className="block text-[9px] sm:text-[11px] font-sans tracking-[0.25em] uppercase text-[#8C827A] mb-0.5">
              Korean & Chinese Luxury Beauty
            </span>
            <h1 className="font-serif-luxury text-xl sm:text-3xl md:text-4xl tracking-[0.18em] font-normal text-[#1A1817]">
              BEAUTY SPHERE
            </h1>
            <div className="hidden sm:flex items-center justify-center gap-2 mt-0.5">
              <span className="h-[1px] w-4 bg-[#D4AF37]/50"></span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.3em] text-[#A39282] uppercase font-light">
                K-BEAUTY & C-BEAUTY BOUTIQUE
              </span>
              <span className="h-[1px] w-4 bg-[#D4AF37]/50"></span>
            </div>
          </div>

          {/* Right Action Icons & Dashboard Controls */}
          <div className="flex items-center justify-end flex-1 gap-1 sm:gap-2">
            {/* Wishlist */}
            <button
              id="open-wishlist-btn"
              onClick={onOpenWishlist}
              className="relative p-2 text-[#2B2623] hover:text-[#C5A880] transition-colors"
              aria-label="Wishlist"
              title="Saved Formulations"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C5A880] text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Customer Account / Fast Checkout Profile */}
            <button
              id="open-user-account-btn"
              onClick={() => onOpenAccount('profile')}
              className="p-2 text-[#2B2623] hover:text-[#C5A880] transition-colors flex items-center gap-1.5"
              aria-label="Customer Account"
              title="Customer Account & Instant Delivery Info"
            >
              <User className="w-5 h-5" />
              <span className="hidden xl:inline text-xs font-medium text-[#4A433E]">Account</span>
            </button>

            {/* Cart List Drawer Button (Buy So Many Products at Once) */}
            <button
              id="open-cart-drawer-btn"
              onClick={onOpenCart}
              className="relative p-2 sm:px-3.5 bg-[#1F1B18] text-[#FAF8F5] hover:bg-[#342F2B] rounded-full transition-all shadow-sm flex items-center justify-center gap-1.5"
              aria-label="Cart List"
              title="View Cart List & Bulk Purchase All Products"
            >
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden md:inline text-xs font-semibold tracking-wider">Cart List</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 bg-[#D4AF37] text-[#1F1B18] text-[11px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Persistent Search Bar (Always fixed at top on scroll with 3-step drawer) */}
        <div className="lg:hidden pb-2.5 pt-0.5">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="mobile-sticky-search-input"
              type="text"
              placeholder="Search Ginseng, Snail Mucin, Cica, Florasis, Pearl..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#F2EDE7] border border-[#DDD5CA] rounded-full focus:outline-none focus:border-[#C5A880] focus:bg-white transition-all text-[#1A1817] placeholder-[#8C827A]"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C827A] hover:text-black p-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center justify-center space-x-8 py-3 border-t border-[#EAE5DF]">
          {navCategories.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                className={`text-xs uppercase tracking-[0.18em] transition-all relative py-1 ${
                  isActive
                    ? 'text-[#1A1817] font-semibold'
                    : 'text-[#6E6660] hover:text-[#1A1817] font-normal'
                }`}
              >
                {cat.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#1A1817] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3-Step Door Portal Window (Spacious, easy-to-use overlay modal) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="bg-[#FAF8F5] border-2 border-[#D4AF37]/60 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Portal Window Header */}
            <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-[#E8DFD3] flex items-center justify-between sticky top-0 z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EAE2D7] text-[#5A4E44] text-[10px] uppercase tracking-[0.2em] font-bold mb-1">
                  <Sparkles className="w-3 h-3 text-[#C5A880]" />
                  <span>Door Portal Window</span>
                </div>
                <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#1A1817] font-semibold">
                  3-Step Door Portal Gateway
                </h3>
                <p className="text-xs text-[#7A7066] mt-0.5">
                  Effortless navigation across Collections, Client Services & Protected Portals
                </p>
              </div>

              <button
                id="close-3step-door-portal-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F1B18] text-white hover:bg-[#38322C] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>

            {/* Portal Window Body: 3 Distinct, Big, Easy-to-use Steps */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-7">
              {/* STEP 1: BOUTIQUE COLLECTIONS */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#1F1B18] text-[#FAF8F5] text-xs font-bold flex items-center justify-center">1</span>
                  <h4 className="text-xs uppercase tracking-[0.18em] font-bold text-[#1F1B18]">
                    Step 1: Curated Boutique Collections
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {navCategories.map((cat) => {
                    const isSelected = selectedCategory === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => {
                          onSelectCategory(cat.value);
                          setMobileMenuOpen(false);
                        }}
                        className={`p-3 rounded-xl text-xs font-semibold tracking-wider text-left transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F1B18] text-[#FAF8F5] border-[#1F1B18] shadow-sm'
                            : 'bg-white text-[#2C2723] hover:bg-[#F2ECE4] border-[#E0D6CB]'
                        }`}
                      >
                        <p className="truncate">{cat.label}</p>
                        <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-[#D4AF37]' : 'text-[#8A8077]'}`}>
                          {isSelected ? '● Active View' : 'Explore →'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: CLIENT ACCESS & BAG */}
              <div className="pt-2 border-t border-[#EAE5DF]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#1F1B18] text-[#FAF8F5] text-xs font-bold flex items-center justify-center">2</span>
                  <h4 className="text-xs uppercase tracking-[0.18em] font-bold text-[#1F1B18]">
                    Step 2: Client Access & Bag Services
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAccount('profile');
                    }}
                    className="p-3.5 bg-white border border-[#E2DAD1] hover:border-[#8C6B3E] hover:bg-[#FAF6F0] rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-[#FAF5EE] rounded-xl group-hover:bg-[#EBE3D8] transition-colors">
                        <User className="w-5 h-5 text-[#8C6B3E]" />
                      </div>
                      <span className="text-[11px] text-[#8C6B3E] font-bold uppercase tracking-wider">Open →</span>
                    </div>
                    <p className="text-xs font-bold text-[#1A1817]">Delivery Profile</p>
                    <p className="text-[11px] text-[#7A7169] mt-0.5">Shipping, orders & preferences</p>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenWishlist();
                    }}
                    className="p-3.5 bg-white border border-[#E2DAD1] hover:border-[#B85D3B] hover:bg-[#FAF6F0] rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-[#FAF5EE] rounded-xl group-hover:bg-[#FBECE6] transition-colors">
                        <Heart className="w-5 h-5 text-[#B85D3B]" />
                      </div>
                      <span className="text-[11px] text-[#B85D3B] font-bold uppercase tracking-wider">{wishlistCount} Saved</span>
                    </div>
                    <p className="text-xs font-bold text-[#1A1817]">Saved Formulations</p>
                    <p className="text-[11px] text-[#7A7169] mt-0.5">Quick access to favorites</p>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCart();
                    }}
                    className="p-3.5 bg-white border border-[#E2DAD1] hover:border-[#1F1B18] hover:bg-[#FAF6F0] rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-[#FAF5EE] rounded-xl group-hover:bg-[#ECE6DE] transition-colors">
                        <ShoppingBag className="w-5 h-5 text-[#1F1B18]" />
                      </div>
                      <span className="text-[11px] text-[#1F1B18] font-bold uppercase tracking-wider">{cartCount} Items</span>
                    </div>
                    <p className="text-xs font-bold text-[#1A1817]">Shopping Bag</p>
                    <p className="text-[11px] text-[#7A7169] mt-0.5">Fast checkout & purchase</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </header>
  );
};
