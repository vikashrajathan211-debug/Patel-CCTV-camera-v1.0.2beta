import React, { useState } from 'react';
import { 
  X, 
  HardDrive, 
  Calculator, 
  Clock, 
  Sparkles, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Language, Product } from '../types';
import { PRODUCTS, STORE_INFO } from '../data/products';

interface StorageCalculatorProps {
  language: Language;
  onClose: () => void;
  onSelectHddProduct: (product: Product) => void;
}

export const StorageCalculator: React.FC<StorageCalculatorProps> = ({
  language,
  onClose,
  onSelectHddProduct,
}) => {
  const isHi = language === 'hi';

  const [numCameras, setNumCameras] = useState<number>(4);
  const [resolution, setResolution] = useState<'2mp' | '3k_4mp' | '5mp' | '4k'>('2mp');
  const [codec, setCodec] = useState<'h264' | 'h265' | 'h265plus'>('h265plus');
  const [recordMode, setRecordMode] = useState<'continuous' | 'motion'>('continuous');

  // Bitrate in Mbps per camera based on resolution and codec
  const bitrateMap: Record<string, Record<string, number>> = {
    '2mp': {
      h264: 4.0,
      h265: 2.0,
      h265plus: 1.2,
    },
    '3k_4mp': {
      h264: 6.0,
      h265: 3.2,
      h265plus: 1.8,
    },
    '5mp': {
      h264: 8.0,
      h265: 4.0,
      h265plus: 2.2,
    },
    '4k': {
      h264: 12.0,
      h265: 6.0,
      h265plus: 3.5,
    },
  };

  const bitratePerCam = bitrateMap[resolution][codec];
  const hoursPerDay = recordMode === 'continuous' ? 24 : 10;

  // GB per day for all cameras
  // Bitrate in Mbps * 3600 seconds * hoursPerDay / 8 bits per byte / 1024 (MB) / 1024 (GB)
  // Or Mbps * 3600 * hours / 8000 approx GB
  const gbPerDay = (bitratePerCam * numCameras * (hoursPerDay * 3600)) / (8 * 1024);

  const calculateDays = (hddSizeTB: number) => {
    if (gbPerDay <= 0) return 0;
    const usableGB = hddSizeTB * 930; // Usable formatting capacity in GB
    return Math.max(1, Math.round(usableGB / gbPerDay));
  };

  const days1TB = calculateDays(1);
  const days2TB = calculateDays(2);
  const days4TB = calculateDays(4);
  const days8TB = calculateDays(8);

  // Recommended HDD
  let recommendedSize = '2TB';
  let recommendedProduct = PRODUCTS.find(p => p.id === 'hdd-wd-purple-2tb') || PRODUCTS[5];

  if (numCameras <= 2 && resolution === '2mp') {
    recommendedSize = '1TB';
    recommendedProduct = PRODUCTS.find(p => p.id === 'hdd-seagate-skyhawk-1tb') || PRODUCTS[4];
  } else if (numCameras >= 8 || resolution === '4k' || days2TB < 20) {
    recommendedSize = '4TB';
    recommendedProduct = PRODUCTS.find(p => p.id === 'hdd-wd-purple-4tb') || PRODUCTS[6];
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between border-b border-indigo-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/60 flex items-center justify-center border border-indigo-400/40">
              <Calculator className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight">
                {isHi ? 'CCTV सर्विलांस हार्ड डिस्क कैलकुलेटर' : 'CCTV Storage & Recording Days Calculator'}
              </h2>
              <p className="text-xs text-indigo-200">
                {isHi ? 'जानें आपके सेटअप पर 1TB, 2TB या 4TB हार्ड डिस्क कितने दिन तक रिकॉर्डिंग रखेगी' : 'Accurately estimate recording days for 1TB, 2TB, 4TB & 8TB Surveillance HDDs'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Number of cameras */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {isHi ? 'कैमरों की संख्या' : 'No. of Cameras'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={numCameras}
                  onChange={(e) => setNumCameras(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="w-8 text-center font-black text-slate-900 text-base">
                  {numCameras}
                </span>
              </div>
            </div>

            {/* Resolution */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {isHi ? 'कैमरा रेजोल्यूशन' : 'Resolution'}
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
              >
                <option value="2mp">2MP Full HD (1080p)</option>
                <option value="3k_4mp">3K / 4MP Quad HD</option>
                <option value="5mp">5MP Ultra HD</option>
                <option value="4k">4K (8MP) Ultra HD</option>
              </select>
            </div>

            {/* Compression Codec */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {isHi ? 'वीडियो कोडिंग (Codec)' : 'Compression'}
              </label>
              <select
                value={codec}
                onChange={(e) => setCodec(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
              >
                <option value="h265plus">H.265+ (Best - 50% Saver)</option>
                <option value="h265">H.265 (Standard HEVC)</option>
                <option value="h264">H.264 (Older DVRs)</option>
              </select>
            </div>

            {/* Recording Mode */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {isHi ? 'रिकॉर्डिंग मोड' : 'Recording Mode'}
              </label>
              <select
                value={recordMode}
                onChange={(e) => setRecordMode(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
              >
                <option value="continuous">24x7 Continuous (लगातार)</option>
                <option value="motion">Motion Detection (~10 hrs/day)</option>
              </select>
            </div>
          </div>

          {/* Daily Usage Metric */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">
                  {isHi ? 'प्रतिदिन डेटा रिकॉर्डिंग (सभी कैमरों का):' : 'Estimated Daily Data Generated:'}
                </div>
                <div className="text-lg font-black text-slate-900">
                  ~{gbPerDay.toFixed(1)} GB / {isHi ? 'दिन' : 'Day'}
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              {isHi ? 'गणना H.265+ सर्विलांस स्ट्रीम पर आधारित है' : 'Calculated for professional surveillance continuous stream'}
            </div>
          </div>

          {/* Recording Days Output Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {isHi ? 'हार्ड डिस्क क्षमता व रिकॉर्डिंग के दिन (Retention Days)' : 'Storage Capacity vs Recording Retention Days'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1TB Card */}
              <div className={`p-4 rounded-2xl border transition relative ${
                recommendedSize === '1TB' 
                  ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                {recommendedSize === '1TB' && (
                  <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                    {isHi ? 'अनुशंसित' : 'Recommended'}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <span className="font-black text-base text-slate-900">1 TB HDD</span>
                </div>
                <div className="text-3xl font-black text-blue-700 mb-1">
                  ~{days1TB} {isHi ? 'दिन' : 'Days'}
                </div>
                <div className="text-xs text-slate-500">
                  {isHi ? '1 से 2 कैमरों के लिए उपयुक्त' : 'Ideal for 1-2 home cameras'}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">₹3,600</span>
                  <span className="text-slate-400 font-medium">3 Yr Warranty</span>
                </div>
              </div>

              {/* 2TB Card */}
              <div className={`p-4 rounded-2xl border transition relative ${
                recommendedSize === '2TB' 
                  ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                {recommendedSize === '2TB' && (
                  <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                    {isHi ? 'सर्वोत्तम चुनाव' : 'Best Choice'}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-5 h-5 text-purple-600" />
                  <span className="font-black text-base text-slate-900">2 TB WD Purple</span>
                </div>
                <div className="text-3xl font-black text-emerald-700 mb-1">
                  ~{days2TB} {isHi ? 'दिन' : 'Days'}
                </div>
                <div className="text-xs text-slate-500">
                  {isHi ? '4 कैमरों पर 30-35 दिन बैकअप' : 'Full 1 Month Backup for 4 Cams'}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">₹5,350</span>
                  <span className="text-slate-400 font-medium">3 Yr National Warranty</span>
                </div>
              </div>

              {/* 4TB Card */}
              <div className={`p-4 rounded-2xl border transition relative ${
                recommendedSize === '4TB' 
                  ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                {recommendedSize === '4TB' && (
                  <span className="absolute -top-2.5 right-3 bg-purple-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                    {isHi ? 'लंबा बैकअप' : 'Heavy Backup'}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-5 h-5 text-indigo-600" />
                  <span className="font-black text-base text-slate-900">4 TB WD Purple</span>
                </div>
                <div className="text-3xl font-black text-purple-700 mb-1">
                  ~{days4TB} {isHi ? 'दिन' : 'Days'}
                </div>
                <div className="text-xs text-slate-500">
                  {isHi ? '8-16 कैमरों व दुकानों हेतु' : 'For 8 Cams or 60+ days retention'}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">₹8,900</span>
                  <span className="text-slate-400 font-medium">3 Yr National Warranty</span>
                </div>
              </div>

              {/* 8TB Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-5 h-5 text-slate-600" />
                  <span className="font-black text-base text-slate-900">8 TB Enterprise</span>
                </div>
                <div className="text-3xl font-black text-slate-700 mb-1">
                  ~{days8TB} {isHi ? 'दिन' : 'Days'}
                </div>
                <div className="text-xs text-slate-500">
                  {isHi ? 'फैक्ट्री, पेट्रोल पंप व बैंक' : 'Banks, Jewellery & Factories'}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">₹16,500</span>
                  <span className="text-slate-400 font-medium">5 Yr Pro Warranty</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expert Advice Note */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5">
                {isHi ? 'पटेल सीसीटीवी सर्विलांस सलाह (Important Tip):' : 'Patel CCTV Surveillance Hard Drive Advisory:'}
              </strong>
              <span>
                {isHi
                  ? 'CCTV में हमेशा केवल सर्विलांस हार्ड डिस्क (जैसे WD Purple या Seagate SkyHawk) ही इस्तेमाल करें। कंप्यूटर वाली साधारण डिस्क 24x7 रिकॉर्डिंग में जल्दी खराब हो जाती है और रिकॉर्डिंग गायब हो सकती है।'
                  : 'Always use dedicated 24/7 Surveillance rated drives (WD Purple / Seagate Skyhawk). Desktop PC hard drives fail rapidly under continuous 24/7 camera write workloads.'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-medium">
            {isHi ? `आपके ${numCameras} कैमरों के लिए अनुशंसित:` : `Recommended for your ${numCameras} cameras:`}{' '}
            <strong className="text-slate-900">{recommendedProduct.name}</strong>
          </div>

          <button
            onClick={() => {
              onSelectHddProduct(recommendedProduct);
              onClose();
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow transition cursor-pointer"
          >
            <span>{isHi ? 'यह हार्ड डिस्क कार्ट में जोड़ें' : 'Add Recommended HDD to Cart'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
