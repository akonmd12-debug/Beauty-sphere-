import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles, 
  Tag, 
  ArrowRight, 
  Gift, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { CartItem, OfferDiscount } from '../types';
import { formatCurrency } from '../utils/storage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart?: () => void;
  onProceedToCheckout: () => void;
  appliedDiscount: OfferDiscount | null;
  onApplyDiscountCode: (code: string) => { success: boolean; message: string };
  onRemoveDiscount: () => void;
  availableOffers: OfferDiscount[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  appliedDiscount,
  onApplyDiscountCode,
  onRemoveDiscount,
  availableOffers,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);

  if (!isOpen) return null;

  const rawSubtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.discountPercent > 0
      ? item.product.price * (1 - item.product.discountPercent / 100)
      : item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const discountPercent = appliedDiscount ? appliedDiscount.discountPercent : 0;
  const discountAmount = appliedDiscount ? (rawSubtotal * discountPercent) / 100 : 0;
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);

  const FREE_SHIPPING_THRESHOLD = 75;
  const qualifiesForFreeShipping = subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = cart.length === 0 ? 0 : qualifiesForFreeShipping ? 0 : 12;
  const progressPercent = Math.min(100, Math.round((subtotalAfterDiscount / FREE_SHIPPING_THRESHOLD) * 100));

  const total = subtotalAfterDiscount + shippingFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const result = onApplyDiscountCode(promoInput.trim());
    if (result.success) {
      setPromoMessage({ type: 'success', text: result.message });
      setPromoInput('');
    } else {
      setPromoMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div 
        id="cart-drawer-panel"
        className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#EBE4DC]"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#EBE4DC] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#1F1B18]" />
            <div>
              <h2 className="font-serif-luxury text-lg sm:text-xl text-[#1A1817] font-medium tracking-wide">
                Your Cart List
              </h2>
              <p className="text-[10px] text-[#7A7066] font-light">
                Bulk purchase multiple Asian beauty products at once
              </p>
            </div>
            <span className="text-xs bg-[#1F1B18] text-[#D4AF37] px-2 py-0.5 rounded-full font-bold ml-1">
              {cart.reduce((count, item) => count + item.quantity, 0)} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && onClearCart && (
              <button
                onClick={onClearCart}
                className="text-[11px] text-[#8C8075] hover:text-rose-700 underline font-medium"
                title="Clear all items from list"
              >
                Clear All
              </button>
            )}
            <button
              id="close-cart-btn"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6E645A] hover:text-black hover:bg-[#F2ECE5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-5 py-3 bg-[#F4EDE5] border-b border-[#E5DDD2]">
          <div className="flex items-center justify-between text-xs text-[#524941] mb-1.5">
            <span className="font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              {qualifiesForFreeShipping
                ? 'Signature Complimentary Delivery Unlocked!'
                : `Add ${formatCurrency(FREE_SHIPPING_THRESHOLD - subtotalAfterDiscount)} for Complimentary Delivery`}
            </span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#E2D6C7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1F1B18] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#786E64]">
              <div className="w-16 h-16 rounded-full bg-[#F2EDE6] flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-[#A69B90]" />
              </div>
              <h3 className="font-serif-luxury text-lg text-[#1A1817] mb-1">Your bag is currently empty</h3>
              <p className="text-xs text-[#8C8074] max-w-xs mb-5">
                Explore our sovereign cold-pressed botanicals and cellular beauty elixirs to awaken your skincare ritual.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#1F1B18] text-white text-xs font-semibold tracking-wider uppercase rounded-full hover:bg-[#342F2B] transition-all"
              >
                Discover Formulations
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemPrice = item.product.discountPercent > 0
                ? item.product.price * (1 - item.product.discountPercent / 100)
                : item.product.price;

              return (
                <div
                  key={item.product.id}
                  id={`cart-item-${item.product.id}`}
                  className="flex gap-4 p-3 bg-white border border-[#EDE5DA] rounded-xl shadow-2xs"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-[#FAF8F5] shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] uppercase tracking-wider text-[#8C8075] font-medium">
                            {item.product.producer}
                          </span>
                          {item.product.originCountry && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-[#F2EDE7] text-[#5C534B] rounded-full font-semibold">
                              {item.product.originCountry.toLowerCase().includes('korea') ? '🇰🇷 K-Beauty' : '🇨🇳 C-Beauty'}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-[#9C9287] hover:text-[#B85D3B] p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-serif-luxury text-sm font-medium text-[#1A1817] line-clamp-1">
                        {item.product.name}
                      </h4>
                      {item.product.nativeName && (
                        <p className="text-[10px] text-[#8C6B3E] font-medium">
                          {item.product.nativeName}
                        </p>
                      )}
                      <p className="text-[11px] text-[#7A7167] font-light">{item.product.size}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5EFE8]">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E0D7CC] rounded bg-[#FAF8F5] px-1 py-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-[#4A433D] hover:text-black"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-[#1A1817]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 text-[#4A433D] hover:text-black disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#1A1817]">
                          {formatCurrency(itemPrice * item.quantity)}
                        </span>
                        {item.product.discountPercent > 0 && (
                          <span className="block text-[10px] text-[#9E948A] line-through">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Breakdown */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#EBE4DC] bg-white space-y-3">
            {/* Complimentary Gift Packaging Toggle */}
            <div 
              onClick={() => setGiftWrap(!giftWrap)}
              className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-[#E5DDD2] rounded-xl cursor-pointer hover:bg-[#F2ECE5] transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#8C6B3E]" />
                <div>
                  <p className="font-medium text-[#1A1817]">Complimentary Boutique Gift Box</p>
                  <p className="text-[10px] text-[#786E64]">Signature ribbon & botanical card</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={() => {}}
                className="w-4 h-4 rounded text-[#1F1B18] accent-[#1F1B18]"
              />
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#8C8075] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter offer code (e.g. SPHERE15)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD4C7] rounded-lg focus:outline-none focus:border-[#1F1B18] uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#342E2A] hover:bg-[#1F1B18] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all"
                >
                  Apply
                </button>
              </div>

              {promoMessage && (
                <div className={`text-[11px] flex items-center gap-1.5 ${promoMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {promoMessage.type === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  <span>{promoMessage.text}</span>
                </div>
              )}

              {appliedDiscount && (
                <div className="flex items-center justify-between text-xs bg-[#EAF2EA] border border-[#CFDFCF] text-emerald-800 px-2.5 py-1 rounded-md">
                  <span className="font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Code '{appliedDiscount.code}' Applied (-{appliedDiscount.discountPercent}%)
                  </span>
                  <button 
                    type="button" 
                    onClick={onRemoveDiscount}
                    className="text-xs hover:underline text-emerald-900 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Price Calculations */}
            <div className="pt-2 border-t border-[#F2ECE5] space-y-1.5 text-xs text-[#524941]">
              <div className="flex justify-between">
                <span>Formulation Subtotal</span>
                <span className="font-medium text-[#1A1817]">{formatCurrency(rawSubtotal)}</span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Special Offer Discount ({appliedDiscount.discountPercent}%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Boutique White-Glove Shipping</span>
                <span className="font-medium">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">Complimentary</span>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-[#EAE3D8] text-sm font-semibold text-[#1A1817]">
                <span>Estimated Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Bulk Buy Checkout Action Button */}
            <button
              id="proceed-to-checkout-btn"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 bg-[#1F1B18] hover:bg-[#38312B] text-white text-xs font-semibold tracking-[0.15em] uppercase rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Buy All ({cart.reduce((c, i) => c + i.quantity, 0)} Items) • {formatCurrency(total)}</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
            <p className="text-[10px] text-center text-[#8C8075] pt-0.5 font-light">
              ✓ Buy {cart.length} distinct item{cart.length > 1 ? 's' : ''} in one unified bulk order
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
