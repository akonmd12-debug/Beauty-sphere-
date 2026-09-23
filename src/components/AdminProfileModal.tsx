import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Plus, 
  SlidersHorizontal, 
  Star, 
  Check, 
  UserCheck, 
  Sparkles,
  Phone,
  Mail,
  Send,
  Eye,
  EyeOff,
  AlertTriangle,
  RotateCcw,
  Edit3,
  Save,
  MapPin,
  Globe
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  getStoredAdminPassword, 
  saveStoredAdminPassword, 
  changeAdminPassword, 
  getStoredRequireMerchantPassword, 
  saveStoredRequireMerchantPassword, 
  verifyOwnerPassword 
} from '../utils/storage';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  productsCount: number;
  producersCount: number;
  reviewsCount: number;
  onOpenAdminDashboard: (initialTab?: string) => void;
  onOpenAddProduct: () => void;
  websiteUrl: string;
  isAdminAuthenticated?: boolean;
  onAuthenticateAdmin?: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  productsCount,
  producersCount,
  reviewsCount,
  onOpenAdminDashboard,
  onOpenAddProduct,
  websiteUrl,
  isAdminAuthenticated = false,
  onAuthenticateAdmin,
  onUpdateProfile,
}) => {
  // Password Requirement Option Setting
  const [requirePasswordOption, setRequirePasswordOption] = useState<boolean>(true);

  // Lock / Unlock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [enteredPassword, setEnteredPassword] = useState<string>('');
  const [showEnteredPassword, setShowEnteredPassword] = useState<boolean>(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Change Password state
  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPasswordText, setShowPasswordText] = useState<boolean>(false);
  const [showCurrentStoredPassword, setShowCurrentStoredPassword] = useState<boolean>(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);

  // Editing profile details state
  const [isEditingContact, setIsEditingContact] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>(userProfile.name || 'Akon MD');
  const [contactEmail, setContactEmail] = useState<string>(userProfile.email || 'akonmd12@gmail.com');
  const [contactPhone, setContactPhone] = useState<string>(userProfile.phone || '+1 (555) 382-9011');
  const [contactWhatsapp, setContactWhatsapp] = useState<string>(userProfile.whatsapp || '+1 (555) 382-9011');
  const [contactTelegram, setContactTelegram] = useState<string>(userProfile.telegram || '@beautysphereshop');
  const [contactAddress, setContactAddress] = useState<string>(userProfile.address || '450 Haute Parfumerie Avenue, Suite 1200');
  const [contactCity, setContactCity] = useState<string>(userProfile.city || 'Beverly Hills');
  const [contactWebsiteUrl, setContactWebsiteUrl] = useState<string>(userProfile.websiteUrl || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Sync initial state on modal open
  useEffect(() => {
    if (isOpen) {
      const isReq = getStoredRequireMerchantPassword();
      setRequirePasswordOption(isReq);

      // Under RBAC, verified admin authentication is strictly required to view or edit admin settings
      if (isAdminAuthenticated) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }

      setEnteredPassword('');
      setUnlockError(null);
      setPasswordFeedback(null);
      setContactName(userProfile.name || 'Akon MD');
      setContactEmail(userProfile.email || 'akonmd12@gmail.com');
      setContactPhone(userProfile.phone || '+1 (555) 382-9011');
      setContactWhatsapp(userProfile.whatsapp || '+1 (555) 382-9011');
      setContactTelegram(userProfile.telegram || '@beautysphereshop');
      setContactAddress(userProfile.address || '450 Haute Parfumerie Avenue, Suite 1200');
      setContactCity(userProfile.city || 'Beverly Hills');
      setContactWebsiteUrl(userProfile.websiteUrl || '');
    }
  }, [isOpen, isAdminAuthenticated, userProfile]);

  if (!isOpen) return null;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);

    if (verifyOwnerPassword(enteredPassword)) {
      setIsUnlocked(true);
      setUnlockError(null);
      if (onAuthenticateAdmin) {
        onAuthenticateAdmin();
      }
    } else {
      setUnlockError('Incorrect owner password. Default password is 00998877.');
    }
  };

  const handleToggleRequirePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setRequirePasswordOption(newValue);
    saveStoredRequireMerchantPassword(newValue);
    setPasswordFeedback({
      type: 'success',
      text: newValue 
        ? 'Option enabled: Owner password will be required every time this merchant profile is opened.' 
        : 'Option disabled: Password prompt bypassed for merchant profile.'
    });
    setTimeout(() => setPasswordFeedback(null), 3500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 4) {
      setPasswordFeedback({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsSavingPassword(true);
    setTimeout(() => {
      const res = changeAdminPassword(oldPassword, newPassword);
      setIsSavingPassword(false);
      if (res.success) {
        setPasswordFeedback({ 
          type: 'success', 
          text: 'Owner password updated successfully! You can change it anytime.' 
        });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChangeForm(false);
      } else {
        setPasswordFeedback({ 
          type: 'error', 
          text: res.error || 'Incorrect current password. Check and try again.' 
        });
      }
    }, 300);
  };

  const handleSaveContactProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        ...userProfile,
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        whatsapp: contactWhatsapp,
        telegram: contactTelegram,
        address: contactAddress,
        city: contactCity,
        websiteUrl: contactWebsiteUrl,
        isStoreOwner: true,
      });
    }
    setIsEditingContact(false);
    setProfileSuccessMsg('Merchant profile information updated successfully!');
    setTimeout(() => setProfileSuccessMsg(null), 3000);
  };

  const handleEnterDashboard = (tab?: string) => {
    onClose();
    onOpenAdminDashboard(tab);
  };

  const handleAddProductClick = () => {
    onClose();
    onOpenAddProduct();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        id="admin-profile-portal-modal"
        className="relative bg-[#FAF8F5] w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-[#E8DFD3] my-6 flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#1F1B18] text-[#FAF8F5] px-6 py-5 flex items-center justify-between border-b border-[#38312B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#352D26] border border-[#52453A] text-[#D4AF37] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-lg sm:text-xl font-normal text-white">
                  Merchant Profile & Store Owner
                </h3>
                <span className="px-2 py-0.2 bg-[#D4AF37] text-[#1F1B18] text-[10px] font-bold uppercase tracking-wider rounded">
                  Sole Merchant
                </span>
              </div>
              <p className="text-[11px] text-[#B8ADA2]">
                Verified Merchant Authentication • BEAUTY SPHERE SHOP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A89D93] hover:text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!isUnlocked ? (
          /* ========================================================= */
          /* OWNER PASSWORD VERIFICATION GATE (WHEN LOCKED)           */
          /* ========================================================= */
          <div className="p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF3E8] border border-[#D4AF37] text-[#8C6B3E] flex items-center justify-center shadow-xs">
                <Lock className="w-7 h-7 text-[#8C6B3E]" />
              </div>
              <h4 className="font-serif-luxury text-xl text-[#1A1817] font-medium">
                Owner Password Required
              </h4>
              <p className="text-xs text-[#635A52] max-w-md mx-auto leading-relaxed">
                This Merchant Profile contains proprietary store owner settings, catalog permissions, and contact records. Only you (<strong>Akon MD</strong>) can enter with your owner password.
              </p>
            </div>

            {unlockError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{unlockError}</span>
              </div>
            )}

            <form onSubmit={handleUnlockSubmit} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-semibold text-[#4A423B] uppercase tracking-wider mb-1.5">
                  Owner Password *
                </label>
                <div className="relative">
                  <input
                    id="merchant-profile-password-input"
                    type={showEnteredPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={enteredPassword}
                    onChange={(e) => {
                      setEnteredPassword(e.target.value);
                      if (unlockError) setUnlockError(null);
                    }}
                    placeholder="Enter owner password..."
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-[#D5C9BC] rounded-xl text-[#1A1817] focus:outline-none focus:border-[#1F1B18] shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEnteredPassword(!showEnteredPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7066] hover:text-[#1A1817] p-1 cursor-pointer"
                  >
                    {showEnteredPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end text-[11px] text-[#7A7066]">
                <span className="text-[#8F8479]">Account: akonmd12@gmail.com</span>
              </div>

              <button
                type="submit"
                id="unlock-merchant-profile-btn"
                className="w-full py-3 px-4 bg-[#1F1B18] hover:bg-[#342F2A] text-white text-xs font-semibold tracking-wider uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                <span>Enter Merchant Profile</span>
              </button>
            </form>

            <div className="pt-4 border-t border-[#EAE3D8] text-center">
              <p className="text-[11px] text-[#7A7066]">
                Need to return?{' '}
                <button
                  onClick={onClose}
                  className="text-[#1A1817] font-semibold underline hover:text-[#8C6B3E] cursor-pointer"
                >
                  Back to boutique
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* UNLOCKED MERCHANT PROFILE BODY                            */
          /* ========================================================= */
          <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh] animate-fadeIn">
            {/* Owner Status Bar */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Authenticated as Sole Store Owner (Akon MD)</span>
              </div>
              <button
                onClick={() => {
                  setIsUnlocked(false);
                  setEnteredPassword('');
                }}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
                title="Lock profile to require password again"
              >
                Lock Profile
              </button>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {/* Store Owner Identity Card */}
            <div className="bg-white p-5 rounded-xl border border-[#EAE3D8] shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-[#1F1B18] text-[#D4AF37] font-serif-luxury text-2xl flex items-center justify-center border-2 border-[#D4AF37]/40 shadow-xs">
                    {contactName.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h4 className="font-serif-luxury text-lg font-medium text-[#1A1817]">
                      {contactName}
                    </h4>
                    <p className="text-xs text-[#8C6B3E] font-medium flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Store Owner & Exclusive Boutique Curator</span>
                    </p>
                    <p className="text-xs text-[#7A7066] font-mono mt-0.5">
                      {contactEmail}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingContact(!isEditingContact)}
                  className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#DDD5CB] text-[#1A1817] text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#8C6B3E]" />
                  <span>{isEditingContact ? 'Cancel Edit' : 'Edit Details'}</span>
                </button>
              </div>

              {/* Editable or Static Contact Details */}
              {isEditingContact ? (
                <form onSubmit={handleSaveContactProfile} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A423B] uppercase mb-1">
                        Owner Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg text-[#1A1817]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A423B] uppercase mb-1">
                        Owner Email
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg text-[#1A1817]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A423B] uppercase mb-1">
                        WhatsApp Contact
                      </label>
                      <input
                        type="text"
                        value={contactWhatsapp}
                        onChange={(e) => setContactWhatsapp(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg text-[#1A1817]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A423B] uppercase mb-1">
                        Telegram Handle
                      </label>
                      <input
                        type="text"
                        value={contactTelegram}
                        onChange={(e) => setContactTelegram(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg text-[#1A1817]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A423B] uppercase mb-1">
                        Studio Address
                      </label>
                      <input
                        type="text"
                        value={contactAddress}
                        onChange={(e) => setContactAddress(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg text-[#1A1817]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A423B] uppercase mb-1">
                        City & Country
                      </label>
                      <input
                        type="text"
                        value={contactCity}
                        onChange={(e) => setContactCity(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg text-[#1A1817]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#4A423B] uppercase mb-1">
                        Store Website URL Link (Edit Anytime)
                      </label>
                      <input
                        type="text"
                        value={contactWebsiteUrl}
                        onChange={(e) => setContactWebsiteUrl(e.target.value)}
                        placeholder="e.g. https://munnaofficial.com"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5CB] rounded-lg text-[#1A1817] font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1F1B18] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Save Profile Details</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-[#524B44]">
                  <div className="flex items-center gap-2 p-2 bg-[#FAF8F5] rounded-lg border border-[#EDE5DA]">
                    <Phone className="w-3.5 h-3.5 text-[#8C6B3E] shrink-0" />
                    <span className="truncate">WhatsApp: {contactWhatsapp}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#FAF8F5] rounded-lg border border-[#EDE5DA]">
                    <Send className="w-3.5 h-3.5 text-[#8C6B3E] shrink-0" />
                    <span className="truncate">Telegram: {contactTelegram}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#FAF8F5] rounded-lg border border-[#EDE5DA] sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-[#8C6B3E] shrink-0" />
                    <span className="truncate">{contactAddress}, {contactCity}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#FAF8F5] rounded-lg border border-[#EDE5DA] sm:col-span-2">
                    <Globe className="w-3.5 h-3.5 text-[#8C6B3E] shrink-0" />
                    <span className="truncate font-mono text-[11px]">URL: {contactWebsiteUrl || userProfile.websiteUrl || 'https://beautysphereshop.com'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* OPTION PASSWORD IN MERCHANT PROFILE & CHANGE ANYTIME      */}
            {/* ========================================================= */}
            <div id="merchant-password-option-card" className="bg-[#FAF4ED] p-5 rounded-xl border-2 border-[#D4AF37]/60 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#1F1B18] text-[#D4AF37] flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif-luxury text-base font-semibold text-[#1A1817]">
                      Owner Password & Security Option
                    </h4>
                    <p className="text-xs text-[#6B5F54]">
                      Only you can enter with this password, and you can change it anytime.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPasswordChangeForm(!showPasswordChangeForm)}
                  className="px-3 py-1.5 bg-[#1F1B18] hover:bg-[#342F2A] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{showPasswordChangeForm ? 'Hide Change Form' : 'Change Password Anytime'}</span>
                </button>
              </div>

              {/* Password Protection Option Toggle */}
              <div className="p-3 bg-white rounded-xl border border-[#E5DACD] flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#1A1817] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#8C6B3E]" />
                    <span>Option: Require Password to Open Merchant Profile</span>
                  </p>
                  <p className="text-[11px] text-[#6B5F54] mt-0.5">
                    When enabled, visiting this profile requires your owner password before displaying confidential owner details.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={requirePasswordOption}
                    onChange={handleToggleRequirePassword}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.75 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#1F1B18]"></div>
                </label>
              </div>

              {/* Feedback messages */}
              {passwordFeedback && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-fadeIn ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {passwordFeedback.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{passwordFeedback.text}</span>
                </div>
              )}

              {/* Current Password Peek & Change Form */}
              {showPasswordChangeForm ? (
                <form onSubmit={handleChangePassword} className="p-4 bg-white rounded-xl border border-[#E5DACD] space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE3]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1817]">
                      Update Owner Password
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCurrentStoredPassword(!showCurrentStoredPassword)}
                      className="text-[11px] text-[#8C6B3E] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {showCurrentStoredPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showCurrentStoredPassword ? `Current: ${getStoredAdminPassword()}` : 'Reveal Current Password'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A423B] uppercase mb-1">
                        Current Password *
                      </label>
                      <input
                        type={showPasswordText ? 'text' : 'password'}
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Current password"
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5C9BC] rounded-lg text-[#1A1817]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A423B] uppercase mb-1">
                        New Password *
                      </label>
                      <input
                        type={showPasswordText ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 4 chars)"
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5C9BC] rounded-lg text-[#1A1817]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A423B] uppercase mb-1">
                        Confirm New *
                      </label>
                      <input
                        type={showPasswordText ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5C9BC] rounded-lg text-[#1A1817]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-3 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setShowPasswordText(!showPasswordText)}
                        className="text-[#7A7066] hover:text-[#1A1817] flex items-center gap-1 cursor-pointer"
                      >
                        {showPasswordText ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPasswordText ? 'Hide Characters' : 'Show Characters'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          saveStoredAdminPassword('00998877');
                          setPasswordFeedback({
                            type: 'success',
                            text: 'Password reset to default (00998877)! You can change it anytime.'
                          });
                          setOldPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="text-rose-700 hover:underline cursor-pointer"
                      >
                        Reset to 00998877
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      id="save-merchant-owner-password-btn"
                      className="px-4 py-2 bg-[#1F1B18] hover:bg-[#342F2A] text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{isSavingPassword ? 'Saving...' : 'Save New Owner Password'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between text-xs text-[#6B5F54] pt-1">
                  <span>
                    Current Password Status: <strong className="text-[#1A1817] font-mono">••••••••</strong> (Secured)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChangeForm(true)}
                    className="text-[#8C6B3E] font-semibold hover:underline cursor-pointer"
                  >
                    Change Password Now →
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-[#E5DACD] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="text-[#6B5F54] text-[11px]">
                  Need to change username or update Merchant credentials?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminDashboard('credentials');
                  }}
                  className="px-3 py-1.5 bg-[#1F1B18] hover:bg-[#342F2A] text-[#D4AF37] font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Open Full Credentials Manager</span>
                </button>
              </div>
            </div>

            {/* Store Posting Rules Notice */}
            <div className="bg-[#FAF4ED] p-4 rounded-xl border border-[#E8DFD3] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1817] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Boutique Authority & Posting Rules</span>
              </div>
              <ul className="text-xs text-[#5C534B] space-y-1.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sole Seller System:</strong> Only you (Akon MD) can add, edit, or list products anytime from verified botanical producers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Public Posting Locked:</strong> Outside visitors and customers cannot post products or become sellers. They can browse, purchase, and write verified reviews.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Client Reviews Enabled:</strong> Customers can leave verified reviews and 1-5 star ratings on every single product in the boutique.
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-white rounded-xl border border-[#EAE3D8]">
                <span className="text-[10px] uppercase tracking-wider text-[#8C8075]">Formulations</span>
                <p className="text-base font-bold text-[#1A1817] mt-0.5">{productsCount}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#EAE3D8]">
                <span className="text-[10px] uppercase tracking-wider text-[#8C8075]">Producers</span>
                <p className="text-base font-bold text-[#1A1817] mt-0.5">{producersCount}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#EAE3D8]">
                <span className="text-[10px] uppercase tracking-wider text-[#8C8075]">Customer Reviews</span>
                <p className="text-base font-bold text-[#1A1817] mt-0.5">{reviewsCount}</p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-2.5 pt-2">
              {/* Primary Action: Add Product Anytime */}
              <button
                id="admin-modal-add-product-btn"
                onClick={handleAddProductClick}
                className="w-full py-3.5 px-4 bg-[#1F1B18] hover:bg-[#342F2A] text-white text-xs font-semibold tracking-[0.16em] uppercase rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>+ Add New Product Formulation Anytime</span>
              </button>

              {/* Secondary Action: Enter Full Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  id="admin-modal-enter-dashboard-btn"
                  onClick={() => handleEnterDashboard('inventory')}
                  className="py-3 px-3 bg-white hover:bg-[#F7F2EB] text-[#1F1B18] border border-[#DDD3C7] text-xs font-medium uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C6B3E]" />
                  <span>Enter Admin Dashboard</span>
                </button>

                <button
                  id="admin-modal-manage-reviews-btn"
                  onClick={() => handleEnterDashboard('reviews')}
                  className="py-3 px-3 bg-white hover:bg-[#F7F2EB] text-[#1F1B18] border border-[#DDD3C7] text-xs font-medium uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Moderate Client Reviews ({reviewsCount})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F5EFE9] border-t border-[#E8DFD3] flex items-center justify-between text-xs text-[#7A7066]">
          <span className="text-[11px]">Authorized Boutique Administrator (Akon MD)</span>
          <button
            onClick={onClose}
            className="text-[11px] font-medium text-[#2C2723] hover:underline cursor-pointer"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
