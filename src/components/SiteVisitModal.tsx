import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Sparkles, 
  Clock, 
  Send, 
  ShieldCheck, 
  Wrench,
  Building2,
  Home,
  Store,
  Warehouse,
  Factory,
  Compass,
  Navigation,
  MessageSquare,
  User,
  Check
} from 'lucide-react';
import { Language, SiteVisitRequest, SiteVisitBooking, StoreInfo, CustomerUser, CityInfo } from '../types';
import { STORE_INFO } from '../data/products';
import { CITIES_DATA, searchCities } from '../data/cities';
import { saveSurveyBooking } from '../utils/surveyStorage';

interface SiteVisitModalProps {
  language: Language;
  isOpen: boolean;
  storeInfo?: StoreInfo;
  currentUser?: CustomerUser | null;
  onClose: () => void;
  onTrackSurvey?: (surveyId: string) => void;
}

export const SiteVisitModal: React.FC<SiteVisitModalProps> = ({
  language,
  isOpen,
  storeInfo = STORE_INFO,
  currentUser,
  onClose,
  onTrackSurvey,
}) => {
  const isHi = language === 'hi';

  const [formData, setFormData] = useState<SiteVisitRequest>({
    fullName: currentUser?.name || '',
    phoneNumber: currentUser?.phone || '',
    placeName: '',
    placeType: 'home',
    city: currentUser?.city || 'Morbi',
    pincode: currentUser?.pincode || '363641',
    landmark: currentUser?.landmark || '',
    fullAddress: currentUser?.address || '',
    serviceType: 'site_survey',
    cameraCount: 4,
    preferredDate: '',
    preferredTimeSlot: 'morning',
    notes: '',
  });

  const [citySearchQuery, setCitySearchQuery] = useState(currentUser?.city || 'Morbi');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<SiteVisitRequest | null>(null);
  const [savedBooking, setSavedBooking] = useState<SiteVisitBooking | null>(null);

  // Sync with currentUser if logged in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || currentUser.name || '',
        phoneNumber: prev.phoneNumber || currentUser.phone || '',
        city: prev.city || currentUser.city || 'Morbi',
        pincode: prev.pincode || currentUser.pincode || '363641',
        landmark: prev.landmark || currentUser.landmark || '',
        fullAddress: prev.fullAddress || currentUser.address || '',
      }));
      if (currentUser.city) {
        setCitySearchQuery(currentUser.city);
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Filter cities for quick suggestion
  const matchedCities = searchCities(citySearchQuery).slice(0, 6);

  const handleSelectCity = (cityItem: CityInfo) => {
    const cityName = isHi ? cityItem.nameHi : cityItem.name;
    setCitySearchQuery(cityName);
    setFormData(prev => ({
      ...prev,
      city: cityName,
      pincode: cityItem.defaultPincode || prev.pincode
    }));
    setShowCityDropdown(false);
  };

  const placeTypes = [
    { id: 'home', icon: Home, label: 'Home / Residence', labelHi: '🏠 घर / मकान' },
    { id: 'shop', icon: Store, label: 'Shop / Showroom', labelHi: '🏪 दुकान / शोरूम' },
    { id: 'office', icon: Building2, label: 'Office / Corporate', labelHi: '🏢 ऑफिस' },
    { id: 'warehouse', icon: Warehouse, label: 'Warehouse / Godown', labelHi: '📦 गोदाम' },
    { id: 'factory', icon: Factory, label: 'Factory / Plant', labelHi: '🏭 फैक्ट्री / प्लांट' },
    { id: 'other', icon: MapPin, label: 'Other Property', labelHi: '🌾 फार्महाउस / अन्य' },
  ];

  const timeSlots = [
    { id: 'morning', label: 'Morning (10 AM - 1 PM)', labelHi: 'सुबह 10 से 1 बजे' },
    { id: 'afternoon', label: 'Afternoon (1 PM - 4 PM)', labelHi: 'दोपहर 1 से 4 बजे' },
    { id: 'evening', label: 'Evening (4 PM - 8 PM)', labelHi: 'शाम 4 से 8 बजे' },
    { id: 'anytime', label: 'Anytime / As per call', labelHi: 'कॉल करके तय करें' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      alert(isHi ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!formData.placeName.trim()) {
      alert(isHi ? 'कृपया जगह / प्रतिष्ठान का नाम दर्ज करें (जैसे: घर, दुकान, ऑफिस का नाम)' : 'Please enter the place / property name.');
      return;
    }

    if (!formData.city.trim()) {
      alert(isHi ? 'कृपया शहर का नाम दर्ज करें।' : 'Please enter the city name.');
      return;
    }

    if (!formData.pincode.trim() || formData.pincode.length < 6) {
      alert(isHi ? 'कृपया 6 अंकों का सही पिन कोड दर्ज करें।' : 'Please enter a valid 6-digit PIN code.');
      return;
    }

    if (!formData.landmark.trim()) {
      alert(isHi ? 'कृपया आसपास का कोई लैंडमार्क (जैसे: मंदिर, बैंक, स्कूल के पास) दर्ज करें ताकि तकनीशियन आसानी से पहुँच सके।' : 'Please enter a nearby landmark.');
      return;
    }

    // Save booking to storage & create unique ID
    const newBooking = saveSurveyBooking(formData);
    setSavedBooking(newBooking);
    setLastSubmittedData({ ...formData });
    setSubmitted(true);

    const placeTypeLabel = placeTypes.find(p => p.id === formData.placeType);
    const timeSlotLabel = timeSlots.find(t => t.id === formData.preferredTimeSlot);

    const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
    const adminApproveUrl = `${baseUrl}?admin_approve_survey=${newBooking.id}`;
    const customerTrackUrl = `${baseUrl}?track_survey=${newBooking.id}`;

    // Format comprehensive WhatsApp message with customer number & direct Admin Approve link
    const whatsappMessage = encodeURIComponent(
      `🎯 *नया फ्री CCTV साइट सर्वे बुक हुआ (FREE SITE SURVEY BOOKING)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *बुकिंग आईडी (Booking ID):* ${newBooking.id}\n` +
      `👤 *ग्राहक का नाम (Customer Name):* ${formData.fullName.trim()}\n` +
      `📞 *ग्राहक का मोबाइल नंबर (Customer Phone):* ${formData.phoneNumber.trim()}\n` +
      `🏢 *जगह / प्रतिष्ठान का नाम (Place Name):* ${formData.placeName.trim()}\n` +
      `🏷️ *प्रॉपर्टी प्रकार (Property Type):* ${isHi ? placeTypeLabel?.labelHi : placeTypeLabel?.label}\n` +
      `🏙️ *शहर / सिटी (City):* ${formData.city.trim()}\n` +
      `📮 *पिन कोड (PIN Code):* ${formData.pincode.trim()}\n` +
      `🚩 *आसपास का लैंडमार्क (Nearby Landmark):* ${formData.landmark.trim()}\n` +
      (formData.fullAddress.trim() ? `📍 *पूरा पता (Full Address):* ${formData.fullAddress.trim()}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📷 *अनुमानित कैमरे (Cameras Needed):* ${formData.cameraCount} कैमरे\n` +
      `🔧 *सर्विस प्रकार:* ${formData.serviceType.replace('_', ' ').toUpperCase()}\n` +
      `🗓️ *पसंदीदा तारीख (Date):* ${formData.preferredDate || 'जल्द से जल्द (Earliest Possible)'}\n` +
      `⏰ *पसंदीदा समय (Time Slot):* ${isHi ? timeSlotLabel?.labelHi : timeSlotLabel?.label}\n` +
      (formData.notes.trim() ? `📝 *विशेष मांग / नोट:* ${formData.notes.trim()}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👉 *स्टोर ओनर / एडमिन 1-क्लिक अप्रूवल लिंक:*\n` +
      `${adminApproveUrl}\n\n` +
      `🔗 *ग्राहक स्टेटस ट्रैकिंग लिंक:*\n` +
      `${customerTrackUrl}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *सुझाव:* स्टोर ओनर ऊपर दिए गए लिंक पर क्लिक करके 'Approve OK' करें ताकि ग्राहक को 'YOUR REQUEST IS SUCCESSFUL' का मैसेज जाए!`
    );

    // Direct redirection to WhatsApp
    const targetWhatsapp = storeInfo.whatsappNumber || '917483005197';
    setTimeout(() => {
      window.open(`https://wa.me/${targetWhatsapp}?text=${whatsappMessage}`, '_blank');
    }, 300);
  };

  const handleReopenWhatsApp = () => {
    if (!lastSubmittedData) return;
    const placeTypeLabel = placeTypes.find(p => p.id === lastSubmittedData.placeType);
    const timeSlotLabel = timeSlots.find(t => t.id === lastSubmittedData.preferredTimeSlot);

    const whatsappMessage = encodeURIComponent(
      `🎯 *नया फ्री CCTV साइट सर्वे बुक हुआ (FREE SITE SURVEY BOOKING)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *ग्राहक का नाम (Customer Name):* ${lastSubmittedData.fullName.trim()}\n` +
      `📞 *ग्राहक का मोबाइल नंबर (Customer Phone):* ${lastSubmittedData.phoneNumber.trim()}\n` +
      `🏢 *जगह / प्रतिष्ठान का नाम (Place Name):* ${lastSubmittedData.placeName.trim()}\n` +
      `🏷️ *प्रॉपर्टी प्रकार (Property Type):* ${isHi ? placeTypeLabel?.labelHi : placeTypeLabel?.label}\n` +
      `🏙️ *शहर / सिटी (City):* ${lastSubmittedData.city.trim()}\n` +
      `📮 *पिन कोड (PIN Code):* ${lastSubmittedData.pincode.trim()}\n` +
      `🚩 *आसपास का लैंडमार्क (Nearby Landmark):* ${lastSubmittedData.landmark.trim()}\n` +
      (lastSubmittedData.fullAddress?.trim() ? `📍 *पूरा पता (Full Address):* ${lastSubmittedData.fullAddress.trim()}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📷 *अनुमानित कैमरे (Cameras Needed):* ${lastSubmittedData.cameraCount} कैमरे\n` +
      `🔧 *सर्विस प्रकार:* ${lastSubmittedData.serviceType.replace('_', ' ').toUpperCase()}\n` +
      `🗓️ *पसंदीदा तारीख (Date):* ${lastSubmittedData.preferredDate || 'जल्द से जल्द (Earliest)'}\n` +
      `⏰ *पसंदीदा समय (Time Slot):* ${isHi ? timeSlotLabel?.labelHi : timeSlotLabel?.label}\n` +
      (lastSubmittedData.notes?.trim() ? `📝 *विशेष मांग / नोट:* ${lastSubmittedData.notes.trim()}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *सुझाव:* ग्राहक को तुरंत इस नंबर (+91 ${lastSubmittedData.phoneNumber.trim()}) पर कॉल या व्हाट्सएप करके फ्री साइट विज़िट का समय कन्फर्म करें!`
    );
    const targetWhatsapp = storeInfo.whatsappNumber || '917483005197';
    window.open(`https://wa.me/${targetWhatsapp}?text=${whatsappMessage}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col border border-slate-200 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/30 flex items-center justify-center border border-emerald-400/40 shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  100% Free Survey
                </span>
                <span className="text-[11px] text-emerald-200 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {isHi ? 'एक्सपर्ट इंजीनियर विज़िट' : 'Certified Engineer Visit'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {isHi ? 'फ्री CCTV साइट सर्वे बुक करें' : 'Book Free CCTV Site Inspection'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted && lastSubmittedData ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-xs font-black mb-2 border border-emerald-300">
                <span>{isHi ? 'बुकिंग आईडी:' : 'Booking ID:'}</span>
                <span className="font-mono">{savedBooking?.id || 'SURV-NEW'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {isHi ? '🎉 फ्री सर्वे रिक्वेस्ट बुक हो गई!' : '🎉 Survey Request Booked!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
                {isHi
                  ? `आपकी सभी जानकारी और मोबाइल नंबर (+91 ${lastSubmittedData.phoneNumber}) हमारे व्हाट्सएप पर भेज दिया गया है। स्टोर द्वारा अप्रूव होते ही आपको 'YOUR REQUEST IS SUCCESSFUL' का नोटिफिकेशन मिलेगा।`
                  : `Your survey details and phone number (+91 ${lastSubmittedData.phoneNumber}) forwarded to WhatsApp. You will receive 'YOUR REQUEST IS SUCCESSFUL' once approved.`}
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs border border-slate-200 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isHi ? 'बुकिंग आईडी:' : 'Booking ID:'}</span>
                <span className="font-mono font-bold text-indigo-600">{savedBooking?.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isHi ? 'ग्राहक का नाम:' : 'Customer Name:'}</span>
                <span className="font-bold text-slate-900">{lastSubmittedData.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isHi ? 'मोबाइल नंबर:' : 'Mobile Number:'}</span>
                <span className="font-bold text-emerald-700">{lastSubmittedData.phoneNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isHi ? 'जगह का नाम:' : 'Place Name:'}</span>
                <span className="font-bold text-slate-900">{lastSubmittedData.placeName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isHi ? 'शहर व पिन कोड:' : 'City & PIN:'}</span>
                <span className="font-bold text-slate-900">{lastSubmittedData.city} ({lastSubmittedData.pincode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">{isHi ? 'लैंडमार्क:' : 'Landmark:'}</span>
                <span className="font-bold text-slate-900">{lastSubmittedData.landmark}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleReopenWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isHi ? 'व्हाट्सएप चैट खोलें' : 'Re-open WhatsApp Chat'}</span>
              </button>
              {onTrackSurvey && savedBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onTrackSurvey(savedBooking.id);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>{isHi ? 'लाइव स्टेटस ट्रैक करें' : 'Track Status'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm py-3 px-5 rounded-xl transition cursor-pointer"
              >
                {isHi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Trust Subheader banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950">
                <p className="font-black">
                  {isHi ? 'CCTV एक्सपर्ट आपके पते पर आकर फ्री में बताएंगे:' : 'Our expert visits your premise for 100% Free:'}
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  {isHi 
                    ? 'सही कैमरे की जगह, वायर का रूट, DVR/NVR क्षमता और कम से कम खर्च में बेस्ट सिक्योरिटी सेटअप।'
                    : 'Best camera angles, no-blind-spot wiring plan, DVR capacity & wholesale quote.'}
                </p>
              </div>
            </div>

            {/* SECTION 1: CUSTOMER DETAILS */}
            <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{isHi ? '1. आपकी संपर्क जानकारी' : '1. Contact Details'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Customer Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'आपका पूरा नाम *' : 'Your Full Name *'}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={isHi ? 'जैसे: राहुल पटेल / विजय भाई' : 'e.g. Rahul Patel'}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Customer Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'मोबाइल नंबर (जिस पर कॉल आएगा) *' : 'Phone Number (For Call & WhatsApp) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-black text-slate-500">+91</span>
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      placeholder={isHi ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phoneNumber: val });
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-3 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: PLACE / LOCATION DETAILS (REQUIRED BY USER) */}
            <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{isHi ? '2. सर्वे स्थल का विवरण (Site Location)' : '2. Survey Location Details'}</span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {isHi ? 'सभी जानकारी अनिवार्य' : 'All Required'}
                </span>
              </div>

              {/* Place Name (जगह का नाम) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'जहाँ सर्वे करना है उस जगह का नाम *' : 'Place / Property / Shop Name *'}
                </label>
                <input
                  required
                  type="text"
                  placeholder={isHi ? 'जैसे: पटेल किराना स्टोर / 3-मंजिला मकान / शांति विला' : 'e.g. Patel Electronics / 3-Storey Home / Shanti Villa'}
                  value={formData.placeName}
                  onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Property Type Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  {isHi ? 'जगह का प्रकार' : 'Property Type'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {placeTypes.map((pt) => {
                    const IconComp = pt.icon;
                    const isSelected = formData.placeType === pt.id;
                    return (
                      <button
                        type="button"
                        key={pt.id}
                        onClick={() => setFormData({ ...formData, placeType: pt.id as any })}
                        className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                        <span className="text-[10px] font-bold truncate max-w-full">
                          {isHi ? pt.labelHi.split(' ')[1] || pt.labelHi : pt.label.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* City (शहर) & PIN Code (पिन कोड) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* City Selection / Input */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'सिटी / शहर का नाम *' : 'City Name *'}
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      placeholder={isHi ? 'शहर खोजें या लिखें (जैसे: मोरबी, राजकोट)' : 'Enter or search city'}
                      value={citySearchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCitySearchQuery(val);
                        setFormData({ ...formData, city: val });
                        setShowCityDropdown(true);
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>

                  {/* City Suggestions Dropdown */}
                  {showCityDropdown && matchedCities.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-30 overflow-hidden py-1 max-h-48 overflow-y-auto">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                        {isHi ? 'सुझावित शहर' : 'Suggested Cities'}
                      </div>
                      {matchedCities.map((cityItem) => (
                        <button
                          type="button"
                          key={cityItem.name}
                          onClick={() => handleSelectCity(cityItem)}
                          className="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between cursor-pointer"
                        >
                          <span>{isHi ? cityItem.nameHi : cityItem.name} ({cityItem.state})</span>
                          <span className="text-[10px] font-mono text-slate-400">PIN: {cityItem.defaultPincode}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick City Chips */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Morbi', 'Rajkot', 'Ahmedabad', 'Surat'].map((cityName) => (
                      <button
                        type="button"
                        key={cityName}
                        onClick={() => {
                          const found = CITIES_DATA.find(c => c.name === cityName);
                          if (found) handleSelectCity(found);
                          else {
                            setCitySearchQuery(cityName);
                            setFormData(prev => ({ ...prev, city: cityName }));
                          }
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition cursor-pointer border ${
                          formData.city.toLowerCase() === cityName.toLowerCase()
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cityName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PIN Code Input (उधर का पिन कोड) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'उधर का पिन कोड (6 अंक) *' : 'Location PIN Code (6 Digits) *'}
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    placeholder={isHi ? 'जैसे: 363641' : 'e.g. 363641'}
                    value={formData.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setFormData({ ...formData, pincode: val });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-black text-slate-900 tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    {isHi ? 'पिन कोड से नजदीकी तकनीशियन को तुरंत असाइन किया जाएगा' : 'Used to dispatch closest field technician'}
                  </p>
                </div>
              </div>

              {/* Landmark (आसपास का लैंडमार्क) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'उधर के आसपास का कोई लैंडमार्क *' : 'Nearby Landmark (Required) *'}
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder={isHi ? 'जैसे: हनुमान मंदिर के पास, SBI बैंक के सामने, पुराना बस स्टैंड' : 'e.g. Near Hanuman Temple, Opp. SBI Bank, Main Chowk'}
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <Compass className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  {isHi ? 'पहचान का स्थान जिससे तकनीशियन को आपकी जगह खोजने में आसानी हो' : 'A recognizable spot nearby to help our engineer reach without hassle'}
                </p>
              </div>

              {/* Full Address / Street (Optional / Additional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isHi ? 'गली / वार्ड / पूरा पता (ऐच्छिक)' : 'Street / Area / Full Address (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? 'जैसे: दुकान नं. 4, गांधी चौक, मेन मार्केट' : 'e.g. Shop No. 4, Gandhi Chowk, Main Market'}
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* SECTION 3: CAMERA REQUIREMENT & PREFERRED TIMING */}
            <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <span>{isHi ? '3. कैमरा जरूरत व समय' : '3. Camera Needs & Schedule'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Camera Count */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'अनुमानित कितने कैमरे लगाने हैं?' : 'Approx Cameras Needed'}
                  </label>
                  <select
                    value={formData.cameraCount}
                    onChange={(e) => setFormData({ ...formData, cameraCount: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value={2}>2 {isHi ? 'कैमरे (छोटा घर/दुकान)' : 'Cameras (Small Setup)'}</option>
                    <option value={4}>4 {isHi ? 'कैमरे (मानक 4-चैनल किट - मोस्ट पॉपुलर)' : 'Cameras (Standard 4-Ch Kit - Most Popular)'}</option>
                    <option value={8}>8 {isHi ? 'कैमरे (बड़ा घर / ऑफिस / शोरूम)' : 'Cameras (Large Showroom / House)'}</option>
                    <option value={16}>16+ {isHi ? 'कैमरे (गोदाम / फैक्ट्री / कमर्शियल)' : 'Cameras (Factory / Warehouse)'}</option>
                  </select>
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'पसंदीदा सर्वे तारीख' : 'Preferred Visit Date'}
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  {isHi ? 'पसंदीदा समय स्लॉट' : 'Preferred Time Slot'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeSlots.map((ts) => (
                    <button
                      type="button"
                      key={ts.id}
                      onClick={() => setFormData({ ...formData, preferredTimeSlot: ts.id as any })}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer font-bold text-[11px] ${
                        formData.preferredTimeSlot === ts.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isHi ? ts.labelHi : ts.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Note / Requirements */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'कोई विशेष मांग या सवाल (ऐच्छिक)' : 'Special Request or Questions (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? 'जैसे: 24/7 कलर नाइट विजन, मोबाइल ऐप व्यू, माइक वाला कैमरा चाहिए' : 'e.g. Color night vision + audio recording required'}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="submit-free-survey-btn"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm sm:text-base py-3.5 px-4 rounded-2xl shadow-xl shadow-emerald-900/30 active:scale-98 transition cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-white text-emerald-600" />
                <span>
                  {isHi ? '🚀 फ्री सर्वे बुक करें (व्हाट्सएप पर भेजें)' : '🚀 Book Free Survey (Send to WhatsApp)'}
                </span>
              </button>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-2 text-center font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isHi
                    ? 'सबमिट करते ही सभी विवरण व आपका नंबर सीधे हमारे व्हाट्सएप (+91 74830 05197) पर प्राप्त होगा।'
                    : 'Your survey location & contact details will be sent directly to WhatsApp.'}
                </span>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
