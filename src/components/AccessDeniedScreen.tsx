import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, ArrowRight, UserCheck, AlertTriangle, KeyRound, ExternalLink, ShieldCheck } from 'lucide-react';
import { AuthUser } from '../types';
import { AppRoute } from '../utils/router';

interface AccessDeniedScreenProps {
  user: AuthUser;
  targetRoute: AppRoute;
  onNavigateMerchant: () => void;
  onNavigateStorefront: () => void;
  onSwitchToAdminLogin: () => void;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  user,
  targetRoute,
  onNavigateMerchant,
  onNavigateStorefront,
  onSwitchToAdminLogin,
}) => {
  return (
    <div className="min-h-screen bg-[#0F0C0A] text-[#FAF8F5] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-rose-900 selection:text-white">
      {/* Background warning grid/ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-950/40 via-[#140F0C]/80 to-[#0A0807] pointer-events-none"></div>
      
      {/* Subtle diagonal hazard pattern at top edge */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600"></div>

      {/* Top Breadcrumb Nav */}
      <div className="max-w-xl w-full mb-4 flex items-center justify-between text-xs text-[#A89D91] relative z-10">
        <button
          onClick={onNavigateStorefront}
          className="flex items-center gap-1.5 text-[#D1C7BD] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Storefront</span>
        </button>
        <span className="font-mono text-[11px] px-2.5 py-0.5 bg-rose-950/80 border border-rose-800 text-rose-300 font-bold rounded">
          HTTP 403: Forbidden Access
        </span>
      </div>

      {/* Access Denied Container Card */}
      <div className="max-w-xl w-full bg-[#181311] border-2 border-rose-600/70 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        {/* Header Visual with Alert Badge */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-500 flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <ShieldAlert className="w-9 h-9 text-rose-400" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3 text-rose-400" />
              <span>Access Control Restriction</span>
            </div>
            
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Access Denied
            </h1>
            
            <p className="text-sm text-rose-200/90 font-medium">
              Merchant Accounts Cannot Access the Admin URL (<code className="font-mono text-rose-300 bg-black/40 px-1.5 py-0.5 rounded text-xs">/admin-dashboard</code>)
            </p>
          </div>
        </div>

        {/* Diagnostic Role Matrix */}
        <div className="bg-[#221A17] border border-[#3C2E28] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#352923]">
            <span className="text-[#A3968A] font-medium">Active Authenticated User:</span>
            <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-[#4A3B33]">
              {user.email}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-2.5 bg-blue-950/40 border border-blue-900/60 rounded-xl">
              <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider block mb-0.5">
                Your Current Role
              </span>
              <div className="flex items-center gap-1.5 text-blue-200 font-bold">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>Sole Merchant / Moderator</span>
              </div>
              <p className="text-[10px] text-blue-300/80 mt-1">
                Authorized for product catalog & customer orders only.
              </p>
            </div>

            <div className="p-2.5 bg-rose-950/40 border border-rose-900/60 rounded-xl">
              <span className="text-[10px] text-rose-300 uppercase font-bold tracking-wider block mb-0.5">
                Required Role for URL
              </span>
              <div className="flex items-center gap-1.5 text-rose-200 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Master Administrator</span>
              </div>
              <p className="text-[10px] text-rose-300/80 mt-1">
                Exclusive authority over site settings, domain URL, and credentials.
              </p>
            </div>
          </div>

          {/* Policy Explanation */}
          <div className="p-3 bg-[#1C1513] rounded-xl border border-rose-900/40 text-[11px] text-[#C9BEB4] leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold mb-0.5">
                Strict Access Control Enforcement
              </strong>
              To safeguard the boutique's confidential domain configuration, user database schemas, and BCrypt security credentials, store moderators and merchants are barred from the Master Admin URL.
            </div>
          </div>
        </div>

        {/* Security Incident Note */}
        <div className="text-[11px] text-[#8C8075] flex items-center justify-between px-1">
          <span>Security Audit Trail: <strong>Event #SEC-403-LOGGED</strong></span>
          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
            System Protected
          </span>
        </div>

        {/* Clear Action Directives */}
        <div className="space-y-2.5 pt-1">
          {/* Primary Action: Go to Merchant Portal */}
          <button
            onClick={onNavigateMerchant}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-blue-200" />
            <span>Go to Sole Merchant Portal (/merchant-login)</span>
            <ArrowRight className="w-4 h-4 text-blue-200" />
          </button>

          {/* Secondary Option: Switch to Admin Account */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onSwitchToAdminLogin}
              className="py-2.5 bg-[#26201B] hover:bg-[#382F27] text-amber-300 border border-[#4D4033] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Login as Admin</span>
            </button>

            <button
              onClick={onNavigateStorefront}
              className="py-2.5 bg-[#221C18] hover:bg-[#2F2722] text-[#D1C7BD] hover:text-white border border-[#3A322B] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
