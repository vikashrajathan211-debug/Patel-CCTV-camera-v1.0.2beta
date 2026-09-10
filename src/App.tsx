import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  Phone, 
  Send, 
  ShieldCheck, 
  ShoppingCart, 
  Check, 
  Calculator, 
  Sliders, 
  Tag, 
  Camera, 
  HardDrive, 
  Tv, 
  Package, 
  Wifi, 
  Zap,
  Layers,
  ArrowUpDown,
  X,
  Eye,
  Lock,
  Volume2,
  Store,
  Briefcase
} from 'lucide-react';
import { Product, ProductCategory, Brand, Language, CartItem, StoreInfo, CustomerUser, HelpCategory } from './types';
import { PRODUCTS, STORE_INFO } from './data/products';
import { Navbar } from './components/Navbar';
import { TrustHeader } from './components/TrustHeader';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PackageEstimator } from './components/PackageEstimator';
import { StorageCalculator } from './components/StorageCalculator';
import { CartDrawer } from './components/CartDrawer';
import { SiteVisitModal } from './components/SiteVisitModal';
import { FlipkartQuestions } from './components/FlipkartQuestions';
import { SellerProfileModal } from './components/SellerProfileModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { AdminMonitorGateModal } from './components/AdminMonitorGateModal';
import { AdminSurveyApprovalModal } from './components/AdminSurveyApprovalModal';
import { SurveyStatusTrackModal } from './components/SurveyStatusTrackModal';
import { CustomerApprovalNotificationBanner } from './components/CustomerApprovalNotificationBanner';
import { HelpSupportContainer } from './components/HelpSupportContainer';
import { HelpSupportModal } from './components/HelpSupportModal';
import { LoginSecurityWarningOverlay } from './components/LoginSecurityWarningOverlay';
import { MandatoryUpdateModal } from './components/MandatoryUpdateModal';
import { LiveProductAlertToast } from './components/LiveProductAlertToast';
import { DiwaliOfferCountdownModal } from './components/DiwaliOfferCountdownModal';
import { SplashScreen } from './components/SplashScreen';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { CCTVLoader } from './components/CCTVLoader';
import { CCTVCoverageCanvasModal } from './components/CCTVCoverageCanvasModal';
import { speakWelcomeAudio } from './utils/speech';
import { checkAppUpdateRequired, fetchRemoteVersionFromFirestore, UpdateCheckResult } from './utils/appVersionManager';
import { initCapacitorMobileApp } from './utils/capacitorMobile';

