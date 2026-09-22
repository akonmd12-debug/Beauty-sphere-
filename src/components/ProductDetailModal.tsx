import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Droplets, 
  Clock, 
  Share2, 
  Check, 
  Plus, 
  Minus,
  Award,
  MessageSquarePlus,
  ThumbsUp,
  UserCheck,
  Zap
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { formatCurrency } from '../utils/storage';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
  websiteUrl: string;
  reviews?: ProductReview[];
  onAddReview?: (review: ProductReview) => void;
  initialTab?: 'benefits' | 'ritual' | 'ingredients' | 'reviews';
  defaultReviewerName?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  websiteUrl,
  reviews = [],
  onAddReview,
  initialTab = 'benefits',
  defaultReviewerName = '',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'ritual' | 'ingredients' | 'reviews'>(initialTab);
  const [copied, setCopied] = useState(false);

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewerName, setReviewerName] = useState(defaultReviewerName || '');
  const [reviewSkinType, setReviewSkinType] = useState('All Skin Types');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [recommendProduct, setRecommendProduct] = useState(true);
  const [reviewSubmittedToast, setReviewSubmittedToast] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen || !product) return null;

  const productReviews = reviews.filter((r) => r.productId === product.id);

  const hasDiscount = product.discountPercent > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  const isOutOfStock = product.stock <= 0;

  const handleCopyLink = () => {
    const shareUrl = `${websiteUrl || window.location.origin}/#product-${product.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleAdd = () => {
    if (!isOutOfStock) {
      onAddToCart(product, quantity);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      customerName: reviewerName.trim() || 'Verified Client',
      rating: newRating,
      title: reviewTitle.trim(),
      comment: reviewComment.trim(),
      date: new Date().toISOString().split('T')[0],
      skinType: reviewSkinType,
      verifiedPurchase: true,
      recommend: recommendProduct,
    };

    if (onAddReview) {
      onAddReview(newReview);
    }

    setReviewSubmittedToast(true);
    setTimeout(() => setReviewSubmittedToast(false), 3500);

    // Reset Form
    setReviewTitle('');
    setReviewComment('');
    setShowReviewForm(false);
    setActiveTab('reviews');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        id="product-detail-modal"
        className="relative bg-[#FAF8F5] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-[#EAE3D8] my-8 flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#2C2723] hover:text-black shadow-sm transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Imagery & Guarantee */}
        <div className="md:w-1/2 bg-[#F5EFE9] relative flex flex-col justify-between p-6 sm:p-8">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-sm bg-white mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase bg-[#1F1B18] text-[#FAF8F5] rounded-full">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                {product.badge}
              </span>
            )}
            {hasDiscount && (
              <span className="absolute top-3 right-3 px-3 py-1 text-[11px] font-bold tracking-wider uppercase bg-[#B85D3B] text-white rounded-full">
                Save {product.discountPercent}%
              </span>
            )}
          </div>

          {/* Verification Badges */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs text-[#6B6158]">
            <div className="bg-white/80 rounded-lg p-2 flex items-center justify-center gap-1.5 border border-[#E8DFC8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C6B3E]" />
              <span className="text-[11px] font-medium">Authentic Asian Import</span>
            </div>
            <div className="bg-white/80 rounded-lg p-2 flex items-center justify-center gap-1.5 border border-[#E8DFC8]">
              <Award className="w-3.5 h-3.5 text-[#8C6B3E]" />
              <span className="text-[11px] font-medium">Hanbang & Herbal Bio-Active</span>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Origin & Producer Tag */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs tracking-[0.15em] uppercase text-[#8C8075] mb-2">
              <div className="flex items-center gap-2">
                {product.originCountry && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    product.originCountry.includes('Korea')
                      ? 'bg-[#EEF4FF] text-[#2C4E8C] border border-[#D5E2F7]'
                      : 'bg-[#FFF1F0] text-[#B83838] border border-[#FAD1CD]'
                  }`}>
                    {product.originCountry.includes('Korea') ? '🇰🇷 K-Beauty (Korea)' : '🇨🇳 C-Beauty (China)'}
                  </span>
                )}
                <span className="font-semibold text-[#8C6B3E]">{product.producer}</span>
              </div>
              <span className="text-[11px]">{product.size}</span>
            </div>

            {/* Heritage tag if present */}
            {product.heritage && (
              <div className="mb-2">
                <span className="inline-block text-[10px] font-medium tracking-wider text-[#7A6E63] bg-[#FAF3EA] border border-[#EADBCC] px-2.5 py-0.5 rounded-full">
                  Heritage: {product.heritage}
                </span>
              </div>
            )}

            {/* Title & Subtitle */}
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#1A1817] font-medium leading-tight mb-1">
              {product.name}
            </h2>
            {product.nativeName && (
              <p className="text-xs text-[#8C7D70] font-serif-luxury tracking-wider mb-1">
                {product.nativeName}
              </p>
            )}
            <p className="text-xs sm:text-sm text-[#70675E] font-light mb-3">
              {product.subtitle}
            </p>

            {/* Rating & Reviews Bar */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-[#EBE4DC]">
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setActiveTab('reviews')}
                title="View customer reviews"
              >
                <div className="flex items-center text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-[#DDD4CA]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#2C2723]">{product.rating.toFixed(1)} / 5.0</span>
                <span className="text-xs text-[#8C8075] group-hover:text-[#8C6B3E] transition-colors underline-offset-2 group-hover:underline">
                  ({productReviews.length} customer {productReviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              <button
                id="quick-write-review-btn"
                onClick={() => {
                  setActiveTab('reviews');
                  setShowReviewForm(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-[#8C6B3E] bg-[#F4EDE5] hover:bg-[#EAE0D4] border border-[#DDD0C0] rounded-md transition-all"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Leave a Review</span>
              </button>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-[#1A1817]">
                {formatCurrency(discountedPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-[#968C83] line-through">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-xs font-semibold text-[#B85D3B] bg-[#F7ECE7] px-2 py-0.5 rounded-full">
                    Save {formatCurrency(product.price - discountedPrice)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#4E4741] leading-relaxed mb-5 font-light">
              {product.description}
            </p>

            {/* Success toast after submitting review */}
            {reviewSubmittedToast && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your verified client review is now live on this product.</span>
              </div>
            )}

            {/* Information Tabs */}
            <div className="mb-6">
              <div className="flex border-b border-[#E5DDD2] gap-3 sm:gap-4 text-xs font-medium uppercase tracking-wider mb-3 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab('benefits')}
                  className={`pb-2 transition-all relative shrink-0 ${
                    activeTab === 'benefits'
                      ? 'text-[#1A1817] font-semibold border-b-2 border-[#1A1817]'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                  }`}
                >
                  Benefits
                </button>
                <button
                  onClick={() => setActiveTab('ritual')}
                  className={`pb-2 transition-all relative shrink-0 ${
                    activeTab === 'ritual'
                      ? 'text-[#1A1817] font-semibold border-b-2 border-[#1A1817]'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                  }`}
                >
                  Ritual of Use
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`pb-2 transition-all relative shrink-0 ${
                    activeTab === 'ingredients'
                      ? 'text-[#1A1817] font-semibold border-b-2 border-[#1A1817]'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                  }`}
                >
                  Ingredients
                </button>
                <button
                  id="product-modal-reviews-tab-btn"
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 transition-all relative shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'text-[#1A1817] font-semibold border-b-2 border-[#1A1817]'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                  }`}
                >
                  <span>Customer Reviews</span>
                  <span className="px-1.5 py-0.2 bg-[#EAE2D7] text-[#6B5D50] text-[10px] rounded-full font-bold">
                    {productReviews.length}
                  </span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="text-xs text-[#524B44] min-h-[140px]">
                {activeTab === 'benefits' && (
                  <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
                    {product.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                )}

                {activeTab === 'ritual' && (
                  <div className="flex items-start gap-2 bg-[#F5EFE9] p-3 rounded-xl">
                    <Clock className="w-4 h-4 text-[#8C6B3E] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{product.usageRitual}</p>
                  </div>
                )}

                {activeTab === 'ingredients' && (
                  <div className="bg-[#F5EFE9] p-3 rounded-xl">
                    <p className="text-[11px] leading-relaxed font-mono text-[#524B44]">
                      {product.ingredients}
                    </p>
                  </div>
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Reviews Summary & Write CTA */}
                    <div className="bg-[#F7F2EB] p-3.5 rounded-xl border border-[#E8DFD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-[#1A1817]">{product.rating.toFixed(1)}</span>
                          <div className="flex items-center text-[#D4AF37]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(product.rating)
                                    ? 'fill-[#D4AF37] text-[#D4AF37]'
                                    : 'text-[#D5CBBD]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-[#7A6F64] font-medium">
                            Based on {productReviews.length} {productReviews.length === 1 ? 'review' : 'reviews'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8C8075] mt-0.5">
                          100% of verified clients recommend this formulation
                        </p>
                      </div>

                      <button
                        id="toggle-write-review-form-btn"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F1B18] text-[#FAF8F5] hover:bg-[#342F2A] text-[11px] font-semibold tracking-wider uppercase rounded-lg shadow-2xs transition-all"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{showReviewForm ? 'Close Form' : 'Write a Review'}</span>
                      </button>
                    </div>

                    {/* LIVE REVIEW SUBMISSION FORM */}
                    {showReviewForm && (
                      <form 
                        onSubmit={handleReviewSubmit}
                        className="bg-white p-4 rounded-xl border border-[#DECDBE] shadow-xs space-y-3 animate-fadeIn"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
                          <h4 className="font-serif-luxury text-sm font-medium text-[#1A1817]">
                            Leave a Verified Client Review
                          </h4>
                          <span className="text-[10px] text-[#8C8075] uppercase tracking-wider">
                            Live Customer Feedback
                          </span>
                        </div>

                        {/* Interactive Star Picker */}
                        <div>
                          <label className="block text-[11px] font-medium text-[#4A423B] mb-1">
                            Your Rating *
                          </label>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setNewRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(null)}
                                className="p-1 transition-transform hover:scale-110 focus:outline-none"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= (hoverRating ?? newRating)
                                      ? 'fill-[#D4AF37] text-[#D4AF37]'
                                      : 'text-[#DDD5C9]'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-xs font-semibold text-[#8C6B3E]">
                              {newRating === 5 ? '5 Stars - Exceptional' : `${newRating} Stars`}
                            </span>
                          </div>
                        </div>

                        {/* Name & Skin Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-medium text-[#4A423B] mb-1">
                              Your Name / Alias *
                            </label>
                            <input
                              type="text"
                              required
                              value={reviewerName}
                              onChange={(e) => setReviewerName(e.target.value)}
                              placeholder="e.g. Isabelle G."
                              className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DED7CE] rounded-lg focus:outline-none focus:border-[#C5A880]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#4A423B] mb-1">
                              Skin Profile
                            </label>
                            <select
                              value={reviewSkinType}
                              onChange={(e) => setReviewSkinType(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DED7CE] rounded-lg focus:outline-none focus:border-[#C5A880]"
                            >
                              <option value="All Skin Types">All Skin Types</option>
                              <option value="Sensitive">Sensitive</option>
                              <option value="Dry & Dehydrated">Dry & Dehydrated</option>
                              <option value="Combination">Combination</option>
                              <option value="Mature / Barrier Deficient">Mature / Barrier Deficient</option>
                              <option value="Oily & Blemish-Prone">Oily & Blemish-Prone</option>
                            </select>
                          </div>
                        </div>

                        {/* Review Title */}
                        <div>
                          <label className="block text-[11px] font-medium text-[#4A423B] mb-1">
                            Review Headline *
                          </label>
                          <input
                            type="text"
                            required
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            placeholder="e.g. Visible firmness and glass-skin radiance within 3 days"
                            className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DED7CE] rounded-lg focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>

                        {/* Review Body */}
                        <div>
                          <label className="block text-[11px] font-medium text-[#4A423B] mb-1">
                            Your Experience & Ritual Notes *
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share how this formulation performed, texture feel, scent, and results on your skin..."
                            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DED7CE] rounded-lg focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>

                        {/* Recommend toggle */}
                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#524B44]">
                            <input
                              type="checkbox"
                              checked={recommendProduct}
                              onChange={(e) => setRecommendProduct(e.target.checked)}
                              className="rounded border-[#D5CBC0] text-[#1F1B18] focus:ring-[#C5A880]"
                            />
                            <span>I recommend this botanical formulation to fellow clients</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowReviewForm(false)}
                              className="px-3 py-1.5 text-xs text-[#7A7066] hover:text-black"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              id="submit-product-review-btn"
                              className="px-4 py-1.5 bg-[#1F1B18] hover:bg-[#38322D] text-white text-xs font-medium tracking-wider uppercase rounded-lg transition-all"
                            >
                              Publish Review
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* REVIEWS LIST */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {productReviews.length === 0 ? (
                        <div className="text-center py-6 bg-white rounded-xl border border-dashed border-[#DDD4C7] p-4">
                          <p className="text-xs text-[#7A7066] mb-2 font-light">
                            No reviews published yet for this formulation.
                          </p>
                          <button
                            onClick={() => setShowReviewForm(true)}
                            className="text-xs text-[#8C6B3E] font-medium underline underline-offset-4"
                          >
                            Be the first customer to leave a review
                          </button>
                        </div>
                      ) : (
                        productReviews.map((rev) => (
                          <div 
                            key={rev.id}
                            className="bg-white p-3.5 rounded-xl border border-[#EAE3D8] space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#1F1B18] text-[#D4AF37] text-[10px] font-bold flex items-center justify-center">
                                  {rev.customerName.charAt(0)}
                                </div>
                                <span className="text-xs font-semibold text-[#1A1817]">{rev.customerName}</span>
                                {rev.verifiedPurchase && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Verified Buyer</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#9E9388]">{rev.date}</span>
                            </div>

                            <div className="flex items-center gap-2">
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
                              {rev.skinType && (
                                <span className="text-[10px] px-2 py-0.2 bg-[#F5EFE9] text-[#7A6F64] rounded-full font-medium">
                                  {rev.skinType}
                                </span>
                              )}
                            </div>

                            <h5 className="text-xs font-semibold text-[#2C2723]">
                              {rev.title}
                            </h5>

                            <p className="text-xs text-[#524B44] leading-relaxed font-light">
                              {rev.comment}
                            </p>

                            {rev.recommend && (
                              <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                                <ThumbsUp className="w-3 h-3" />
                                <span>Recommends this formulation</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#EAE4DC] space-y-3">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#D8CFC5] rounded-lg bg-white px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-1 text-[#4A433D] hover:text-black disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-1 text-[#4A433D] hover:text-black disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                id="modal-add-to-cart-btn"
                disabled={isOutOfStock}
                onClick={handleAdd}
                className={`flex-1 py-3 px-3 sm:px-4 text-xs font-semibold tracking-wider uppercase rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-[#E5DFD7] text-[#9C9288] cursor-not-allowed'
                    : 'bg-[#1F1B18] hover:bg-[#342F2B] text-white shadow-sm'
                }`}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span className="truncate">{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </button>

              {/* Instant Buy Now button */}
              {!isOutOfStock && onBuyNow && (
                <button
                  id="modal-buy-now-btn"
                  onClick={() => {
                    onBuyNow(product, quantity);
                    onClose();
                  }}
                  className="flex-1 py-3 px-3 sm:px-4 text-xs font-bold tracking-wider uppercase rounded-lg flex items-center justify-center gap-1.5 transition-all bg-[#D4AF37] hover:bg-[#C29E2E] text-[#1F1B18] shadow-sm cursor-pointer"
                  title="Instant Checkout"
                >
                  <Zap className="w-4 h-4 fill-[#1F1B18] shrink-0" />
                  <span className="truncate">Buy Now • {formatCurrency(discountedPrice * quantity)}</span>
                </button>
              )}

              {/* Wishlist */}
              <button
                id="modal-wishlist-toggle"
                onClick={() => onToggleWishlist(product)}
                className="p-3 border border-[#D8CFC5] rounded-lg bg-white hover:bg-[#F7F2EB] text-[#2C2723] hover:text-[#B85D3B] transition-all"
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#B85D3B] text-[#B85D3B]' : ''}`} />
              </button>

              {/* Direct share product link */}
              <button
                onClick={handleCopyLink}
                className="p-3 border border-[#D8CFC5] rounded-lg bg-white hover:bg-[#F7F2EB] text-[#2C2723] transition-all"
                title="Copy direct product link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Direct Link status */}
            {copied && (
              <p className="text-[11px] text-center text-emerald-700 font-medium">
                Product link copied to clipboard!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
