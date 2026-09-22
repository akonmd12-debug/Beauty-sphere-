import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, ArrowLeft, UserCheck, AlertCircle, Sparkles, Check, Eye, EyeOff } from 'lucide-react';
import { authenticateAdmin, getAdminUser } from '../utils/auth';
import { AuthUser, UserRole } from '../types';

interface AdminPortalGateProps {
  onLoginSuccess: (user: AuthUser, role: UserRole) => void;
  onNavigateHome: () => void;
  onNavigateMerchant: () => void;
}

export const AdminPortalGate: React.FC<AdminPortalGateProps> = ({
  onLoginSuccess,
  onNavigateHome,
  onNavigateMerchant,
}) => {
  const currentAdmin = getAdminUser();
  const [identifier, setIdentifier] = useState(currentAdmin?.username || 'akonmd12@gmail.com');
  const [password, setPassword] = useState(currentAdmin?.passwordChangedAt ? '' : '00998877');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedQuick, setCopiedQuick] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifying(true);

    setTimeout(() => {
      const res = authenticateAdmin(identifier, password);
      setIsVerifying(false);

      if (res.success && res.user && res.role) {
        onLoginSuccess(res.user, res.role);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Only authorized Master Administrator can log in.');
      }
    }, 250);
  };

  const handleQuickFill = () => {
    const admin = getAdminUser();
    setIdentifier(admin?.username || 'akonmd12@gmail.com');
    if (admin?.passwordChangedAt) {
      setPassword('');
      setCopiedQuick(true);
      setTimeout(() => setCopiedQuick(false), 3000);
    } else {
      setPassword('00998877');
      setCopiedQuick(true);
      setTimeout(() => setCopiedQuick(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#120F0D] text-[#FAF8F5] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#382E25]/40 via-transparent to-transparent pointer-events-none"></div>

      {/* Secret Route Identification Banner */}
      <div className="max-w-md w-full mb-4 flex items-center justify-between text-xs text-[#A89D91]">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 text-[#D1C7BD] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Storefront</span>
        </button>
        <span className="font-mono text-[11px] px-2 py-0.5 bg-[#26201B] border border-[#3E342D] rounded text-amber-300 font-bold">
          Secret Path: /admin-dashboard
        </span>
      </div>

      {/* Main Gate Card */}
      <div className="max-w-md w-full bg-[#1C1815] border border-[#3E342B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        {/* Header Visual */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8 text-[#D4AF37]" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Master Administrator Access</span>
            </div>
            <h1 className="font-serif-luxury text-2xl font-bold tracking-wide text-white">
              Admin Portal
            </h1>
            <p className="text-xs text-[#A89D91] leading-relaxed">
              Full control over website configuration, root store domain, user roles, and security credentials.
            </p>
          </div>
        </div>

        {/* Privileges Highlights & Privacy Warning */}
        <div className="bg-[#241F1B] p-3.5 rounded-2xl border border-[#383028] text-xs space-y-2">
          <div className="p-2 bg-amber-950/40 border border-amber-800/40 rounded-xl text-[11px] text-amber-200/90 leading-snug">
            <strong className="text-amber-300 block font-semibold mb-0.5">
              🔒 Private Restricted Zone — Boutique Owner Only
            </strong>
            This portal is strictly private. Public customers and store visitors have zero access to administrative records, server configurations, or financial summaries.
          </div>

          <span className="font-bold text-[10px] uppercase tracking-wider text-[#D4AF37] block pt-1">
            Admin Authority Scope:
          </span>
          <ul className="space-y-1 text-[#C7BDB3] text-[11px]">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              <span>Root Domain & Storefront URL Configuration</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              <span>User Roles Management & BCrypt Password Encryption</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              <span>Full Product Inventory, Client Orders & Review Moderation</span>
            </li>
          </ul>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#C7BDB3] mb-1">
              Admin Identifier (Username or Email):
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. akonmd12@gmail.com"
              className="w-full px-3.5 py-2.5 bg-[#241F1B] border border-[#3E342B] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-medium"
            />
          </div>

          <div>
            <label className="block font-medium text-[#C7BDB3] mb-1">
              Master Admin Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#241F1B] border border-[#3E342B] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8075] hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick-Fill Helper */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>
                {copiedQuick
                  ? (currentAdmin?.passwordChangedAt ? `Set to ${currentAdmin.username} (Enter your custom password)` : 'Credentials Applied!')
                  : `Fill Current Admin (${currentAdmin?.username || 'akonmd12@gmail.com'})`}
              </span>
            </button>
            <span className="text-[10px] text-[#8C8075] font-mono">BCrypt Blowfish</span>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 bg-[#D4AF37] hover:bg-[#C29E2F] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isVerifying ? 'Verifying BCrypt Hash...' : 'Unlock Admin Portal'}</span>
          </button>
        </form>

        {/* Footer Links */}
        <div className="pt-2 border-t border-[#2C2621] flex items-center justify-between text-xs text-[#8C8075]">
          <span className="text-[11px] text-[#6E6359]">
            BEAUTY SPHERE • Authorized Access Only
          </span>
          <button
            onClick={onNavigateHome}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront (/)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
