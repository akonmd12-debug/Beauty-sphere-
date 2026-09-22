import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Truck,
  Phone,
  User,
  Mail,
  MapPin,
  Banknote,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { CartItem, OfferDiscount, Order, UserProfile, CustomerAccount } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  appliedDiscount?: OfferDiscount | null;
  userProfile?: UserProfile;
  customerAccount?: CustomerAccount;
  onOrderCompleted: (order: Order) => void;
  onClearCart: () => void;
  onRemoveItem?: (productId: string) => void;
  onOpenAccountOrders?: () => void;
  websiteUrl?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  customerAccount,
  userProfile,
  onOrderCompleted,
  onClearCart,
  onRemoveItem,
  onOpenAccountOrders,
}) => {
  // Simple form fields: Name, Address, Contact Number, Email
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Delivery area: Inside Dhaka (70 TK) or Outside Dhaka (120 TK)
  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');

  // Submission & status state
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Initialize with account info if available
  useEffect(() => {
    if (customerAccount) {
      if (customerAccount.fullName && !fullName) setFullName(customerAccount.fullName);
      if (customerAccount.phone && !phone) setPhone(customerAccount.phone);
      if (customerAccount.email && !email) setEmail(customerAccount.email);
      if (customerAccount.address && !address) setAddress(customerAccount.address);
    } else if (userProfile) {
      if (userProfile.name && !fullName) setFullName(userProfile.name);
      if (userProfile.phone && !phone) setPhone(userProfile.phone);
      if (userProfile.email && !email) setEmail(userProfile.email);
      if (userProfile.address && !address) setAddress(userProfile.address);
    }
  }, [customerAccount, userProfile]);

  if (!isOpen) return null;

  // Delivery charge calculation
  const deliveryFee = deliveryArea === 'inside_dhaka' ? 70 : 120;
  const totalItemCount = cart.length;
  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalPrice = subtotal > 0 ? subtotal + deliveryFee : 0;

  const handleRemoveFromOrder = (productId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (onRemoveItem) {
      onRemoveItem(productId);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name (আপনার নাম লিখুন)');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setError('Please enter a valid 11-digit contact number (সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন)');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address (সঠিক ইমেইল ঠিকানা দিন)');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setError('Please enter your full delivery address (পূর্ণ ডেলিভারি ঠিকানা লিখুন)');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderNum = `ORD-${Date.now().toString().slice(-6)}`;
      const newOrder: Order = {
        id: `ord_${Date.now()}`,
        orderNumber: orderNum,
        createdAt: new Date().toISOString(),
        customer: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: cleanPhone,
          address: address.trim(),
          city: deliveryArea === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka',
          postalCode: '',
          country: 'Bangladesh',
        },
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          producer: item.product.producer || 'Premium',
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })),
        subtotal,
        discountAmount: 0,
        shippingFee: deliveryFee,
        tax: 0,
        total: totalPrice,
        status: 'Pending',
        paymentMethod: 'Cash on Delivery',
        notes: `Delivery Area: ${deliveryArea === 'inside_dhaka' ? 'Inside Dhaka (70 TK)' : 'Outside Dhaka (120 TK)'}`,
      };

      setIsSubmitting(false);
      setPlacedOrder(newOrder);

      // Trigger callbacks
      onOrderCompleted(newOrder);
      onClearCart();
    }, 600);
  };

  const handleClose = () => {
    setPlacedOrder(null);
    setError('');
    onClose();
  };

  return (
    <div
      id="simple-checkout-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="simple-checkout-modal"
        className="relative w-full max-w-xl sm:max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[94vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-[#1F1B18] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {placedOrder ? 'Order Placed Successfully!' : 'Quick Order Portal'}
              </h2>
              <p className="text-[11px] text-gray-300">
                {placedOrder
                  ? 'Thank you! We will deliver your parcel via Cash on Delivery.'
                  : 'Simple & Fast Checkout • Cash on Delivery'}
              </p>
            </div>
          </div>
          <button
            id="close-simple-checkout-btn"
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto px-5 sm:px-6 py-5">
          {placedOrder ? (
            /* Order Placed Success Confirmation */
            <div id="simple-order-success" className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                  Cash on Delivery (ক্যাশ অন ডেলিভারি)
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 mt-2">
                  Order #{placedOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                  Thank you, <strong>{placedOrder.customer.fullName}</strong>! Your order has been placed. We will contact you at <strong>{placedOrder.customer.phone}</strong> before delivery.
                </p>
              </div>

              {/* Order Summary Receipt Box */}
              <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-200 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Customer Name:</span>
                  <span className="font-semibold text-gray-900">{placedOrder.customer.fullName}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Contact Number:</span>
                  <span className="font-semibold text-gray-900">{placedOrder.customer.phone}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Email:</span>
                  <span className="font-semibold text-gray-900">{placedOrder.customer.email}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Address:</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[60%]">
                    {placedOrder.customer.address}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Region:</span>
                  <span className="font-semibold text-gray-900">
                    {placedOrder.customer.city} ({placedOrder.shippingFee} TK)
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2.5 mt-2 flex justify-between items-center font-bold text-gray-900 text-base">
                  <span>Total Amount Due:</span>
                  <span className="text-emerald-700 font-extrabold">৳{placedOrder.total} TK</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                {onOpenAccountOrders && (
                  <button
                    id="view-tracking-btn"
                    onClick={() => {
                      handleClose();
                      onOpenAccountOrders();
                    }}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Track Order Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  id="continue-shopping-btn"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs sm:text-sm transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Simple Order Form */
            <form id="simple-order-form" onSubmit={handleSubmitOrder} className="space-y-4">
              {error && (
                <div
                  id="simple-order-error"
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Item and Price Display */}
              <div className="p-3.5 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Ordered Items & Price
                    </span>
                    <span className="text-[10px] text-gray-400 hidden sm:inline">
                      (অর্ডারকৃত পণ্যসমূহ)
                    </span>
                  </div>
                  <span
                    id="quick-order-items-count-badge"
                    className="text-xs font-bold text-gray-700 bg-gray-200/80 px-2.5 py-0.5 rounded-full"
                  >
                    {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                    {totalUnits > 0 && ` • ${totalUnits} ${totalUnits === 1 ? 'unit' : 'units'}`}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 divide-y divide-gray-100">
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <div
                        key={item.product.id}
                        id={`order-item-${item.product.id}`}
                        className="flex items-center gap-3 pt-2.5 first:pt-0 group"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0 bg-white shadow-2xs"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate" title={item.product.name}>
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] text-gray-500">
                              Unit Price: ৳{item.product.price} TK × {item.quantity}
                            </p>
                            {item.product.size && (
                              <span className="text-[10px] text-gray-400">({item.product.size})</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            ৳{item.product.price * item.quantity} TK
                          </span>
                          {/* Small Remove button */}
                          <button
                            type="button"
                            id={`remove-order-item-${item.product.id}`}
                            onClick={(e) => handleRemoveFromOrder(item.product.id, e)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200 active:scale-95 cursor-pointer flex items-center justify-center group/btn"
                            title={`Remove ${item.product.name} from order list`}
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      id="quick-order-empty-cart-view"
                      className="py-6 px-4 text-center space-y-2 bg-white rounded-xl border border-dashed border-gray-200 my-1"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-gray-800">Your cart is empty</p>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto">
                        All items have been removed. Add items from the boutique to complete your order.
                      </p>
                      <button
                        type="button"
                        id="browse-products-empty-cart-btn"
                        onClick={handleClose}
                        className="mt-1 px-4 py-1.5 bg-[#1F1B18] text-[#D4AF37] hover:bg-[#342F2B] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Browse Boutique
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Customer Inputs (Name, Contact Number, Email, Address) */}
              <div className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      id="customer-name-input"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900"
                    />
                  </div>
                </div>

                {/* Contact Number & Email in 2 columns on sm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Contact Number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        id="customer-phone-input"
                        type="tel"
                        required
                        placeholder="e.g. 01700000000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        id="customer-email-input"
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <textarea
                      id="customer-address-input"
                      required
                      rows={2}
                      placeholder="House / Flat No, Road No, Area, City / District"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Delivery Area Options: Inside Dhaka (70 TK) / Outside Dhaka (120 TK) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Delivery Area (ডেলিভারি এলাকা) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Inside Dhaka */}
                  <label
                    htmlFor="delivery-inside-dhaka"
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                      deliveryArea === 'inside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        id="delivery-inside-dhaka"
                        name="delivery_charge_option"
                        type="radio"
                        checked={deliveryArea === 'inside_dhaka'}
                        onChange={() => setDeliveryArea('inside_dhaka')}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-900">Inside Dhaka</div>
                        <div className="text-xs text-gray-500">ঢাকার ভিতরে ডেলিভারি</div>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                      70 TK
                    </span>
                  </label>

                  {/* Outside Dhaka */}
                  <label
                    htmlFor="delivery-outside-dhaka"
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                      deliveryArea === 'outside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        id="delivery-outside-dhaka"
                        name="delivery_charge_option"
                        type="radio"
                        checked={deliveryArea === 'outside_dhaka'}
                        onChange={() => setDeliveryArea('outside_dhaka')}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-900">Outside Dhaka</div>
                        <div className="text-xs text-gray-500">ঢাকার বাইরে সারা বাংলাদেশ</div>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                      120 TK
                    </span>
                  </label>
                </div>
              </div>

              {/* 4. Only One Payment Option: Cash on Delivery */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-2xs">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Payment Method: Cash on Delivery (ক্যাশ অন ডেলিভারি)
                    </span>
                    <span className="text-[11px] text-gray-600">
                      Pay in cash when you receive the product. No advance payment needed.
                    </span>
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              </div>

              {/* 5. Live Price Summary */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-gray-900">৳{subtotal} TK</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    Delivery Charge ({deliveryArea === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {cart.length > 0 ? `৳${deliveryFee} TK` : '৳0 TK'}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm font-bold text-gray-900">
                  <span>Total Price:</span>
                  <span className="text-base sm:text-lg font-extrabold text-emerald-700">
                    ৳{totalPrice} TK
                  </span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                id="submit-simple-order-btn"
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : cart.length === 0 ? (
                  <span>Your Cart is Empty</span>
                ) : (
                  <>
                    <span>Confirm Order (৳{totalPrice} TK)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
