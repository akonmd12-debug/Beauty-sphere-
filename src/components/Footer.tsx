import React, { useState } from 'react';
import { 
  Sparkles, 
  Share2, 
  Check, 
  ExternalLink, 
  Mail, 
  ArrowUpRight,
  User,
  MessageCircle,
  Send,
  Phone,
  Copy,
  Clock
} from 'lucide-react';
import { UserProfile } from '../types';
import { AppRoute } from '../utils/router';

interface FooterProps {
  userProfile: UserProfile;
  onOpenAccount: (tab?: string) => void;
  onOpenAdmin: () => void;
  onOpenAdminProfile?: () => void;
  websiteUrl: string;
  onNavigateRoute?: (route: AppRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({
  userProfile,
  onOpenAccount,
  onOpenAdmin,
  onOpenAdminProfile,
  websiteUrl,
  onNavigateRoute,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const currentUrl = websiteUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const whatsappNumber = userProfile.whatsapp || userProfile.phone || '+1 (555) 382-9011';
  const cleanWhatsappNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const emailAddress = userProfile.email || userProfile.supportEmail || 'akonmd12@gmail.com';
  const telegramHandle = userProfile.telegram || '@beautysphereshop';
  const cleanTelegramHandle = telegramHandle.replace(/^@/, '');

  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber || '15553829011'}?text=Hello%20BEAUTY%20SPHERE%20SHOP%2C%20I%20would%20like%20to%20inquire%20about%20your%20luxury%20skincare%20formulations.`;
  const emailUrl = `mailto:${emailAddress}?subject=Inquiry%20-%20BEAUTY%20SPHERE%20SHOP`;
  const telegramUrl = `https://t.me/${cleanTelegramHandle || 'beautysphereshop'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyContact = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContact(type);
    setTimeout(() => setCopiedContact(null), 2500);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 3500);
    }
  };

  return (
    <footer id="boutique-footer" className="bg-[#191614] text-[#EDE7E1] pt-16 pb-12 border-t border-[#2E2823]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Direct Website URL Banner in Footer */}
        <div className="bg-[#241F1B] border border-[#3A332C] rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>BEAUTY SPHERE SHOP • Direct Storefront URL</span>
            </div>
            <p className="text-xs text-[#B8ADA2] font-light">
              Bookmark or share this direct boutique link so your clients can easily find your collection:
            </p>
            <p className="font-mono text-xs text-white mt-1 select-all break-all">
              {currentUrl}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              id="footer-copy-site-link"
              onClick={handleCopyLink}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#C29E2E] text-[#1F1B18] text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied!" : "Copy Boutique Link"}</span>
            </button>

            <button
              onClick={() => onOpenAccount('website-link')}
              className="px-3.5 py-2.5 bg-[#332B25] hover:bg-[#423932] text-white border border-[#4D4238] rounded-xl text-xs flex items-center gap-1.5 transition-all"
              title="Open Profile Settings & Link Details"
            >
              <User className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Profile Settings</span>
            </button>
          </div>
        </div>

        {/* 4 Column Layout: Manifesto, Collections, Concierge & Gazette */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2E2823]">
          {/* Brand Manifesto */}
          <div className="space-y-3">
            <h3 className="font-serif-luxury text-2xl tracking-widest text-white">
              BEAUTY SPHERE
            </h3>
            <p className="text-xs text-[#A89D93] leading-relaxed font-light">
              Haute K-Beauty & C-Beauty Skincare • Hanbang & Imperial Phyto-Cosmetic Formulations. 
              Authentically imported direct from certified bio-cellular laboratories in Seoul, Jeju Island, Hangzhou, and Yunnan.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="text-[11px] text-[#D4AF37] hover:underline uppercase tracking-wider font-semibold"
              >
                Access Merchant Admin Portal →
              </button>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="space-y-3 text-xs text-[#B8ADA2]">
            <h4 className="font-serif-luxury text-sm uppercase tracking-[0.2em] text-white">Asian Formulations</h4>
            <ul className="space-y-2 font-light">
              <li><a href="#products-section" className="hover:text-white transition-colors">Korean Hanbang Essences</a></li>
              <li><a href="#products-section" className="hover:text-white transition-colors">Centella & Barrier Creams</a></li>
              <li><a href="#products-section" className="hover:text-white transition-colors">Imperial Herbal Oils & Balms</a></li>
              <li><a href="#products-section" className="hover:text-white transition-colors">Joseon Rice Sun Care SPF 50+</a></li>
              <li><a href="#products-section" className="hover:text-white transition-colors">Bio-Ferment & Sheet Masks</a></li>
            </ul>
          </div>

          {/* Account & Concierge Links */}
          <div className="space-y-3 text-xs text-[#B8ADA2]">
            <h4 className="font-serif-luxury text-sm uppercase tracking-[0.2em] text-white">Client Concierge</h4>
            <ul className="space-y-2 font-light">
              <li>
                <button onClick={() => onOpenAccount('profile')} className="hover:text-white transition-colors text-left">
                  Account & Profile Settings
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAccount('website-link')} className="hover:text-white transition-colors text-left flex items-center gap-1">
                  <span>Store Direct Website Link</span>
                  <ArrowUpRight className="w-3 h-3 text-[#D4AF37]" />
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAccount('orders')} className="hover:text-white transition-colors text-left">
                  Track Delivery & Order History
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAccount('wishlist')} className="hover:text-white transition-colors text-left">
                  Saved Ritual Wishlist
                </button>
              </li>
              <li className="pt-1">
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 text-[#D4AF37] hover:text-white transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp: {whatsappNumber}</span>
                </a>
              </li>
              <li>
                <a 
                  href={emailUrl} 
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="truncate">{emailAddress}</span>
                </a>
              </li>
              <li>
                <a 
                  href={telegramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Telegram: {telegramHandle}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* VIP Newsletter Registration */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury text-sm uppercase tracking-[0.2em] text-white">The Sphere Gazette</h4>
            <p className="text-xs text-[#A89D93] font-light leading-relaxed">
              Receive private invitations to limited seasonal reserves, botanical harvest notes, and VIP member privileges.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your personal email..."
                  className="w-full px-3 py-2 text-xs bg-[#241F1B] border border-[#3A332C] rounded-lg text-white placeholder-[#786E64] focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-white text-[#191614] hover:bg-[#EAE3D8] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shrink-0"
                >
                  Join
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-emerald-400 font-medium">
                  Welcome to the Sphere Gazette inner circle.
                </p>
              )}
            </form>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#8C8075]">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Concierge Hours: 24/7 Global Response</span>
            </div>
          </div>
        </div>

        {/* Dedicated Luxury Contact Info Section (WhatsApp, Email, Telegram) */}
        <div id="footer-contact-channels" className="py-10 border-b border-[#2E2823]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#D4AF37]">
                Instant Concierge & Direct Inquiries
              </span>
              <h4 className="font-serif-luxury text-xl sm:text-2xl text-white font-normal mt-0.5">
                Connect Directly With Beauty Sphere Shop
              </h4>
            </div>
            <p className="text-xs text-[#A89D93] font-light max-w-sm">
              Reach our private skincare concierge team immediately via your preferred channel for personalized consultations or order support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WhatsApp Contact Card */}
            <div 
              id="contact-channel-whatsapp"
              className="bg-[#241F1B] hover:bg-[#2B2520] border border-[#3A332C] hover:border-[#4D4238] rounded-2xl p-5 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20">
                    Live Chat
                  </span>
                </div>
                <h5 className="font-serif-luxury text-base text-white font-medium">WhatsApp Concierge</h5>
                <p className="text-xs text-[#A89D93] mt-1 font-light leading-relaxed">
                  Real-time advice on botanical rituals, custom formulation matches, and private order dispatch.
                </p>
                <div className="mt-3 py-1.5 px-3 bg-[#191614] rounded-lg font-mono text-xs text-white border border-[#2E2823] flex items-center justify-between">
                  <span className="truncate">{whatsappNumber}</span>
                  <button
                    onClick={() => handleCopyContact(whatsappNumber, 'whatsapp')}
                    className="ml-2 text-[#A89D93] hover:text-[#D4AF37] transition-colors p-1"
                    title="Copy WhatsApp number"
                  >
                    {copiedContact === 'whatsapp' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#332B25] flex items-center gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20BA5A] text-[#12100E] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Email Contact Card */}
            <div 
              id="contact-channel-email"
              className="bg-[#241F1B] hover:bg-[#2B2520] border border-[#3A332C] hover:border-[#4D4238] rounded-2xl p-5 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                    Official Support
                  </span>
                </div>
                <h5 className="font-serif-luxury text-base text-white font-medium">Email Desk</h5>
                <p className="text-xs text-[#A89D93] mt-1 font-light leading-relaxed">
                  Direct written correspondence for detailed regimen recommendations, press, and client concierge.
                </p>
                <div className="mt-3 py-1.5 px-3 bg-[#191614] rounded-lg font-mono text-xs text-white border border-[#2E2823] flex items-center justify-between">
                  <span className="truncate">{emailAddress}</span>
                  <button
                    onClick={() => handleCopyContact(emailAddress, 'email')}
                    className="ml-2 text-[#A89D93] hover:text-[#D4AF37] transition-colors p-1"
                    title="Copy Email address"
                  >
                    {copiedContact === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#332B25] flex items-center gap-2">
                <a
                  href={emailUrl}
                  className="flex-1 py-2 px-3 bg-[#D4AF37] hover:bg-[#C29E2E] text-[#191614] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>

            {/* Telegram Contact Card */}
            <div 
              id="contact-channel-telegram"
              className="bg-[#241F1B] hover:bg-[#2B2520] border border-[#3A332C] hover:border-[#4D4238] rounded-2xl p-5 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 text-[#229ED9] flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#229ED9]/10 text-[#229ED9] border border-[#229ED9]/20">
                    Instant Channel
                  </span>
                </div>
                <h5 className="font-serif-luxury text-base text-white font-medium">Telegram VIP Desk</h5>
                <p className="text-xs text-[#A89D93] mt-1 font-light leading-relaxed">
                  Instant messaging, secret botanical harvest announcements, and priority boutique updates.
                </p>
                <div className="mt-3 py-1.5 px-3 bg-[#191614] rounded-lg font-mono text-xs text-white border border-[#2E2823] flex items-center justify-between">
                  <span className="truncate">{telegramHandle}</span>
                  <button
                    onClick={() => handleCopyContact(telegramHandle, 'telegram')}
                    className="ml-2 text-[#A89D93] hover:text-[#D4AF37] transition-colors p-1"
                    title="Copy Telegram username"
                  >
                    {copiedContact === 'telegram' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#332B25] flex items-center gap-2">
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-[#229ED9] hover:bg-[#1E8BBF] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open Telegram</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright 2026 to 2029 */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C8075] gap-3">
          <p id="footer-copyright-text" className="text-center sm:text-left">
            © 2026 to 2029 BEAUTY SPHERE SHOP. All rights reserved. Sovereign Botanical Formulations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[#8C8075]">
            <button onClick={() => onOpenAccount('website-link')} className="hover:text-white transition-colors">
              Platform Direct URL
            </button>
            <span>•</span>
            {onOpenAdminProfile && (
              <>
                <button onClick={onOpenAdminProfile} className="hover:text-[#D4AF37] text-[#D4AF37]/90 font-medium transition-colors">
                  Admin Profile (Akon MD)
                </button>
                <span>•</span>
              </>
            )}
            <button 
              onClick={() => onNavigateRoute ? onNavigateRoute('merchant-login') : onOpenAdmin()} 
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
              title="Access Sole Merchant & Moderator Console (/merchant-login)"
            >
              Sole Merchant Portal (/merchant-login)
            </button>
            <span>•</span>
            <button 
              onClick={() => onNavigateRoute ? onNavigateRoute('admin-dashboard') : onOpenAdmin()} 
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
              title="Access Master Administrator Portal (/admin-dashboard)"
            >
              Secret Admin Portal (/admin-dashboard)
            </button>
            <span>•</span>
            <button onClick={() => onOpenAccount('profile')} className="hover:text-white transition-colors cursor-pointer">
              Profile Settings
            </button>
            <span>•</span>
            <span className="text-[#A89D93]">Verified Luxury Boutique</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

