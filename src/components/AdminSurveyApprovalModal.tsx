import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Send, 
  MapPin, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  MessageSquare, 
  PhoneCall, 
  Copy, 
  Check, 
  ExternalLink,
  Search,
  Filter,
  BadgeCheck,
  Building,
  Navigation,
  Compass,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { Language, SiteVisitBooking, StoreInfo } from '../types';
import { 
  getStoredSurveyBookings, 
  approveSurveyBooking, 
  generateApprovalCustomerNotification 
} from '../utils/surveyStorage';
import { speakWelcomeAudio } from '../utils/speech';

interface AdminSurveyApprovalModalProps {
  isOpen: boolean;
  language: Language;
  storeInfo: StoreInfo;
  initialSurveyId?: string | null;
  onClose: () => void;
}

export const AdminSurveyApprovalModal: React.FC<AdminSurveyApprovalModalProps> = ({
  isOpen,
  language,
  storeInfo,
  initialSurveyId,
  onClose,
}) => {
  const isHi = language === 'hi';

  const [bookings, setBookings] = useState<SiteVisitBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<SiteVisitBooking | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justApprovedId, setJustApprovedId] = useState<string | null>(null);

  // Form states for approval customization
  const [assignedEngineer, setAssignedEngineer] = useState('इंजीनियर जिग्नेश पटेल (Senior Field Tech)');
  const [engineerPhone, setEngineerPhone] = useState('7483005197');
  const [adminNote, setAdminNote] = useState('फ्री साइट सर्वे स्वीकृत। इंजीनियर नियत समय पर लोकेशन पर पहुंचेगा।');

  const reloadBookings = () => {
    const data = getStoredSurveyBookings();
    setBookings(data);
    if (initialSurveyId) {
      const target = data.find(b => b.id.toLowerCase() === initialSurveyId.toLowerCase());
      if (target) {
        setSelectedBooking(target);
      }
    } else if (data.length > 0 && !selectedBooking) {
      setSelectedBooking(data[0]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadBookings();
    }
  }, [isOpen, initialSurveyId]);

  if (!isOpen) return null;

  const handleApprove = (bookingId: string) => {
    const approved = approveSurveyBooking(bookingId, assignedEngineer, engineerPhone, adminNote);
    if (approved) {
      setJustApprovedId(bookingId);
      setSelectedBooking(approved);
      reloadBookings();

      // Send immediate customer notification via WhatsApp / SMS preview
      const notif = generateApprovalCustomerNotification(approved);
      
      // Auto trigger WhatsApp message draft to customer
      setTimeout(() => {
        window.open(notif.whatsappUrl, '_blank');
      }, 400);
    }
  };

  const handleCopyLink = (booking: SiteVisitBooking) => {
    const notif = generateApprovalCustomerNotification(booking);
    navigator.clipboard.writeText(notif.trackLink);
    setCopiedId(booking.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'pending' && b.status !== 'pending') return false;
    if (activeTab === 'approved' && b.status !== 'approved') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.fullName.toLowerCase().includes(q) ||
        b.phoneNumber.includes(q) ||
        b.placeName.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.pincode.includes(q) ||
        b.landmark.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col text-white my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Admin Approval Panel
                </span>
                {pendingCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {pendingCount} Pending Approvals
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {isHi ? 'CCTV फ्री सर्वे अप्रूवल मैनेजर (Survey Approvals)' : 'CCTV Survey Approval & Dispatch Console'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 flex-1 overflow-hidden">
          
          {/* Left Column: Bookings List (4 cols) */}
          <div className="lg:col-span-5 p-4 flex flex-col bg-slate-900/70 overflow-hidden max-h-[40vh] lg:max-h-[75vh]">
            
            {/* Search & Filter Tabs */}
            <div className="space-y-2.5 pb-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={isHi ? 'नाम, मोबाइल, जगह, पिन से खोजें...' : 'Search by name, phone, place, pin...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-1.5 bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setActiveTab('approved')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Approved ({bookings.length - pendingCount})
                </button>
              </div>
            </div>

            {/* Bookings Scroll List */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  {isHi ? 'कोई सर्वे रिक्वेस्ट नहीं मिली।' : 'No survey requests found.'}
                </div>
              ) : (
                filteredBookings.map((item) => {
                  const isSelected = selectedBooking?.id === item.id;
                  const isApproved = item.status === 'approved';

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedBooking(item)}
                      className={`p-3 rounded-2xl border transition cursor-pointer relative ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/40'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-black text-indigo-300">
                              {item.id}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.2 rounded-full uppercase ${
                              isApproved 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            }`}>
                              {isApproved ? 'Approved OK' : 'Pending'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">
                            {item.fullName}
                          </h4>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 line-clamp-1">
                            <Building className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{item.placeName} ({item.city})</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block font-mono">
                            PIN: {item.pincode}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400">
                            {item.cameraCount} Cams
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Booking Detail & Approval Actions (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 overflow-y-auto bg-slate-900/90 max-h-[75vh] space-y-4">
            {selectedBooking ? (
              <>
                {/* Approval Status Header Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
                  selectedBooking.status === 'approved'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedBooking.status === 'approved' ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {selectedBooking.status === 'approved' ? (
                        <BadgeCheck className="w-6 h-6" />
                      ) : (
                        <Clock className="w-6 h-6 animate-spin" />
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider">
                        {selectedBooking.status === 'approved' ? 'Status: Approved & Dispatched' : 'Status: Waiting for Admin Approval'}
                      </div>
                      <h3 className="text-base font-black text-white">
                        {selectedBooking.id} — {selectedBooking.placeName}
                      </h3>
                    </div>
                  </div>

                  {selectedBooking.status === 'approved' && (
                    <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-xl shadow-xs">
                      YOUR REQUEST IS SUCCESSFUL
                    </span>
                  )}
                </div>

                {/* Customer & Location Full Specifications */}
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-3 text-xs">
                  <div className="text-[11px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-700/80 pb-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span>Customer & Site Inspection Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Customer Name:</span>
                      <span className="font-bold text-white text-sm">{selectedBooking.fullName}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Customer Phone (WhatsApp):</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          +91 {selectedBooking.phoneNumber}
                        </span>
                        <a
                          href={`tel:${selectedBooking.phoneNumber}`}
                          className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                          title="Call Customer"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Place / Property Name:</span>
                      <span className="font-bold text-amber-300">{selectedBooking.placeName}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({selectedBooking.placeType || 'Commercial/Residential'})</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">City & PIN Code:</span>
                      <span className="font-bold text-white">{selectedBooking.city}</span>
                      <span className="ml-1 bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-md font-mono text-[10px]">
                        PIN: {selectedBooking.pincode}
                      </span>
                    </div>

                    <div className="sm:col-span-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-slate-400 block text-[11px] font-medium flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        Nearby Landmark (पहचान स्थल):
                      </span>
                      <span className="font-bold text-amber-200 mt-0.5 block">{selectedBooking.landmark}</span>
                      {selectedBooking.fullAddress && (
                        <span className="text-slate-400 text-[11px] block mt-1">
                          Address: {selectedBooking.fullAddress}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Requested Cameras:</span>
                      <span className="font-bold text-white">{selectedBooking.cameraCount} Cameras Setup</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Preferred Timing:</span>
                      <span className="font-bold text-white">
                        {selectedBooking.preferredDate || 'Earliest'} ({selectedBooking.preferredTimeSlot || 'Morning'})
                      </span>
                    </div>

                    {selectedBooking.notes && (
                      <div className="sm:col-span-2 bg-slate-900/40 p-2 rounded-lg text-slate-300">
                        <span className="text-slate-400 block text-[10px]">Customer Notes:</span>
                        {selectedBooking.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* APPROVAL ACTION SECTION */}
                {selectedBooking.status === 'pending' ? (
                  <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-indigo-300 uppercase">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Approve & Dispatch Technician</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-300 font-bold mb-1">
                          Assigned Field Engineer:
                        </label>
                        <input
                          type="text"
                          value={assignedEngineer}
                          onChange={(e) => setAssignedEngineer(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-300 font-bold mb-1">
                          Technician Phone:
                        </label>
                        <input
                          type="text"
                          value={engineerPhone}
                          onChange={(e) => setEngineerPhone(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* BIG APPROVE BUTTON */}
                    <button
                      onClick={() => handleApprove(selectedBooking.id)}
                      id="admin-approve-survey-btn"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-sm sm:text-base py-3.5 px-4 rounded-2xl shadow-xl transition cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 className="w-5 h-5 fill-slate-950 text-emerald-400" />
                      <span>
                        {isHi
                          ? '✅ अप्रूव ओके करें (APPROVE OK & SEND NOTIFICATION)'
                          : '✅ APPROVE OK & SEND NOTIFICATION TO CUSTOMER'}
                      </span>
                    </button>
                    <p className="text-[11px] text-slate-400 text-center">
                      {isHi
                        ? 'अप्रूव करते ही स्टेटस "YOUR REQUEST IS SUCCESSFUL" हो जाएगा और ग्राहक को नोटिफिकेशन जाएगा।'
                        : 'Approving sets status to "YOUR REQUEST IS SUCCESSFUL" and notifies customer.'}
                    </p>
                  </div>
                ) : (
                  /* ALREADY APPROVED - NOTIFICATION SENDING OPTIONS */
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Survey is Approved (Approved at: {new Date(selectedBooking.approvedAt || Date.now()).toLocaleTimeString()})</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        Dispatched
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {/* WhatsApp to customer */}
                      <a
                        href={generateApprovalCustomerNotification(selectedBooking).whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2.5 px-3 rounded-xl transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{isHi ? 'व्हाट्सएप पर अप्रूवल भेजें' : 'Send WhatsApp Approval'}</span>
                      </a>

                      {/* SMS to customer */}
                      <a
                        href={generateApprovalCustomerNotification(selectedBooking).smsUrl}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-700 transition"
                      >
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span>{isHi ? 'SMS मैसेज भेजें' : 'Send Direct SMS'}</span>
                      </a>
                    </div>

                    {/* Direct Tracking Link Copy */}
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-400 text-[10px] shrink-0">Tracking Link:</span>
                      <input
                        readOnly
                        value={generateApprovalCustomerNotification(selectedBooking).trackLink}
                        className="w-full bg-transparent text-indigo-300 font-mono text-[11px] focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleCopyLink(selectedBooking)}
                        className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white shrink-0 cursor-pointer transition flex items-center gap-1 text-[11px]"
                      >
                        {copiedId === selectedBooking.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === selectedBooking.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </>
            ) : (
              <div className="text-center py-20 text-slate-500">
                {isHi ? 'विवरण देखने के लिए कोई सर्वे चुनें' : 'Select a survey to view details'}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
