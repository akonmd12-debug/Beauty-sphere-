import React from 'react';
import { Heart, ShoppingBag, Eye, Star, Sparkles, Zap } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/storage';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product, initialTab?: 'benefits' | 'ritual' | 'ingredients' | 'reviews') => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onBuyNow,
}) => {
  const hasDiscount = product.discountPercent > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-white border border-[#EBE4DC] rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/5] bg-[#F7F4F0] overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase bg-[#1F1B18] text-[#FAF8F5] rounded-full shadow-2xs">
              <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#D4AF37]" />
              <span className="truncate max-w-[80px] sm:max-w-none">{product.badge}</span>
            </span>
          )}

          {hasDiscount && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-[#B85D3B] text-white rounded-full shadow-2xs">
              -{product.discountPercent}%
            </span>
          )}

          {product.isNewArrival && !product.badge && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-medium tracking-wider uppercase bg-[#5A6E58] text-white rounded-full shadow-2xs">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white text-[#2B2623] hover:text-[#B85D3B] shadow-2xs transition-all z-10 cursor-pointer"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-[#B85D3B] text-[#B85D3B]' : ''}`} />
        </button>

        {/* Hover Quick Actions */}
        <div className="hidden sm:flex absolute inset-x-2.5 bottom-2.5 items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-1.5 px-2.5 bg-white/95 hover:bg-white text-[#1F1B18] text-[11px] font-semibold tracking-wider uppercase rounded-lg shadow-sm backdrop-blur-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-2.5 py-1 bg-[#1F1B18] text-white text-[10px] sm:text-xs font-semibold tracking-wider uppercase rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-grow justify-between bg-white">
        <div>
          {/* Producer & Category Tag */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-[#8C8075] mb-1">
            <div className="flex items-center gap-1 truncate max-w-[70%]">
              {product.originCountry && (
                <span className={`px-1 py-0.2 rounded text-[9px] font-semibold shrink-0 ${
                  product.originCountry.includes('Korea')
                    ? 'bg-[#EEF4FF] text-[#2C4E8C] border border-[#D5E2F7]'
                    : 'bg-[#FFF1F0] text-[#B83838] border border-[#FAD1CD]'
                }`}>
                  {product.originCountry.includes('Korea') ? '🇰🇷 K-Beauty' : '🇨🇳 C-Beauty'}
                </span>
              )}
              <span className="font-medium text-[#7D6B5A] truncate">{product.producer}</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-[#A69B91] shrink-0">{product.size}</span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onQuickView(product)}
            className="font-serif-luxury text-sm sm:text-base text-[#1A1817] font-medium leading-snug line-clamp-1 hover:text-[#8C6B3E] cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {product.nativeName && (
            <p className="text-[10px] sm:text-[11px] text-[#8C7E72] font-serif-luxury tracking-wide line-clamp-1 mt-0.5">
              {product.nativeName}
            </p>
          )}

          <p className="text-[11px] sm:text-xs text-[#6B635B] line-clamp-1 font-light mt-0.5 mb-1.5">
            {product.subtitle}
          </p>

          {/* Star Rating & Leave Review trigger */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product, 'reviews');
            }}
            className="flex items-center gap-1 mb-2 cursor-pointer group/rating hover:opacity-80 transition-opacity"
            title="Read & Leave Client Reviews"
          >
            <div className="flex items-center text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-[#D4AF37] text-[#D4AF37]'
                      : 'text-[#D9D2CA]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#4A433D]">{product.rating.toFixed(1)}</span>
            <span className="text-[10px] sm:text-[11px] text-[#A3998F] group-hover/rating:text-[#8C6B3E] group-hover/rating:underline underline-offset-2">
              ({product.reviewsCount})
            </span>
          </div>
        </div>

        {/* Pricing & Add to Bag Footer */}
        <div className="pt-2 sm:pt-2.5 border-t border-[#F2EDE7]">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-semibold text-[#1A1817]">
                {formatCurrency(discountedPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-[#998F85] line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            {isLowStock ? (
              <span className="text-[9px] sm:text-[10px] font-semibold text-[#B85D3B] uppercase tracking-wider">
                {product.stock} left
              </span>
            ) : isOutOfStock ? (
              <span className="text-[9px] sm:text-[10px] font-medium text-[#8C827A] uppercase tracking-wider">
                Sold Out
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-medium text-emerald-700 tracking-wider">
                In Stock
              </span>
            )}
          </div>

          {/* Action buttons: Add to Bag & Buy Now */}
          <div className="flex items-center gap-1.5">
            <button
              id={`add-to-bag-${product.id}`}
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product)}
              className={`flex-1 py-1.5 sm:py-2 px-1.5 sm:px-2.5 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-[#EAE4DC] text-[#9E9388] cursor-not-allowed'
                  : 'bg-[#1F1B18] hover:bg-[#38312B] text-white shadow-2xs hover:shadow-xs'
              }`}
              title={isOutOfStock ? 'Sold Out' : 'Add to Bag'}
            >
              <ShoppingBag className="w-3 h-3 shrink-0" />
              <span className="truncate">{isOutOfStock ? 'Sold Out' : 'Add'}</span>
            </button>

            {onBuyNow && (
              <button
                id={`buy-now-${product.id}`}
                disabled={isOutOfStock}
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow(product);
                }}
                className={`flex-1 py-1.5 sm:py-2 px-1.5 sm:px-2.5 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'hidden'
                    : 'bg-[#D4AF37] hover:bg-[#C29E2E] text-[#1F1B18] shadow-2xs hover:shadow-xs'
                }`}
                title="Instant Checkout"
              >
                <Zap className="w-3 h-3 fill-[#1F1B18] shrink-0" />
                <span className="truncate">Buy</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
