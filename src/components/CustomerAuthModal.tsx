import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  Phone,
  MapPin,
  Send,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Search,
  Building2,
  KeyRound,
  RotateCw,
  Sparkles,
  ArrowRight,
  Shield,
  Smartphone,
  Navigation,
  Compass,
  Radio,
  MessageSquare,
  Eye,
  Volume2,
  ShoppingCart,
  Check,
  Tag,
  Globe
} from 'lucide-react';
import { CustomerUser, Language, StoreInfo, CityInfo } from '../types';
import { CITIES_DATA, searchCities } from '../data/cities';
import { speakWelcomeAudio } from '../utils/speech';
import { CCTVLoader } from './CCTVLoader';
import { SUPPORTED_LANGUAGES, getAuthT } from '../data/translations';

interface CustomerAuthModalProps {
  isOpen: boolean;
  isMandatoryGate?: boolean; // If true, cannot close without login
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  storeInfo: StoreInfo;
  currentUser: CustomerUser | null;
  onLoginSuccess: (user: CustomerUser) => void;
  onContinueAsGuest?: () => void;
  onClose?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  isMandatoryGate = true,
  language,
  onLanguageChange,
  storeInfo,
  currentUser,
  onLoginSuccess,
  onContinueAsGuest,
  onClose,
}) => {
  const t = getAuthT(language);
  const isHi = language === 'hi';

  // Form states
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');
  const [selectedCity, setSelectedCity] = useState<string>(currentUser?.city || 'Morbi');
  const [selectedState, setSelectedState] = useState<string>(currentUser?.state || 'Gujarat');
  const [pincode, setPincode] = useState<string>(currentUser?.pincode || '363641');
  const [address, setAddress] = useState<string>(currentUser?.address || '');
  const [landmark, setLandmark] = useState<string>(currentUser?.landmark || '');

  // Location Auto-Detect State
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Reset form with currentUser values whenever modal opens or currentUser updates
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setSelectedCity(currentUser.city || 'Morbi');
      setSelectedState(currentUser.state || 'Gujarat');
      setPincode(currentUser.pincode || '363641');
      setAddress(currentUser.address || '');
      setLandmark(currentUser.landmark || '');
    }
  }, [currentUser, isOpen]);

  // Automatic Location Detection Function (GPS + Reverse Geocoding + PIN Lookup)
  const detectDeviceLocation = async (isManual = true) => {
    if (!navigator.geolocation) {
      setLocationStatus(t.gpsNotSupported);
      return;
    }

    setIsLocating(true);
    setLocationStatus(t.detectingGps);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          let detectedCity = '';
          let detectedState = '';
          let detectedPin = '';

          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            if (res.ok) {
              const data = await res.json();
              detectedCity = data.city || data.locality || data.principalSubdivision || '';
              detectedState = data.principalSubdivision || '';
              detectedPin = data.postcode || '';
            }
          } catch (e) {
            console.warn('BigDataCloud fallback', e);
          }

          if (!detectedPin) {
            try {
              const osmRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
                { headers: { 'User-Agent': 'PatelCCTVStore/2.0' } }
              );
              if (osmRes.ok) {
                const osmData = await osmRes.json();
                const addr = osmData.address || {};
                detectedPin = addr.postcode || detectedPin;
                detectedCity = addr.city || addr.town || addr.village || addr.county || detectedCity;
                detectedState = addr.state || detectedState;
              }
            } catch (e) {
              console.warn('OSM fallback', e);
            }
          }

          if (detectedCity || detectedPin) {
            const matched = CITIES_DATA.find(
              c => (detectedCity && c.name.toLowerCase().includes(detectedCity.toLowerCase())) ||
                   (detectedPin && c.defaultPincode === detectedPin)
            );

            if (matched) {
              setSelectedCity(matched.name);
              setSelectedState(matched.state);
              setPincode(detectedPin || matched.defaultPincode);
            } else if (detectedCity) {
              setSelectedCity(detectedCity);
              if (detectedState) setSelectedState(detectedState);
              if (detectedPin) setPincode(detectedPin);
            } else if (detectedPin) {
              setPincode(detectedPin);
            }

            setLocationStatus(
              `✓ GPS: ${detectedCity || selectedCity}, PIN: ${detectedPin || pincode}`
            );
          } else {
            setLocationStatus(t.gpsLocationMatched);
          }
        } catch (err) {
          console.error(err);
          setLocationStatus(t.gpsCaptured);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (isManual) {
          if (err.code === err.PERMISSION_DENIED) {
            setLocationStatus(t.gpsPermissionDenied);
          } else {
            setLocationStatus(t.gpsSignalFailed);
          }
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // City Search UI
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // OTP Verification States
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [showOtpBanner, setShowOtpBanner] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [isWebOtpListening, setIsWebOtpListening] = useState<boolean>(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Filtered Cities list
  const filteredCities = useMemo(() => {
    return searchCities(citySearchQuery);
  }, [citySearchQuery]);

  // Resend Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Android WebOTP API listener (Auto-reads SMS from default Messages app when on mobile device)
  useEffect(() => {
    if (step !== 'otp') return;

    let abortController: AbortController | null = null;

    if ('OTPCredential' in window && typeof (window as any).OTPCredential === 'function') {
      try {
        abortController = new AbortController();
        setIsWebOtpListening(true);

        (navigator.credentials as any)
          .get({
            otp: { transport: ['sms'] },
            signal: abortController.signal,
          })
          .then((otpCredential: any) => {
            if (otpCredential && otpCredential.code) {
              const code = otpCredential.code.replace(/\D/g, '').slice(0, 6);
              if (code.length === 6) {
                setEnteredOtp(code.split(''));
                setOtpError('');
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
              }
            }
          })
          .catch((err: any) => {
            console.log('WebOTP listener info:', err);
          })
          .finally(() => {
            setIsWebOtpListening(false);
          });
      } catch (err) {
        console.log('WebOTP error:', err);
      }
    }

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [step]);

  // Handle City Select
  const handleSelectCity = (city: CityInfo) => {
    setSelectedCity(city.name);
    setSelectedState(city.state);
    setCitySearchQuery('');
    setIsCityDropdownOpen(false);
    if (!pincode || pincode.length !== 6 || pincode === '363641') {
      setPincode(city.defaultPincode);
    }
  };

  // Generate 6-digit OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setFormError(t.invalidMobileError);
      return;
    }

    if (!pincode || pincode.trim().length !== 6 || !/^\d{6}$/.test(pincode.trim())) {
      setFormError(t.invalidPinError);
      return;
    }

    if (!name.trim()) {
      setFormError(t.nameRequiredError);
      return;
    }

    if (!selectedCity.trim()) {
      setFormError(t.cityRequiredError);
      return;
    }

    // Generate random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setEnteredOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendTimer(30);
    setStep('otp');
    setShowOtpBanner(true);

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }

    // Auto open native SMS app on device with OTP targeted to the user's entered phone number
    try {
      const userPhoneClean = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      const message = `Your Patel CCTV Login OTP is: ${newOtp}\n\nValid for 10 minutes. Do not share with anyone. @patel-cctv.app #${newOtp}`;
      const smsUri = `sms:+${userPhoneClean}?body=${encodeURIComponent(message)}`;
      
      // Attempt to launch SMS intent/URI on mobile device
      window.location.href = smsUri;
    } catch (err) {
      console.warn('Direct SMS launch info:', err);
    }

    // Auto focus first OTP input
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 100);
  };

  // Open native mobile SMS app directly to the user's entered number
  const handleOpenSmsApp = () => {
    const cleanNumber = phone.replace(/\D/g, '');
    const userPhoneClean = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    const message = `Your Patel CCTV Login OTP is: ${generatedOtp}\n\nValid for 10 minutes. Do not share with anyone. @patel-cctv.app #${generatedOtp}`;
    const smsUrl = `sms:+${userPhoneClean}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  // Handle OTP Input Change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newEnteredOtp = [...enteredOtp];
    newEnteredOtp[index] = value.slice(-1);
    setEnteredOtp(newEnteredOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle OTP Keydown (backspace handling)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !enteredOtp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Paste OTP
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('').slice(0, 6);
      const newOtp = [...enteredOtp];
      digits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setEnteredOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setEnteredOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendTimer(30);
    setShowOtpBanner(true);
  };

  // Verify OTP & Complete Login
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullEnteredOtp = enteredOtp.join('');

    if (fullEnteredOtp.length !== 6) {
      setOtpError(t.incompleteOtpError);
      return;
    }

    if (fullEnteredOtp !== generatedOtp) {
      setOtpError(t.invalidOtpError);
      return;
    }

    // Success!
    const cleanPhone = phone.replace(/\D/g, '');
    const isMasterMonitor = cleanPhone === '8000951663' || cleanPhone === '918000951663' || cleanPhone.endsWith('8000951663') || cleanPhone === storeInfo.phone.replace(/\D/g, '');

    const userData: CustomerUser = {
      name: name.trim(),
      phone: cleanPhone,
      city: selectedCity,
      state: selectedState,
      pincode: pincode.trim(),
      address: address.trim(),
      landmark: landmark.trim(),
      isLoggedIn: true,
      loggedInAt: new Date().toISOString(),
      accountType: isMasterMonitor ? 'seller' : 'buyer',
    };

    onLoginSuccess(userData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top 8-Language Selector Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-1.5 shrink-0 text-slate-300 text-xs font-bold">
            <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[11px] text-slate-300 font-semibold hidden xs:inline">Language / भाषा:</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 overflow-x-auto py-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                id={`login-lang-btn-${lang.code}`}
                onClick={() => onLanguageChange && onLanguageChange(lang.code)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs ${
                  language === lang.code
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105 border border-blue-400'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/70 hover:text-white'
                }`}
              >
                <span>{lang.nativeName}</span>
                <span className={`text-[10px] ${language === lang.code ? 'text-blue-100' : 'text-slate-400'} font-normal`}>
                  ({lang.shortLabel})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-inner shrink-0">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-wider font-bold text-blue-200 bg-blue-500/30 px-2 py-0.5 rounded-full border border-blue-400/20">
                    {t.verifiedCustomerLogin}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {t.otpProtected}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-amber-400/25 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-xs">
                    <span>⚡</span>
                    <span>Powered by Vikash Patel</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      speakWelcomeAudio();
                    }}
                    title={t.voicePreview}
                    className="inline-flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30 transition cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{t.voicePreview}</span>
                  </button>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                  {language === 'hi' ? storeInfo.nameHi : storeInfo.name}
                </h2>
                <p className="text-xs text-blue-100/90 mt-0.5">
                  {t.headerSubtitle}
                </p>
              </div>
            </div>

            {!isMandatoryGate && onClose && (
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Real-time Simulated SMS OTP Notification Banner */}
        {showOtpBanner && step === 'otp' && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500/50 rounded-2xl shadow-md text-slate-800 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1">
                      <span>📩 {t.smsAppOtpTitle}</span>
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                      {t.smsDeliveredTag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    {t.smsSentText}{' '}
                    <strong className="text-base font-black text-emerald-800 tracking-wider font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-sm">
                      {generatedOtp}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <button
                  type="button"
                  onClick={handleOpenSmsApp}
                  title="Open default SMS app"
                  className="text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.smsAppBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEnteredOtp(generatedOtp.split(''));
                    setOtpError('');
                  }}
                  className="text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{t.autoFillBtn}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-7">
          {step === 'details' ? (
            /* STEP 1: Enter Customer Mobile, Name, City, PIN & Address */
            <form onSubmit={handleSendOtp} className="space-y-4">
              
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* GPS Auto-Detect Location Banner */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    {isLocating ? (
                      <div className="animate-cctv-pan origin-center">
                        <Compass className="w-4 h-4 text-amber-300" />
                      </div>
                    ) : (
                      <Compass className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <span>{t.autoGpsPinTitle}</span>
                      {isLocating && (
                        <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded font-semibold animate-pulse">
                          {t.radarSearching}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-blue-800/90 leading-tight mt-0.5">
                      {locationStatus || t.autoGpsDesc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => detectDeviceLocation(true)}
                  disabled={isLocating}
                  className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isLocating ? (
                    <CCTVLoader language={language} variant="mini" title={t.detectingBtn} />
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t.autoDetectBtn}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.yourFullName}</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.mobileNumber}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {t.digitsBadge}
                  </span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-700 text-xs font-bold">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full text-sm font-bold tracking-wider px-3.5 py-2.5 rounded-r-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>
              </div>

              {/* City Selection & Search (Morbi, Rajkot, Ahmedabad, Jaipur, Jodhpur, Mumbai, etc.) */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t.selectCity}</span>
                  </span>
                  <span className="text-[11px] font-bold text-blue-600">
                    {selectedCity} ({selectedState})
                  </span>
                </label>

                {/* City Search Bar & Selected Display */}
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      ref={cityInputRef}
                      type="text"
                      value={citySearchQuery || (isCityDropdownOpen ? '' : `${selectedCity}, ${selectedState}`)}
                      onFocus={() => {
                        setIsCityDropdownOpen(true);
                        setCitySearchQuery('');
                      }}
                      onChange={(e) => {
                        setCitySearchQuery(e.target.value);
                        setIsCityDropdownOpen(true);
                      }}
                      placeholder={t.searchCityPlaceholder}
                      className="w-full text-xs font-semibold pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                    />
                    {isCityDropdownOpen && (
                      <button
                        type="button"
                        onClick={() => setIsCityDropdownOpen(false)}
                        className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Dropdown City Search Results */}
                  {isCityDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-300 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-2 divide-y divide-slate-100">
                      <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t.matchingCities} ({filteredCities.length})
                      </div>
                      {filteredCities.length > 0 ? (
                        filteredCities.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => handleSelectCity(c)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                              selectedCity === c.name
                                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                                : 'hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <div>
                                <span className="font-semibold">{c.name} ({c.nameHi})</span>
                                <span className="text-[10px] text-slate-500 ml-1.5">[{c.state}]</span>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              PIN: {c.defaultPincode}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-500">
                          {t.noCityFound}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Popular Quick-Select City Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                    {t.quickSelect}
                  </span>
                  {[
                    { name: 'Morbi', state: 'Gujarat', pin: '363641' },
                    { name: 'Rajkot', state: 'Gujarat', pin: '360001' },
                    { name: 'Ahmedabad', state: 'Gujarat', pin: '380001' },
                    { name: 'Surat', state: 'Gujarat', pin: '395001' },
                    { name: 'Jaipur', state: 'Rajasthan', pin: '302001' },
                    { name: 'Jodhpur', state: 'Rajasthan', pin: '342001' },
                    { name: 'Mumbai', state: 'Maharashtra', pin: '400001' }
                  ].map((qc) => (
                    <button
                      key={qc.name}
                      type="button"
                      onClick={() => {
                        setSelectedCity(qc.name);
                        setSelectedState(qc.state);
                        setPincode(qc.pin);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        selectedCity === qc.name
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {qc.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mandatory PIN Code & Locality Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 6-Digit PIN Code (MANDATORY) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>{t.pinCode}</span>
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                      {t.sixDigitsReq}
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="363641"
                    className="w-full text-sm font-mono font-bold tracking-widest px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {t.pinCodeNote}
                  </p>
                </div>

                {/* Landmark / Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.areaLandmark}</span>
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder={t.areaPlaceholder}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.addressLabel}</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.addressPlaceholder}
                  className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>

              {/* Quick Trust Highlights for Customer Login */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-around text-[11px] text-slate-600 font-semibold">
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{t.freeQuotationTag}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>100% {t.otpProtected}</span>
                </div>
              </div>

              {/* Submit / Proceed to OTP Button */}
              <button
                type="submit"
                id="submit-send-otp-btn"
                className="w-full mt-2 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.getSmsOtpBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.oneTimeLoginTitle}</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-tight">
                  {t.oneTimeLoginDesc}
                </p>
              </div>

              {/* Guest Mode Option Button */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    if (onContinueAsGuest) {
                      onContinueAsGuest();
                    } else if (onClose) {
                      onClose();
                    }
                  }}
                  id="guest-mode-browse-btn"
                  className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-slate-800 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4 text-slate-700" />
                  <span>{t.guestModeBtn}</span>
                </button>
                <div className="flex items-center justify-center gap-1 text-[11px] text-amber-700 mt-1.5 font-medium text-center">
                  <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>{t.guestModeWarning}</span>
                </div>
              </div>
            </form>
          ) : (
            /* STEP 2: Enter 6-digit OTP & Confirm */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-center mx-auto mb-2 text-blue-600 shadow-inner">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {t.otpVerificationTitle}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  {`${t.otpSentSubtitle} ${phone}:`}
                </p>
                
                {isWebOtpListening && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[11px] font-bold animate-pulse">
                    <Radio className="w-3 h-3 text-emerald-600 animate-spin" />
                    <span>{t.autoReadActive}</span>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-700 font-semibold">
                    <span>📍 {selectedCity}, PIN: {pincode}</span>
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-blue-600 hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      {t.editDetailsBtn}
                    </button>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-950 border border-blue-200 shadow-xs">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>{t.verifiedBuyerAccount}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenSmsApp}
                    className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.smsAppBtn}</span>
                  </button>
                </div>
              </div>

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* 6 Digit OTP Inputs */}
              <div>
                <label className="block text-center text-xs font-bold text-slate-700 mb-2">
                  {t.enterSixDigitOtp}
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {enteredOtp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl border-2 outline-none transition shadow-sm ${
                        digit
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                          : 'border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP button */}
              <div className="flex items-center justify-between text-xs px-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  {t.changeDetailsBack}
                </button>

                {resendTimer > 0 ? (
                  <span className="text-slate-400 font-medium">
                    {`${t.resendOtpIn} (${resendTimer}s)`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{t.resendOtpBtn}</span>
                  </button>
                )}
              </div>

              {/* Verify and Open App Button */}
              <button
                type="submit"
                id="verify-otp-btn"
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 px-5 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">
                  {t.verifyAndOpenAppBtn}
                </span>
              </button>

              {/* Guest mode fallback in OTP step */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onContinueAsGuest) {
                      onContinueAsGuest();
                    } else if (onClose) {
                      onClose();
                    }
                  }}
                  className="text-slate-500 hover:text-slate-800 text-xs font-semibold underline cursor-pointer"
                >
                  {t.guestModeFallback}
                </button>
              </div>
            </form>
          )}

          {/* Modal bottom branding */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="font-mono text-slate-400">PATEL CCTV v1.0.3beta</span>
            <div className="inline-flex items-center gap-1 text-slate-600 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              <span className="text-amber-500 font-black">⚡</span>
              <span>Powered by <strong className="text-slate-900">Vikash Patel</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
