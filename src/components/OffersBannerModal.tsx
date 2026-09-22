import React, { useState } from 'react';
import { X, Tag, Sparkles, Check, Copy } from 'lucide-react';
import { OfferDiscount } from '../types';
import { formatCurrency } from '../utils/storage';

interface OffersBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  offers: OfferDiscount[];
  onApplyCode: (code: string) => void;
}

export const OffersBannerModal: React.FC<OffersBannerModalProps> = ({
  isOpen,
  onClose,
  offers,
  onApplyCode,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    onApplyCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const activeOffers = offers.filter(o => o.isActive);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        id="offers-modal-container"
        className="relative bg-[#FAF8F5] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-[#E8DFD3] my-6 flex flex-col"
      >
        <div className="px-6 py-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif-luxury text-xl font-medium text-[#1A1817]">
              Current Boutique Privileges & Offers
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#736A61] hover:text-black rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-[#5C534B] font-light">
            Enjoy exclusive seasonal savings applied directly during checkout. Click any code below to copy and apply automatically to your bag.
          </p>

          <div className="space-y-3">
            {activeOffers.map((offer) => (
              <div 
                key={offer.id}
                className="bg-white border border-[#E5DDD2] rounded-xl p-4 flex items-center justify-between shadow-2xs hover:border-[#C5A880] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#F4EDE5] px-2.5 py-1 rounded text-[#1A1817] border border-[#DDD3C7]">
                      {offer.code}
                    </span>
                    <span className="text-xs font-bold text-[#8C6B3E]">
                      {offer.discountPercent}% OFF
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#1A1817] mt-1.5">{offer.title}</h4>
                  <p className="text-[11px] text-[#7A7169]">
                    Applies on orders over {formatCurrency(offer.minimumOrder)}
                  </p>
                </div>

                <button
                  onClick={() => handleCopyCode(offer.code)}
                  className="px-3 py-1.5 bg-[#1F1B18] hover:bg-[#38312B] text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all"
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <p className="text-[11px] text-center text-[#8C8075]">
              Plus, all acquisitions over ৳1,500 include complimentary white-glove signature shipping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
