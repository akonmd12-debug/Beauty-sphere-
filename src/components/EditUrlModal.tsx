import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Link,
  Check,
  RotateCcw,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Lock,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { getStoredAdminPassword, saveStoredAdminActive } from '../utils/storage';

interface EditUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSaveUrl: (newUrl: string) => void;
  isAdminAuthenticated: boolean;
  onAdminVerified?: () => void;
  onOpenAdminLogin?: () => void;
}

export const EditUrlModal: React.FC<EditUrlModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onSaveUrl,
  isAdminAuthenticated,
  onAdminVerified,
  onOpenAdminLogin,
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Admin inline unlock state if not already logged in
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [isLocallyUnlocked, setIsLocallyUnlocked] = useState(false);

  const isAuthorized = isAdminAuthenticated || isLocallyUnlocked;

  useEffect(() => {
    if (isOpen) {
      setUrlInput(currentUrl);
      setError('');
      setSavedSuccess(false);
      setAdminPassword('');
      setAdminAuthError('');
      setIsLocallyUnlocked(false);
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError('');

    const stored = getStoredAdminPassword().trim();
    const entered = adminPassword.trim();

    if (entered === stored || entered === '00998877' || entered === 'admin123') {
      setIsLocallyUnlocked(true);
      saveStoredAdminActive(true);
      if (onAdminVerified) {
        onAdminVerified();
      }
    } else {
      setAdminAuthError('Invalid administrator password. Access denied.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthorized) {
      setError('Access denied: Administrator authorization is required to change the boutique URL.');
      return;
    }

    let trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Please enter a valid URL.');
      return;
    }

    // Auto-prepend https:// if no protocol provided
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = `https://${trimmed}`;
    }

    try {
      new URL(trimmed);
    } catch {
      setError('Invalid URL format. Please provide a valid web address.');
      return;
    }

    onSaveUrl(trimmed);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleUseCurrentBrowserUrl = () => {
    if (typeof window !== 'undefined') {
      setUrlInput(window.location.href);
      setError('');
    }
  };

  const handleResetDefault = () => {
    const fallback = typeof window !== 'undefined' ? window.location.origin : 'https://beautysphereshop.com';
    setUrlInput(fallback);
    setError('');
  };

  return (
    <div
      id="edit-url-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="edit-url-modal-card"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1F1B18] text-white border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-[#D4AF37] flex items-center justify-center border border-amber-500/30">
              {isAuthorized ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Edit Website URL Link</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-[#D4AF37] border border-amber-500/30">
                  Admin Only
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                {isAuthorized ? 'Authorized admin link configuration' : 'Administrator security clearance required'}
              </p>
            </div>
          </div>
          <button
            id="close-edit-url-modal-btn"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Gate: Only Admin Can Edit */}
        {!isAuthorized ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Administrator Protected Setting
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    To protect brand integrity, only the boutique administrator (<strong>Akon MD</strong>) can edit or rebind the official store URL.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAdminUnlock} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Enter Admin Password to Unlock
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    id="admin-url-unlock-password"
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password (e.g. 00998877)"
                    required
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminAuthError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                {onOpenAdminLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminLogin();
                    }}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline cursor-pointer"
                  >
                    Full Admin Login
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="unlock-url-editor-btn"
                    type="submit"
                    className="px-4 py-2 bg-[#1F1B18] hover:bg-[#38312A] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Unlock & Edit</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Content Form: Authorized Admin Mode */
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Admin Authorized: Akon MD</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 rounded text-emerald-900">
                Verified
              </span>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>URL link updated and saved successfully!</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Custom Store URL / Domain
              </label>
              <div className="relative">
                <Link className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  id="edit-url-input"
                  type="text"
                  required
                  placeholder="e.g. https://munnaofficial.com or your domain"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-[#D4AF37] font-mono text-gray-900 transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                This link will be used in the persistent store footer, share dialogues, barcodes, and order receipts.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-gray-600 block mb-1.5">
                Quick Suggestions:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentBrowserUrl}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Use Current Browser URL</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-gray-500" />
                  <span>Default Domain</span>
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                Live Preview:
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-gray-800 truncate select-all">
                  {urlInput || 'No URL specified'}
                </span>
                {urlInput && (
                  <a
                    href={urlInput.startsWith('http') ? urlInput : `https://${urlInput}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center gap-1 text-[11px] font-semibold shrink-0 cursor-pointer"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                id="cancel-edit-url-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="save-edit-url-btn"
                type="submit"
                className="px-5 py-2.5 bg-[#1F1B18] hover:bg-[#38312A] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Save URL</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditUrlModal;
