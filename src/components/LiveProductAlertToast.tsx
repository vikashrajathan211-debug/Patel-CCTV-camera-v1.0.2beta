import React, { useEffect, useState } from 'react';
import { Sparkles, Bell, X, ArrowRight, Eye, ShoppingCart } from 'lucide-react';
import { Product, Language } from '../types';
import { speakNotification } from '../utils/speech';

interface LiveProductAlertToastProps {
  language: Language;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const LiveProductAlertToast: React.FC<LiveProductAlertToastProps> = ({
  language,
  onViewProduct,
  onAddToCart,
}) => {
  const [activeAlert, setActiveAlert] = useState<Product | null>(null);
  const isHi = language === 'hi';

  useEffect(() => {
    // 1. Listen for local broadcast / custom event
    const handleNewProduct = (event: CustomEvent<Product>) => {
      const product = event.detail;
      if (!product || !product.name) return;

      setActiveAlert(product);

      // Speak announcement
      const alertMsg = isHi
        ? `नया सामान उपलब्ध है: ${product.nameHi || product.name}`
        : `New item available: ${product.name}`;
      try {
        speakNotification(alertMsg, language);
      } catch (e) {
        console.debug('Alert speech skipped', e);
      }

      // Auto dismiss after 8 seconds
      const timer = setTimeout(() => {
        setActiveAlert((prev) => (prev?.id === product.id ? null : prev));
      }, 8000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('patel_cctv_new_product_added' as any, handleNewProduct as any);

    // 2. Listen to cross-tab BroadcastChannel if available
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('patel_cctv_live_sync');
        channel.onmessage = (event) => {
          if (event.data && event.data.type === 'NEW_PRODUCT_ADDED') {
            handleNewProduct(new CustomEvent('patel_cctv_new_product_added', { detail: event.data.product }));
          }
        };
      }
    } catch (e) {
      console.debug('BroadcastChannel not supported', e);
    }

    return () => {
      window.removeEventListener('patel_cctv_new_product_added' as any, handleNewProduct as any);
      if (channel) {
        channel.close();
      }
    };
  }, [isHi, language]);

  if (!activeAlert) return null;

  return (
    <div className="fixed top-20 right-3 sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border-2 border-amber-400 text-white p-4 rounded-2xl shadow-2xl shadow-amber-500/20 relative overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 animate-pulse" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  <Sparkles className="w-3 h-3" />
                  {isHi ? 'नया सामान उपलब्ध है!' : 'New Item Available!'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">LIVE UPDATE</span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white mt-1 line-clamp-1">
                {isHi ? (activeAlert.nameHi || activeAlert.name) : activeAlert.name}
              </h4>
            </div>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product details preview */}
        <div className="mt-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-slate-400">
              {isHi ? 'थोक मूल्य / MRP:' : 'Wholesale Price:'}{' '}
              <span className="text-emerald-400 font-bold text-sm">₹{activeAlert.price.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[11px] text-slate-500 line-clamp-1">
              {activeAlert.brand} • {activeAlert.model}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onViewProduct(activeAlert);
                setActiveAlert(null);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isHi ? 'देखें' : 'View'}</span>
            </button>
            <button
              onClick={() => {
                onAddToCart(activeAlert);
                setActiveAlert(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md shadow-amber-500/20 transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{isHi ? 'जोड़ें' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
