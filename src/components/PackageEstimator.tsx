import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Building2, 
  Home, 
  Store, 
  Factory, 
  HardDrive, 
  Tv, 
  Wrench, 
  Check, 
  Sparkles, 
  Share2, 
  ShoppingCart, 
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Language, Product, StoreInfo } from '../types';
import { STORE_INFO } from '../data/products';

interface PackageEstimatorProps {
  language: Language;
  storeInfo?: StoreInfo;
  onClose: () => void;
  onAddCustomPackageToCart: (customProduct: Product) => void;
}

export const PackageEstimator: React.FC<PackageEstimatorProps> = ({
  language,
  storeInfo = STORE_INFO,
  onClose,
  onAddCustomPackageToCart,
}) => {
  const isHi = language === 'hi';

  const [premise, setPremise] = useState<'home' | 'shop' | 'office' | 'factory'>('home');
  const [domeCount, setDomeCount] = useState<number>(2);
  const [bulletCount, setBulletCount] = useState<number>(2);
  const [quality, setQuality] = useState<'2mp_hd' | '3k_colorvu' | '5mp_audio'>('3k_colorvu');
  const [brand, setBrand] = useState<'CP Plus' | 'Hikvision' | 'Dahua'>('Hikvision');
  const [storage, setStorage] = useState<'none' | '1TB' | '2TB' | '4TB'>('2TB');
  const [cableLength, setCableLength] = useState<number>(90);
  const [includeRack, setIncludeRack] = useState<boolean>(false);
  const [includeInstallation, setIncludeInstallation] = useState<boolean>(true);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerCity, setCustomerCity] = useState<string>('');

  const totalCameras = domeCount + bulletCount;

  // Camera pricing by quality
  const cameraPriceMap = {
    '2mp_hd': { price: 1450, original: 2400, label: '2MP Full HD (1080p)', labelHi: '2MP फुल एचडी' },
    '3k_colorvu': { price: 2450, original: 3800, label: '3K ColorVu + Audio Mic', labelHi: '3K कलरवू 24/7 + माइक' },
    '5mp_audio': { price: 2650, original: 4200, label: '5MP Pro Audio / Night Vision', labelHi: '5MP प्रो ऑडियो व नाइट विजन' },
  };

  const currentCamInfo = cameraPriceMap[quality];
  const camerasCost = totalCameras * currentCamInfo.price;
  const camerasOriginal = totalCameras * currentCamInfo.original;

  // Determine required DVR channels
  let dvrChannels: 4 | 8 | 16 = 4;
  let dvrPrice = 2850;
  let dvrOriginal = 4200;
  let smpsPrice = 650;
  let smpsName = '4-Channel 12V 5A SMPS';

  if (totalCameras > 8) {
    dvrChannels = 16;
    dvrPrice = 7400;
    dvrOriginal = 11500;
    smpsPrice = 1650;
    smpsName = '16-Channel 12V 20A SMPS';
  } else if (totalCameras > 4) {
    dvrChannels = 8;
    dvrPrice = 4950;
    dvrOriginal = 7500;
    smpsPrice = 1150;
    smpsName = '8-Channel 12V 10A SMPS';
  } else if (totalCameras === 0) {
    dvrPrice = 0;
    dvrOriginal = 0;
    smpsPrice = 0;
  }

  // Storage pricing
  const storageMap = {
    'none': { price: 0, original: 0, label: 'No HDD (Only live view)', labelHi: 'हार्ड डिस्क नहीं चाहिए', days: '0 Days' },
    '1TB': { price: 3600, original: 5100, label: '1TB Seagate / WD Surveillance', labelHi: '1TB सर्विलांस (~15-20 दिन रिकॉर्डिंग)', days: '15-20 Days' },
    '2TB': { price: 5350, original: 7800, label: '2TB Western Digital Purple', labelHi: '2TB WD पर्पल (~30-40 दिन रिकॉर्डिंग)', days: '30-40 Days' },
    '4TB': { price: 8900, original: 12500, label: '4TB Western Digital Purple Pro', labelHi: '4TB WD पर्पल (~60-80 दिन रिकॉर्डिंग)', days: '60-80 Days' }
  };
  const hddInfo = storageMap[storage];

  // Cable and connectors cost (3+1 pure copper ₹15/m + ₹50 per camera connector set)
  const cableCost = cableLength * 15;
  const connectorsCost = totalCameras * 60; // 2 BNC + 1 DC connector per cam

  // Rack cost
  const rackCost = includeRack ? 1450 : 0;

  // Installation cost (₹450 per camera setup + free DVR setup)
  const installationCost = includeInstallation ? (totalCameras * 450) : 0;

  // Total Calculations
  const totalPrice = camerasCost + dvrPrice + hddInfo.price + smpsPrice + cableCost + connectorsCost + rackCost + installationCost;
  const originalTotalPrice = camerasOriginal + dvrOriginal + hddInfo.original + (smpsPrice * 1.5) + (cableCost * 1.3) + connectorsCost + (includeRack ? 2400 : 0) + installationCost;
  const totalSavings = Math.max(0, originalTotalPrice - totalPrice);

  // Generate WhatsApp formatted estimate text
  const generateWhatsAppMessage = () => {
    const lines = [
      `*🌟 PATEL CCTV CAMERA - CUSTOM PACKAGE ESTIMATE 🌟*`,
      `==================================`,
      customerName ? `*Customer:* ${customerName}` : `*Customer Inquiry*`,
      customerCity ? `*Location:* ${customerCity}` : '',
      `*Premise Type:* ${premise.toUpperCase()}`,
      `*Brand Preference:* ${brand}`,
      `----------------------------------`,
      `*1. CAMERAS (${totalCameras} Total)*`,
      `   • Indoor Dome: ${domeCount} Nos`,
      `   • Outdoor Bullet: ${bulletCount} Nos`,
      `   • Quality/Model: ${currentCamInfo.label}`,
      `   • Cameras Subtotal: ₹${camerasCost.toLocaleString('en-IN')}`,
      `----------------------------------`,
      `*2. RECORDING & STORAGE*`,
      `   • DVR: ${brand} ${dvrChannels}-Channel HD DVR (₹${dvrPrice.toLocaleString('en-IN')})`,
      `   • HDD: ${hddInfo.label} (₹${hddInfo.price.toLocaleString('en-IN')})`,
      `----------------------------------`,
      `*3. ACCESSORIES & WIRING*`,
      `   • Power Supply: ${smpsName} (₹${smpsPrice.toLocaleString('en-IN')})`,
      `   • 3+1 Pure Copper Cable: ${cableLength}m (₹${cableCost.toLocaleString('en-IN')})`,
      `   • Connectors (BNC/DC): ${totalCameras * 2} BNC + ${totalCameras} DC (₹${connectorsCost})`,
      includeRack ? `   • 4U Lockable Metal Rack: Yes (₹1,450)` : `   • 4U Rack: Not included`,
      includeInstallation ? `   • Pro Installation & Mobile App Setup: Yes (₹${installationCost.toLocaleString('en-IN')})` : `   • Installation: DIY / Self`,
      `==================================`,
      `*💰 TOTAL ESTIMATED PRICE: ₹${totalPrice.toLocaleString('en-IN')}*`,
      `*(Estimated Market Price: ₹${originalTotalPrice.toLocaleString('en-IN')} | You Save: ₹${totalSavings.toLocaleString('en-IN')})*`,
      `==================================`,
      `Please confirm final quotation & earliest installation date.`
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent(lines)}`, '_blank');
  };

  const handleAddBundleToCart = () => {
    const customBundleProduct: Product = {
      id: `custom-bundle-${Date.now()}`,
      name: `Custom ${totalCameras}-Camera ${brand} ${currentCamInfo.label} Package`,
      nameHi: `कस्टम ${totalCameras}-कैमरा ${brand} ${currentCamInfo.labelHi} पैकेज`,
      category: 'combo',
      brand: brand,
      model: `PATEL-CUSTOM-${totalCameras}CAM`,
      price: totalPrice,
      originalPrice: originalTotalPrice,
      rating: 5.0,
      reviewsCount: 1,
      inStock: true,
      image: '',
      warranty: '2 Years on Hardware, 3 Years on HDD',
      warrantyHi: 'हार्डवेयर पर 2 साल, हार्ड डिस्क पर 3 साल वारंटी',
      features: [
        `${domeCount}x Indoor Dome + ${bulletCount}x Outdoor Bullet (${currentCamInfo.label})`,
        `1x ${brand} ${dvrChannels}-Channel DVR`,
        `1x ${hddInfo.label}`,
        `1x ${smpsName} + ${cableLength}m Cable + Connectors`,
        includeRack ? '1x 4U Wall-Mount Lockable Rack' : 'No Rack',
        includeInstallation ? 'Complete Onsite Professional Installation' : 'Hardware Supply'
      ],
      featuresHi: [
        `${domeCount} इंडोर डोम + ${bulletCount} आउटडोर बुलेट कैमरे`,
        `1x ${brand} ${dvrChannels}-चैनल DVR`,
        `1x ${hddInfo.labelHi}`,
        `पावर सप्लाई, ${cableLength}m केबल और सभी कनेक्टर`,
        includeInstallation ? 'ऑनसाइट इंस्टॉलेशन व मोबाइल ऐप सेटअप शामिल' : 'केवल सामान सप्लाई'
      ],
      tags: ['Custom Estimate', `${totalCameras}-Cameras`, brand],
      description: `Custom generated ${totalCameras}-camera CCTV setup for ${premise} including DVR, surveillance HDD, power supply, and accessories.`,
      descriptionHi: `${premise} के लिए तैयार किया गया ${totalCameras} कैमरों का पूरा सेटअप।`,
      specs: {
        'Camera Units': `${totalCameras} (${domeCount} Dome + ${bulletCount} Bullet)`,
        'Resolution': currentCamInfo.label,
        'Storage Drive': hddInfo.label,
        'Wiring': `${cableLength}m 3+1 Pure Copper`,
        'Installation': includeInstallation ? 'Included' : 'Excluded'
      }
    };

    onAddCustomPackageToCart(customBundleProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-5xl w-full max-h-[94vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-blue-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/60 flex items-center justify-center border border-blue-400/40">
              <Sliders className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>{isHi ? 'सीसीटीवी पैकेज कोटेशन कैलकुलेटर' : 'CCTV System Package Estimator'}</span>
              </h2>
              <p className="text-xs text-blue-200">
                {isHi ? 'अपनी जरूरत के अनुसार कैमरे, DVR और हार्ड डिस्क चुनें और तुरंत रेट पाएं' : 'Customize your cameras, recording storage & get instant wholesale price quote'}
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

        {/* Calculator Body - 2 Columns */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Premise Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {isHi ? '1. जगह का प्रकार चुनें (Premise Type)' : '1. Select Premise Type'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'home', label: 'Home / Flat', labelHi: 'घर / फ्लैट', icon: Home },
                  { id: 'shop', label: 'Shop / Retail', labelHi: 'दुकान / शोरूम', icon: Store },
                  { id: 'office', label: 'Office', labelHi: 'कार्यालय / ऑफिस', icon: Building2 },
                  { id: 'factory', label: 'Factory / Godown', labelHi: 'फैक्ट्री / गोदाम', icon: Factory },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = premise === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPremise(item.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-bold cursor-pointer ${
                        active
                          ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{isHi ? item.labelHi : item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Camera Counts */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {isHi ? '2. कैमरों की संख्या (Camera Count)' : '2. Camera Quantities'}
                </label>
                <span className="text-xs font-extrabold bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                  {totalCameras} {isHi ? 'कुल कैमरे' : 'Total Cameras'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Indoor Dome Count */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      {isHi ? 'इंडोर डोम कैमरा' : 'Indoor Dome Cams'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isHi ? 'कमरे, हॉल, रिसेप्शन के लिए' : 'Rooms, halls & counters'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDomeCount(Math.max(0, domeCount - 1))}
                      disabled={domeCount <= 0}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-black text-slate-900 text-base">
                      {domeCount}
                    </span>
                    <button
                      onClick={() => setDomeCount(Math.min(16, domeCount + 1))}
                      className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Outdoor Bullet Count */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      {isHi ? 'आउटडोर बुलेट कैमरा' : 'Outdoor Bullet Cams'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isHi ? 'वाटरप्रूफ - गेट, पार्किंग, छत' : 'Weatherproof - gate & front'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBulletCount(Math.max(0, bulletCount - 1))}
                      disabled={bulletCount <= 0}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-black text-slate-900 text-base">
                      {bulletCount}
                    </span>
                    <button
                      onClick={() => setBulletCount(Math.min(16, bulletCount + 1))}
                      className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Camera Clarity / Quality */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {isHi ? '3. कैमरा क्वालिटी व नाइट विजन (Camera Quality)' : '3. Camera Technology & Night Vision'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: '2mp_hd', name: '2MP 1080p HD', nameHi: '2MP फुल एचडी', desc: 'Standard IR Night Vision', descHi: 'सामान्य नाइट विजन', price: '₹1,450/cam' },
                  { id: '3k_colorvu', name: '3K ColorVu + Mic', nameHi: '3K कलरवू + ऑडियो माइक', desc: '24/7 Color + Sound recording', descHi: 'रात में भी रंगीन + आवाज़', popular: true, price: '₹2,450/cam' },
                  { id: '5mp_audio', name: '5MP Starlight Pro', nameHi: '5MP स्टारलाइट प्रो', desc: 'Long distance clarity', descHi: 'लंबी दूरी व सुपर क्लैरिटी', price: '₹2,650/cam' },
                ].map((item) => {
                  const active = quality === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setQuality(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition relative cursor-pointer ${
                        active
                          ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.popular && (
                        <span className="absolute -top-2 right-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.2 rounded-full uppercase">
                          Recommended
                        </span>
                      )}
                      <div className="font-bold text-xs text-slate-900 mb-0.5">
                        {isHi ? item.nameHi : item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mb-1">
                        {isHi ? item.descHi : item.desc}
                      </div>
                      <div className="text-xs font-black text-blue-700">{item.price}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Brand & Storage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand Choice */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {isHi ? '4. ब्रांड पसंद (Brand)' : '4. Preferred Brand'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Hikvision', 'CP Plus', 'Dahua'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setBrand(b)}
                      className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition cursor-pointer ${
                        brand === b
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage HDD Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {isHi ? '5. सर्विलांस हार्ड डिस्क (Storage)' : '5. Surveillance Storage (HDD)'}
                </label>
                <select
                  value={storage}
                  onChange={(e) => setStorage(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="none">{isHi ? 'हार्ड डिस्क नहीं चाहिए (केवल लाइव व्यू)' : 'No HDD (Only Live View)'}</option>
                  <option value="1TB">{isHi ? '1TB सर्विलांस (~15-20 दिन) - ₹3,600' : '1TB Surveillance (~15-20 Days) - ₹3,600'}</option>
                  <option value="2TB">{isHi ? '2TB WD पर्पल (~30-40 दिन) [बेस्ट] - ₹5,350' : '2TB WD Purple (~30-40 Days) [Best] - ₹5,350'}</option>
                  <option value="4TB">{isHi ? '4TB WD पर्पल (~60-80 दिन) - ₹8,900' : '4TB WD Purple (~60-80 Days) - ₹8,900'}</option>
                </select>
              </div>
            </div>

            {/* Step 5: Accessories & Add-ons */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                {isHi ? '6. अतिरिक्त सामग्री व इंस्टॉलेशन (Add-ons)' : '6. Wiring, Enclosure & Installation'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 4U Rack Toggle */}
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={includeRack}
                    onChange={(e) => setIncludeRack(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {isHi ? '4U लॉकेबल मेटल रैक (+₹1,450)' : '4U Lockable Metal Rack (+₹1,450)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isHi ? 'DVR और हार्ड डिस्क को चोरी से सुरक्षा' : 'Theft-proof cabinet for DVR & HDD'}
                    </span>
                  </div>
                </label>

                {/* Professional Installation Toggle */}
                <label className="flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-blue-950 block">
                      {isHi ? 'फुल इंस्टॉलेशन व ऐप सेटअप (+₹450/cam)' : 'Onsite Setup & App (+₹450/cam)'}
                    </span>
                    <span className="text-[11px] text-blue-800">
                      {isHi ? 'फिटिंग, वायरिंग व मोबाइल लाइव व्यू' : 'Complete wiring, mounting & phone setup'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Cable length slider */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-700">
                  {isHi ? '3+1 कॉपर केबल लंबाई:' : '3+1 Pure Copper Cable:'} <strong>{cableLength} {isHi ? 'मीटर' : 'Meters'}</strong>
                </span>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="15"
                  value={cableLength}
                  onChange={(e) => setCableLength(Number(e.target.value))}
                  className="w-full sm:w-48 accent-blue-600"
                />
              </div>
            </div>

            {/* Optional Customer info for Quote */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder={isHi ? 'आपका नाम (कोटेशन हेतु वैकल्पिक)' : 'Your Name (Optional for Quote)'}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder={isHi ? 'शहर / एरिया (जैसे: जयपुर, दिल्ली)' : 'City / Area (e.g., Delhi, Jaipur)'}
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right Column: Live Price Summary & Breakdown Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white p-5 sm:p-6 rounded-3xl flex flex-col justify-between shadow-xl border border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">
                    {isHi ? 'अनुमानित कोटेशन' : 'Live Estimate Summary'}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {brand} {totalCameras}-Camera Kit
                  </h3>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {isHi ? 'होलसेल रेट' : 'Wholesale'}
                </span>
              </div>

              {/* Itemized Price Breakdown Table */}
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span>{totalCameras}x Cameras ({currentCamInfo.label})</span>
                  <span className="font-bold text-white">₹{camerasCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span>1x {brand} {dvrChannels}-Ch DVR</span>
                  <span className="font-bold text-white">₹{dvrPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span>1x Surveillance HDD ({storage})</span>
                  <span className="font-bold text-white">₹{hddInfo.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span>1x {smpsName}</span>
                  <span className="font-bold text-white">₹{smpsPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span>{cableLength}m Copper Wire + BNC/DC</span>
                  <span className="font-bold text-white">₹{(cableCost + connectorsCost).toLocaleString('en-IN')}</span>
                </div>
                {includeRack && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span>1x 4U Lockable Metal Rack</span>
                    <span className="font-bold text-white">₹1,450</span>
                  </div>
                )}
                {includeInstallation && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80 text-emerald-400">
                    <span>Onsite Fitting & Mobile Live Setup</span>
                    <span className="font-bold">₹{installationCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Savings Box */}
              <div className="mt-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
                <span className="text-slate-300">{isHi ? 'मार्केट रेट (MRP):' : 'Estimated MRP:'} <del className="text-slate-400">₹{originalTotalPrice.toLocaleString('en-IN')}</del></span>
                <span className="text-emerald-400 font-extrabold">{isHi ? 'बचत:' : 'You Save:'} ₹{totalSavings.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Total Block & Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    {isHi ? 'कुल अनुमानित लागत (GST सहित)' : 'Total Estimated Cost (Incl. GST)'}
                  </div>
                  <div className="text-3xl font-black text-amber-400">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <div>{isHi ? '2 साल वारंटी' : '2 Yr Warranty'}</div>
                  <div className="text-emerald-400 font-bold">{isHi ? 'फ्री मोबाइल ऐप' : 'Free Mobile App'}</div>
                </div>
              </div>

              {/* WhatsApp Quote Share */}
              <button
                onClick={generateWhatsAppMessage}
                id="share-whatsapp-quote-btn"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/40 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{isHi ? 'व्हाट्सएप पर कोटेशन भेजें' : 'Send Quote on WhatsApp'}</span>
              </button>

              {/* Add entire package to Cart */}
              <button
                onClick={handleAddBundleToCart}
                id="add-package-cart-btn"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 px-4 rounded-xl transition cursor-pointer border border-blue-400/30"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isHi ? 'यह पूरा पैकेज कार्ट में जोड़ें' : 'Add Full Package to Cart'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
