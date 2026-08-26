import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  PhoneCall, 
  Building, 
  Compass, 
  Navigation, 
  AlertCircle,
  BadgeCheck,
  Wrench,
  MessageSquare,
  Volume2
} from 'lucide-react';
import { Language, SiteVisitBooking, StoreInfo } from '../types';
import { getSurveyBookingById, getStoredSurveyBookings, getActiveCustomerSurveyId } from '../utils/surveyStorage';
import { speakWelcomeAudio } from '../utils/speech';

interface SurveyStatusTrackModalProps {
  isOpen: boolean;
  language: Language;
  storeInfo: StoreInfo;
  surveyId?: string | null;
  onClose: () => void;
  onOpenNewSurvey?: () => void;
}

export const SurveyStatusTrackModal: React.FC<SurveyStatusTrackModalProps> = ({
  isOpen,
  language,
  storeInfo,
  surveyId,
  onClose,
  onOpenNewSurvey,
}) => {
  const isHi = language === 'hi';
  const [activeBooking, setActiveBooking] = useState<SiteVisitBooking | null>(null);
  const [inputId, setInputId] = useState(surveyId || '');

  const loadBooking = (idToLook: string) => {
    if (!idToLook.trim()) {
      const activeId = getActiveCustomerSurveyId();
      if (activeId) {
        const found = getSurveyBookingById(activeId);
        if (found) {
          setActiveBooking(found);
          setInputId(found.id);
          return;
        }
      }
      const all = getStoredSurveyBookings();
      if (all.length > 0) {
        setActiveBooking(all[0]);
        setInputId(all[0].id);
      }
      return;
    }

    const found = getSurveyBookingById(idToLook);
    if (found) {
      setActiveBooking(found);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (surveyId) {
        setInputId(surveyId);
        loadBooking(surveyId);
      } else {
        loadBooking('');
      }
    }
  }, [isOpen, surveyId]);

  // Listen to live updates from admin approvals
  useEffect(() => {
    const handleSurveyUpdate = (e: any) => {
      const updatedId = e.detail?.bookingId;
      if (activeBooking && updatedId && activeBooking.id.toLowerCase() === updatedId.toLowerCase()) {
        const fresh = getSurveyBookingById(updatedId);
        if (fresh) {
          setActiveBooking(fresh);
        }
      }
    };
    window.addEventListener('cctv_survey_updated', handleSurveyUpdate);
    return () => window.removeEventListener('cctv_survey_updated', handleSurveyUpdate);
  }, [activeBooking]);

  if (!isOpen) return null;

  const isApproved = activeBooking?.status === 'approved';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-slate-200 my-auto text-slate-900">
        
        {/* Header */}
        <div className={`p-4 sm:p-5 text-white flex items-center justify-between transition-colors ${
          isApproved 
            ? 'bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900' 
            : 'bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              isApproved 
                ? 'bg-emerald-500/30 border-emerald-400 text-amber-300' 
                : 'bg-indigo-500/30 border-indigo-400 text-indigo-200'
            }`}>
              {isApproved ? <BadgeCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isApproved ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-200'
                }`}>
                  {isApproved ? 'Approved & Confirmed' : 'Survey Tracking'}
                </span>
                {activeBooking && (
                  <span className="text-[11px] font-mono text-emerald-200 font-bold">
                    {activeBooking.id}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {isHi ? 'फ्री सर्वे स्टेटस व लाइव ट्रैकिंग' : 'CCTV Free Survey Live Status'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Lookup Input if needed */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={isHi ? 'बुकिंग ID दर्ज करें (जैसे: SURV-7842)' : 'Enter Booking ID (e.g. SURV-7842)'}
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <button
              onClick={() => loadBooking(inputId)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
            >
              {isHi ? 'स्टेटस देखें' : 'Check'}
            </button>
          </div>

          {activeBooking ? (
            <>
              {/* PRIMARY PROMINENT APPROVAL HERO BANNER */}
              {isApproved ? (
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-500 rounded-3xl p-4 sm:p-5 text-center shadow-lg shadow-emerald-900/10 space-y-2 relative overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-black text-[11px] sm:text-xs uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>YOUR REQUEST IS SUCCESSFUL</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                    {isHi 
                      ? '🎉 आपका अप्रूवल ओके हो चुका है!' 
                      : '🎉 YOUR CCTV SURVEY IS APPROVED!'}
                  </h3>

                  <p className="text-xs sm:text-sm text-emerald-900 font-semibold max-w-md mx-auto">
                    {isHi
                      ? `पटेल सीसीटीवी कैमरा वर्ल्ड द्वारा आपकी सर्वे रिक्वेस्ट स्वीकृत कर ली गई है। हमारे सर्टिफाइड इंजीनियर आपकी लोकेशन पर फ्री विज़िट करेंगे।`
                      : `Patel CCTV Camera World has approved your site survey request. Our field technician will visit your location shortly.`}
                  </p>

                  <div className="pt-1 flex items-center justify-center gap-2">
                    <span className="bg-white/80 border border-emerald-300 text-emerald-800 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      Approved at {new Date(activeBooking.approvedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-center space-y-1.5">
                  <div className="inline-flex items-center gap-1 bg-amber-200 text-amber-900 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>Under Review by Admin</span>
                  </div>
                  <h4 className="text-base font-bold text-amber-950">
                    {isHi ? 'सर्वे रिक्वेस्ट रिव्यू में है' : 'Survey Request is Pending Approval'}
                  </h4>
                  <p className="text-xs text-amber-800">
                    {isHi 
                      ? 'जैसे ही स्टोर ओनर अप्रूव ओके करेंगे, यहाँ "YOUR REQUEST IS SUCCESSFUL" दिखाई देगा।'
                      : 'As soon as store admin clicks Approve, status will update here instantly.'}
                  </p>
                </div>
              )}

              {/* TIMELINE PROGRESS */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  {isHi ? 'सर्वे प्रोग्रेस ट्रैकर' : 'Survey Progress Tracker'}
                </div>

                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {isHi ? '1. सर्वे रिक्वेस्ट बुक हुई' : '1. Survey Request Submitted'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(activeBooking.createdAt).toLocaleDateString()} at {new Date(activeBooking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isApproved ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950 animate-pulse'
                    }`}>
                      {isApproved ? '✓' : '2'}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isApproved ? 'text-emerald-900' : 'text-slate-700'}`}>
                        {isHi ? '2. स्टोर अप्रूवल (Approve OK)' : '2. Store Approval (Approve OK)'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {isApproved ? 'YOUR REQUEST IS SUCCESSFUL' : 'Awaiting confirmation'}
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isApproved ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      3
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {isHi ? '3. फील्ड इंजीनियर विज़िट' : '3. Certified Engineer Site Visit'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {isApproved ? (activeBooking.assignedEngineer || 'Engineer Assigned') : 'Pending approval'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LOCATION & SURVEY DETAILS */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center justify-between">
                  <span>{isHi ? 'साइट लोकेशन का विवरण' : 'Site Location Specifications'}</span>
                  <span className="text-emerald-700 font-bold">{activeBooking.cameraCount} Cams</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-500 text-[10px] block">{isHi ? 'ग्राहक:' : 'Customer:'}</span>
                    <span className="font-bold text-slate-900">{activeBooking.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">{isHi ? 'फोन:' : 'Phone:'}</span>
                    <span className="font-mono font-bold text-emerald-700">+91 {activeBooking.phoneNumber}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px] block">{isHi ? 'जगह का नाम:' : 'Place Name:'}</span>
                    <span className="font-bold text-slate-900">{activeBooking.placeName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">{isHi ? 'शहर:' : 'City:'}</span>
                    <span className="font-bold text-slate-900">{activeBooking.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">{isHi ? 'पिन कोड:' : 'PIN Code:'}</span>
                    <span className="font-mono font-bold text-slate-900">{activeBooking.pincode}</span>
                  </div>
                  <div className="col-span-2 bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-medium block flex items-center gap-1">
                      <Compass className="w-3 h-3 text-emerald-600" />
                      {isHi ? 'आसपास का लैंडमार्क:' : 'Nearby Landmark:'}
                    </span>
                    <span className="font-bold text-slate-900 block mt-0.5">{activeBooking.landmark}</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={`tel:${storeInfo.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl transition"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>{isHi ? 'स्टोर हेल्पलाइन पर बात करें' : 'Call Store Helpline'}</span>
                </a>
                <a
                  href={`https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent(`नमस्ते, मुझे मेरे फ्री सर्वे ${activeBooking.id} (${activeBooking.placeName}) के बारे में जानकारी चाहिए।`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isHi ? 'व्हाट्सएप चैट' : 'WhatsApp Chat'}</span>
                </a>
              </div>

            </>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              {isHi ? 'कृपया सही बुकिंग आईडी दर्ज करें।' : 'Please enter a valid Booking ID.'}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
