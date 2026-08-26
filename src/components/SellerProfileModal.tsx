import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Store, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Camera, 
  Upload, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Save, 
  RotateCcw, 
  Search, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Zap,
  Radio,
  Lock,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Product, StoreInfo, Language, ProductCategory, Brand } from '../types';
import { 
  getRemoteVersionConfig, 
  saveRemoteVersionConfig, 
  getInstalledVersion, 
  setInstalledVersion, 
  AppVersionConfig,
  CURRENT_BUILD_VERSION
} from '../utils/appVersionManager';

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  storeInfo: StoreInfo;
  onUpdateStoreInfo: (info: StoreInfo) => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const CATEGORY_OPTIONS: { value: ProductCategory; labelEn: string; labelHi: string }[] = [
  { value: 'cctv', labelEn: 'CCTV Camera (HD/IP/ColorVu)', labelHi: 'CCTV कैमरा (HD/IP/ColorVu)' },
  { value: 'combo', labelEn: 'Full Combo Kit (Set)', labelHi: 'फुल कॉम्बो किट (सेट)' },
  { value: 'dvr', labelEn: 'DVR / NVR Recorder', labelHi: 'DVR / NVR रिकॉर्डर' },
  { value: 'hdd', labelEn: 'Surveillance Hard Disk (HDD)', labelHi: 'हार्ड डिस्क (HDD)' },
  { value: 'wifi_smart', labelEn: 'Smart WiFi & 4G Camera', labelHi: 'स्मार्ट WiFi व 4G कैमरा' },
  { value: 'accessories', labelEn: 'Power Supply, Wire & Accessories', labelHi: 'SMPS पावर, तार व एक्सेसरीज' }
];

