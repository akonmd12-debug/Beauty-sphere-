import React, { useState } from 'react';
import { 
  Lock, 
  X, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  KeyRound, 
  RefreshCw, 
  UserCheck, 
  Shield, 
  HelpCircle,
  Cpu
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { 
  authenticateAdmin, 
  authenticateMerchantModerator, 
  authenticateAdminAsync,
  authenticateMerchantModeratorAsync,
  changeUserPassword, 
  getDatabaseUsers, 
  getAdminUser,
  getMerchantUser
} from '../utils/auth';
import { saveStoredAdminActive } from '../utils/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user?: AuthUser, role?: UserRole) => void;
  onSuccess?: (user?: AuthUser, role?: UserRole) => void;
  initialRole?: UserRole;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSuccess,
  initialRole = 'admin',
}) => {
  // Selected login tab: 'admin' vs 'merchant_moderator'
  const [selectedRole, setSelectedRole] = useState<'admin' | 'merchant_moderator'>(
    initialRole === 'merchant_moderator' ? 'merchant_moderator' : 'admin'
  );
  
  // Modes: 'login' | 'change-password'
  const [mode, setMode] = useState<'login' | 'change-password'>('login');

  // Admin login credentials (empty by default)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Merchant / Moderator login credentials (empty by default)
  const [merchantUsername, setMerchantUsername] = useState('');
  const [merchantPassword, setMerchantPassword] = useState('');
  const [showMerchantPassword, setShowMerchantPassword] = useState(false);

  // Change password form state
  const [targetAccountRole, setTargetAccountRole] = useState<'admin' | 'merchant_moderator'>('admin');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSuccessCallback = (user?: AuthUser, role?: UserRole) => {
    saveStoredAdminActive(true);
    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess(user, role);
    } else if (typeof onSuccess === 'function') {
      onSuccess(user, role);
    }
  };

  // Submit Admin Login (Server-Side BCrypt Validation)
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const result = await authenticateAdminAsync(adminUsername, adminPassword);
      setIsSubmitting(false);

      if (result.success && result.user) {
        setSuccessMessage(`Welcome back, ${result.user.displayName}! (Role: Administrator)`);
        setAdminPassword('');
        setTimeout(() => {
          handleLoginSuccessCallback(result.user, 'admin');
        }, 300);
      } else {
        setError(result.error || 'Administrator login failed. Passwords are encrypted using bcrypt.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Server validation error occurred.');
    }
  };

  // Submit Merchant / Moderator Login (Server-Side BCrypt Validation)
  const handleMerchantLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const result = await authenticateMerchantModeratorAsync(merchantUsername, merchantPassword);
      setIsSubmitting(false);

      if (result.success && result.user) {
        setSuccessMessage(`Welcome, ${result.user.displayName}! (Role: Sole Merchant / Moderator)`);
        setMerchantPassword('');
        setTimeout(() => {
          handleLoginSuccessCallback(result.user, 'merchant_moderator');
        }, 300);
      } else {
        setError(result.error || 'Merchant/Moderator login failed. Passwords are encrypted using bcrypt.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Server validation error occurred.');
    }
  };

  // Submit Change Password with BCrypt encryption
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long for bcrypt security.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const targetUserId = targetAccountRole === 'admin' ? 'user_admin_master' : 'user_merchant_moderator';
      const roleLabel = targetAccountRole === 'admin' ? 'Administrator' : 'Sole Merchant / Moderator';

      const result = changeUserPassword(targetUserId, oldPassword, newPassword);
      setIsSubmitting(false);

      if (result.success) {
        setSuccessMessage(`${roleLabel} password successfully encrypted and updated via bcrypt! You can now log in.`);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (targetAccountRole === 'admin') {
          setAdminPassword(newPassword);
        } else {
          setMerchantPassword(newPassword);
        }
        setTimeout(() => {
          setSelectedRole(targetAccountRole);
          setMode('login');
        }, 1500);
      } else {
        setError(result.error || 'Failed to update password. Please check your current password.');
      }
    }, 300);
  };

  const users = getDatabaseUsers();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        id="admin-login-modal"
        className="relative bg-[#FAF8F5] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-[#E8DFC8] my-6 flex flex-col"
      >
        {/* Top Brand & Security Header */}
        <div className="bg-[#1F1B18] text-[#FAF8F5] p-5 sm:p-6 pb-6 text-center relative border-b border-[#38312B]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#B5AAA0] hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-[#2D2723] border border-[#443B35] flex items-center justify-center mx-auto mb-2.5 text-[#D4AF37] shadow-inner">
            {mode === 'login' ? (
              selectedRole === 'admin' ? <Shield className="w-6 h-6 text-[#D4AF37]" /> : <UserCheck className="w-6 h-6 text-amber-400" />
            ) : (
              <RefreshCw className="w-6 h-6 text-[#D4AF37]" />
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#D4AF37]">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>BCrypt Encrypted Authentication</span>
          </div>

          <h2 className="font-serif-luxury text-xl sm:text-2xl font-medium tracking-wide mt-1 text-white">
            {mode === 'login' 
              ? (selectedRole === 'admin' ? 'Store Administrator Portal' : 'Sole Merchant & Moderator Portal')
              : 'Change Account Password'}
          </h2>
          <p className="text-xs text-[#C5B9AC] font-light mt-1 max-w-sm mx-auto">
            {mode === 'login'
              ? (selectedRole === 'admin'
                  ? 'Master authority for Akon MD: System settings, boutique domain URL & full credentials.'
                  : 'Operational access: Manage catalog formulations, order fulfillment & customer reviews.')
              : 'Enter current password to securely re-hash and store a new bcrypt-encrypted credential.'}
          </p>

          {/* Primary Role Selector Tabs (Only in Login Mode) */}
          {mode === 'login' && (
            <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-[#12100E] rounded-xl border border-[#3A322C]">
              {/* Tab 1: Administrator */}
              <button
                type="button"
                id="select-admin-role-tab"
                onClick={() => {
                  setSelectedRole('admin');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-[#D4AF37] text-[#1F1B18] shadow-md font-extrabold'
                    : 'text-[#B5AAA0] hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Administrator (Super)</span>
              </button>

              {/* Tab 2: Sole Merchant / Moderator */}
              <button
                type="button"
                id="select-merchant-role-tab"
                onClick={() => {
                  setSelectedRole('merchant_moderator');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'merchant_moderator'
                    ? 'bg-[#D4AF37] text-[#1F1B18] shadow-md font-extrabold'
                    : 'text-[#B5AAA0] hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Merchant / Moderator</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: ADMINISTRATOR LOGIN FORM */}
          {/* ========================================================= */}
          {mode === 'login' && selectedRole === 'admin' && (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A423A] mb-1">
                  Email or Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  id="admin-username-input"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter admin email or username"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D5CABE] rounded-xl text-[#1A1817] placeholder-[#9E948A] focus:outline-none focus:border-[#1F1B18] focus:ring-1 focus:ring-[#1F1B18]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A423A]">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetAccountRole('admin');
                      setMode('change-password');
                      setError(null);
                    }}
                    className="text-[11px] text-[#8C6B3E] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Change Admin Password?</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    id="admin-password-input"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border border-[#D5CABE] rounded-xl text-[#1A1817] placeholder-[#9E948A] focus:outline-none focus:border-[#1F1B18] focus:ring-1 focus:ring-[#1F1B18]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7066] hover:text-black p-1 cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="submit-admin-login-btn"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#1F1B18] hover:bg-[#342E29] text-white text-xs font-semibold uppercase tracking-[0.18em] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-[#D4AF37]" />
                    <span>Log In as Administrator</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SOLE MERCHANT & MODERATOR LOGIN FORM */}
          {/* ========================================================= */}
          {mode === 'login' && selectedRole === 'merchant_moderator' && (
            <form onSubmit={handleMerchantLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A423A] mb-1">
                  Email or Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  id="merchant-username-input"
                  value={merchantUsername}
                  onChange={(e) => setMerchantUsername(e.target.value)}
                  placeholder="Enter merchant email or username"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D5CABE] rounded-xl text-[#1A1817] placeholder-[#9E948A] focus:outline-none focus:border-[#1F1B18] focus:ring-1 focus:ring-[#1F1B18]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A423A]">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetAccountRole('merchant_moderator');
                      setMode('change-password');
                      setError(null);
                    }}
                    className="text-[11px] text-[#8C6B3E] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Change Merchant Password?</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showMerchantPassword ? 'text' : 'password'}
                    required
                    id="merchant-password-input"
                    value={merchantPassword}
                    onChange={(e) => {
                      setMerchantPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border border-[#D5CABE] rounded-xl text-[#1A1817] placeholder-[#9E948A] focus:outline-none focus:border-[#1F1B18] focus:ring-1 focus:ring-[#1F1B18]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMerchantPassword(!showMerchantPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7066] hover:text-black p-1 cursor-pointer"
                  >
                    {showMerchantPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="submit-merchant-login-btn"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#1F1B18] hover:bg-[#342E29] text-white text-xs font-semibold uppercase tracking-[0.18em] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Verifying BCrypt Hash...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>Log In as Merchant / Moderator</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CHANGE PASSWORD (BCRYPT ENCRYPTED) */}
          {/* ========================================================= */}
          {mode === 'change-password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A423A] mb-1.5">
                  Select Account Role to Update
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetAccountRole('admin')}
                    className={`py-2 px-3 text-xs rounded-xl font-medium border transition-all ${
                      targetAccountRole === 'admin'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    Administrator Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetAccountRole('merchant_moderator')}
                    className={`py-2 px-3 text-xs rounded-xl font-medium border transition-all ${
                      targetAccountRole === 'merchant_moderator'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    Merchant / Moderator
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A423A] mb-1">
                  Current (Old) Password *
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border border-[#D5CABE] rounded-xl text-[#1A1817] focus:outline-none focus:border-[#1F1B18] focus:ring-1 focus:ring-[#1F1B18]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7066] hover:text-black p-1"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A423A] mb-1">
                  New Password (Encrypted with BCrypt) *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters..."
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border border-[#D5CABE] rounded-xl text-[#1A1817] focus:outline-none focus:border-[#1F1B18] focus:ring-1 focus:ring-[#1F1B18]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7066] hover:text-black p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A423A] mb-1">
                  Confirm New Password *
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D5CABE] rounded-xl text-[#1A1817] focus:outline-none focus:border-[#1F1B18] focus:ring-1 focus:ring-[#1F1B18]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="flex-1 py-2.5 px-3 bg-white border border-[#D5CABE] text-[#4A423A] hover:bg-[#F2ECE5] text-xs font-medium uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-2.5 px-4 bg-[#1F1B18] hover:bg-[#342E29] text-white text-xs font-semibold uppercase tracking-[0.16em] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Encrypting & Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Update with BCrypt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Back to storefront link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#736B63] hover:text-[#1A1817] font-medium cursor-pointer"
            >
              ← Back to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
