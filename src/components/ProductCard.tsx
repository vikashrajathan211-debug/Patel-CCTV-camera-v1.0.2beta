import React from 'react';
import { 
  Shield, 
  Check, 
  ShoppingCart, 
  Eye, 
  Star, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Camera,
  Lock,
  UserCheck
} from 'lucide-react';
import { Product, Language, StoreInfo } from '../types';
import { STORE_INFO } from '../data/products';
import { getUIT } from '../data/translations';

interface ProductCardProps {
  product: Product;
  language: Language;
  storeInfo?: StoreInfo;
  isGuestMode?: boolean;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onRequestLogin?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  storeInfo = STORE_INFO,
  isGuestMode = false,
  onAddToCart,
  onViewDetails,
  onRequestLogin,
}) => {
  const t = getUIT(language);
  const isHi = language === 'hi';
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuestMode) {
      onRequestLogin?.();
      return;
    }
    const message = encodeURIComponent(
      `Hello ${storeInfo.name},\nI am interested in purchasing:\n\n*Product:* ${product.name}\n*Model:* ${product.model}\n*Offer Price:* ₹${product.price.toLocaleString('en-IN')}\n\nPlease share availability and delivery/installation details.`
    );
    window.open(`https://wa.me/${storeInfo.whatsappNumber}?text=${message}`, '_blank');
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuestMode) {
      onRequestLogin?.();
      return;
    }
    onAddToCart(product);
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-blue-500/70 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
    >
      {/* Top badges (Flipkart style) */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
        {product.isBestseller && (
          <span className="bg-amber-500 text-slate-950 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-slate-950" />
            {t.bestseller}
          </span>
        )}
        {!isGuestMode && discountPercent > 0 && (
          <span className="bg-rose-600 text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
            {discountPercent}% {t.offDiscount}
          </span>
        )}
        {isGuestMode && (
          <span className="bg-slate-800/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {t.viewOnly}
          </span>
        )}
      </div>

      {/* Brand indicator at top right */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700 shadow-xs">
          {product.brand}
        </span>
      </div>

      {/* Product Visual / Image Container */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative w-full h-40 sm:h-48 bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 overflow-hidden cursor-pointer flex flex-col items-center justify-center p-3 sm:p-4 text-center border-b border-slate-100 group-hover:from-slate-850 group-hover:to-blue-900 transition-colors"
      >
        {product.image && product.image.trim() !== '' ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-2 rounded-xl group-hover:scale-105 transition-transform duration-500 bg-white/95"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <>
            {/* Subtle camera icon with glow */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center mb-2 shadow-inner group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-blue-200" />
            </div>

            {/* Clear "CCTV CAMERA" Label */}
            <span className="text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow-xs">
              {t.catCctv}
            </span>
            <span className="text-[10px] text-slate-300 font-mono mt-0.5 max-w-[90%] truncate">
              {product.brand} • {product.model}
            </span>
          </>
        )}

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            {t.viewDetails}
          </span>
        </div>

        {/* Resolution / Key pill at bottom */}
        {product.resolution && (
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
            {product.resolution}
          </div>
        )}
        {product.capacity && (
          <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
            {product.capacity}
          </div>
        )}
        {product.channels && (
          <div className="absolute bottom-2 left-2 bg-indigo-600 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
            {product.channels} CH
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col min-w-0">
        {/* Rating and Model (Flipkart Green Star Pill) */}
        <div className="flex items-center justify-between gap-1 text-xs mb-1.5 min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            <span className="bg-emerald-700 text-white text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
              <span>{product.rating}</span>
              <Star className="w-2.5 h-2.5 fill-white text-white" />
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
              ({product.reviewsCount})
            </span>
          </div>

          <span className="text-[9px] sm:text-[11px] text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-bold border border-blue-100 flex items-center gap-0.5 truncate shrink-0">
            <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 shrink-0" />
            <span>Assured</span>
          </span>
        </div>

        {/* Product Title */}
        <h3 
          onClick={() => onViewDetails(product)}
          className="text-xs sm:text-sm md:text-base font-bold text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors leading-snug mb-1.5 min-w-0"
        >
          {isHi ? product.nameHi : product.name}
        </h3>

        {/* Key Feature Bullets (Compact 2 features for clean height) */}
        <div className="my-1 space-y-0.5 sm:space-y-1 bg-slate-50 p-1.5 sm:p-2.5 rounded-xl border border-slate-100 text-[10px] sm:text-xs min-w-0">
          {(isHi ? product.featuresHi : product.features).slice(0, 2).map((feat, idx) => (
            <div key={idx} className="flex items-start gap-1 text-slate-700 min-w-0">
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0 mt-0.5" />
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>

        {/* Demo & Bundle Quick Link Banner */}
        <button
          type="button"
          onClick={() => onViewDetails(product)}
          className="w-full mt-1 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-blue-900 hover:to-indigo-900 text-white text-[10px] sm:text-[11px] font-bold py-1.5 px-2 rounded-xl border border-slate-800 transition cursor-pointer group/btn min-w-0"
        >
          <span className="flex items-center gap-1 text-blue-200 truncate">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="truncate">CCTV Demo & Bundle</span>
          </span>
          <span className="text-amber-300 font-mono text-[9px] sm:text-[10px] group-hover/btn:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0 ml-1">
            <span>+Fit & SD</span>
            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
          </span>
        </button>

        {/* Warranty Tag */}
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-600 font-medium mb-2 mt-1.5 min-w-0">
          <Shield className="w-3 h-3 text-blue-600 shrink-0" />
          <span className="truncate">{isHi ? product.warrantyHi : product.warranty}</span>
        </div>

        {/* Price & Action Section */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2.5">
          {isGuestMode ? (
            /* GUEST MODE: Price is completely hidden */
            <div className="flex items-center justify-between gap-1 bg-amber-50/90 p-2 rounded-xl border border-amber-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>🔒 {t.viewOnly}</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                Guest
              </span>
            </div>
          ) : (
            /* LOGGED IN USER: Show exact price & GST */
            <div className="flex items-baseline justify-between gap-1 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl md:text-2xl font-black text-slate-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-[11px] sm:text-xs text-slate-400 line-through font-medium">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {t.gstIncluded}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {isGuestMode ? (
            /* GUEST MODE: Prompt to login to buy */
            <button
              onClick={() => onRequestLogin?.()}
              id={`guest-login-btn-${product.id}`}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition shadow-md shadow-blue-700/20 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{t.orderOnWhatsApp}</span>
            </button>
          ) : (
            /* LOGGED IN: Allow adding to cart and WhatsApp ordering */
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                onClick={handleAddToCartClick}
                id={`add-to-cart-${product.id}`}
                className="flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] sm:text-xs py-2 px-1.5 sm:px-2 rounded-xl transition border border-blue-200 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t.addToCartBtn}</span>
              </button>

              <button
                onClick={handleWhatsAppOrder}
                id={`whatsapp-order-${product.id}`}
                className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs py-2 px-1.5 sm:px-2 rounded-xl transition shadow-xs shadow-emerald-700/20 cursor-pointer"
              >
                <span className="truncate">{t.orderOnWhatsApp.split(' ')[0]}</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