const BRAND_OPTIONS: Brand[] = [
  'CP Plus',
  'Hikvision',
  'Dahua',
  'Western Digital',
  'Seagate',
  'TP-Link / Tapo',
  'Patel Special'
];

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({
  isOpen,
  onClose,
  language,
  storeInfo,
  onUpdateStoreInfo,
  products,
  onUpdateProducts
}) => {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState<'products' | 'store' | 'updates'>('products');
  
  // Store form state
  const [storeForm, setStoreForm] = useState<StoreInfo>({ ...storeInfo });
  const [storeSuccessMsg, setStoreSuccessMsg] = useState<string | null>(null);

  // App Update Version state
  const [versionConfig, setVersionConfig] = useState<AppVersionConfig>(getRemoteVersionConfig);
  const [newVersionInput, setNewVersionInput] = useState('1.0.1.beta');
  const [customNoteHi, setCustomNoteHi] = useState('नया सीसीटीवी कैमरा मॉडल एवं अपडेटेड थोक रेट जोड़े गए हैं');
  const [versionMsg, setVersionMsg] = useState<string | null>(null);

  useEffect(() => {
    setVersionConfig(getRemoteVersionConfig());
  }, [isOpen]);

  // Products manager state
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle store info save
  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreInfo(storeForm);
    setStoreSuccessMsg(isHi ? 'दुकान व संपर्क जानकारी सफलतापूर्वक अपडेट हो गई!' : 'Store & contact details updated successfully!');
    setTimeout(() => setStoreSuccessMsg(null), 3500);
  };

  // Open Edit Form for a product
  const handleStartEdit = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsAddingNew(false);
    setProductSuccessMsg(null);
  };

  // Open Add Form for new product
  const handleStartAdd = () => {
    const newId = `cctv-custom-${Date.now()}`;
    const newProd: Product = {
      id: newId,
      name: '',
      nameHi: '',
      category: 'cctv',
      brand: 'CP Plus',
      model: '',
      price: 1500,
      originalPrice: 2200,
      rating: 4.8,
      reviewsCount: 15,
      inStock: true,
      image: '',
      resolution: '2MP (1080p)',
      warranty: '2 Years Manufacturer Warranty',
      warrantyHi: '2 साल की कंपनी वारंटी',
      features: ['Full HD Clarity', 'IR Night Vision', 'All DVR Compatible'],
      featuresHi: ['फुल एचडी स्पष्टता', 'नाइट विजन रिकॉर्डिंग', 'सभी DVR के साथ कम्पैटिबल'],
      tags: ['CCTV', 'Security'],
      description: 'High quality surveillance equipment for home and commercial security.',
      descriptionHi: 'घर और दूकान की सुरक्षा के लिए उच्च गुणवत्ता वाला सीसीटीवी उपकरण।',
      specs: {
        'Type': 'Surveillance System',
        'Warranty': '2 Years'
      },
      isBestseller: false
    };
    setEditingProduct(newProd);
    setIsAddingNew(true);
    setProductSuccessMsg(null);
  };

  // Handle Photo File Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditingProduct({
            ...editingProduct,
            image: reader.result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save product changes (Edit or Add)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      alert(isHi ? 'कृपया प्रोडक्ट का नाम दर्ज करें' : 'Please enter product name');
      return;
    }

    let updatedList: Product[];
    if (isAddingNew) {
      updatedList = [editingProduct, ...products];
      
      // Dispatch real-time live notification across tabs and components
      try {
        window.dispatchEvent(new CustomEvent('patel_cctv_new_product_added', { detail: editingProduct }));
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const channel = new BroadcastChannel('patel_cctv_live_sync');
          channel.postMessage({ type: 'NEW_PRODUCT_ADDED', product: editingProduct });
          channel.close();
        }
      } catch (err) {
        console.debug('Product live broadcast notice:', err);
      }
    } else {
      updatedList = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    }

    onUpdateProducts(updatedList);
    setProductSuccessMsg(
      isHi 
        ? `${editingProduct.name || 'कैमरा'} सफलतापूर्वक सेव हो गया!` 
        : `${editingProduct.name || 'Camera'} saved successfully!`
    );
    setEditingProduct(null);
    setIsAddingNew(false);
    setTimeout(() => setProductSuccessMsg(null), 3500);
  };

  // Delete product
  const handleDeleteProduct = (id: string, name: string) => {
    const confirmMsg = isHi 
      ? `क्या आप वास्तव में "${name}" को हटाना चाहते हैं?` 
      : `Are you sure you want to delete "${name}"?`;
    if (window.confirm(confirmMsg)) {
      const updated = products.filter(p => p.id !== id);
      onUpdateProducts(updated);
      setProductSuccessMsg(isHi ? 'प्रोडक्ट हटा दिया गया' : 'Product removed');
      if (editingProduct?.id === id) {
        setEditingProduct(null);
      }
      setTimeout(() => setProductSuccessMsg(null), 3000);
    }
  };

  // Filtered products list in manager
  const filteredProductList = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.nameHi.includes(productSearch) ||
    p.model.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shadow-inner">
              <Store className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {isHi ? 'दुकानदार / मुख्य ओनर एडमिन प्रोफाइल' : 'Store Owner Profile & CCTV Catalog Manager'}
                </h2>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-400/30">
                  +91 80009 51663 Authorized
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {isHi ? 'कैमरा फोटो, नाम, मॉडल, मूल्य और दुकान की प्रोफाइल अपडेट करें' : 'Update camera photos, model names, pricing, & store profile'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-4 sm:px-6 py-2 border-b border-slate-200 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setActiveTab('products');
              setEditingProduct(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{isHi ? 'कैमरा व सामान अपडेट करें (Photos, Price, Models)' : 'Cameras & Catalog Manager'}</span>
            <span className="bg-slate-900/30 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'store'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>{isHi ? 'दुकान व मोबाइल नंबर सेटिंग्स' : 'Store & Contact Details'}</span>
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'updates'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{isHi ? '🚀 ऐप अपडेट व वर्ज़न कंट्रोल' : 'App Update & Version Control'}</span>
            <span className="bg-amber-100 text-amber-950 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-amber-300">
              v{versionConfig.latestVersion}
            </span>
          </button>
        </div>

        {/* Body Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: PRODUCT & CAMERAS MANAGER */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Success Notification */}
              {productSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{productSuccessMsg}</span>
                </div>
              )}

              {/* Editing / Adding Form */}
              {editingProduct ? (
                <form onSubmit={handleSaveProduct} className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                        {isAddingNew ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900">
                        {isAddingNew 
                          ? (isHi ? 'नया कैमरा / प्रोडक्ट जोड़ें' : 'Add New Camera / Product')
                          : (isHi ? `संशोधन करें: ${editingProduct.name || editingProduct.model}` : `Edit: ${editingProduct.name}`)}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg bg-white border border-slate-200 cursor-pointer"
                    >
                      {isHi ? 'रद्द करें' : 'Cancel'}
                    </button>
                  </div>

                  {/* Top Photo Upload & Preview Section */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>{isHi ? 'कैमरा फोटो (Camera Photo Upload / Link)' : 'Camera Photo (Upload / URL)'}</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* Photo Preview Box */}
                      <div className="sm:col-span-4 bg-slate-900 rounded-2xl p-2 h-36 flex flex-col items-center justify-center text-center overflow-hidden border border-slate-800 relative">
                        {editingProduct.image && editingProduct.image.trim() !== '' ? (
                          <img 
                            src={editingProduct.image} 
                            alt="Preview" 
                            className="w-full h-full object-contain bg-white rounded-xl p-1"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <Camera className="w-8 h-8 text-blue-400 mb-1" />
                            <span className="text-xs font-bold text-white uppercase">CCTV CAMERA</span>
                            <span className="text-[9px] text-slate-400">{isHi ? '(कोई फोटो नहीं - टेक्स्ट दिखेगा)' : '(No photo - Text will show)'}</span>
                          </div>
                        )}
                        {editingProduct.image && (
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                            className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full shadow hover:bg-rose-700"
                            title={isHi ? 'फोटो हटाएं' : 'Remove Photo'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Photo Upload Controls */}
                      <div className="sm:col-span-8 space-y-2.5">
                        <div className="flex flex-wrap gap-2">
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isHi ? 'फ़ोन / कंप्यूटर से फोटो अपलोड करें' : 'Upload Photo from Device'}</span>
                          </button>

                          {editingProduct.image && (
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-3 py-2 rounded-xl border border-rose-200 bg-rose-50"
                            >
                              {isHi ? 'फोटो हटाएं (सिर्फ CCTV लिखें)' : 'Remove Photo (Show Text Only)'}
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-500 font-medium">
                            {isHi ? 'या फोटो का वेब लिंक (Image URL) पेस्ट करें:' : 'Or paste direct Image Web URL:'}
                          </label>
                          <input
                            type="text"
                            value={editingProduct.image}
                            onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                            placeholder="https://example.com/camera.jpg"
                            className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Core Product Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name English */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isHi ? 'कैमरा / प्रोडक्ट का नाम (English) *' : 'Product Name (English) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="e.g. CP Plus 2MP Cosmic Full HD Camera"
                        className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 font-semibold"
                      />
                    </div>

                    {/* Name Hindi */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isHi ? 'प्रोडक्ट का नाम (हिंदी)' : 'Product Name (Hindi)'}
                      </label>
                      <input
                        type="text"
                        value={editingProduct.nameHi}
                        onChange={(e) => setEditingProduct({ ...editingProduct, nameHi: e.target.value })}
                        placeholder="उदा. सीपी प्लस 2MP फुल एचडी कैमरा"
                        className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600"
                      />
                    </div>

                    {/* Brand */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isHi ? 'ब्रांड (Brand)' : 'Brand'}
                      </label>
                      <select
                        value={editingProduct.brand}
                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value as Brand })}
                        className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 font-semibold bg-white"
                      >
                        {BRAND_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Model */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isHi ? 'मॉडल नंबर (Model Number)' : 'Model Number'}
                      </label>
                      <input
                        type="text"
                        value={editingProduct.model}
                        onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                        placeholder="e.g. CP-VAC-T20PL2 / DS-2CE76D0T"
                        className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 font-mono"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isHi ? 'कैटेगरी (Category)' : 'Category'}
                      </label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                        className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 font-semibold bg-white"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {isHi ? c.labelHi : c.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Resolution / Key Spec */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isHi ? 'रेज़ोल्यूशन / मुख्य स्पेसिफिकेशन' : 'Resolution / Capacity / Channels'}
                      </label>
                      <input
                        type="text"
                        value={editingProduct.resolution || editingProduct.capacity || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, resolution: e.target.value })}
                        placeholder="e.g. 2MP (1080p) / 3K ColorVu / 1TB / 4 Channel"
                        className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600"
                      />
                    </div>

                    {/* Selling Price */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isHi ? 'बिक्री मूल्य (Selling Price in ₹) *' : 'Selling Price (₹) *'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          className="w-full text-xs sm:text-sm p-2.5 pl-7 rounded-xl border border-slate-200 focus:outline-blue-600 font-black text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Original MRP */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isHi ? 'असली MRP मूल्य (Original Price in ₹)' : 'Original MRP (₹)'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={editingProduct.originalPrice}
                          onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                          className="w-full text-xs sm:text-sm p-2.5 pl-7 rounded-xl border border-slate-200 focus:outline-blue-600 font-semibold text-slate-600"
                        />
                      </div>
                    </div>

                    {/* Warranty English */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isHi ? 'वारंटी (English)' : 'Warranty (English)'}
                      </label>
                      <input
                        type="text"
                        value={editingProduct.warranty}
                        onChange={(e) => setEditingProduct({ ...editingProduct, warranty: e.target.value })}
                        placeholder="e.g. 2 Years Manufacturer Warranty"
                        className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600"
                      />
                    </div>

                    {/* Warranty Hindi */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isHi ? 'वारंटी (हिंदी)' : 'Warranty (Hindi)'}
                      </label>
                      <input
                        type="text"
                        value={editingProduct.warrantyHi}
                        onChange={(e) => setEditingProduct({ ...editingProduct, warrantyHi: e.target.value })}
                        placeholder="उदा. 2 साल की कंपनी वारंटी"
                        className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600"
                      />
                    </div>
                  </div>

                  {/* Stock & Bestseller Checkboxes */}
                  <div className="flex flex-wrap items-center gap-6 bg-white p-3.5 rounded-2xl border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={editingProduct.inStock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>{isHi ? 'स्टॉक में उपलब्ध है (In Stock)' : 'Item is In Stock'}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={!!editingProduct.isBestseller}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isBestseller: e.target.checked })}
                        className="w-4 h-4 text-amber-500 rounded"
                      />
                      <span className="text-amber-700">{isHi ? '⭐ बेस्ट सेलर बैज दिखाएं (Top Deal)' : '⭐ Mark as Bestseller / Top Deal'}</span>
                    </label>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                    >
                      {isHi ? 'रद्द करें' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isHi ? 'प्रोडक्ट सेव करें' : 'Save Product Changes'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Products Table / Cards List */
                <div className="space-y-4">
                  {/* Top Bar: Search & Add Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder={isHi ? 'कैमरा नाम, मॉडल या ब्रांड खोजें...' : 'Search cameras, model or brand...'}
                        className="w-full text-xs pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-blue-600"
                      />
                    </div>

                    <button
                      onClick={handleStartAdd}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isHi ? '+ नया कैमरा / प्रोडक्ट जोड़ें' : '+ Add New Camera / Item'}</span>
                    </button>
                  </div>

                  {/* Products Grid / List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {filteredProductList.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 flex items-center justify-between gap-3 transition shadow-2xs"
                      >
                        {/* Thumbnail / Visual */}
                        <div className="w-14 h-14 rounded-xl bg-slate-900 flex flex-col items-center justify-center shrink-0 border border-slate-800 text-white p-1 text-center overflow-hidden">
                          {prod.image && prod.image.trim() !== '' ? (
                            <img src={prod.image} alt={prod.name} className="w-full h-full object-contain bg-white rounded-lg p-0.5" />
                          ) : (
                            <>
                              <Camera className="w-4 h-4 text-blue-400 mb-0.5" />
                              <span className="text-[8px] font-black text-blue-100 uppercase">CCTV</span>
                            </>
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                              {prod.brand}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {prod.model}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
                            {isHi ? (prod.nameHi || prod.name) : prod.name}
                          </h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-sm font-black text-blue-700">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-[11px] text-slate-400 line-through">
                                ₹{prod.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleStartEdit(prod)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition border border-blue-200 cursor-pointer"
                            title={isHi ? 'एडिट करें' : 'Edit Item'}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition border border-rose-200 cursor-pointer"
                            title={isHi ? 'हटाएं' : 'Delete Item'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STORE & CONTACT PROFILE SETTINGS */}
          {activeTab === 'store' && (
            <form onSubmit={handleSaveStore} className="space-y-5">
              
              {/* Success Notification */}
              {storeSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{storeSuccessMsg}</span>
                </div>
              )}

              <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200 space-y-4">
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-600" />
                  <span>{isHi ? 'दुकान व संपर्क जानकारी' : 'Store & Contact Information'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Store Name EN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {isHi ? 'दुकान का नाम (English) *' : 'Store Name (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.name}
                      onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                      placeholder="e.g. Patel CCTV camera"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 font-bold bg-white"
                    />
                  </div>

                  {/* Store Name HI */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {isHi ? 'दुकान का नाम (हिंदी)' : 'Store Name (Hindi)'}
                    </label>
                    <input
                      type="text"
                      value={storeForm.nameHi}
                      onChange={(e) => setStoreForm({ ...storeForm, nameHi: e.target.value })}
                      placeholder="उदा. पटेल सीसीटीवी कैमरा"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 bg-white"
                    />
                  </div>

                  {/* Phone Calling Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isHi ? 'कॉलिंग मोबाइल नंबर (Phone Number) *' : 'Calling Phone Number *'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.phone}
                      onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 font-black text-slate-900 bg-white"
                    />
                    <span className="text-[10px] text-slate-400">
                      {isHi ? 'यह नंबर वेबसाइट पर सीधे कॉलिंग के लिए दिखेगा' : 'Displayed across header & call buttons'}
                    </span>
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isHi ? 'व्हाट्सएप नंबर (WhatsApp Order Number) *' : 'WhatsApp Order Number *'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.whatsappNumber}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsappNumber: e.target.value })}
                      placeholder="919876543210"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 font-mono font-bold text-emerald-700 bg-white"
                    />
                    <span className="text-[10px] text-slate-400">
                      {isHi ? 'देश कोड सहित बिना स्पेस (उदा: 919876543210)' : 'Include country code without + (e.g. 919876543210)'}
                    </span>
                  </div>

                  {/* Address EN */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>{isHi ? 'दुकान का पूरा पता (English)' : 'Shop Address (English)'}</span>
                    </label>
                    <input
                      type="text"
                      value={storeForm.address}
                      onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                      placeholder="SIROMANI COMPLEX OPPOSITE KARANSINHJI BALAJI HUNUMAN TEMPLE BHUPENDRA ROAD RAJKOT"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 bg-white"
                    />
                  </div>

                  {/* Address HI */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {isHi ? 'दुकान का पूरा पता (हिंदी)' : 'Shop Address (Hindi)'}
                    </label>
                    <input
                      type="text"
                      value={storeForm.addressHi}
                      onChange={(e) => setStoreForm({ ...storeForm, addressHi: e.target.value })}
                      placeholder="शिरोमणि कॉम्प्लेक्स, करनसिंहजी बालाजी हनुमान मंदिर के सामने, भूपेंद्र रोड, राजकोट"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 bg-white"
                    />
                  </div>

                  {/* Working Hours */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isHi ? 'दुकान का समय (Working Hours)' : 'Working Hours'}</span>
                    </label>
                    <input
                      type="text"
                      value={storeForm.workingHours}
                      onChange={(e) => setStoreForm({ ...storeForm, workingHours: e.target.value })}
                      placeholder="Mon - Sat: 9:30 AM - 8:30 PM (Sun Open)"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 bg-white"
                    />
                  </div>

                  {/* GST Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {isHi ? 'जीएसटी नंबर (GST Number)' : 'GST Number'}
                    </label>
                    <input
                      type="text"
                      value={storeForm.gstNumber}
                      onChange={(e) => setStoreForm({ ...storeForm, gstNumber: e.target.value })}
                      placeholder="07AAAAA0000A1Z5"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-blue-600 font-mono bg-white uppercase"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isHi ? 'सेव करें व स्टोर अपडेट करें' : 'Save & Update Storefront'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: APP VERSION & MANDATORY BROADCAST CONTROLS */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              
              {/* Alert Notification */}
              {versionMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{versionMsg}</span>
                </div>
              )}

              {/* Status Header Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-white">
                        {isHi ? '📢 पटेल सीसीटीवी लाइव ऐप वर्ज़न ब्रॉडकास्ट सिस्टम' : '📢 Live App Version Broadcast Engine'}
                      </h3>
                      <p className="text-xs text-slate-300">
                        {isHi ? 'जब भी आप नया अपडेट जारी करेंगे, पुराने ऐप यूजर को अनिवार्य अपडेट स्क्रीन दिखेगी।' : 'Publish updates to trigger mandatory update screens for all old users.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{isHi ? 'वर्तमान सक्रिय वर्ज़न' : 'Current Active Version'}</p>
                      <p className="text-sm font-black text-amber-400 font-mono">v{versionConfig.latestVersion}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION 1: RELEASE NEW MANDATORY UPDATE */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{isHi ? '१. सभी यूजर के लिए नया ऐप अपडेट जारी करें' : '1. Release New Mandatory Update'}</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    Mandatory Update
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'नया वर्ज़न नंबर (Version):' : 'New Version Number:'}
                    </label>
                    <input
                      type="text"
                      value={newVersionInput}
                      onChange={(e) => setNewVersionInput(e.target.value)}
                      placeholder="e.g. 2.6.0"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-blue-900 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'अपडेट विवरण / क्या नया है (Update Release Note):' : 'Update Highlights (Hindi / English):'}
                    </label>
                    <input
                      type="text"
                      value={customNoteHi}
                      onChange={(e) => setCustomNoteHi(e.target.value)}
                      placeholder="e.g. नए 4K कैमरे, नए दाम व तेज फोटो लोडिंग"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    {isHi ? '⚡ बटन दबाते ही सभी पुराने यूजर्स की स्क्रीन पर अपडेट पॉपअप लॉक हो जाएगा।' : 'Pushes compulsory update dialog to all active client devices.'}
                  </p>
                  
                  <button
                    onClick={() => {
                      const newConfig: AppVersionConfig = {
                        ...versionConfig,
                        latestVersion: newVersionInput.trim() || '2.5.1',
                        minRequiredVersion: newVersionInput.trim() || '2.5.1',
                        forced: true,
                        isUnderMaintenance: false,
                        releaseDate: new Date().toISOString().split('T')[0],
                        releaseNotesHi: [
                          customNoteHi.trim() || 'नया सीसीटीवी कैमरा मॉडल एवं अपडेटेड थोक रेट जोड़े गए हैं',
                          'सुपरफास्ट कैमरा फोटो लोडिंग व व्हाट्सएप ऑर्डर सिंक (+91 74830 05197)',
                          'सुरक्षा सुधार व ऑटोमैटिक कैश रिफ्रेश'
                        ],
                        releaseNotes: [
                          'Updated CCTV Camera Models & Wholesale Rates',
                          'Fast photo rendering and WhatsApp order link (+91 74830 05197)',
                          'Performance optimization & security cache purge'
                        ]
                      };
                      saveRemoteVersionConfig(newConfig);
                      setVersionConfig(newConfig);
                      setInstalledVersion(newConfig.latestVersion);
                      setVersionMsg(
                        isHi 
                          ? `✅ नया वर्ज़न v${newConfig.latestVersion} सफलतापूर्वक जारी कर दिया गया!` 
                          : `✅ New Version v${newConfig.latestVersion} released successfully!`
                      );
                      setTimeout(() => setVersionMsg(null), 4000);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-slate-950" />
                    <span>{isHi ? '📢 नया अपडेट पब्लिश करें' : 'Publish Mandatory Update'}</span>
                  </button>
                </div>
              </div>

              {/* ACTION 2: MAINTENANCE / LIVE EDITING LOCK */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-600" />
                    <span>{isHi ? '२. मेंटेनेंस / लाइव अपडेट लॉक (Lock App during Live Edits)' : '2. Maintenance Lock Mode'}</span>
                  </h4>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    versionConfig.isUnderMaintenance 
                      ? 'bg-rose-100 text-rose-800 border-rose-300' 
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {versionConfig.isUnderMaintenance ? (isHi ? '🔒 लॉक सक्रिय (Active)' : '🔒 Locked') : (isHi ? '🟢 सामान्य चालू (Live)' : '🟢 Online')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {isHi 
                    ? 'जब आप नए कैमरे की तस्वीरें अपलोड कर रहे हों या भारी मूल्य संशोधन कर रहे हों, तब इसे ऑन कर दें ताकि ग्राहक अधूरा डेटा न देख सकें।'
                    : 'Locks the app with an in-progress screen for visitors while you perform catalog edits or heavy stock adjustments.'}
                </p>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={() => {
                      const updated: AppVersionConfig = {
                        ...versionConfig,
                        isUnderMaintenance: !versionConfig.isUnderMaintenance,
                      };
                      saveRemoteVersionConfig(updated);
                      setVersionConfig(updated);
                      setVersionMsg(
                        updated.isUnderMaintenance 
                          ? (isHi ? '🔒 मेंटेनेंस लॉक चालू कर दिया गया है।' : '🔒 Maintenance mode enabled.')
                          : (isHi ? '🟢 मेंटेनेंस लॉक हटा दिया गया है। ऐप लाइव है।' : '🟢 Maintenance mode disabled. App is live.')
                      );
                      setTimeout(() => setVersionMsg(null), 4000);
                    }}
                    className={`px-5 py-2.5 font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer ${
                      versionConfig.isUnderMaintenance 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {versionConfig.isUnderMaintenance 
                        ? (isHi ? '🟢 मेंटेनेंस मोड बंद करें (Unlock App)' : '🟢 Turn Off Maintenance')
                        : (isHi ? '🔒 मेंटेनेंस मोड चालू करें (Lock App)' : '🔒 Turn On Maintenance')}
                    </span>
                  </button>
                </div>
              </div>

              {/* ACTION 3: TEST THE OUTDATED CLIENT MODAL */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>{isHi ? 'परीक्षण: पुराना वर्ज़न सिम्युलेटर' : 'Simulation: Test Outdated Client Screen'}</span>
                  </h5>
                  <p className="text-[11px] text-amber-900">
                    {isHi 
                      ? 'इस बटन को दबाने पर आपकी डिवाइस पर पुराना वर्ज़न v0.9.0.beta सेट होगा और आप ग्राहक को दिखने वाला पॉपअप टेस्ट कर सकेंगे।'
                      : 'Simulate an older client version (v0.9.0.beta) to test how the update prompt behaves for regular customers.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setInstalledVersion('0.9.0.beta');
                    onClose();
                    window.location.reload();
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                >
                  {isHi ? '🧪 टेस्ट करें (Trigger Test)' : 'Test Update Prompt'}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHi ? 'सभी बदलाव तुरंत वेबसाइट पर लाइव लागू होते हैं और सुरक्षित रहते हैं।' : 'All updates are saved and live on the storefront immediately.'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-700 font-bold hover:text-slate-900 cursor-pointer"
          >
            {isHi ? 'बंद करें (Close)' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