export default function App() {
  // State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  // Language state with default 'en' (English) and localStorage persistence
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('patel_cctv_language');
      if (savedLang && ['en', 'hi', 'gu', 'mr', 'kn', 'ta', 'te', 'ml'].includes(savedLang)) {
        return savedLang as Language;
      }
      return 'en'; // Default language is English
    } catch {
      return 'en';
    }
  });

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('patel_cctv_language', newLang);
    } catch (err) {
      console.error('Failed to save language preference', err);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');

  // Customer User Authentication & Location State
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('patel_cctv_customer_user_v2') || localStorage.getItem('prince_cctv_customer_user_v2');
      if (saved) {
        const parsed = JSON.parse(saved) as CustomerUser;
        const cleanPhone = (parsed.phone || '').replace(/\D/g, '');
        const isMaster = cleanPhone === '8000951663' || cleanPhone === '918000951663' || cleanPhone.endsWith('8000951663');
        return {
          ...parsed,
          accountType: isMaster ? 'seller' : 'buyer'
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    try {
      const savedUser = localStorage.getItem('patel_cctv_customer_user_v2') || localStorage.getItem('prince_cctv_customer_user_v2');
      const parsed = savedUser ? JSON.parse(savedUser) : null;
      if (parsed && parsed.isLoggedIn) return false;
      const savedGuest = localStorage.getItem('patel_cctv_is_guest_mode') || localStorage.getItem('prince_cctv_is_guest_mode');
      return savedGuest === 'true';
    } catch {
      return false;
    }
  });

  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('patel_cctv_customer_user_v2') || localStorage.getItem('prince_cctv_customer_user_v2');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && parsed.isLoggedIn) return false;
      const savedGuest = localStorage.getItem('patel_cctv_is_guest_mode') || localStorage.getItem('prince_cctv_is_guest_mode');
      return savedGuest !== 'true';
    } catch {
      return true;
    }
  });
  
  // Dynamic Products state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('patel_cctv_custom_products_v3') || localStorage.getItem('prince_cctv_custom_products_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((p: Product) => ({
          ...p,
          image: p.image && p.image.startsWith('data:') ? p.image : ''
        }));
      }
      return PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('patel_cctv_custom_products_v3', JSON.stringify(products));
    } catch (err) {
      console.error('Failed to save products to localStorage', err);
    }
  }, [products]);

  // Listen for live new products from other tabs, sockets, or admin manager
  useEffect(() => {
    const handleLiveProduct = (e: CustomEvent<Product>) => {
      const newP = e.detail;
      if (!newP || !newP.id) return;
      setProducts((prev) => {
        if (prev.some((item) => item.id === newP.id)) return prev;
        return [newP, ...prev];
      });
    };
    window.addEventListener('patel_cctv_new_product_added' as any, handleLiveProduct as any);
    return () => {
      window.removeEventListener('patel_cctv_new_product_added' as any, handleLiveProduct as any);
    };
  }, []);

  // Dynamic Store & Contact Info state with localStorage persistence
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    try {
      const saved = localStorage.getItem('patel_cctv_store_info_v3') || localStorage.getItem('prince_cctv_store_info_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        const isLegacyAddress = !parsed.address || parsed.address.includes('Shop No. 12') || parsed.address.includes('City Hub');
        return {
          ...STORE_INFO,
          ...parsed,
          name: STORE_INFO.name, // Always enforce 'Patel CCTV camera'
          nameHi: STORE_INFO.nameHi, // Always enforce 'पटेल सीसीटीवी कैमरा'
          address: isLegacyAddress ? STORE_INFO.address : parsed.address,
          addressHi: isLegacyAddress ? STORE_INFO.addressHi : (parsed.addressHi || STORE_INFO.addressHi),
          phone: (parsed.phone === '+91 98765 43210') ? '+91 80009 51663' : (parsed.phone || '+91 80009 51663'),
          whatsappNumber: '917483005197'
        };
      }
      return STORE_INFO;
    } catch {
      return STORE_INFO;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('patel_cctv_store_info_v3', JSON.stringify(storeInfo));
    } catch (err) {
      console.error('Failed to save store info to localStorage', err);
    }
  }, [storeInfo]);

  // Cart state with localStorage recovery
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('patel_cctv_cart') || localStorage.getItem('prince_cctv_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('patel_cctv_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [cartItems]);

  // Modals state
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState<boolean>(false);
  const [isStorageCalcOpen, setIsStorageCalcOpen] = useState<boolean>(false);
  const [isCoverageCanvasOpen, setIsCoverageCanvasOpen] = useState<boolean>(false);
  const [isSiteVisitOpen, setIsSiteVisitOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSellerProfileOpen, setIsSellerProfileOpen] = useState<boolean>(false);
  const [isBuyerRestrictionModalOpen, setIsBuyerRestrictionModalOpen] = useState<boolean>(false);
  const [isAdminSurveyApprovalOpen, setIsAdminSurveyApprovalOpen] = useState<boolean>(false);
  const [adminTargetSurveyId, setAdminTargetSurveyId] = useState<string | null>(null);
  const [isTrackSurveyOpen, setIsTrackSurveyOpen] = useState<boolean>(false);
  const [trackTargetSurveyId, setTrackTargetSurveyId] = useState<string | null>(null);
  
  // Help & Grievance Modal State
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [helpModalCategory, setHelpModalCategory] = useState<HelpCategory>('fraud_alert');
  const [helpModalTicketId, setHelpModalTicketId] = useState<string | null>(null);

  // Login Security Warning Overlay (White screen -> Warning -> Progressive Typing -> Voice)
  const [isLoginSecurityWarningOpen, setIsLoginSecurityWarningOpen] = useState<boolean>(false);

  // Grand Diwali 77-Day Countdown Offer Popup (3 Seconds Auto Popup on App Open)
  const [isDiwaliOfferOpen, setIsDiwaliOfferOpen] = useState<boolean>(() => {
    try {
      const expiryDate = new Date('2026-11-16T23:59:59');
      return new Date().getTime() <= expiryDate.getTime();
    } catch {
      return true;
    }
  });

  // App Update & Version Mandatory Gate State
  const [updateStatus, setUpdateStatus] = useState<UpdateCheckResult>(() => checkAppUpdateRequired());

  useEffect(() => {
    const evaluateUpdate = () => {
      setUpdateStatus(checkAppUpdateRequired());
    };
    evaluateUpdate();
    fetchRemoteVersionFromFirestore().then(() => evaluateUpdate()).catch(() => {});
    window.addEventListener('patel_cctv_version_changed', evaluateUpdate);
    window.addEventListener('storage', evaluateUpdate);
    const interval = setInterval(evaluateUpdate, 15000);

    return () => {
      window.removeEventListener('patel_cctv_version_changed', evaluateUpdate);
      window.removeEventListener('storage', evaluateUpdate);
      clearInterval(interval);
    };
  }, []);

  // Native Mobile Android APK Support: Initialize StatusBar and Hardware Back Button handling
  useEffect(() => {
    initCapacitorMobileApp(() => {
      if (activeProductModal) { setActiveProductModal(null); return true; }
      if (isCartOpen) { setIsCartOpen(false); return true; }
      if (isCoverageCanvasOpen) { setIsCoverageCanvasOpen(false); return true; }
      if (isEstimatorOpen) { setIsEstimatorOpen(false); return true; }
      if (isStorageCalcOpen) { setIsStorageCalcOpen(false); return true; }
      if (isSiteVisitOpen) { setIsSiteVisitOpen(false); return true; }
      if (isHelpModalOpen) { setIsHelpModalOpen(false); return true; }
      if (isSellerProfileOpen) { setIsSellerProfileOpen(false); return true; }
      if (isAdminSurveyApprovalOpen) { setIsAdminSurveyApprovalOpen(false); return true; }
      if (isTrackSurveyOpen) { setIsTrackSurveyOpen(false); return true; }
      if (isDiwaliOfferOpen) { setIsDiwaliOfferOpen(false); return true; }
      return false;
    });
  }, [
    activeProductModal,
    isCartOpen,
    isCoverageCanvasOpen,
    isEstimatorOpen,
    isStorageCalcOpen,
    isSiteVisitOpen,
    isHelpModalOpen,
    isSellerProfileOpen,
    isAdminSurveyApprovalOpen,
    isTrackSurveyOpen,
    isDiwaliOfferOpen,
  ]);

  // Deep-link check for Survey Approval, Survey Tracking, Help Grievance, or Warning Notice from WhatsApp / SMS links
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const adminApprove = params.get('admin_approve_survey') || params.get('admin_approve');
      const trackSurvey = params.get('track_survey');
      const helpReport = params.get('help_report') || params.get('fraud_alert') || params.get('help');
      const trackTicket = params.get('track_ticket');
      const showWarning = params.get('warning') || params.get('security_alert');

      if (adminApprove) {
        setAdminTargetSurveyId(adminApprove);
        setIsAdminSurveyApprovalOpen(true);
      } else if (trackSurvey) {
        setTrackTargetSurveyId(trackSurvey);
        setIsTrackSurveyOpen(true);
      } else if (helpReport) {
        if (helpReport === 'fraud' || params.get('fraud_alert')) setHelpModalCategory('fraud_alert');
        else if (helpReport === 'warranty') setHelpModalCategory('warranty_problem');
        else if (helpReport === 'replacement') setHelpModalCategory('replacement_issue');
        setIsHelpModalOpen(true);
      } else if (trackTicket) {
        setHelpModalTicketId(trackTicket);
        setIsHelpModalOpen(true);
      } else if (showWarning) {
        setIsLoginSecurityWarningOpen(true);
      }
    } catch (err) {
      console.error('Error parsing URL parameters:', err);
    }
  }, []);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // CCTV Camera-Style Animated Loading State
  const [cctvLoadingState, setCctvLoadingState] = useState<{
    active: boolean;
    title?: string;
    subtitle?: string;
  } | null>(null);

  const openWithCCTVLoader = (action: () => void, title?: string, subtitle?: string, delay = 480) => {
    setCctvLoadingState({
      active: true,
      title: title || (isHi ? 'पटेल सीसीटीवी सिस्टम लोड हो रहा है...' : 'Scanning Patel CCTV System...'),
      subtitle: subtitle || (isHi ? 'कैमरा व DVR सिस्टम एक्टिव हो रहा है, कृपया प्रतीक्षा करें' : 'Synchronizing Live Camera Feeds & DVR Storage')
    });
    setTimeout(() => {
      action();
      setCctvLoadingState(null);
    }, delay);
  };

  const isHi = language === 'hi';

  const handleCustomerLoginSuccess = (user: CustomerUser) => {
    setCurrentUser(user);
    setIsGuestMode(false);
    try {
      localStorage.setItem('patel_cctv_customer_user_v2', JSON.stringify(user));
      localStorage.removeItem('patel_cctv_is_guest_mode');
      localStorage.removeItem('prince_cctv_is_guest_mode');
    } catch (err) {
      console.error(err);
    }
    setIsCustomerAuthOpen(false);

    // Trigger Full-Screen White Screen -> Warning Title -> Typewriter Text + Audio Speech!
    setIsLoginSecurityWarningOpen(true);
  };

  const handleContinueAsGuest = () => {
    setIsGuestMode(true);
    try {
      localStorage.setItem('patel_cctv_is_guest_mode', 'true');
    } catch (err) {
      console.error(err);
    }
    setIsCustomerAuthOpen(false);
    showToast(
      isHi
        ? '👤 आप गेस्ट मोड में हैं। आप सभी कैमरे व सामान देख सकते हैं। खरीदने या कीमत देखने के लिए लॉगिन करें।'
        : '👤 You are now in Guest Mode. Browse items freely. Login with mobile to view prices & buy.'
    );
  };

  const handleCustomerLogout = () => {
    setCurrentUser(null);
    setIsGuestMode(false);
    try {
      localStorage.removeItem('patel_cctv_customer_user_v2');
      localStorage.removeItem('prince_cctv_customer_user_v2');
      localStorage.removeItem('patel_cctv_is_guest_mode');
      localStorage.removeItem('prince_cctv_is_guest_mode');
    } catch (err) {
      console.error(err);
    }
    setIsCustomerAuthOpen(true);
    showToast(isHi ? 'आप लॉगआउट हो गए हैं। नया पिन कोड दर्ज करें।' : 'You have been logged out.');
  };

  const handleOpenSellerProfile = () => {
    if (!currentUser || !currentUser.isLoggedIn) {
      setIsCustomerAuthOpen(true);
      return;
    }
    const cleanPhone = (currentUser.phone || '').replace(/\D/g, '');
    const isMasterMonitor = cleanPhone === '8000951663' || cleanPhone === '918000951663' || cleanPhone.endsWith('8000951663') || cleanPhone === storeInfo.phone.replace(/\D/g, '');
    
    if (!isMasterMonitor) {
      setIsBuyerRestrictionModalOpen(true);
      return;
    }
    openWithCCTVLoader(
      () => setIsSellerProfileOpen(true),
      isHi ? 'पटेल सीसीटीवी मुख्य मॉनिटर डैशबोर्ड लोड हो रहा है...' : 'Opening Store Monitor Dashboard...',
      isHi ? 'दुकान इन्वेंट्री व अधिकृत इनवॉइस विवरण' : 'Viewing Authorized Rajkot Store Details'
    );
  };

  const isUserGuest = (!currentUser || !currentUser.isLoggedIn);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(isHi ? `"${product.nameHi}" कार्ट में जोड़ा गया!` : `"${product.name}" added to quotation!`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleAddCustomPackage = (customProduct: Product) => {
    setCartItems(prev => [...prev, { product: customProduct, quantity: 1 }]);
    setIsCartOpen(true);
    showToast(isHi ? 'कस्टम कोटेशन पैकेज कार्ट में जोड़ा गया!' : 'Custom CCTV package added to cart!');
  };

  // Filter Categories
  const categoriesList: { id: ProductCategory; name: string; nameHi: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', name: 'All Products', nameHi: 'सभी सामान', icon: Layers },
    { id: 'cctv', name: 'CCTV Cameras', nameHi: 'CCTV कैमरा', icon: Camera },
    { id: 'dvr', name: 'DVR / NVR Systems', nameHi: 'DVR / NVR', icon: Tv },
    { id: 'hdd', name: 'Hard Disks (HDD)', nameHi: 'हार्ड डिस्क', icon: HardDrive },
    { id: 'combo', name: 'Full Combo Kits', nameHi: 'फुल कॉम्बो सेट', icon: Package },
    { id: 'wifi_smart', name: 'Smart WiFi & 4G', nameHi: 'स्मार्ट वाईफाई व 4G', icon: Wifi },
    { id: 'accessories', name: 'Power & Accessories', nameHi: 'एक्सेसरीज व SMPS', icon: Zap },
  ];

  // Filter Brands
  const brandsList: string[] = ['all', 'CP Plus', 'Hikvision', 'Dahua', 'Western Digital', 'Seagate', 'TP-Link / Tapo'];

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q) || product.nameHi.toLowerCase().includes(q);
        const matchesModel = product.model.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesTags = product.tags.some(t => t.toLowerCase().includes(q));
        const matchesFeatures = product.features.some(f => f.toLowerCase().includes(q)) || product.featuresHi.some(f => f.toLowerCase().includes(q));
        if (!matchesName && !matchesModel && !matchesBrand && !matchesTags && !matchesFeatures) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default: featured (bestseller first, then rating)
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    });
  }, [products, selectedCategory, selectedBrand, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 animate-bounce max-w-md w-[90%]">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        cartItems={cartItems}
        storeInfo={storeInfo}
        currentUser={currentUser}
        isGuestMode={isUserGuest}
        onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
        onLogoutCustomer={handleCustomerLogout}
        onPlayGreeting={speakWelcomeAudio}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenEstimator={() => openWithCCTVLoader(() => setIsEstimatorOpen(true), isHi ? 'कस्टम पैकेज कोटेशन लोड हो रहा है...' : 'Scanning Custom Package Estimator...', isHi ? 'कैमरा व DVR कॉम्बिनेशन तैयार हो रहा है' : 'Synchronizing CCTV & DVR Configuration')}
        onOpenStorageCalc={() => openWithCCTVLoader(() => setIsStorageCalcOpen(true), isHi ? 'CCTV हार्ड डिस्क कैलकुलेटर लोड हो रहा है...' : 'Calculating Surveillance Storage...', isHi ? 'DVR रिकॉर्डिंग दिन व क्षमता का आंकलन' : 'Estimating Days of CCTV Continuous Recording')}
        onOpenCoverageCanvas={() => openWithCCTVLoader(() => setIsCoverageCanvasOpen(true), isHi ? 'CCTV विज़न फीता व FOV लोड हो रहा है...' : 'Opening CCTV Field of View & Tape Measure...', isHi ? 'कैनवास व दूरी पैमाना लोड हो रहा है' : 'Initializing Canvas & Distance Measuring Grid')}
        onOpenSiteVisit={() => openWithCCTVLoader(() => setIsSiteVisitOpen(true), isHi ? 'फ्री साइट सर्वे बुकिंग पोर्टल लोड हो रहा है...' : 'Opening Free Site Survey Booking...', isHi ? 'इंजीनियर विजिट व इंस्टॉलेशन रिक्वेस्ट' : 'Scheduling CCTV Engineer Site Inspection')}
        onOpenSellerProfile={handleOpenSellerProfile}
        onOpenAdminApprovals={() => openWithCCTVLoader(() => setIsAdminSurveyApprovalOpen(true), isHi ? 'एडमिन सर्वे अप्रूवल पैनल लोड हो रहा है...' : 'Opening Admin Approval Console...')}
        onOpenTrackSurvey={() => openWithCCTVLoader(() => setIsTrackSurveyOpen(true), isHi ? 'साइट सर्वे लाइव स्टेटस लोड हो रहा है...' : 'Tracking Site Survey Status...')}
        onOpenHelpSupport={(cat) => {
          openWithCCTVLoader(() => {
            if (cat) setHelpModalCategory(cat);
            setIsHelpModalOpen(true);
          }, isHi ? 'सपोर्ट व शिकायत निवारण पोर्टल लोड हो रहा है...' : 'Opening Customer Support & Redressal...');
        }}
        onOpenSecurityWarning={() => openWithCCTVLoader(() => setIsLoginSecurityWarningOpen(true), isHi ? 'सुरक्षा सत्यापन व चेतावनी लोड हो रही है...' : 'Scanning Security Caution Notice...')}
        onReplaySplash={() => setShowSplash(true)}
      />

      {/* Guest Mode Alert Banner */}
      {isUserGuest && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between gap-3 flex-wrap border-b border-amber-400">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black">
            <Eye className="w-4 h-4 text-slate-950 shrink-0" />
            <span>
              {isHi
                ? '👤 आप गेस्ट मोड (अतिथि मोड) में हैं — आप सभी कैमरे व सामान देख सकते हैं। कीमतें देखने व खरीदने के लिए लॉगिन करें।'
                : '👤 You are in Guest Mode — View all CCTV items. Mobile login required to view prices & buy.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomerAuthOpen(true)}
              id="guest-login-banner-btn"
              className="bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-white font-black text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isHi ? '🔒 मोबाइल नंबर से लॉगिन करें' : '🔒 Login with Mobile'}</span>
            </button>
            <button
              onClick={speakWelcomeAudio}
              title="Play Welcome Audio"
              className="bg-amber-400/80 hover:bg-amber-400 text-slate-900 font-bold text-xs p-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero & Trust Announcement Bar */}
      <TrustHeader
        language={language}
        currentUser={currentUser}
        onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
        onOpenEstimator={() => openWithCCTVLoader(() => setIsEstimatorOpen(true), isHi ? 'CCTV पैकेज कोटेशन लोड हो रहा है...' : 'Loading Package Estimator...')}
        onOpenStorageCalc={() => openWithCCTVLoader(() => setIsStorageCalcOpen(true), isHi ? 'HDD स्टोरेज कैलकुलेटर लोड हो रहा है...' : 'Loading Storage Calculator...')}
        onOpenCoverageCanvas={() => openWithCCTVLoader(() => setIsCoverageCanvasOpen(true), isHi ? 'CCTV विज़न फीता व FOV लोड हो रहा है...' : 'Opening CCTV Field of View & Tape Measure...', isHi ? 'कैनवास व दूरी पैमाना लोड हो रहा है' : 'Initializing Canvas & Distance Measuring Grid')}
        onOpenSiteVisit={() => openWithCCTVLoader(() => setIsSiteVisitOpen(true), isHi ? 'फ्री साइट सर्वे फॉर्म लोड हो रहा है...' : 'Loading Site Survey Portal...')}
        onOpenTrackSurvey={() => openWithCCTVLoader(() => setIsTrackSurveyOpen(true), isHi ? 'साइट सर्वे स्टेटस लोड हो रहा है...' : 'Tracking Site Survey...')}
        onOpenHelpSupport={(cat) => {
          openWithCCTVLoader(() => {
            if (cat) setHelpModalCategory(cat);
            setIsHelpModalOpen(true);
          }, isHi ? 'हेल्प व सपोर्ट पोर्टल लोड हो रहा है...' : 'Loading Support Portal...');
        }}
        onOpenSecurityWarning={() => openWithCCTVLoader(() => setIsLoginSecurityWarningOpen(true), isHi ? 'सुरक्षा सत्यापन व चेतावनी लोड हो रही है...' : 'Scanning Security Caution Notice...')}
        onOpenDiwaliOffer={() => setIsDiwaliOfferOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-12 space-y-4 sm:space-y-6">
        {/* Sticky Filter & Search Control Bar */}
        <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200/80 space-y-2.5">
          {/* Top Search and Sort Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isHi ? 'कैमरा, DVR, मॉडल या ब्रांड खोजें...' : 'Search CP Plus, Hikvision, DVR, 2TB HDD...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick action badges & Sort dropdown */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">{isHi ? 'क्रमबद्ध:' : 'Sort by:'}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="featured">{isHi ? 'लोकप्रिय / बेस्टसेलर' : 'Featured / Bestseller'}</option>
                  <option value="price_low">{isHi ? 'मूल्य: कम से ज्यादा (₹)' : 'Price: Low to High'}</option>
                  <option value="price_high">{isHi ? 'मूल्य: ज्यादा से कम (₹)' : 'Price: High to Low'}</option>
                  <option value="rating">{isHi ? 'उच्चतम रेटिंग ★' : 'Top Customer Rating'}</option>
                </select>
              </div>

              {/* Total items badge */}
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200">
                {filteredProducts.length} {isHi ? 'उत्पाद' : 'Products'}
              </span>
            </div>
          </div>

          {/* Category Tabs Strip */}
          <div className="border-t border-slate-100 pt-2.5 sm:pt-3">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {categoriesList.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`btn-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition shrink-0 cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${active ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span>{isHi ? cat.nameHi : cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-0.5">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {isHi ? 'ब्रांड:' : 'Brand:'}
            </span>
            {brandsList.map((brandName) => {
              const active = selectedBrand === brandName;
              return (
                <button
                  key={brandName}
                  onClick={() => setSelectedBrand(brandName)}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {brandName === 'all' ? (isHi ? 'सभी ब्रांड्स' : 'All Brands') : brandName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Sections (Flipkart Style Segmented Posts & 2-by-2 Grid) */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {isHi ? 'कोई उत्पाद नहीं मिला' : 'No products match your search'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isHi 
                ? 'कृपया दूसरा कीवर्ड खोजें या फिल्टर रीसेट करें।'
                : 'Try adjusting your search terms or filter selection.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
                setSearchQuery('');
              }}
              className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
            >
              {isHi ? 'सभी फिल्टर रीसेट करें' : 'Reset All Filters'}
            </button>
          </div>
        ) : selectedCategory === 'all' && selectedBrand === 'all' && searchQuery.trim() === '' ? (
          /* Flipkart Curated Category Sections (Separate Post Blocks) */
          <div id="store" className="space-y-8">
            {/* Section 1: CCTV Cameras Top Deals */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span>{isHi ? 'बेस्ट CCTV कैमरे (Dome / Bullet / ColorVu)' : 'Top CCTV Cameras (HD & ColorVu)'}</span>
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full hidden sm:inline">
                        {isHi ? 'स्पेशल डिस्काउंट' : 'Top Deals'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {isHi ? 'CP Plus, Hikvision और Dahua के बेस्ट सेलर मॉडल्स' : 'Top picks from CP Plus, Hikvision & Dahua'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory('cctv')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isHi ? 'सभी देखें' : 'View All'}</span>
                  <span>→</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.filter(p => p.category === 'cctv').slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    language={language}
                    storeInfo={storeInfo}
                    isGuestMode={isUserGuest}
                    onRequestLogin={() => setIsCustomerAuthOpen(true)}
                    onAddToCart={handleAddToCart}
                    onViewDetails={(prod) => openWithCCTVLoader(() => setActiveProductModal(prod), isHi ? `${prod.nameHi || prod.name} लोड हो रहा है...` : `Scanning ${prod.name}...`, isHi ? 'कैमरा स्पेसिफिकेशन्स व लाइव व्यू लोड हो रहा है...' : 'Accessing Camera Specifications & Features')}
                  />
                ))}
              </div>
            </div>

            {/* Section 2: Full Combo Kits (Flipkart Style Card Section) */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span>{isHi ? 'फुल रेडी CCTV कॉम्बो किट (All-in-One)' : 'Complete CCTV Ready Combo Kits'}</span>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full hidden sm:inline">
                        {isHi ? 'फुल फिटिंग सेट' : 'Ready Kits'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {isHi ? 'कैमरे, DVR, हार्ड डिस्क, SMPS पावर और केबल सहित' : 'Cameras, DVR, HDD, SMPS power & connectors included'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory('combo')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isHi ? 'सभी देखें' : 'View All'}</span>
                  <span>→</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.filter(p => p.category === 'combo').slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    language={language}
                    storeInfo={storeInfo}
                    isGuestMode={isUserGuest}
                    onRequestLogin={() => setIsCustomerAuthOpen(true)}
                    onAddToCart={handleAddToCart}
                    onViewDetails={(prod) => openWithCCTVLoader(() => setActiveProductModal(prod), isHi ? `${prod.nameHi || prod.name} लोड हो रहा है...` : `Scanning ${prod.name}...`, isHi ? 'कॉम्बो किट विवरण व एक्सेसरीज लिस्ट' : 'Accessing Complete Combo Configuration')}
                  />
                ))}
              </div>
            </div>

            {/* Section 3: Hard Disks (HDD) & DVRs */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span>{isHi ? 'सर्विलांस हार्ड डिस्क व स्मार्ट DVR' : 'Surveillance Storage & DVR Recorders'}</span>
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full hidden sm:inline">
                        {isHi ? '3 साल वारंटी' : '3 Yr Warranty'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {isHi ? 'WD Purple, SkyHawk एवं 4/8/16 चैनल DVR सिस्टम' : 'WD Purple, Seagate SkyHawk & 4/8/16 CH Recorders'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory('hdd')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isHi ? 'सभी देखें' : 'View All'}</span>
                  <span>→</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.filter(p => p.category === 'hdd' || p.category === 'dvr').slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    language={language}
                    storeInfo={storeInfo}
                    isGuestMode={isUserGuest}
                    onRequestLogin={() => setIsCustomerAuthOpen(true)}
                    onAddToCart={handleAddToCart}
                    onViewDetails={(prod) => openWithCCTVLoader(() => setActiveProductModal(prod), isHi ? `${prod.nameHi || prod.name} लोड हो रहा है...` : `Scanning ${prod.name}...`, isHi ? 'DVR / HDD तकनीकी स्पेसिफिकेशन्स' : 'Accessing Storage Specifications')}
                  />
                ))}
              </div>
            </div>

            {/* Section 4: Smart WiFi & 4G Wireless Cameras */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span>{isHi ? 'स्मार्ट 360° वाईफाई व 4G सिम कैमरा' : 'Smart 360° WiFi & 4G SIM Cameras'}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full hidden sm:inline">
                        {isHi ? 'नो वायरिंग' : 'Plug & Play'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {isHi ? 'घर, दुकान व खेत-खलिहान के लिए वायरलेस सुरक्षा' : 'Wireless security with 2-way talk & motion alerts'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory('wifi_smart')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isHi ? 'सभी देखें' : 'View All'}</span>
                  <span>→</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.filter(p => p.category === 'wifi_smart' || p.category === 'accessories').slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    language={language}
                    storeInfo={storeInfo}
                    isGuestMode={isUserGuest}
                    onRequestLogin={() => setIsCustomerAuthOpen(true)}
                    onAddToCart={handleAddToCart}
                    onViewDetails={(prod) => openWithCCTVLoader(() => setActiveProductModal(prod), isHi ? `${prod.nameHi || prod.name} लोड हो रहा है...` : `Scanning ${prod.name}...`, isHi ? 'वाईफाई / 4G कैमरा फीचर्स' : 'Accessing Smart Wireless Camera Features')}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Filtered View: Clean 2-by-2 responsive grid */
          <div id="store" className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-800">
                {filteredProducts.length} {isHi ? 'उत्पाद प्रदर्शित' : 'Products Displayed'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  language={language}
                  storeInfo={storeInfo}
                  isGuestMode={isUserGuest}
                  onRequestLogin={() => setIsCustomerAuthOpen(true)}
                  onAddToCart={handleAddToCart}
                  onViewDetails={(prod) => openWithCCTVLoader(() => setActiveProductModal(prod), isHi ? `${prod.nameHi || prod.name} लोड हो रहा है...` : `Scanning ${prod.name}...`, isHi ? 'उत्पाद विवरण लोड हो रहा है' : 'Accessing Product Specifications')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Flipkart Style 2-by-2 Customer Questions & Answers Section */}
        <FlipkartQuestions language={language} />

        {/* Customer Help & Grievance Container (Fraud, Fake Calls, Warranty, Replacement) */}
        <HelpSupportContainer
          language={language}
          storeInfo={storeInfo}
          currentUser={currentUser}
          onOpenHelpModal={(cat) => {
            if (cat) setHelpModalCategory(cat);
            setIsHelpModalOpen(true);
          }}
          onOpenTrackTicket={(ticketId) => {
            setHelpModalTicketId(ticketId);
            setIsHelpModalOpen(true);
          }}
        />

        {/* Banner Callout for Custom Systems & Consultation */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-blue-800/40">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="bg-amber-400/20 text-amber-300 text-xs uppercase font-extrabold px-3 py-1 rounded-full border border-amber-400/30">
              {isHi ? 'कस्टम प्रोजेक्ट रिक्वायरमेंट' : 'Custom Project Solutions'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              {isHi ? 'क्या आपको 8, 16 या 32 कैमरों का बड़ा सेटअप चाहिए?' : 'Planning an 8, 16 or 32 Camera System for Office / Factory?'}
            </h3>
            <p className="text-xs sm:text-sm text-blue-200">
              {isHi
                ? 'हमारी अनुभवी टीम आपके बजट और जगह के अनुसार सबसे किफायती और मजबूत CCTV सेटअप तैयार करके देगी।'
                : 'Get tailored commercial quotes with on-site technician survey and turnkey installation warranty.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsEstimatorOpen(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-lg transition cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-amber-300" />
              <span>{isHi ? 'कोटेशन बनाएं' : 'Build Custom Quote'}</span>
            </button>

            <button
              onClick={() => setIsSiteVisitOpen(true)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-lg transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isHi ? 'फ्री साइट विज़िट' : 'Free Site Inspection'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={`https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent(`Hello ${storeInfo.name}, I would like to inquire about camera setup and prices.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Support"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-emerald-600 to-green-500 text-white p-4 rounded-full shadow-2xl shadow-emerald-900/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group border-2 border-white/20 animate-pulse-subtle"
      >
        <Send className="w-7 h-7 -rotate-12" />
        {/* Floating tooltip label */}
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {isHi ? 'व्हाट्सएप पर तुरंत चैट करें' : 'Chat on WhatsApp'}
        </span>
      </a>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={activeProductModal}
        language={language}
        storeInfo={storeInfo}
        isGuestMode={isUserGuest}
        onRequestLogin={() => setIsCustomerAuthOpen(true)}
        onClose={() => setActiveProductModal(null)}
        onAddToCart={handleAddToCart}
      />

      {isEstimatorOpen && (
        <PackageEstimator
          language={language}
          storeInfo={storeInfo}
          onClose={() => setIsEstimatorOpen(false)}
          onAddCustomPackageToCart={handleAddCustomPackage}
        />
      )}

      {isStorageCalcOpen && (
        <StorageCalculator
          language={language}
          onClose={() => setIsStorageCalcOpen(false)}
          onSelectHddProduct={(prod) => {
            handleAddToCart(prod);
            setIsCartOpen(true);
          }}
        />
      )}

      <SiteVisitModal
        language={language}
        isOpen={isSiteVisitOpen}
        storeInfo={storeInfo}
        currentUser={currentUser}
        onClose={() => setIsSiteVisitOpen(false)}
        onTrackSurvey={(surveyId) => {
          setTrackTargetSurveyId(surveyId);
          setIsTrackSurveyOpen(true);
        }}
      />

      {/* Store Admin Survey Approvals Console */}
      <AdminSurveyApprovalModal
        isOpen={isAdminSurveyApprovalOpen}
        language={language}
        storeInfo={storeInfo}
        initialSurveyId={adminTargetSurveyId}
        onClose={() => {
          setIsAdminSurveyApprovalOpen(false);
          setAdminTargetSurveyId(null);
        }}
      />

      {/* Customer Live Survey Status & "YOUR REQUEST IS SUCCESSFUL" Modal */}
      <SurveyStatusTrackModal
        isOpen={isTrackSurveyOpen}
        language={language}
        storeInfo={storeInfo}
        surveyId={trackTargetSurveyId}
        onClose={() => {
          setIsTrackSurveyOpen(false);
          setTrackTargetSurveyId(null);
        }}
        onOpenNewSurvey={() => {
          setIsTrackSurveyOpen(false);
          setIsSiteVisitOpen(true);
        }}
      />

      {/* Customer Live Approved Notification Floating Banner */}
      <CustomerApprovalNotificationBanner
        language={language}
        onOpenTrackModal={(surveyId) => {
          setTrackTargetSurveyId(surveyId);
          setIsTrackSurveyOpen(true);
        }}
      />

      <CartDrawer
        language={language}
        cartItems={cartItems}
        storeInfo={storeInfo}
        currentUser={currentUser}
        isGuestMode={isUserGuest}
        isOpen={isCartOpen}
        onRequestLogin={() => setIsCustomerAuthOpen(true)}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Customer Mobile, City, Mandatory PIN Code & OTP Verification Gate / Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen || (!isGuestMode && (!currentUser || !currentUser.isLoggedIn))}
        isMandatoryGate={!isGuestMode && (!currentUser || !currentUser.isLoggedIn)}
        language={language}
        onLanguageChange={handleLanguageChange}
        storeInfo={storeInfo}
        currentUser={currentUser}
        onLoginSuccess={handleCustomerLoginSuccess}
        onContinueAsGuest={handleContinueAsGuest}
        onClose={() => {
          setIsCustomerAuthOpen(false);
        }}
      />

      {/* Seller Admin Profile Modal */}
      <SellerProfileModal
        isOpen={isSellerProfileOpen}
        onClose={() => setIsSellerProfileOpen(false)}
        language={language}
        storeInfo={storeInfo}
        onUpdateStoreInfo={setStoreInfo}
        products={products}
        onUpdateProducts={setProducts}
      />

      {/* Admin Store Monitor Security Gate Modal */}
      <AdminMonitorGateModal
        isOpen={isBuyerRestrictionModalOpen}
        language={language}
        storeInfo={storeInfo}
        currentUser={currentUser}
        onClose={() => setIsBuyerRestrictionModalOpen(false)}
        onUnlockSeller={() => {
          setIsBuyerRestrictionModalOpen(false);
          if (currentUser) {
            const adminUser: CustomerUser = {
              ...currentUser,
              accountType: 'seller',
            };
            setCurrentUser(adminUser);
            try {
              localStorage.setItem('patel_cctv_customer_user_v2', JSON.stringify(adminUser));
            } catch (err) {
              console.error(err);
            }
          }
          openWithCCTVLoader(
            () => setIsSellerProfileOpen(true),
            isHi ? 'मुख्य स्टोर मॉनिटर डैशबोर्ड लोड हो रहा है...' : 'Opening Store Monitor Dashboard...',
            isHi ? 'इन्वेंट्री, मूल्य व स्टोर मैनेजमेंट एक्टिव' : 'Authorized Monitor Control Active'
          );
        }}
      />

      {/* Customer Help, Grievance, Warranty & Fraud Alert Resolution Modal */}
      <HelpSupportModal
        isOpen={isHelpModalOpen}
        language={language}
        storeInfo={storeInfo}
        currentUser={currentUser}
        initialCategory={helpModalCategory}
        initialTicketId={helpModalTicketId}
        onClose={() => {
          setIsHelpModalOpen(false);
          setHelpModalTicketId(null);
        }}
      />

      {/* CCTV Camera Vision Cone & Distance Measuring Tape Canvas Modal */}
      <CCTVCoverageCanvasModal
        isOpen={isCoverageCanvasOpen}
        onClose={() => setIsCoverageCanvasOpen(false)}
        language={language}
        storeInfo={storeInfo}
        onSelectProductForCart={(product) => {
          handleAddToCart(product);
          setIsCoverageCanvasOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* Login Security Warning Fullscreen Overlay (White Screen -> Warning Header -> Typewriter -> Hindi Voice) */}
      <LoginSecurityWarningOverlay
        isOpen={isLoginSecurityWarningOpen}
        language={language}
        storeInfo={storeInfo}
        user={currentUser}
        onClose={() => {
          setIsLoginSecurityWarningOpen(false);
          if (currentUser) {
            showToast(
              isHi
                ? `🌸 स्वागत है ${currentUser.name}! (${currentUser.city}, PIN: ${currentUser.pincode}) — पटेल सीसीटीवी कैमरा वर्ल्ड`
                : `🌸 Welcome ${currentUser.name}! (${currentUser.city}, PIN: ${currentUser.pincode}) — Patel CCTV Camera World`
            );
          }
        }}
      />

      {/* Store Footer */}
      <Footer
        language={language}
        storeInfo={storeInfo}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }}
        onOpenEstimator={() => openWithCCTVLoader(() => setIsEstimatorOpen(true), isHi ? 'CCTV पैकेज कोटेशन लोड हो रहा है...' : 'Loading Package Estimator...')}
        onOpenStorageCalc={() => openWithCCTVLoader(() => setIsStorageCalcOpen(true), isHi ? 'HDD स्टोरेज कैलकुलेटर लोड हो रहा है...' : 'Loading Storage Calculator...')}
        onOpenSiteVisit={() => openWithCCTVLoader(() => setIsSiteVisitOpen(true), isHi ? 'फ्री साइट सर्वे फॉर्म लोड हो रहा है...' : 'Loading Site Survey Portal...')}
        onOpenHelpSupport={(cat) => {
          openWithCCTVLoader(() => {
            if (cat) setHelpModalCategory(cat);
            setIsHelpModalOpen(true);
          }, isHi ? 'सपोर्ट व शिकायत निवारण पोर्टल लोड हो रहा है...' : 'Opening Customer Support & Redressal...');
        }}
        onOpenSecurityWarning={() => openWithCCTVLoader(() => setIsLoginSecurityWarningOpen(true), isHi ? 'सुरक्षा सत्यापन व चेतावनी लोड हो रही है...' : 'Scanning Security Caution Notice...')}
      />

      {/* Mobile Bottom Navigation Bar (Thumb friendly for mobile screens) */}
      <MobileBottomNav
        language={language}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenEstimator={() => openWithCCTVLoader(() => setIsEstimatorOpen(true), isHi ? 'CCTV पैकेज कोटेशन लोड हो रहा है...' : 'Loading Package Estimator...')}
        onOpenStorageCalc={() => openWithCCTVLoader(() => setIsStorageCalcOpen(true), isHi ? 'HDD स्टोरेज कैलकुलेटर लोड हो रहा है...' : 'Loading Storage Calculator...')}
        onOpenSiteVisit={() => openWithCCTVLoader(() => setIsSiteVisitOpen(true), isHi ? 'फ्री साइट सर्वे फॉर्म लोड हो रहा है...' : 'Loading Site Survey Portal...')}
        onScrollToStore={() => {
          const storeElem = document.getElementById('store') || document.querySelector('main');
          storeElem?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Floating App Corner Badge: Powered by Vikash Patel */}
      <div className="fixed bottom-20 md:bottom-4 left-3 z-30 pointer-events-auto select-none">
        <div className="bg-slate-950/90 backdrop-blur-md text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-xl hover:scale-105 transition-transform">
          <span className="text-amber-400">⚡</span>
          <span className="text-slate-300">Powered by <strong className="text-amber-300">Vikash Patel</strong></span>
        </div>
      </div>

      {/* Global Camera-Style Animated Loading Screen (Rotating Cameras & DVR Activity) */}
      {cctvLoadingState?.active && (
        <CCTVLoader
          language={language}
          variant="fullscreen"
          title={cctvLoadingState.title}
          subtitle={cctvLoadingState.subtitle}
        />
      )}

      {/* Real-time New Product Alert Toast */}
      <LiveProductAlertToast
        language={language}
        onViewProduct={(product) => {
          setActiveProductModal(product);
        }}
        onAddToCart={(product) => {
          handleAddToCart(product);
        }}
      />

      {/* Mandatory App Update & In-Progress Maintenance Lock Screen */}
      <MandatoryUpdateModal
        isOpen={updateStatus.needed || updateStatus.isMaintenance}
        language={language}
        currentVersion={updateStatus.currentVersion}
        latestVersion={updateStatus.latestVersion}
        config={updateStatus.config}
        isMaintenance={updateStatus.isMaintenance}
        onUpdateCompleted={() => {
          setUpdateStatus(checkAppUpdateRequired());
        }}
      />

      {/* Grand Diwali 77-Day Mega Offer Countdown Popup (3-Second Auto Dismiss + Sparkler Fountain Animation) */}
      {!showSplash && isDiwaliOfferOpen && (
        <DiwaliOfferCountdownModal
          language={language}
          onClose={() => setIsDiwaliOfferOpen(false)}
          onExploreOffer={() => {
            setIsDiwaliOfferOpen(false);
            const storeElem = document.getElementById('store') || document.querySelector('main');
            storeElem?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Cinematic Animated Splash Screen (Dark #0F111A, Expanding Gradient Lines, PATEL CCTV CAMERA, Timer to Login) */}
      {showSplash && (
        <SplashScreen
          minDuration={2600}
          onFinish={() => {
            setShowSplash(false);
            if (!currentUser && !isGuestMode) {
              setIsCustomerAuthOpen(true);
            }
          }}
        />
      )}
    </div>
  );
}
