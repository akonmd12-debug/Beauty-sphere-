import React, { useState } from 'react';
import { ShieldCheck, ShoppingBag, Lock, UserCheck, ShieldAlert, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { AppRoute, getRoutePath } from '../utils/router';
import { UserRole } from '../types';

interface RouteSwitcherBarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  currentRole: UserRole | null;
  isAdminAuthenticated: boolean;
  currentUserDisplayName?: string;
}

export const RouteSwitcherBar: React.FC<RouteSwitcherBarProps> = ({
  currentRoute,
  onNavigate,
  currentRole,
  isAdminAuthenticated,
  currentUserDisplayName,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div className="fixed top-2 right-2 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141210]/95 hover:bg-[#241F1B] text-[#D4AF37] border border-[#3E342B] rounded-full text-xs font-semibold shadow-xl backdrop-blur-sm transition-all cursor-pointer"
          title="Expand Access Control & Route Switcher"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Access Control Bar</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#A89D91]" />
        </button>
      </div>
    );
  }

  return (
    <div
      id="protected-route-switcher-bar"
      className="bg-[#141210] text-[#EDE5DB] border-b border-[#2C2723] py-2 px-4 text-xs font-sans shadow-xs transition-all z-50"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Left: Active Route & Context Indicator */}
        <div className="flex items-center gap-2 flex-wrap text-center md:text-left justify-center md:justify-start">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#2B241E] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
            <span>Access Control Guard</span>
          </span>
          <span className="text-[#A89D91]">
            URL:
          </span>
          <span className="font-mono font-bold text-white bg-black/50 px-2 py-0.5 rounded border border-[#3D352E]">
            {getRoutePath(currentRoute)}
          </span>

          <span className="hidden sm:inline text-[#665D54]">•</span>

          {currentRole === 'admin' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Logged In: <strong>Master Administrator</strong> (Root Authority)</span>
            </span>
          )}

          {currentRole === 'merchant_moderator' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-blue-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              <span>Logged In: <strong>Sole Merchant / Moderator</strong> (Admin URL Restricted)</span>
            </span>
          )}

          {!currentRole && (
            <span className="text-[11px] text-[#A89D91] inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#8C8075]" />
              <span>Session: <strong className="text-white">Public Customer</strong> (Both Portals Private)</span>
            </span>
          )}
        </div>

        {/* Right: Route Switcher Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-[10px] text-[#8C8075] uppercase font-bold tracking-wider mr-1 hidden lg:inline">
            Direct Route Switcher:
          </span>

          {/* Storefront / */}
          <button
            onClick={() => onNavigate('storefront')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              currentRoute === 'storefront'
                ? 'bg-[#FAF3E8] text-[#1F1B18] font-bold shadow-xs'
                : 'bg-[#241F1B] text-[#D1C7BD] hover:bg-[#342D27] hover:text-white border border-[#3A332C]'
            }`}
            title="Public Boutique Storefront (Path: /)"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Storefront (/)</span>
          </button>

          {/* Secret Admin Portal /admin-dashboard */}
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              currentRoute === 'admin-dashboard'
                ? 'bg-amber-400 text-black font-bold shadow-xs'
                : 'bg-[#241F1B] text-amber-300 hover:bg-[#342D27] hover:text-amber-200 border border-amber-900/50'
            }`}
            title={
              currentRole === 'merchant_moderator'
                ? "Restricted! Clicking this will trigger the Access Denied Guard"
                : "Secret Admin Portal: Master Administrator only (/admin-dashboard)"
            }
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Secret Admin Portal (/admin-dashboard)</span>
            {currentRole === 'merchant_moderator' && (
              <span className="text-[9px] uppercase font-bold bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800 flex items-center gap-0.5">
                <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />
                <span>Restricted</span>
              </span>
            )}
          </button>

          {/* Sole Merchant Portal /merchant-login */}
          <button
            onClick={() => onNavigate('merchant-login')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
              currentRoute === 'merchant-login'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-[#241F1B] text-blue-300 hover:bg-[#342D27] hover:text-blue-200 border border-blue-900/50'
            }`}
            title="Sole Merchant Portal: View customer orders & product management (Path: /merchant-login)"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold">Merchant Portal (/merchant-login)</span>
          </button>

          {/* Minimize toggle */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-[#8C8075] hover:text-white transition-colors cursor-pointer ml-1"
            title="Minimize Bar"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

