import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Shield, 
  CheckCircle, 
  Star, 
  ShoppingCart, 
  PhoneCall, 
  Package, 
  Sliders, 
  Wrench,
  HelpCircle,
  Sparkles,
  Camera,
  Lock,
  Play,
  Pause,
  Sun,
  Moon,
  Eye,
  Video,
  HardDrive,
  Box,
  Zap,
  Cable,
  Check,
  ArrowRight,
  ShieldCheck,
  Maximize2,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  Radio,
  Share2
} from 'lucide-react';
import { Product, Language, StoreInfo } from '../types';
import { STORE_INFO } from '../data/products';

interface ProductDetailModalProps {
  product: Product | null;
  language: Language;
  storeInfo?: StoreInfo;
  isGuestMode?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onRequestLogin?: () => void;
}

export interface ProductAddon {
  id: string;
  name: string;
  nameHi: string;
  price: number;
  icon: string;
  badge?: string;
  description: string;
  descriptionHi: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  language,
  storeInfo = STORE_INFO,
  isGuestMode = false,
  onClose,
  onAddToCart,
  onRequestLogin,
}) => {
  const isHi = language === 'hi';

  // 1. Camera Demo / Video States
  const [demoMode, setDemoMode] = useState<'day' | 'night_color' | 'night_ir'>('day');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [liveTimestamp, setLiveTimestamp] = useState<string>('');
  const [isLiveStreamSimulated, setIsLiveStreamSimulated] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 2. Addon / Bundle Checkboxes
  const [selectedSdCard, setSelectedSdCard] = useState<'none' | '64gb' | '128gb'>('64gb');
  const [includeJunctionBox, setIncludeJunctionBox] = useState<boolean>(true);
  const [includePowerAdapter, setIncludePowerAdapter] = useState<boolean>(false);
  const [includeCableBundle, setIncludeCableBundle] = useState<boolean>(false);

  // 3. Installation Booking State
  const [includeInstallation, setIncludeInstallation] = useState<boolean>(true);

  // 4. Checkout confirmation modal/toast
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState<boolean>(false);

  // Addon Pricing Matrix
  const SD_64GB_PRICE = 499;
  const SD_128GB_PRICE = 899;
  const JUNCTION_BOX_PRICE = 199;
  const POWER_ADAPTER_PRICE = 249;
  const CABLE_BUNDLE_PRICE = 320;
  const INSTALLATION_PRICE = 350;

  // Live timer simulation for CCTV footage OSD (On Screen Display)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setLiveTimestamp(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!product) return null;

  const discountPercent = product.originalPrice > 0 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Calculate live dynamic totals
  const sdPrice = selectedSdCard === '64gb' ? SD_64GB_PRICE : selectedSdCard === '128gb' ? SD_128GB_PRICE : 0;
  const junctionPrice = includeJunctionBox ? JUNCTION_BOX_PRICE : 0;
  const adapterPrice = includePowerAdapter ? POWER_ADAPTER_PRICE : 0;
  const cablePrice = includeCableBundle ? CABLE_BUNDLE_PRICE : 0;
  const installPrice = includeInstallation ? INSTALLATION_PRICE : 0;

  const totalAddonsPrice = sdPrice + junctionPrice + adapterPrice + cablePrice;
  const grandTotal = product.price + totalAddonsPrice + installPrice;

  // Video play/pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // WhatsApp Checkout with full itemized breakdown
  const handleWhatsAppCheckout = () => {
    if (isGuestMode) {
      onClose();
      onRequestLogin?.();
      return;
    }

    const addonsList: string[] = [];
    if (selectedSdCard === '64gb') addonsList.push(`• 64GB High-Speed Surveillance SD Card (+₹${SD_64GB_PRICE})`);
    if (selectedSdCard === '128gb') addonsList.push(`• 128GB High-Speed Surveillance SD Card (+₹${SD_128GB_PRICE})`);
    if (includeJunctionBox) addonsList.push(`• Waterproof Junction Box (+₹${JUNCTION_BOX_PRICE})`);
    if (includePowerAdapter) addonsList.push(`• 12V 2A Heavy-Duty Power Adapter (+₹${POWER_ADAPTER_PRICE})`);
    if (includeCableBundle) addonsList.push(`• 10m Cat6 / 3+1 Shielded Cable Bundle (+₹${CABLE_BUNDLE_PRICE})`);

    const installationText = includeInstallation
      ? `\n*Installation Service:* YES (+₹${INSTALLATION_PRICE} - Professional Doorstep Fitting & App Setup)`
      : '\n*Installation Service:* Self-Installation (₹0)';

    const message = encodeURIComponent(
      `🛒 *NEW CCTV ORDER & BUNDLE INQUIRY*\n` +
      `--------------------------------\n` +
      `*Product:* ${product.name}\n` +
      `*Brand & Model:* ${product.brand} (${product.model})\n` +
      `*Camera Base Price:* ₹${product.price.toLocaleString('en-IN')}\n\n` +
      `*Selected Add-ons / Bundle:* \n` +
      (addonsList.length > 0 ? addonsList.join('\n') : '• None (Camera Only)') + `\n` +
      installationText + `\n\n` +
      `*--------------------------------*\n` +
      `*💰 GRAND TOTAL:* ₹${grandTotal.toLocaleString('en-IN')} (Incl. GST)\n` +
      `*--------------------------------*\n\n` +
      `Please confirm dispatch time and send payment invoice for Patel CCTV Store.`
    );

    window.open(`https://wa.me/${storeInfo.whatsappNumber}?text=${message}`, '_blank');
  };

  const handleAddToCartWithBundle = () => {
    if (isGuestMode) {
      onClose();
      onRequestLogin?.();
      return;
    }

    // Add base product to cart
    onAddToCart(product);
    setShowCheckoutSuccess(true);
    setTimeout(() => {
      setShowCheckoutSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-5xl w-full max-h-[94vh] overflow-hidden flex flex-col border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-blue-600 text-white text-xs uppercase font-black px-2.5 py-1 rounded-md tracking-wide shadow-sm">
              {product.brand}
            </span>
            <span className="text-slate-300 text-xs font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {product.model}
            </span>
            {product.resolution && (
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                {product.resolution}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Genuine & GST Billed</span>
            </span>
            <button
              onClick={onClose}
              id="close-product-detail-modal"
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-7 space-y-6">
          
          {/* Top Hero Section: Image + Title + Price */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pb-4 border-b border-slate-100">
            
            {/* Product Image preview */}
            <div className="md:col-span-4 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center">
              <div className="w-full h-52 sm:h-60 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-slate-800 flex flex-col items-center justify-center p-3 text-center shadow-md relative overflow-hidden group">
                {product.image && product.image.trim() !== '' ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain bg-white rounded-xl p-2"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/25 border border-blue-400/30 text-blue-300 flex items-center justify-center mb-2 shadow-inner">
                      <Camera className="w-8 h-8 text-blue-200" />
                    </div>
                    <span className="text-sm font-black tracking-wider text-white uppercase drop-shadow-xs">
                      {isHi ? 'सीसीटीवी कैमरा' : 'CCTV CAMERA'}
                    </span>
                    <span className="text-[11px] font-mono text-blue-300 mt-0.5">
                      {product.brand} • {product.model}
                    </span>
                  </>
                )}

                {product.isBestseller && (
                  <div className="absolute top-2.5 left-2.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{isHi ? 'बेस्ट सेलर' : 'Bestseller'}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 w-full grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">{isHi ? 'वारंटी' : 'Warranty'}</div>
                  <div className="font-bold text-slate-800">{isHi ? product.warrantyHi : product.warranty}</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">{isHi ? 'डिलीवरी' : 'Delivery'}</div>
                  <div className="font-bold text-emerald-600">{isHi ? 'फास्ट / ऑनसाइट' : 'Fast Delivery'}</div>
                </div>
              </div>
            </div>

            {/* Product Meta & Pricing */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviewsCount} {isHi ? 'रिव्यूज' : 'reviews'})</span>
                </div>
                <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                  {isHi ? 'ऑरिजिनल ब्रांडेड माल' : '100% Brand Certified'}
                </span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                  {isHi ? 'जीएसटी इनवॉइस उपलब्ध' : 'GST Invoice Ready'}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                {isHi ? product.nameHi : product.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isHi ? product.descriptionHi : product.description}
              </p>

              {/* Price Block */}
              {isGuestMode ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs sm:text-sm">
                      <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{isHi ? '🔒 होलसेल कीमत देखने हेतु लॉगिन करें' : '🔒 Login to View Wholesale Price'}</span>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      {isHi
                        ? 'असली होलसेल रेट, बंडल डिस्काउंट व जीएसटी बिल देखने के लिए मोबाइल नंबर से लॉगिन करें।'
                        : 'Login with your mobile number to unlock wholesale price and bundle discounts.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onRequestLogin?.();
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shrink-0 cursor-pointer shadow-xs"
                  >
                    {isHi ? 'लॉगिन करें' : 'Login Now'}
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3.5 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {isHi ? 'कैमरा बेस प्राइस (होलसेल ऑफर)' : 'Camera Base Price (Wholesale Offer)'}
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs sm:text-sm text-slate-400 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      {discountPercent > 0 && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          {discountPercent}% {isHi ? 'बचत' : 'OFF'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-xs block">
                      {isHi ? 'GST इनवॉइस बिल' : 'With GST Bill'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {isHi ? '2-साल वारंटी सहित' : '2-Year Warranty'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1. कैमरा डेमो / फुटेज (Night & Day Vision Video & Footage Simulation) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                    <span>1. कैमरा डेमो (Night & Day Vision Footage Demo)</span>
                    <span className="bg-red-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      REC
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {isHi ? 'दिन व रात के असली विज़न और क्लैरिटी की लाइव जांच करें' : 'Live Interactive Day, Color Night & IR Vision footage'}
                  </p>
                </div>
              </div>

              {/* Vision Mode Switcher Buttons */}
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDemoMode('day')}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    demoMode === 'day'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>{isHi ? 'दिन (Day)' : 'Day'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoMode('night_color')}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    demoMode === 'night_color'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>{isHi ? 'कलर नाइट (Color Night)' : 'Color Night'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoMode('night_ir')}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    demoMode === 'night_ir'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isHi ? 'IR ब्लैक/व्हाइट' : 'IR Night'}</span>
                </button>
              </div>
            </div>

            {/* Video Box Container with CCTV Overlays */}
            <div className="p-3 sm:p-4 bg-slate-950">
              <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 shadow-inner group">
                
                {/* HTML5 Video or Simulated Stream */}
                {isLiveStreamSimulated ? (
                  <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                    {/* Simulated Background Backdrop based on vision mode */}
                    {demoMode === 'day' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-amber-100 to-emerald-200 opacity-90 transition-all duration-500">
                        {/* Street & store facade background graphic */}
                        <div className="absolute bottom-0 w-full h-24 bg-slate-700/80" />
                        <div className="absolute bottom-16 left-8 w-24 h-32 bg-slate-800 rounded-t-lg border-2 border-slate-600" />
                        <div className="absolute bottom-16 right-12 w-28 h-36 bg-blue-900 rounded-t-lg border-2 border-blue-700" />
                        {/* Target Box AI Human Detection */}
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-28 h-40 border-2 border-emerald-400 rounded bg-emerald-400/10 flex flex-col justify-between p-1.5 animate-pulse">
                          <span className="text-[9px] font-mono font-bold bg-emerald-500 text-black px-1 rounded self-start">
                            HUMAN 98.4%
                          </span>
                          <span className="text-[9px] font-mono text-emerald-300 self-end">
                            FACE OK
                          </span>
                        </div>
                      </div>
                    )}

                    {demoMode === 'night_color' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 transition-all duration-500">
                        {/* Smart Dual Light Warm LED effect */}
                        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-200/20 via-amber-100/10 to-transparent" />
                        <div className="absolute bottom-0 w-full h-24 bg-slate-900" />
                        <div className="absolute bottom-16 left-8 w-24 h-32 bg-slate-850 rounded-t-lg border-2 border-amber-500/40" />
                        <div className="absolute bottom-16 right-12 w-28 h-36 bg-indigo-950 rounded-t-lg border-2 border-blue-500/40" />
                        {/* ColorVu Spotlight Target Box */}
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-28 h-40 border-2 border-amber-400 rounded bg-amber-400/15 flex flex-col justify-between p-1.5 animate-pulse">
                          <span className="text-[9px] font-mono font-bold bg-amber-400 text-black px-1 rounded self-start">
                            COLORVU SMART LIGHT
                          </span>
                          <span className="text-[9px] font-mono text-amber-200 self-end">
                            FULL COLOR
                          </span>
                        </div>
                      </div>
                    )}

                    {demoMode === 'night_ir' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black grayscale contrast-125 transition-all duration-500">
                        {/* IR Illuminator monochrome grain */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_0%,_transparent_75%)]" />
                        <div className="absolute bottom-0 w-full h-24 bg-zinc-800" />
                        <div className="absolute bottom-16 left-8 w-24 h-32 bg-zinc-700 rounded-t-lg border-2 border-zinc-500" />
                        <div className="absolute bottom-16 right-12 w-28 h-36 bg-zinc-650 rounded-t-lg border-2 border-zinc-500" />
                        {/* IR Night Vision Target Box */}
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-28 h-40 border-2 border-white/80 rounded bg-white/10 flex flex-col justify-between p-1.5">
                          <span className="text-[9px] font-mono font-bold bg-white text-black px-1 rounded self-start">
                            IR 850nm (30M)
                          </span>
                          <span className="text-[9px] font-mono text-white self-end">
                            NIGHT B/W
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Camera Center Crosshair */}
                    <div className="relative z-10 text-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center mx-auto mb-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      </div>
                      <p className="text-white font-black text-xs sm:text-sm tracking-wider uppercase drop-shadow-md">
                        {demoMode === 'day' && (isHi ? '4K अल्ट्रा एचडी डे-विज़न डेमो' : '4K Ultra HD Day Vision Demo')}
                        {demoMode === 'night_color' && (isHi ? 'कलर नाइट-विज़न (ColorVu / Full Color)' : 'Smart ColorVu Night Vision Demo')}
                        {demoMode === 'night_ir' && (isHi ? '30-मीटर इन्फ्रारेड (IR) नाइट विज़न' : '30-Meter Infrared IR Night Vision Demo')}
                      </p>
                      <p className="text-[11px] text-slate-300 font-mono">
                        {product.brand} • {product.model} • 25 FPS
                      </p>
                    </div>
                  </div>
                ) : (
                  <video 
                    ref={videoRef}
                    controls 
                    className="w-full h-full object-contain"
                    poster="https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80"
                  >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-traffic-security-camera-view-41440-large.mp4" type="video/mp4" />
                    {isHi ? 'आपका ब्राउज़र वीडियो सपोर्ट नहीं करता।' : 'Your browser does not support the video tag.'}
                  </video>
                )}

                {/* CCTV OSD Top Bar (Timestamp, Channel Name, Bitrate) */}
                <div className="absolute top-2.5 inset-x-3 flex items-center justify-between text-white font-mono text-[10px] sm:text-xs z-20 pointer-events-none drop-shadow-md">
                  <div className="flex items-center gap-2 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>CH-01: {product.name.substring(0, 18)}</span>
                  </div>

                  <div className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-2">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{liveTimestamp || '2026-08-22 12:00:00'}</span>
                  </div>
                </div>

                {/* CCTV OSD Bottom Info (Resolution, Quality, Bitrate) */}
                <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-white font-mono text-[10px] sm:text-xs z-20 pointer-events-none drop-shadow-md">
                  <div className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                    <span>{product.resolution || '4K 5MP'} | H.265+ | 4096 Kbps</span>
                  </div>

                  <div className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span className="text-emerald-300 font-bold">LIVE PREVIEW</span>
                  </div>
                </div>

                {/* Floating Interactive Controls in Corner */}
                <div className="absolute bottom-10 right-3 z-30 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAudioMuted(!isAudioMuted)}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs transition cursor-pointer border border-white/20"
                    title={isAudioMuted ? 'ऑडियो चालू करें' : 'ऑडियो बंद करें'}
                  >
                    {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Cycle through modes
                      if (demoMode === 'day') setDemoMode('night_color');
                      else if (demoMode === 'night_color') setDemoMode('night_ir');
                      else setDemoMode('day');
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold transition cursor-pointer shadow-md"
                    title="मोड बदलें (Switch Mode)"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isHi ? 'विज़न बदलें' : 'Switch Mode'}</span>
                  </button>
                </div>

              </div>

              {/* Mode Explanation Footnote */}
              <div className="mt-2 text-center text-[11px] text-slate-400">
                {demoMode === 'day' && '☀️ दिन में 4K क्रिस्टल क्लियर कलर व्यू और ऑटो वाइड डायनामिक रेंज (WDR)।'}
                {demoMode === 'night_color' && '🌙 स्मार्ट वॉर्म एलईडी द्वारा घुप अंधेरे में भी बिल्कुल दिन जैसा 24/7 फुल कलर वीडियो रिकॉर्डिंग।'}
                {demoMode === 'night_ir' && '🌑 30 मीटर तक हाई-पावर इन्फ्रारेड एलईडी द्वारा जीरो लाइट में भी साफ नाइट विज़न।'}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. जरूरी एक्सेसरीज जोड़ें (Storage & Accessories Bundle Selector) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    2. जरूरी एक्सेसरीज जोड़ें (Accessories Bundle)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isHi ? 'कैमरे के साथ जरूरी मेमोरी कार्ड व वाटरप्रूफ बॉक्स साथ लें' : 'Select essential storage & weatherproof accessories for this camera'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                {isHi ? 'होलसेल बंडल छूट' : 'Bundle Savings'}
              </span>
            </div>

            <div className="p-4 space-y-3 divide-y divide-slate-100">
              
              {/* SD Card Options */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isHi ? 'मेमोरी स्टोरेज कार्ड (SD Card)' : 'Storage MicroSD Card'}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isHi ? '7 से 15 दिन ऑटो-लूप रिकॉर्डिंग' : '7 to 15 Days Loop Recording'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option: No Card */}
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition cursor-pointer ${
                      selectedSdCard === 'none'
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="sdcard_select"
                        checked={selectedSdCard === 'none'}
                        onChange={() => setSelectedSdCard('none')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-800">{isHi ? 'कार्ड नहीं चाहिए' : 'No SD Card'}</div>
                        <div className="text-[10px] text-slate-400">{isHi ? 'सिर्फ लाइव व्यू' : 'Live View Only'}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500">₹0</span>
                  </label>

                  {/* Option: 64GB Card */}
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition cursor-pointer ${
                      selectedSdCard === '64gb'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        id="sdcard"
                        name="sdcard_select"
                        checked={selectedSdCard === '64gb'}
                        onChange={() => setSelectedSdCard('64gb')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                          <span>64GB High-Speed SD Card</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1 rounded">POPULAR</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{isHi ? '~7-दिन लूप रिकॉर्डिंग' : '~7 Days Backup'}</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-700 font-mono">+₹{SD_64GB_PRICE}</span>
                  </label>

                  {/* Option: 128GB Card */}
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition cursor-pointer ${
                      selectedSdCard === '128gb'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="sdcard_select"
                        checked={selectedSdCard === '128gb'}
                        onChange={() => setSelectedSdCard('128gb')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">128GB High-Speed SD Card</div>
                        <div className="text-[10px] text-slate-500">{isHi ? '~15-दिन लूप रिकॉर्डिंग' : '~15 Days Backup'}</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-700 font-mono">+₹{SD_128GB_PRICE}</span>
                  </label>
                </div>
              </div>

              {/* Addon Item 2: Waterproof Junction Box */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="power"
                    checked={includeJunctionBox}
                    onChange={(e) => setIncludeJunctionBox(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-blue-600" />
                      <span>Waterproof Camera Junction Box</span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">अनुशंसित / Recommended</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isHi ? 'कैमरा तारों व एडॉप्टर को बारिश, धूप व धूल से 100% सुरक्षित रखता है।' : 'Protects power adapter & camera wires from rain, dust, and tampering.'}
                    </p>
                  </div>
                </label>
                <span className="font-black text-xs sm:text-sm text-slate-900 font-mono shrink-0">
                  +₹{JUNCTION_BOX_PRICE}
                </span>
              </div>

              {/* Addon Item 3: Heavy Duty Power Adapter */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includePowerAdapter}
                    onChange={(e) => setIncludePowerAdapter(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>12V 2A Weatherproof Heavy-Duty Power Adapter</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isHi ? 'हाई-ग्रेड कॉपर सर्ज प्रोटेक्शन एडॉप्टर (कैमरा जलने से बचाता है)।' : 'High quality surge-protected 12V 2A power supply unit.'}
                    </p>
                  </div>
                </label>
                <span className="font-black text-xs sm:text-sm text-slate-900 font-mono shrink-0">
                  +₹{POWER_ADAPTER_PRICE}
                </span>
              </div>

              {/* Addon Item 4: 10m High-Speed Shielded Wire Bundle */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeCableBundle}
                    onChange={(e) => setIncludeCableBundle(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <Cable className="w-3.5 h-3.5 text-emerald-600" />
                      <span>10-Meter High-Grade Cat6 / 3+1 CCTV Cable Bundle</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isHi ? 'प्योर कॉपर वायर + कनेक्टर्स (BNC/DC या RJ45 क्रिम्प्ड)।' : '100% pure copper shielded cable with pre-crimped weatherproof connectors.'}
                    </p>
                  </div>
                </label>
                <span className="font-black text-xs sm:text-sm text-slate-900 font-mono shrink-0">
                  +₹{CABLE_BUNDLE_PRICE}
                </span>
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. इंस्टॉलेशन बुकिंग (Professional Installation Service Selector) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    3. इंस्टॉलेशन सर्विस (Doorstep Fitting & App Setup)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isHi ? 'प्रमाणित तकनीशियन द्वारा ऑनसाइट ड्रिलिंग, वायरिंग व मोबाइल ऐप कॉन्फ़िगरेशन' : 'Professional technician home/shop installation & mobile app setup'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                {isHi ? '30-दिन वारंटी' : '30-Day Service Guarantee'}
              </span>
            </div>

            <div className="p-4">
              <label 
                className={`flex items-start justify-between p-4 rounded-2xl border-2 transition cursor-pointer ${
                  includeInstallation
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="install"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <strong className="text-sm sm:text-base text-slate-900 font-bold block">
                      {isHi ? 'प्रोफेशनल इंस्टॉलेशन जोड़ें' : 'Add Professional Doorstep Installation'}
                    </strong>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {isHi
                        ? 'पटेल सीसीटीवी का प्रमाणित टेक्नीशियन आपके पते पर आकर पूरी फिटिंग, सही एंगल अलाइनमेंट व मोबाइल ऐप (Hik-Connect / gCMOB / Tapo) में लाइव व्यू सेटअप करेगा।'
                        : 'Certified technician visits your premise for complete wall mounting, cable routing, camera alignment and live mobile app configuration.'}
                    </p>

                    {/* Feature bullet list */}
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium text-emerald-900">
                      <span className="bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        {isHi ? 'ड्रिलिंग व माउंटिंग' : 'Wall Mounting'}
                      </span>
                      <span className="bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        {isHi ? 'मोबाइल ऐप लाइव व्यू' : 'Mobile App Setup'}
                      </span>
                      <span className="bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        {isHi ? '30-दिन फ्री सर्विस वारंटी' : '30-Day Free Service'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className="text-base sm:text-lg font-black text-emerald-700 font-mono block">
                    +₹{INSTALLATION_PRICE}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {isHi ? 'प्रति कैमरा' : 'Per camera'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Technical Specifications Table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>{isHi ? 'तकनीकी विवरण (Technical Specifications)' : 'Technical Specifications'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {Object.entries(product.specs).map(([key, value], idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{key}</span>
                    <span className="font-bold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 4. Modal Footer: Dynamic Itemized Total + आगे बढ़ें (Checkout) Button */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
          
          {/* Dynamic Calculated Total Block */}
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{isHi ? 'कुल देय राशि (Total Payable):' : 'Grand Total Amount:'}</span>
              {totalAddonsPrice > 0 || includeInstallation ? (
                <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded text-[10px]">
                  {isHi ? 'बंडल व इंस्टॉलेशन सहित' : 'Includes Bundle & Fitting'}
                </span>
              ) : null}
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
              {isGuestMode ? (
                <span className="text-lg font-black text-amber-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>{isHi ? 'कीमत देखने हेतु लॉगिन करें' : 'Login to View Final Price'}</span>
                </span>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500">
                    (₹{product.price.toLocaleString('en-IN')} + ₹{(totalAddonsPrice + installPrice).toLocaleString('en-IN')} {isHi ? 'एक्सेसरीज/सर्विस' : 'addons'})
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isGuestMode ? (
              <button
                onClick={() => {
                  onClose();
                  onRequestLogin?.();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-700/20 transition cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>{isHi ? 'लॉगिन करें (ऑर्डर व चेकआउट हेतु)' : 'Login to Checkout'}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAddToCartWithBundle}
                  id="add-bundle-to-cart-btn"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl transition border border-blue-300 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isHi ? '+ कार्ट में जोड़ें' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  id="checkout-buy-btn"
                  className="buy-btn flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-700/30 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{isHi ? 'आगे बढ़ें (Checkout)' : 'Proceed (Checkout)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

        </div>

        {/* Success Toast Modal */}
        {showCheckoutSuccess && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200 animate-zoomIn">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                {isHi ? 'कार्ट में बंडल सफलतापूर्वक जोड़ा गया!' : 'Bundle Added to Cart!'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {isHi
                  ? `कैमरा, SD कार्ड व फिटिंग सहित कुल राशि: ₹${grandTotal.toLocaleString('en-IN')}`
                  : `Package Total: ₹${grandTotal.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
