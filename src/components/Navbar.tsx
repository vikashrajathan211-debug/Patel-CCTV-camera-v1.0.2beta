import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  ShoppingCart, 
  Calculator, 
  Sliders, 
  Clock, 
  Sparkles,
  UserCheck,
  Store,
  MapPin,
  User,
  LogOut,
  ChevronDown,
  Volume2,
  VolumeX,
  Lock,
  Eye,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { Language, CartItem, StoreInfo, CustomerUser, HelpCategory } from '../types';
import { subscribeSpeechState, isSpeakingAudio, stopWelcomeAudio } from '../utils/speech';
import { getPendingSurveyCount } from '../utils/surveyStorage';
import { SUPPORTED_LANGUAGES, getUIT } from '../data/translations';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  cartItems: CartItem[];
  storeInfo: StoreInfo;
  currentUser: CustomerUser | null;
  isGuestMode?: boolean;
  onOpenCustomerAuth: () => void;
  onLogoutCustomer: () => void;
  onPlayGreeting?: () => void;
  onOpenCart: () => void;
  onOpenEstimator: () => void;
  onOpenStorageCalc: () => void;
  onOpenSiteVisit: () => void;
  onOpenSellerProfile: () => void;
  onOpenAdminApprovals?: () => void;
  onOpenTrackSurvey?: () => void;
  onOpenHelpSupport?: (category?: HelpCategory) => void;
  onOpenSecurityWarning?: () => void;
  onReplaySplash?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  cartItems,
  storeInfo,
  currentUser,
  isGuestMode = false,
  onOpenCustomerAuth,
  onLogoutCustomer,
  onPlayGreeting,
  onOpenCart,
  onOpenEstimator,
  onOpenStorageCalc,
  onOpenSiteVisit,
  onOpenSellerProfile,
  onOpenAdminApprovals,
  onOpenTrackSurvey,
  onOpenHelpSupport,
  onOpenSecurityWarning,
  onReplaySplash,
}) => {
  const t = getUIT(language);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isHi = language === 'hi';
  const isNonEn = language !== 'en';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [speakingLanguage, setSpeakingLanguage] = useState<Language | null>(null);
  const [pendingSurveyCount, setPendingSurveyCount] = useState(0);

  useEffect(() => {
    setPendingSurveyCount(getPendingSurveyCount());
    const handleSurveyUpdate = () => {
      setPendingSurveyCount(getPendingSurveyCount());
    };
    window.addEventListener('cctv_survey_updated', handleSurveyUpdate);
    return () => window.removeEventListener('cctv_survey_updated', handleSurveyUpdate);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeSpeechState((isPlaying, lang) => {
      setIsPlayingVoice(isPlaying);
      setSpeakingLanguage(lang);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-xl border-b border-slate-800">
      {/* Top micro bar for verified customer location & store timings - Smooth Horizontal Swipe on Mobile */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-xs py-1.5 px-3 sm:px-8 border-b border-blue-800/40 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-between gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x flex-nowrap py-0.5">
          
          {/* Customer Location Pill / Guest Mode Pill */}
          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            {currentUser && currentUser.isLoggedIn ? (
              <button
                onClick={onOpenCustomerAuth}
                title={isHi ? 'शहर या पिन कोड बदलें' : 'Change City or PIN code'}
                className="inline-flex items-center gap-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 hover:text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-blue-400/30 transition cursor-pointer shrink-0 whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {currentUser.city}, {currentUser.pincode}
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1 rounded font-normal">
                  {isHi ? 'बदलें' : 'Change'}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenCustomerAuth}
                className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-amber-400/40 transition cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Eye className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{isHi ? '👤 गेस्ट मोड (लॉगिन करें)' : '👤 Guest (Click to Login)'}</span>
              </button>
            )}

            {/* Audio Voice Welcome Replay Button with Live Speaking Pulse Animation */}
            {onPlayGreeting && (
              <button
                onClick={() => {
                  if (isPlayingVoice) {
                    stopWelcomeAudio();
                  } else {
                    onPlayGreeting();
                  }
                }}
                title={
                  isPlayingVoice 
                    ? (isNonEn ? 'ઓડિયો બંધ કરો / ऑडियो बंद करें' : 'Stop voice audio') 
                    : t.voiceGreetingBtn
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border transition cursor-pointer shrink-0 whitespace-nowrap ${
                  isPlayingVoice
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border-white/15'
                }`}
              >
                {isPlayingVoice ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-slate-950 animate-bounce shrink-0" />
                    <span className="font-bold">
                      {t.voiceSpeaking}
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>
                      {t.voiceGreetingBtn}
                    </span>
                  </>
                )}
              </button>
            )}

            <span className="hidden md:inline-flex items-center gap-1 text-slate-300 font-medium shrink-0 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {t.authorizedDealer}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            {/* Customer User Profile Dropdown */}
            {currentUser && currentUser.isLoggedIn && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px] flex items-center gap-1.5 border border-slate-700 transition cursor-pointer whitespace-nowrap"
                >
                  <User className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="max-w-[90px] truncate">{currentUser.name || currentUser.phone}</span>
                  {currentUser.accountType === 'seller' ? (
                    <span className="bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[9px] px-1 py-0.2 rounded font-black">
                      👑 मॉनिटर
                    </span>
                  ) : (
                    <span className="bg-blue-500/30 text-blue-300 border border-blue-400/30 text-[9px] px-1 py-0.2 rounded font-black">
                      🛒 ग्राहक
                    </span>
                  )}
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl p-3 min-w-[240px] z-50 animate-in fade-in zoom-in-95 space-y-2">
                    <div className="border-b border-slate-100 pb-2">
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-black text-xs text-slate-900 truncate">{currentUser.name}</div>
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                          currentUser.accountType === 'seller'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}>
                          {currentUser.accountType === 'seller' ? '👑 मुख्य मॉनिटर' : '🛒 अधिकृत ग्राहक'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">+91 {currentUser.phone}</div>
                      <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                        📍 {currentUser.city} - {currentUser.pincode}
                      </div>
                      {currentUser.businessName && (
                        <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                          🏢 {currentUser.businessName}
                        </div>
                      )}
                    </div>

                    {/* Account Type Features Notice */}
                    <div className={`p-2 rounded-xl text-[11px] leading-tight ${
                      currentUser.accountType === 'seller'
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-blue-50 text-blue-900 border border-blue-200'
                    }`}>
                      {currentUser.accountType === 'seller' ? (
                        <div className="space-y-0.5">
                          <div className="font-bold flex items-center gap-1 text-amber-900">
                            <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>मुख्य स्टोर मॉनिटर व एडमिन:</span>
                          </div>
                          <p className="text-[10px] text-amber-800">
                            {isHi ? '✓ प्रोडक्ट जोड़ें/संपादित करें + ✓ कैटलॉग मैनेजमेंट' : '✓ Full Inventory & Product Management'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="font-bold flex items-center gap-1 text-blue-900">
                            <ShoppingCart className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>अधिकृत ग्राहक (खरीदार खाता):</span>
                          </div>
                          <p className="text-[10px] text-blue-800">
                            {isHi ? '✓ सभी कैमरे थोक रेट पर खरीदें + फ्री कोटेशन' : '✓ Wholesale purchasing & Free quotations active'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 space-y-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenCustomerAuth();
                        }}
                        className="w-full text-left text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>{isHi ? 'खाता / पता / पिन कोड बदलें' : 'Edit Profile & PIN'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogoutCustomer();
                        }}
                        className="w-full text-left text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>{isHi ? 'लॉगआउट करें' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Survey Approval Link in top micro bar */}
            {onOpenAdminApprovals && (
              <button
                onClick={onOpenAdminApprovals}
                id="top-admin-survey-approvals-btn"
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 border border-emerald-400/40 transition cursor-pointer shrink-0 whitespace-nowrap"
                title={isNonEn ? 'સર્વે અપ્રૂવલ / सर्वे अप्रूवल' : 'Approve Survey Requests & Notify Customer'}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t.approvals}</span>
                {pendingSurveyCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                    {pendingSurveyCount}
                  </span>
                )}
              </button>
            )}

            {/* Customer Track Survey Link in top micro bar */}
            {onOpenTrackSurvey && (
              <button
                onClick={onOpenTrackSurvey}
                id="top-track-survey-btn"
                className="inline-flex bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 hover:text-white px-2.5 py-0.5 rounded-full font-semibold text-[11px] items-center gap-1 border border-indigo-400/30 transition cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Clock className="w-3 h-3 text-indigo-300 shrink-0" />
                <span>{t.trackSurvey}</span>
              </button>
            )}

            {/* Security Warning & Caution Notice in top micro bar */}
            {onOpenSecurityWarning && (
              <button
                onClick={onOpenSecurityWarning}
                id="top-security-warning-btn"
                className="bg-red-500/25 hover:bg-red-500/40 text-red-200 hover:text-white px-2.5 py-0.5 rounded-full font-black text-[11px] flex items-center gap-1 border border-red-400/50 transition cursor-pointer shadow-sm animate-pulse shrink-0 whitespace-nowrap"
                title={t.cautionNotice}
              >
                <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
                <span>{t.cautionNotice}</span>
              </button>
            )}

            {/* Help, Grievance & Fraud Alert in top micro bar */}
            {onOpenHelpSupport && (
              <button
                onClick={() => onOpenHelpSupport('fraud_alert')}
                id="top-help-support-btn"
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 border border-rose-400/40 transition cursor-pointer animate-pulse-subtle shrink-0 whitespace-nowrap"
                title={t.helpFraudPortal}
              >
                <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
                <span>{t.helpFraudPortal}</span>
              </button>
            )}

            {/* Seller Profile Link in top micro bar */}
            <button
              onClick={onOpenSellerProfile}
              id="top-seller-profile-btn"
              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 border transition cursor-pointer shrink-0 whitespace-nowrap ${
                currentUser?.accountType === 'seller'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                  : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 hover:text-amber-200 border-amber-400/40'
              }`}
              title={t.sellerPanel}
            >
              <Store className="w-3 h-3 shrink-0" />
              <span>{t.sellerPanel}</span>
              {currentUser?.accountType === 'buyer' && (
                <span className="text-[9px] bg-slate-800/80 text-amber-300 px-1 rounded font-normal">
                  🔒
                </span>
              )}
            </button>

            <span className="text-slate-600 shrink-0">|</span>

            {/* 8-Language Selector Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                id="top-language-menu-btn"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 border border-slate-700 transition cursor-pointer whitespace-nowrap"
                title="Change language / भाषा बदलें"
              >
                <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                <span>
                  {SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName || 'हिन्दी'}
                </span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl p-2 min-w-[200px] z-50 animate-in fade-in zoom-in-95 grid grid-cols-1 gap-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-500" />
                    <span>भाषा चुनें / Select Language</span>
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        language === lang.code
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.nativeName}</span>
                        <span className="text-[11px] text-slate-400 font-normal">({lang.name})</span>
                      </div>
                      {language === lang.code && (
                        <span className="text-xs text-blue-600 font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Logo */}
        <div 
          onClick={onReplaySplash}
          role="button"
          tabIndex={0}
          title={isHi ? 'पटेल सीसीटीवी स्प्लैश एनिमेशन देखें' : 'View Patel CCTV Splash Animation'}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30 shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-1.5 truncate max-w-[180px] sm:max-w-none group-hover:text-blue-200 transition-colors">
                <span>{t.storeName}</span>
              </h1>
              <span className="hidden md:inline-block bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-blue-500/30">
                {t.wholesaleTag}
              </span>
              <span className="bg-amber-400/20 text-amber-300 text-[9px] sm:text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded border border-amber-400/30 font-mono">
                v1.0.3beta
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium line-clamp-1">
                {t.storeTagline}
              </p>
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 flex items-center gap-1 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                <span>⚡</span> Powered by Vikash Patel
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons & Tools on Desktop */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* Package Quotation Generator Button */}
          <button
            onClick={onOpenEstimator}
            id="nav-estimator-btn"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-xl shadow-md hover:shadow-blue-500/25 transition-all border border-blue-400/30 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-amber-300" />
            <span>{t.estimatorTitle}</span>
          </button>

          {/* Storage Recording Calculator Button */}
          <button
            onClick={onOpenStorageCalc}
            id="nav-storage-btn"
            className="hidden lg:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>{t.hddCalc}</span>
          </button>

          {/* Direct Phone Call */}
          <a
            href={`tel:${storeInfo.phone.replace(/\s+/g, '')}`}
            className="hidden sm:flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-blue-400 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>{storeInfo.phone}</span>
          </a>

          {/* Dedicated Top Corner Seller Profile Button */}
          <button
            onClick={onOpenSellerProfile}
            id="nav-seller-profile-btn"
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-black px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-md shadow-amber-500/20 border border-amber-300/40 transition cursor-pointer"
            title={t.sellerPanel}
          >
            <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
            <span>{t.sellerPanel}</span>
          </button>

          {/* Cart / Quotation Drawer Button */}
          <button
            onClick={onOpenCart}
            id="nav-cart-btn"
            className="relative flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-lg shadow-emerald-700/30 transition cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t.cart}</span>
            {totalCartCount > 0 && (
              <span className="bg-amber-400 text-slate-900 font-black text-xs w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile-Only Horizontal Sliding Tool Options Ribbon */}
      <div className="md:hidden bg-slate-950/90 border-t border-slate-800/80 px-2.5 py-1.5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x flex-nowrap">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-0.5">
            <span>👉</span>
            <span className="text-[9px]">{isHi ? 'स्लाइड:' : 'Slide:'}</span>
          </span>

          <button
            onClick={onOpenEstimator}
            className="flex items-center gap-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition cursor-pointer active:scale-95"
          >
            <Sliders className="w-3 h-3 text-amber-300" />
            <span>{t.estimatorTitle}</span>
          </button>

          <button
            onClick={onOpenStorageCalc}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition cursor-pointer active:scale-95"
          >
            <Calculator className="w-3 h-3 text-emerald-400" />
            <span>{t.hddCalc}</span>
          </button>

          <button
            onClick={onOpenSiteVisit}
            className="flex items-center gap-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{t.bookSurvey}</span>
          </button>

          {onOpenTrackSurvey && (
            <button
              onClick={onOpenTrackSurvey}
              className="flex items-center gap-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[11px] font-semibold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition cursor-pointer active:scale-95"
            >
              <Clock className="w-3 h-3 text-indigo-300" />
              <span>{t.trackSurvey}</span>
            </button>
          )}

          <a
            href={`tel:${storeInfo.phone.replace(/\s+/g, '')}`}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>{storeInfo.phone}</span>
          </a>

          {onOpenHelpSupport && (
            <button
              onClick={() => onOpenHelpSupport('fraud_alert')}
              className="flex items-center gap-1 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition cursor-pointer"
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>{t.helpFraudPortal}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

