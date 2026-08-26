import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  PhoneCall, 
  MessageSquare, 
  RotateCcw, 
  Award, 
  Wrench, 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  Smartphone,
  Info,
  Send,
  Lock,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Language, StoreInfo, HelpCategory, HelpTicket, CustomerUser } from '../types';
import { 
  verifyCallerNumber, 
  OFFICIAL_PHONE_NUMBERS, 
  saveHelpTicket, 
  getStoredHelpTickets, 
  getHelpTicketById, 
  getActiveCustomerTicketId 
} from '../utils/helpStorage';

interface HelpSupportModalProps {
  isOpen: boolean;
  language: Language;
  storeInfo: StoreInfo;
  currentUser?: CustomerUser | null;
  initialCategory?: HelpCategory;
  initialTicketId?: string | null;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  language,
  storeInfo,
  currentUser,
  initialCategory = 'fraud_alert',
  initialTicketId,
  onClose,
}) => {
  const isHi = language === 'hi';

  // Tabs: 'report_issue' | 'verify_number' | 'track_ticket'
  const [activeTab, setActiveTab] = useState<'report_issue' | 'verify_number' | 'track_ticket'>('report_issue');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>(initialCategory);

  // Form State
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '');
  const [subType, setSubType] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'critical' | 'high' | 'medium'>('high');

  // Fraud-specific state
  const [suspectPhoneNumber, setSuspectPhoneNumber] = useState('');
  const [suspectName, setSuspectName] = useState('');
  const [fraudAmount, setFraudAmount] = useState('');
  const [incidentTime, setIncidentTime] = useState('');

  // Warranty / Replacement state
  const [productModel, setProductModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Number Verification Tool state
  const [checkNumberInput, setCheckNumberInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    checked: boolean;
    isOfficial: boolean;
    details: any;
  } | null>(null);

  // Tracking Ticket state
  const [trackTicketIdInput, setTrackTicketIdInput] = useState(initialTicketId || '');
  const [trackedTicket, setTrackedTicket] = useState<HelpTicket | null>(null);

  // Success submission state
  const [submittedTicket, setSubmittedTicket] = useState<HelpTicket | null>(null);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
    if (initialTicketId) {
      setTrackTicketIdInput(initialTicketId);
      const found = getHelpTicketById(initialTicketId);
      if (found) {
        setTrackedTicket(found);
        setActiveTab('track_ticket');
      }
    }
  }, [initialCategory, initialTicketId, isOpen]);

  useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.name);
      if (!phoneNumber) setPhoneNumber(currentUser.phone);
    }
  }, [currentUser]);

  // Set default subTypes when category changes
  useEffect(() => {
    if (selectedCategory === 'fraud_alert') {
      setSubType(isHi ? 'अनधिकृत व्यक्ति द्वारा फर्जी कॉल / एडवांस पेमेंट की मांग' : 'Fake call demanding payment in store name');
      setUrgency('critical');
    } else if (selectedCategory === 'warranty_problem') {
      setSubType(isHi ? '2/3 वर्ष ब्रांड वारंटी क्लेम व इनवॉइस वेरिफिकेशन' : 'Brand Warranty claim & invoice validation');
      setUrgency('high');
    } else if (selectedCategory === 'replacement_issue') {
      setSubType(isHi ? 'खराब कैमरा / नाइट विजन IR LED / DOA रिप्लेसमेंट' : 'Dead on arrival / Blurry lens replacement');
      setUrgency('high');
    } else if (selectedCategory === 'tech_app_offline') {
      setSubType(isHi ? 'मोबाइल ऐप (Hik-Connect / gCMOB) ऑफलाइन व पासवर्ड रीसेट' : 'Mobile app offline or password reset help');
      setUrgency('medium');
    } else if (selectedCategory === 'installation_complaint') {
      setSubType(isHi ? 'टेक्नीशियन देरी या वायरिंग / कैमरा एंगल शिकायत' : 'Technician delay or wiring quality grievance');
      setUrgency('high');
    } else {
      setSubType(isHi ? 'बिलिंग व GST इनवॉइस संशोधन' : 'GST Invoice or payment confirmation');
      setUrgency('medium');
    }
  }, [selectedCategory, isHi]);

  if (!isOpen) return null;

  const handleVerifyNumber = () => {
    if (!checkNumberInput.trim()) return;
    const res = verifyCallerNumber(checkNumberInput);
    setVerificationResult({
      checked: true,
      isOfficial: res.isOfficial,
      details: res.details
    });
  };

  const handleTrackTicket = (idToTrack: string) => {
    const id = idToTrack.trim();
    if (!id) {
      const activeId = getActiveCustomerTicketId();
      if (activeId) {
        const found = getHelpTicketById(activeId);
        if (found) {
          setTrackedTicket(found);
          setTrackTicketIdInput(found.id);
          return;
        }
      }
      const all = getStoredHelpTickets();
      if (all.length > 0) {
        setTrackedTicket(all[0]);
        setTrackTicketIdInput(all[0].id);
      }
      return;
    }

    const found = getHelpTicketById(id);
    setTrackedTicket(found || null);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim() || !description.trim()) {
      alert(isHi ? 'कृपया अपना नाम, मोबाइल नंबर और समस्या का विवरण दर्ज करें।' : 'Please fill your name, phone number, and issue description.');
      return;
    }

    const ticket = saveHelpTicket({
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      category: selectedCategory,
      subType: subType.trim(),
      description: description.trim(),
      urgency,
      suspectPhoneNumber: suspectPhoneNumber.trim() || undefined,
      suspectName: suspectName.trim() || undefined,
      fraudAmount: fraudAmount.trim() || undefined,
      incidentTime: incidentTime.trim() || undefined,
      productModel: productModel.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined,
      purchaseDate: purchaseDate.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
    });

    setSubmittedTicket(ticket);

    // Prepare Urgent WhatsApp Escalation to Store Owner
    let urgencyEmoji = '🚨';
    let catTitle = 'कस्टमर सपोर्ट टिकट';
    if (selectedCategory === 'fraud_alert') {
      urgencyEmoji = '🚨🚨 *URGENT FRAUD / FAKE CALL ALERT*';
      catTitle = 'फ़ेक कॉल / फ्रॉड की शिकायत';
    } else if (selectedCategory === 'warranty_problem') {
      urgencyEmoji = '🛡️ *WARRANTY CLAIM SUPPORT*';
      catTitle = 'वारंटी चेक व इनवॉइस समस्या';
    } else if (selectedCategory === 'replacement_issue') {
      urgencyEmoji = '🔄 *PRODUCT REPLACEMENT REQUEST*';
      catTitle = 'रिप्लेसमेंट व डिफेक्टिव प्रोडक्ट';
    }

    const waMsg = encodeURIComponent(
      `${urgencyEmoji}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *टिकट आईडी (Ticket ID):* ${ticket.id}\n` +
      `👤 *ग्राहक का नाम (Customer):* ${ticket.fullName}\n` +
      `📞 *ग्राहक मोबाइल नंबर (Phone):* +91 ${ticket.phoneNumber}\n` +
      `🏷️ *समस्या श्रेणी (Category):* ${catTitle}\n` +
      `📋 *मुख्य विषय (Subject):* ${ticket.subType}\n` +
      (ticket.suspectPhoneNumber ? `⚠️ *संदिग्ध/फ्रॉड कॉलर नंबर:* ${ticket.suspectPhoneNumber}\n` : '') +
      (ticket.fraudAmount ? `💰 *मांगी गई रकम:* ${ticket.fraudAmount}\n` : '') +
      (ticket.productModel ? `📦 *प्रोडक्ट मॉडल / सीरियल:* ${ticket.productModel} (${ticket.serialNumber || 'N/A'})\n` : '') +
      `📝 *समस्या विवरण (Description):*\n${ticket.description}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡ *सुझाव:* स्टोर ओनर तुरंत ग्राहक को +91 ${ticket.phoneNumber} पर कॉल करके समस्या का समाधान करें!`
    );

    // Open WhatsApp in new tab for direct store notification
    try {
      window.open(`https://wa.me/${storeInfo.whatsappNumber}?text=${waMsg}`, '_blank');
    } catch {
      // Fallback
    }
  };

  const categories = [
    {
      id: 'fraud_alert' as HelpCategory,
      titleHi: '🚨 फ़ेक कॉल व फ्रॉड अलर्ट',
      titleEn: '🚨 Fraud & Fake Call Alert',
      descHi: 'कोई पटेल सीसीटीवी के नाम पर फर्जी कॉल करे या पैसे मांगे',
      descEn: 'Report impersonation, fake technician or scam callers',
      badge: 'URGENT',
      color: 'from-rose-600 to-red-700 border-rose-500 text-rose-100'
    },
    {
      id: 'warranty_problem' as HelpCategory,
      titleHi: '🛡️ वारंटी चेक प्रॉब्लम',
      titleEn: '🛡️ Warranty Check & Claim',
      descHi: 'ब्रांड वारंटी वेरिफिकेशन, सीरियल नंबर मिसमैच व बिल कॉपी',
      descEn: 'Verify 2/3 yr brand warranty or get duplicate GST invoice',
      badge: 'WARRANTY',
      color: 'from-amber-600 to-amber-700 border-amber-500 text-amber-100'
    },
    {
      id: 'replacement_issue' as HelpCategory,
      titleHi: '🔄 रिप्लेसमेंट व DOA प्रॉब्लम',
      titleEn: '🔄 Replacement & DOA Issue',
      descHi: 'खराब कैमरा, धुंधला लेंस, नाइट विजन IR या अडैप्टर खराबी',
      descEn: 'Dead on arrival, defective hardware or fast replacement',
      badge: '7-DAY REPLACEMENT',
      color: 'from-blue-600 to-indigo-700 border-blue-500 text-blue-100'
    },
    {
      id: 'tech_app_offline' as HelpCategory,
      titleHi: '🛠️ ऐप ऑफलाइन व पासवर्ड रीसेट',
      titleEn: '🛠️ App Offline & Tech Help',
      descHi: 'Hik-Connect, gCMOB ऐप में ऑफलाइन व DVR पासवर्ड भूलना',
      descEn: 'Mobile app offline, recording not saving, password recovery',
      badge: 'TECH SUPPORT',
      color: 'from-emerald-600 to-teal-700 border-emerald-500 text-emerald-100'
    },
    {
      id: 'installation_complaint' as HelpCategory,
      titleHi: '👷 इंस्टॉलेशन व टेक्नीशियन शिकायत',
      titleEn: '👷 Technician & Wiring Quality',
      descHi: 'टेक्नीशियन समय पर न आना या वायरिंग/कैमरा एंगल में कमी',
      descEn: 'Technician delay, improper angle, or cabling grievance',
      badge: 'QUALITY ESCALATION',
      color: 'from-violet-600 to-purple-700 border-violet-500 text-violet-100'
    },
    {
      id: 'billing_payment' as HelpCategory,
      titleHi: '🧾 बिलिंग व पेमेंट पूछताछ',
      titleEn: '🧾 Billing & GST Invoice',
      descHi: 'GST बिल संशोधन, पेमेंट वेरिफिकेशन या कोटेशन रसीद',
      descEn: 'Tax invoice correction, payment receipts & pricing help',
      badge: 'ACCOUNTS',
      color: 'from-slate-700 to-slate-800 border-slate-600 text-slate-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col border border-slate-200 my-auto text-slate-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-rose-900/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-400 text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {isHi ? 'हेल्प व कस्टमर प्रोटेक्शन' : 'Customer Help & Fraud Shield'}
                </span>
                <span className="text-[11px] text-amber-300 font-bold hidden sm:inline">
                  24x7 Redressal Helpline
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {isHi ? 'कस्टमर सहायता व समस्या निवारण पोर्टल' : 'Help & Grievance Redressal Center'}
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

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 p-2 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => {
              setActiveTab('report_issue');
              setSubmittedTicket(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'report_issue'
                ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isHi ? 'समस्या / शिकायत दर्ज करें' : 'Report Issue / Grievance'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('verify_number');
              setSubmittedTicket(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'verify_number'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isHi ? 'कॉलर नंबर ऑथेंटिसिटी चेकर (फ़ेक चेक)' : 'Verify Caller / Fake Check'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('track_ticket');
              setSubmittedTicket(null);
              handleTrackTicket(trackTicketIdInput);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'track_ticket'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isHi ? 'टिकट लाइव स्टेटस ट्रैक' : 'Track Ticket Status'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] space-y-5">

          {/* TAB 1: REPORT ISSUE */}
          {activeTab === 'report_issue' && (
            <>
              {submittedTicket ? (
                /* Successful Submission Screen */
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-xs font-black mb-2 border border-emerald-300">
                      <span>{isHi ? 'टिकट आईडी:' : 'Ticket ID:'}</span>
                      <span className="font-mono text-indigo-700">{submittedTicket.id}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {isHi ? '🎉 आपकी समस्या सफलतापूर्ण दर्ज कर ली गई है!' : '🎉 Grievance Registered Successfully!'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                      {isHi
                        ? `आपकी शिकायत स्टोर ओनर एवं टेक्निकल टीम को व्हाट्सएप पर अग्रेषित कर दी गई है। हमारी टीम जल्द ही आपसे +91 ${submittedTicket.phoneNumber} पर संपर्क करेगी।`
                        : `Your grievance has been escalated to store management on WhatsApp. Our priority support team will contact you at +91 ${submittedTicket.phoneNumber}.`}
                    </p>
                  </div>

                  {submittedTicket.category === 'fraud_alert' && (
                    <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-left text-xs space-y-2">
                      <div className="flex items-center gap-2 text-rose-900 font-black">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>{isHi ? '🚨 फ्रॉड से बचने हेतु महत्वपूर्ण सलाह:' : '🚨 Safety Advice Against Scammers:'}</span>
                      </div>
                      <p className="text-rose-800">
                        {isHi
                          ? `पटेल सीसीटीवी कैमरा वर्ल्ड कभी भी किसी अज्ञात व्यक्ति या बिना इनवॉइस के यूपीआई पर सीधे पेमेंट नहीं मांगता। हमारे अधिकृत स्टोर नंबर +91 ${storeInfo.phone} के अलावा किसी अन्य नंबर पर पैसे न भेजें!`
                          : `Patel CCTV Camera World never asks for unauthorized UPI transfers. Never pay anyone without verifying through our official store line +91 ${storeInfo.phone}.`}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
                    <button
                      onClick={() => {
                        setTrackedTicket(submittedTicket);
                        setTrackTicketIdInput(submittedTicket.id);
                        setActiveTab('track_ticket');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>{isHi ? 'टिकट स्टेटस देखें' : 'Track Ticket'}</span>
                    </button>
                    <button
                      onClick={() => setSubmittedTicket(null)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-3 px-5 rounded-xl transition cursor-pointer"
                    >
                      {isHi ? 'नई समस्या दर्ज करें' : 'Report Another Issue'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Issue Submission Form */
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  
                  {/* Category Selection Carousel/Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>{isHi ? '1. समस्या का प्रकार चुनें:' : '1. Select Issue Category:'}</span>
                      <span className="text-[11px] text-rose-600 font-bold lowercase">
                        {isHi ? '*अनिवार्य' : '*required'}
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`p-3 rounded-2xl border-2 transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                              isSelected
                                ? `bg-gradient-to-br ${cat.color} text-white shadow-md shadow-slate-900/10`
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <span className="text-xs font-black tracking-tight leading-tight">
                                {isHi ? cat.titleHi : cat.titleEn}
                              </span>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase shrink-0 ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {cat.badge}
                              </span>
                            </div>
                            <p className={`text-[10px] leading-snug line-clamp-2 ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                              {isHi ? cat.descHi : cat.descEn}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Contact Details */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-3">
                    <div className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      {isHi ? '2. ग्राहक संपर्क विवरण:' : '2. Customer Contact Details:'}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {isHi ? 'आपका पूरा नाम:' : 'Full Name:'} *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={isHi ? 'जैसे: राजेश कुमार' : 'e.g. Rajesh Kumar'}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {isHi ? 'मोबाइल नंबर (WhatsApp Active):' : 'Mobile Number:'} *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder={isHi ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specific Conditional Fields based on Category */}
                  
                  {/* FRAUD SPECIFIC SECTION */}
                  {selectedCategory === 'fraud_alert' && (
                    <div className="bg-rose-50/80 border-2 border-rose-300 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black text-rose-950 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>{isHi ? '🚨 फ्रॉड / फर्जी कॉलर की जानकारी भरें:' : '🚨 Fraud / Fake Caller Details:'}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-rose-900 block mb-1">
                            {isHi ? 'संदिग्ध/फ्रॉड कॉलर का फोन नंबर:' : 'Suspect / Fraud Phone Number:'}
                          </label>
                          <input
                            type="text"
                            placeholder={isHi ? 'जैसे: 9876543210 (जिस नंबर से कॉल आया)' : 'Number from which call was received'}
                            value={suspectPhoneNumber}
                            onChange={(e) => setSuspectPhoneNumber(e.target.value)}
                            className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-rose-900 block mb-1">
                            {isHi ? 'मांगी गई रकम (यदि पैसे मांगे गए):' : 'Amount Demanded (if any):'}
                          </label>
                          <input
                            type="text"
                            placeholder={isHi ? 'जैसे: ₹2,000 एडवांस' : 'e.g. ₹2,000 advance'}
                            value={fraudAmount}
                            onChange={(e) => setFraudAmount(e.target.value)}
                            className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-rose-900 block mb-1">
                            {isHi ? 'कॉलर ने अपना क्या नाम या बहाना बताया?' : 'Caller Name or False Claim Made:'}
                          </label>
                          <input
                            type="text"
                            placeholder={isHi ? 'जैसे: खुद को पटेल सीसीटीवी का नया इंजीनियर बताया और क्यूआर कोड भेजा' : 'Claimed to be technician, sent fake QR code, etc.'}
                            value={suspectName}
                            onChange={(e) => setSuspectName(e.target.value)}
                            className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WARRANTY / REPLACEMENT SPECIFIC SECTION */}
                  {(selectedCategory === 'warranty_problem' || selectedCategory === 'replacement_issue') && (
                    <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black text-amber-950 uppercase tracking-wider">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>{isHi ? '🛡️ प्रोडक्ट व इनवॉइस विवरण:' : '🛡️ Product & Warranty Details:'}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-amber-900 block mb-1">
                            {isHi ? 'कैमरा / DVR मॉडल या ब्रांड:' : 'Camera / DVR Model:'}
                          </label>
                          <input
                            type="text"
                            placeholder={isHi ? 'जैसे: CP Plus 2.4MP Dome या Hikvision DVR' : 'e.g. CP Plus 4-Channel DVR'}
                            value={productModel}
                            onChange={(e) => setProductModel(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-amber-900 block mb-1">
                            {isHi ? 'सीरियल नंबर (डिवाइस के पीछे लिखा):' : 'Serial Number (S/N):'}
                          </label>
                          <input
                            type="text"
                            placeholder={isHi ? 'जैसे: CP20240981' : 'e.g. HK991024'}
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Description */}
                  <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                      {isHi ? '3. समस्या का पूरा विवरण लिखें:' : '3. Detailed Description of Issue:'} *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder={isHi 
                        ? 'कृपया पूरी बात स्पष्ट लिखें ताकि हमारी टीम तुरंत आपकी मदद कर सके...' 
                        : 'Describe your issue in detail so our support team can resolve it immediately...'}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Submit and Emergency Call Buttons */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-rose-900/20 transition cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isHi ? 'शिकायत दर्ज करें व स्टोर व्हाट्सएप पर भेजें' : 'Submit Grievance & Send to Store WhatsApp'}</span>
                    </button>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href={`tel:${storeInfo.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isHi ? 'स्टोर ओनर डायरेक्ट हेल्पलाइन (7483005197)' : 'Call Store Owner (7483005197)'}</span>
                      </a>
                    </div>
                  </div>

                </form>
              )}
            </>
          )}

          {/* TAB 2: CALLER NUMBER AUTHENTICITY VERIFICATION */}
          {activeTab === 'verify_number' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isHi ? 'कॉलर नंबर ऑथेंटिसिटी चेकर' : 'Caller Number Authenticity Verification'}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isHi ? 'क्या आपको पटेल सीसीटीवी के नाम से कोई अनजान कॉल आया?' : 'Received a Call Claiming to be from Patel CCTV?'}
                </h3>
                <p className="text-xs text-emerald-100">
                  {isHi
                    ? 'नीचे कॉलर का 10 अंकों का फोन नंबर डालें। हमारा सिस्टम तुरंत जांचेगा कि वह नंबर हमारे ऑथराइज्ड स्टोर ओनर / इंजीनियर का है या कोई अज्ञात / फर्जी व्यक्ति है।'
                    : 'Enter the caller\'s 10-digit number below to check whether it belongs to authorized Patel CCTV staff or an unverified scammer.'}
                </p>
              </div>

              {/* Number Input & Check Button */}
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder={isHi ? '10 अंकों का मोबाइल नंबर दर्ज करें (जैसे: 7483005197)' : 'Enter 10-digit phone number (e.g. 7483005197)'}
                  value={checkNumberInput}
                  onChange={(e) => {
                    setCheckNumberInput(e.target.value);
                    setVerificationResult(null);
                  }}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  onClick={handleVerifyNumber}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>{isHi ? 'जांचें' : 'Verify'}</span>
                </button>
              </div>

              {/* Verification Result Display */}
              {verificationResult && verificationResult.checked && (
                <div className="animate-fadeIn">
                  {verificationResult.isOfficial ? (
                    <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 space-y-2 text-emerald-950">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black">
                          ✓
                        </div>
                        <div>
                          <div className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                            {isHi ? '✅ 100% अधिकृत एवं सुरक्षित नंबर' : '✅ 100% VERIFIED OFFICIAL STAFF'}
                          </div>
                          <div className="text-sm sm:text-base font-black text-emerald-950">
                            {isHi ? verificationResult.details?.nameHi : verificationResult.details?.name}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                        {isHi
                          ? `यह नंबर (${verificationResult.details?.cleanNumber}) पटेल सीसीटीवी कैमरा वर्ल्ड के ${verificationResult.details?.designationHi} का आधिकारिक नंबर है। आप सुरक्षित बातचीत कर सकते हैं।`
                          : `This phone number belongs to our ${verificationResult.details?.designation}. It is safe to proceed.`}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 space-y-3 text-rose-950">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-black animate-pulse">
                          !
                        </div>
                        <div>
                          <div className="text-xs font-black text-rose-700 uppercase tracking-wider">
                            {isHi ? '⚠️ अनधिकृत / संदिग्ध नंबर (UNVERIFIED NUMBER)' : '⚠️ UNVERIFIED / SUSPICIOUS NUMBER'}
                          </div>
                          <div className="text-sm font-black text-rose-950">
                            {isHi ? 'यह नंबर हमारे किसी भी अधिकृत स्टाफ का नहीं है!' : 'This number DOES NOT belong to Patel CCTV Staff!'}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-rose-200 text-xs space-y-1.5 text-rose-900">
                        <p className="font-bold">
                          {isHi 
                            ? '🚨 सुरक्षा निर्देश: इस नंबर पर कोई भी पैसे, OTP, या एडवांस UPI ट्रांसफर न करें।' 
                            : '🚨 Alert: Do NOT transfer any money or share OTP with this caller.'}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {isHi
                            ? 'यदि इस व्यक्ति ने हमारे स्टोर का नाम लेकर पैसे मांगे हैं, तो तुरंत नीचे दिए गए बटन से फ्रॉड शिकायत दर्ज करें।'
                            : 'If this person claimed to represent our store, click below to file an urgent fraud alert.'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCategory('fraud_alert');
                          setSuspectPhoneNumber(checkNumberInput);
                          setActiveTab('report_issue');
                        }}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>{isHi ? 'इस नंबर के खिलाफ फ्रॉड रिपोर्ट दर्ज करें' : 'File Fraud Report Against this Number'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Official Store Directory */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
                <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHi ? 'पटेल सीसीटीवी अधिकृत संपर्क सूची:' : 'Official Patel CCTV Directory:'}</span>
                </div>

                <div className="space-y-2 pt-1">
                  {OFFICIAL_PHONE_NUMBERS.map((p, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{isHi ? p.nameHi : p.name}</div>
                        <div className="text-[10px] text-slate-500">{isHi ? p.designationHi : p.designation}</div>
                      </div>
                      <a
                        href={`tel:${p.cleanNumber}`}
                        className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
                      >
                        +91 {p.cleanNumber}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRACK TICKET */}
          {activeTab === 'track_ticket' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isHi ? 'टिकट आईडी दर्ज करें (जैसे: TKT-FRD-9102)' : 'Enter Ticket ID (e.g. TKT-FRD-9102)'}
                  value={trackTicketIdInput}
                  onChange={(e) => setTrackTicketIdInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  onClick={() => handleTrackTicket(trackTicketIdInput)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  {isHi ? 'स्टेटस देखें' : 'Check'}
                </button>
              </div>

              {trackedTicket ? (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-mono font-bold text-indigo-700 text-sm block">{trackedTicket.id}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(trackedTicket.createdAt).toLocaleDateString()} at {new Date(trackedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      trackedTicket.status === 'resolved' 
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : trackedTicket.status === 'investigating'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}>
                      {trackedTicket.status === 'resolved' 
                        ? (isHi ? 'सुलझाया गया (Resolved)' : 'Resolved') 
                        : (isHi ? 'जांच जारी (Under Investigation)' : 'Under Review')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">{isHi ? 'ग्राहक:' : 'Customer:'}</span>
                      <span className="font-bold text-slate-900">{trackedTicket.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">{isHi ? 'फोन:' : 'Phone:'}</span>
                      <span className="font-mono font-bold text-slate-900">+91 {trackedTicket.phoneNumber}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 text-[10px] block">{isHi ? 'विषय:' : 'Subject:'}</span>
                      <span className="font-bold text-slate-900">{trackedTicket.subType}</span>
                    </div>
                    {trackedTicket.suspectPhoneNumber && (
                      <div className="col-span-2 bg-rose-50 p-2 rounded-xl border border-rose-200">
                        <span className="text-rose-900 text-[10px] font-bold block">
                          {isHi ? 'संदिग्ध फ्रॉड नंबर:' : 'Suspect Phone Number:'}
                        </span>
                        <span className="font-mono font-bold text-rose-700">{trackedTicket.suspectPhoneNumber}</span>
                      </div>
                    )}
                    {trackedTicket.resolutionNotes && (
                      <div className="col-span-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 space-y-1">
                        <span className="text-emerald-900 text-[10px] font-black uppercase tracking-wider block">
                          {isHi ? 'स्टोर ओनर / टेक्निकल एक्शन नोट:' : 'Store Action & Resolution Note:'}
                        </span>
                        <p className="text-emerald-800 text-xs font-semibold">{trackedTicket.resolutionNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <a
                      href={`tel:${storeInfo.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isHi ? 'स्टोर हेल्पलाइन से बात करें' : 'Call Support'}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  {isHi ? 'कृपया वैध टिकट आईडी दर्ज करें।' : 'Please enter a valid Ticket ID.'}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
