import React from 'react';
import { 
  Store, 
  Video, 
  Sliders, 
  CalendarCheck, 
  ShoppingCart,
  Calculator
} from 'lucide-react';
import { Language, CartItem } from '../types';

interface MobileBottomNavProps {
  language: Language;
  cartItems: CartItem[];
  activeTab?: string;
  onOpenCart: () => void;
  onOpenEstimator: () => void;
  onOpenStorageCalc: () => void;
  onOpenSiteVisit: () => void;
  onScrollToStore: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  language,
  cartItems,
  onOpenCart,
  onOpenEstimator,
  onOpenStorageCalc,
  onOpenSiteVisit,
  onScrollToStore,
}) => {
  const isHi = language === 'hi';
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div 
      id="mobile-bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.5)] pb-[max(env(safe-area-inset-bottom,0px),8px)] w-full"
    >
      {/* Home / Catalog button */}
      <button
        type="button"
        onClick={onScrollToStore}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-300 hover:text-white active:scale-95 transition cursor-pointer min-w-[58px]"
      >
        <Store className="w-5 h-5 text-blue-400" />
        <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-[62px]">
          {isHi ? 'स्टोर' : 'Store'}
        </span>
      </button>

      {/* Estimator button */}
      <button
        type="button"
        onClick={onOpenEstimator}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-300 hover:text-white active:scale-95 transition cursor-pointer min-w-[58px]"
      >
        <Sliders className="w-5 h-5 text-amber-400" />
        <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-[62px]">
          {isHi ? 'कोटेशन' : 'Estimate'}
        </span>
      </button>

      {/* HDD Storage Calc */}
      <button
        type="button"
        onClick={onOpenStorageCalc}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-300 hover:text-white active:scale-95 transition cursor-pointer min-w-[58px]"
      >
        <Calculator className="w-5 h-5 text-emerald-400" />
        <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-[62px]">
          {isHi ? 'HDD डेज' : 'HDD Calc'}
        </span>
      </button>

      {/* Book Survey */}
      <button
        type="button"
        onClick={onOpenSiteVisit}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-300 hover:text-white active:scale-95 transition cursor-pointer min-w-[58px]"
      >
        <CalendarCheck className="w-5 h-5 text-teal-300" />
        <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-[62px]">
          {isHi ? 'फ्री सर्वे' : 'Survey'}
        </span>
      </button>

      {/* Floating Cart Button with Counter */}
      <button
        type="button"
        onClick={onOpenCart}
        className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold active:scale-95 transition cursor-pointer min-w-[62px] shadow-md shadow-emerald-950/50"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-white" />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-emerald-800">
              {totalCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-black mt-0.5 tracking-tight truncate max-w-[62px]">
          {isHi ? 'कार्ट' : 'Cart'}
        </span>
      </button>
    </div>
  );
};
