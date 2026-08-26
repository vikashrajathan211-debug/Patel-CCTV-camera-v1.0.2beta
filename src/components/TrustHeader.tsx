import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Truck, 
  Headphones, 
  Sliders, 
  Calculator, 
  CalendarCheck,
  CheckCircle2,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Language, CustomerUser, HelpCategory } from '../types';
import { STORE_INFO } from '../data/products';
import { getUIT } from '../data/translations';
import { ShieldAlert } from 'lucide-react';

interface TrustHeaderProps {
  language: Language;
  currentUser?: CustomerUser | null;
  onOpenCustomerAuth?: () => void;
  onOpenEstimator: () => void;
  onOpenStorageCalc: () => void;
  onOpenSiteVisit: () => void;
  onOpenTrackSurvey?: () => void;
  onOpenHelpSupport?: (category?: HelpCategory) => void;
  onOpenSecurityWarning?: () => void;
  onOpenDiwaliOffer?: () => void;
}

export const TrustHeader: React.FC<TrustHeaderProps> = ({
  language,
  currentUser,
  onOpenCustomerAuth,
  onOpenEstimator,
  onOpenStorageCalc,
  onOpenSiteVisit,
  onOpenTrackSurvey,
  onOpenHelpSupport,
  onOpenSecurityWarning,
  onOpenDiwaliOffer,
}) => {
  const t = getUIT(language);
  const isHi = language === 'hi';

  // Dynamic days left until Nov 8, 2026
  const targetDate = new Date('2026-11-08T00:00:00');
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-white border-b border-slate-200">
      {/* Hero Announcement Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-4 sm:py-6 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 relative z-10">
          <div className="text-left w-full lg:max-w-2xl">
            {/* Top Badges Strip - Horizontal Swipeable on Mobile */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x flex-nowrap mb-2 pb-0.5">
              {/* Diwali Festive Special Pill */}
              {onOpenDiwaliOffer && (
                <button
                  type="button"
                  onClick={onOpenDiwaliOffer}
                  id="header-diwali-offer-pill-btn"
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/30 to-orange-500/30 hover:from-amber-500/40 hover:to-orange-500/40 border border-amber-400/60 rounded-full px-2.5 py-0.5 text-xs font-black text-amber-300 transition cursor-pointer shadow-xs animate-pulse shrink-0 whitespace-nowrap"
                >
                  <span>🪔</span>
                  <span>{diffDays > 0 ? `${t.diwaliOfferBadge} • 8/11/2026 (${diffDays} ${t.diwaliDaysLeft})` : t.diwaliOfferBadge}</span>
                </button>
              )}

              <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full px-2.5 py-0.5 text-xs font-semibold text-blue-200 shrink-0 whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t.allOriginalOem} • {t.gstBill2YrWarranty}</span>
              </div>

              <div className="inline-flex items-center gap-1 bg-amber-400/20 border border-amber-400/40 rounded-full px-2.5 py-0.5 text-xs font-bold text-amber-300 shrink-0 whitespace-nowrap shadow-xs">
                <span>⚡</span>
                <span>Powered by Vikash Patel</span>
              </div>

              {currentUser && currentUser.isLoggedIn && (
                <button
                  type="button"
                  onClick={onOpenCustomerAuth}
                  className="inline-flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded-full px-2.5 py-0.5 text-xs font-bold text-emerald-300 transition cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>📍 {currentUser.city || 'સુરત'}</span>
                </button>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
              {t.heroHeading}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {t.heroSubheading}
            </p>
          </div>

          {/* Quick tool launch cards: Smooth touch slideable / scrollable on mobile */}
          <div className="w-full lg:w-auto shrink-0 space-y-1.5">
            {/* Mobile swipe hint banner */}
            <div className="flex sm:hidden items-center justify-between text-[11px] text-blue-200 font-bold px-1">
              <span className="flex items-center gap-1">
                <span>👉</span>
                <span>{isHi ? 'बाएं-दाएं स्लाइड करें' : 'Swipe Left & Right'}</span>
              </span>
              <span className="text-[10px] text-amber-300 bg-amber-400/20 px-2 py-0.2 rounded-full border border-amber-400/30">
                {isHi ? '4 मुख्य टूल्स' : '4 Quick Tools'}
              </span>
            </div>

            <div className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory gap-2.5 pb-1 sm:grid sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 w-full">
              <button
                onClick={onOpenEstimator}
                id="hero-estimator-btn"
                className="snap-start shrink-0 min-w-[155px] sm:min-w-0 flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-xs transition-all cursor-pointer border border-blue-400/30 text-left active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-blue-200 font-normal uppercase leading-tight truncate">
                    {t.instantEstimate}
                  </div>
                  <div className="leading-tight text-xs sm:text-sm font-black truncate">
                    {t.estimatorTitle}
                  </div>
                </div>
              </button>

              <button
                onClick={onOpenStorageCalc}
                id="hero-storage-btn"
                className="snap-start shrink-0 min-w-[155px] sm:min-w-0 flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-xs transition-all cursor-pointer border border-slate-700 text-left active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-slate-300 font-normal uppercase leading-tight truncate">
                    {t.hddCalc}
                  </div>
                  <div className="leading-tight text-xs sm:text-sm font-black truncate">
                    {t.hddCalcSubtitle}
                  </div>
                </div>
              </button>

              <button
                onClick={onOpenSiteVisit}
                id="hero-site-visit-btn"
                className="snap-start shrink-0 min-w-[155px] sm:min-w-0 flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-xs transition-all cursor-pointer border border-emerald-400/30 text-left active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-emerald-200 font-normal uppercase leading-tight truncate">
                    {t.freeSurvey}
                  </div>
                  <div className="leading-tight text-xs sm:text-sm font-black truncate">
                    {t.bookSurvey}
                  </div>
                </div>
              </button>

              <button
                onClick={onOpenTrackSurvey || onOpenSecurityWarning}
                id="hero-track-survey-btn"
                className="snap-start shrink-0 min-w-[155px] sm:min-w-0 flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-xs transition-all cursor-pointer border border-slate-700 text-left active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-amber-300 font-normal uppercase leading-tight truncate">
                    {t.trackSurvey}
                  </div>
                  <div className="leading-tight text-xs sm:text-sm font-black truncate">
                    {t.trackSurvey}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Trust Bar - Horizontal Smooth Sliding on Mobile */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x gap-2 sm:gap-4 sm:grid sm:grid-cols-4 pb-0.5">
          <div className="snap-start shrink-0 min-w-[160px] sm:min-w-0 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                {t.badgeOriginalTitle}
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                {t.badgeOriginalDesc}
              </p>
            </div>
          </div>

          <div className="snap-start shrink-0 min-w-[160px] sm:min-w-0 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                {t.badgeWarrantyTitle}
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                {t.badgeWarrantyDesc}
              </p>
            </div>
          </div>

          <div className="snap-start shrink-0 min-w-[160px] sm:min-w-0 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                {t.badgeSupportTitle}
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                {t.badgeSupportDesc}
              </p>
            </div>
          </div>

          <div className="snap-start shrink-0 min-w-[160px] sm:min-w-0 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                {t.badgeDeliveryTitle}
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                {t.badgeDeliveryDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


