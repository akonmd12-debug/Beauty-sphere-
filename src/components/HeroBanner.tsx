import React from 'react';
import { Sparkles, ShieldCheck, Leaf, Award, ArrowRight, ExternalLink } from 'lucide-react';

interface HeroBannerProps {
  onShopClick: () => void;
  onOffersClick?: () => void;
  onOpenAccountLink: () => void;
  websiteUrl?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onShopClick,
  onOpenAccountLink
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F5EFE9] to-[#FAF8F5] py-14 md:py-24 border-b border-[#EAE5DF]">
      {/* Subtle organic luxury ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#E8DFD3]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Subtle prestige tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE6DE] border border-[#DDD4C7] text-[#4A423C] text-[11px] font-medium tracking-[0.2em] uppercase mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Curated Korean & Chinese Luxury Beauty</span>
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-5xl md:text-6xl text-[#1A1817] font-normal leading-[1.14] tracking-tight mb-8">
            Hanbang Herbal Science & Imperial Court Botanicals
          </h2>

          {/* Action CTAs: Explore Boutique & Boutique Link & Profile */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-5 mb-4">
            <button
              id="hero-shop-collection-btn"
              onClick={onShopClick}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1F1B18] text-[#FAF8F5] hover:bg-[#342E29] text-xs font-semibold tracking-[0.18em] uppercase rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span>Explore Boutique</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-share-website-btn"
              onClick={onOpenAccountLink}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#EBE3D8] hover:bg-[#DFD5C8] text-[#2C2723] border border-[#CFC3B3] text-xs font-semibold tracking-wider uppercase rounded-full transition-all shadow-2xs cursor-pointer"
              title="View Store Link in Profile Settings"
            >
              <ExternalLink className="w-4 h-4 text-[#8C6B3E]" />
              <span>Boutique Link & Profile</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars of Luxury Guarantee */}
        <div className="mt-14 pt-10 border-t border-[#EAE5DF] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#EAE2D8] flex items-center justify-center mb-2.5 text-[#8C6B3E]">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1F1B18]">🇰🇷 Korean Hanbang</h4>
            <p className="text-[11px] text-[#7A7169] mt-0.5">Fermented red ginseng & cica ferments</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#EAE2D8] flex items-center justify-center mb-2.5 text-[#8C6B3E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1F1B18]">🇨🇳 Imperial Botanicals</h4>
            <p className="text-[11px] text-[#7A7169] mt-0.5">Snow lotus, pearl & Lingzhi reishi</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#EAE2D8] flex items-center justify-center mb-2.5 text-[#8C6B3E]">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1F1B18]">100% Authentic Imports</h4>
            <p className="text-[11px] text-[#7A7169] mt-0.5">Direct verified laboratory batches</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#EAE2D8] flex items-center justify-center mb-2.5 text-[#8C6B3E]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1F1B18]">Glass Skin Radiance</h4>
            <p className="text-[11px] text-[#7A7169] mt-0.5">Hydration barrier repair & glow</p>
          </div>
        </div>
      </div>
    </section>
  );
};
