import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Award, 
  FileText, 
  CheckCircle2,
  Send,
  Heart
} from 'lucide-react';
import { Language, ProductCategory, StoreInfo, HelpCategory } from '../types';
import { STORE_INFO } from '../data/products';
import { ShieldAlert, RotateCcw, Wrench } from 'lucide-react';

interface FooterProps {
  language: Language;
  storeInfo?: StoreInfo;
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenEstimator: () => void;
  onOpenStorageCalc: () => void;
  onOpenSiteVisit: () => void;
  onOpenHelpSupport?: (category?: HelpCategory) => void;
  onOpenSecurityWarning?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  storeInfo = STORE_INFO,
  onSelectCategory,
  onOpenEstimator,
  onOpenStorageCalc,
  onOpenSiteVisit,
  onOpenHelpSupport,
  onOpenSecurityWarning,
}) => {
  const isHi = language === 'hi';

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 pt-8 sm:pt-12 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Top Authorized Brands Badges */}
        <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400 block">
              {isHi ? 'अधिकृत पार्टनर एवं डिस्ट्रीब्यूटर' : 'Authorized Sales Partners'}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isHi ? '100% ओरिजिनल OEM वारंटी सहित' : '100% Original Products with Full OEM Warranty'}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {storeInfo.brandsSupported.map((brand, idx) => (
              <span key={idx} className="bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-black text-slate-200 border border-slate-700">
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* Store Info & Quick Links: 1 col on mobile, 3 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Store Intro */}
          <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black shadow-md shadow-blue-600/30 shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black tracking-tight text-white truncate">
                  {isHi ? storeInfo.nameHi : storeInfo.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium truncate">
                  {isHi ? 'सुरक्षा का विश्वसनीय नाम' : 'Total CCTV & Security Store'}
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {isHi
                ? 'CP Plus, Hikvision और Dahua के ओरिजिनल CCTV कैमरे, DVR/NVR, सर्विलांस हार्ड डिस्क व ऑनसाइट इंस्टॉलेशन सपोर्ट।'
                : 'Direct distributor of top-tier CCTV security cameras, AcuSense DVRs, WD Purple storage & professional installation.'}
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800">
              <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>GSTIN: <strong className="text-slate-300 font-mono">{storeInfo.gstNumber}</strong></span>
            </div>
          </div>

          {/* Quick Tools & Services Buttons */}
          <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {isHi ? 'उपयोगी टूल्स व सहायता' : 'Surveillance Tools & Help'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenEstimator}
                className="bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl text-left text-slate-200 border border-slate-700/60 transition cursor-pointer"
              >
                <span className="text-amber-400 font-bold block text-xs">★ {isHi ? 'कोटेशन' : 'Estimator'}</span>
                <span className="text-[11px] text-slate-400 truncate block">{isHi ? 'पैकेज कैलकुलेटर' : 'Package Builder'}</span>
              </button>

              <button
                onClick={onOpenStorageCalc}
                className="bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl text-left text-slate-200 border border-slate-700/60 transition cursor-pointer"
              >
                <span className="text-emerald-400 font-bold block text-xs">★ {isHi ? 'स्टोरेज दिन' : 'HDD Calc'}</span>
                <span className="text-[11px] text-slate-400 truncate block">{isHi ? 'दिन कैलकुलेटर' : 'Recording Days'}</span>
              </button>

              <button
                onClick={onOpenSiteVisit}
                className="bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl text-left text-slate-200 border border-slate-700/60 transition cursor-pointer"
              >
                <span className="text-blue-400 font-bold block text-xs">★ {isHi ? 'फ्री सर्वे' : 'Free Survey'}</span>
                <span className="text-[11px] text-slate-400 truncate block">{isHi ? 'विजिट बुक करें' : 'Book Site Visit'}</span>
              </button>

              {onOpenSecurityWarning && (
                <button
                  onClick={onOpenSecurityWarning}
                  className="bg-red-950/40 hover:bg-red-950/60 p-2.5 rounded-xl text-left text-red-300 border border-red-800/50 transition cursor-pointer"
                >
                  <span className="text-red-400 font-bold block text-xs">⚠️ {isHi ? 'सुरक्षा नोट' : 'Caution'}</span>
                  <span className="text-[11px] text-red-300/80 truncate block">{isHi ? 'चेतावनी व अलर्ट' : 'Security Alert'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Contact & WhatsApp */}
          <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-3 md:col-span-2 lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {isHi ? 'संपर्क एवं दुकान का पता' : 'Store Location & Contact'}
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{isHi ? storeInfo.addressHi : storeInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${storeInfo.phone.replace(/\s+/g, '')}`} className="hover:text-white font-bold text-slate-200">
                  {storeInfo.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{isHi ? storeInfo.workingHoursHi : storeInfo.workingHours}</span>
              </div>
            </div>

            {/* Quick WhatsApp Direct Connect */}
            <a
              href={`https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent(`Hello ${storeInfo.name}, I would like to inquire about camera prices.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl transition shadow cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{isHi ? 'व्हाट्सएप पर संपर्क करें' : 'Chat on WhatsApp'}</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-4 border-t border-slate-900 text-center text-xs text-slate-500 space-y-2">
          <div>
            © {new Date().getFullYear()} {STORE_INFO.name}. {isHi ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="bg-slate-800 text-amber-400 border border-slate-700 px-2.5 py-0.5 rounded-md font-mono text-xs font-bold">
              App Version: v1.0.3beta
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-400/30 px-3 py-0.5 rounded-full text-xs font-bold shadow-xs">
              <span className="text-amber-400">⚡</span>
              <span>Powered by <strong>Vikash Patel</strong></span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
