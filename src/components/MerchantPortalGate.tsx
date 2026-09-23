import React, { useState } from 'react';
import { UserCheck, Shield, KeyRound, ArrowLeft, Lock, AlertCircle, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { authenticateMerchantModeratorAsync } from '../utils/auth';
import { AuthUser, UserRole } from '../types';

interface MerchantPortalGateProps {
  onLoginSuccess: (user: AuthUser, role: UserRole) => void;
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
}

export const MerchantPortalGate: React.FC<MerchantPortalGateProps> = ({
  onLoginSuccess,
  onNavigateHome,
  onNavigateAdmin,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const res = await authenticateMerchantModeratorAsync(identifier, password);
      setIsVerifying(false);

      if (res.success && res.user && res.role) {
        onLoginSuccess(res.user, res.role);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Only authorized Merchant / Moderator can log in.');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMessage(err?.message || 'Server authentication error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1526] text-[#FAF8F5] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none"></div>

      {/* Route Identification Banner */}
      <div className="max-w-md w-full mb-4 flex items-center justify-between text-xs text-blue-200">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 text-blue-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Storefront</span>
        </button>
        <span className="font-mono text-[11px] px-2.5 py-0.5 bg-blue-950/80 border border-blue-800 rounded text-blue-300 font-bold">
          URL: /merchant
        </span>
      </div>

      {/* Main Gate Card */}
      <div className="max-w-md w-full bg-[#131C33] border border-blue-900/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        {/* Header Visual */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            <UserCheck className="w-8 h-8 text-blue-400" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
              <Shield className="w-3 h-3 text-blue-400" />
              <span>Merchant / Moderator Console</span>
            </div>
            <h1 className="font-serif-luxury text-2xl font-bold tracking-wide text-white">
              Merchant Portal Login
            </h1>
            <p className="text-xs text-blue-200/80 leading-relaxed">
              Authorized operators only. Please sign in with your merchant credentials.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form - Displays clean empty fields only */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-blue-200 mb-1">
              Email or Username:
            </label>
            <input
              type="text"
              required
              id="merchant-login-identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter merchant email or username"
              className="w-full px-3.5 py-2.5 bg-[#18233C] border border-blue-800 rounded-xl text-white placeholder-blue-400/50 focus:outline-none focus:ring-1 focus:ring-blue-400 font-medium"
            />
          </div>

          <div>
            <label className="block font-medium text-blue-200 mb-1">
              Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                id="merchant-login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 bg-[#18233C] border border-blue-800 rounded-xl text-white placeholder-blue-400/50 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="merchant-login-submit-btn"
            disabled={isVerifying}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isVerifying ? 'Authenticating...' : 'Sign In to Merchant Portal'}</span>
          </button>
        </form>

        {/* Footer Links */}
        <div className="pt-2 border-t border-blue-900/60 flex items-center justify-between text-xs text-blue-300/70">
          <span className="text-[11px] text-blue-400/60">
            Sole Merchant Private Session
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
