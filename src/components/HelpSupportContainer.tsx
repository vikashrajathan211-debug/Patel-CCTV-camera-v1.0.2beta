import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw, 
  Award, 
  Wrench, 
  PhoneCall, 
  MessageSquare, 
  Search, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  FileText, 
  HelpCircle,
  Lock,
  ArrowRight,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { Language, StoreInfo, HelpCategory } from '../types';
import { verifyCallerNumber } from '../utils/helpStorage';

interface HelpSupportContainerProps {
  language: Language;
  storeInfo: StoreInfo;
  onOpenHelpModal: (category?: HelpCategory) => void;
  onOpenVerifyModal?: () => void;
  onOpenTrackModal?: (ticketId?: string) => void;
}

export const HelpSupportContainer: React.FC<HelpSupportContainerProps> = ({
  language,
  storeInfo,
  onOpenHelpModal,
  onOpenVerifyModal,
  onOpenTrackModal,
}) => {
  const isHi = language === 'hi';

  const [quickPhoneCheck, setQuickPhoneCheck] = useState('');
  const [quickCheckResult, setQuickCheckResult] = useState<{
    checked: boolean;
    isOfficial: boolean;
    details: any;
  } | null>(null);

  const [quickTicketId, setQuickTicketId] = useState('');

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPhoneCheck.trim()) return;
    const res = verifyCallerNumber(quickPhoneCheck);
    setQuickCheckResult({
      checked: true,
      isOfficial: res.isOfficial,
      details: res.details
    });
  };

  const supportBoxes = [
    {
      id: 'fraud_alert' as HelpCategory,
      titleHi: '🚨 फ़ेक कॉल व फ्रॉड अलर्ट',
      titleEn: '🚨 Fraud & Fake Call Alert',
      descHi: 'कोई हमारे नाम से फर्जी कॉल करे या पैसे मांगे तो तुरंत रिपोर्ट करें।',
      descEn: 'Report unauthorized person claiming to be Patel CCTV technician.',
      badgeHi: 'अति आवश्यक (URGENT)',
      badgeEn: 'HIGH PRIORITY',
      border: 'border-rose-400/80 bg-gradient-to-br from-rose-950/40 via-slate-900 to-rose-900/30 text-rose-100 hover:border-rose-400',
      badgeColor: 'bg-rose-600 text-white',
      icon: ShieldAlert,
      iconColor: 'text-rose-400 bg-rose-500/20'
    },
    {
      id: 'warranty_problem' as HelpCategory,
      titleHi: '🛡️ वारंटी चेक प्रॉब्लम',
      titleEn: '🛡️ Warranty Check & Verification',
      descHi: 'सीरियल नंबर मिसमैच, सर्विस सेंटर रिजेक्शन या इनवॉइस कॉपी प्राप्त करें।',
      descEn: 'Check 2/3 year brand warranty status or request duplicate GST bill.',
      badgeHi: 'ब्रांड वारंटी',
      badgeEn: 'WARRANTY DESK',
      border: 'border-amber-400/60 bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-900/20 text-amber-100 hover:border-amber-400',
      badgeColor: 'bg-amber-500 text-slate-950',
      icon: Award,
      iconColor: 'text-amber-400 bg-amber-500/20'
    },
    {
      id: 'replacement_issue' as HelpCategory,
      titleHi: '🔄 रिप्लेसमेंट व DOA समस्या',
      titleEn: '🔄 Replacement & Hardware Issue',
      descHi: 'धुंधला लेंस, नाइट विजन IR खराबी या डेड कैमरा का फ़ास्ट-ट्रैक रिप्लेसमेंट।',
      descEn: 'Instant resolution for dead on arrival, blur view or burnt adapters.',
      badgeHi: '7-दिन रिप्लेसमेंट',
      badgeEn: 'FAST-TRACK',
      border: 'border-blue-400/60 bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-900/20 text-blue-100 hover:border-blue-400',
      badgeColor: 'bg-blue-600 text-white',
      icon: RotateCcw,
      iconColor: 'text-blue-400 bg-blue-500/20'
    },
    {
      id: 'tech_app_offline' as HelpCategory,
      titleHi: '🛠️ ऐप ऑफलाइन व पासवर्ड रीसेट',
      titleEn: '🛠️ App Offline & Tech Help',
      descHi: 'Hik-Connect / gCMOB ऐप में ऑफलाइन इश्यू व DVR पासवर्ड रीसेट सहायता।',
      descEn: 'Mobile app offline troubleshooting, recording check & DVR unlocking.',
      badgeHi: 'टेक्निकल सपोर्ट',
      badgeEn: 'TECH SUPPORT',
      border: 'border-emerald-400/60 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-900/20 text-emerald-100 hover:border-emerald-400',
      badgeColor: 'bg-emerald-600 text-white',
      icon: Wrench,
      iconColor: 'text-emerald-400 bg-emerald-500/20'
    },
    {
      id: 'installation_complaint' as HelpCategory,
      titleHi: '👷 इंस्टॉलेशन व टेक्नीशियन शिकायत',
      titleEn: '👷 Technician & Wiring Quality',
      descHi: 'तय समय पर टेक्नीशियन न आना या वायरिंग/कैमरा एंगल सही न लगना।',
      descEn: 'Technician delay, loose cabling or improper camera angle fixing.',
      badgeHi: 'सर्विस क्वालिटी',
      badgeEn: 'SERVICE ESCALATION',
      border: 'border-purple-400/60 bg-gradient-to-br from-purple-950/40 via-slate-900 to-violet-900/20 text-purple-100 hover:border-purple-400',
      badgeColor: 'bg-purple-600 text-white',
      icon: HelpCircle,
      iconColor: 'text-purple-400 bg-purple-500/20'
    },
    {
      id: 'billing_payment' as HelpCategory,
      titleHi: '🧾 बिलिंग, इनवॉइस व पेमेंट',
      titleEn: '🧾 Billing, GST Invoice & Payment',
      descHi: 'GST बिल में संशोधन, पेमेंट वेरिफिकेशन या इनवॉइस डाउनलोड इश्यू।',
      descEn: 'GST invoice amendments, payment confirmation & official receipts.',
      badgeHi: 'बिलिंग सपोर्ट',
      badgeEn: 'ACCOUNTS',
      border: 'border-slate-500/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-100 hover:border-slate-400',
      badgeColor: 'bg-slate-700 text-slate-100',
      icon: FileText,
      iconColor: 'text-slate-300 bg-slate-700/50'
    }
  ];

  return (
    <section id="help-support-container" className="my-8 scroll-mt-20">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-8 text-white border-2 border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-400/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{isHi ? 'ग्राहक सुरक्षा एवं समस्या समाधान केंद्र' : 'Customer Shield & Grievance Redressal'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isHi ? 'क्या आपको कोई समस्या या फ्रॉड का संदेह है?' : 'Need Help, Warranty Claim or Report Fraud?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isHi
                ? 'पटेल सीसीटीवी कैमरा वर्ल्ड पर आपकी सुरक्षा और संतुष्टि सर्वोच्च प्राथमिकता है। यदि किसी ने हमारे नाम से फर्जी कॉल किया, माल में खराबी है, या वारंटी में दिक्कत है—तो नीचे तुरंत अपनी शिकायत दर्ज करें।'
                : 'Your security and trust are our top priority. Report fake caller scams, request instant warranty support, or claim 7-day fast track product replacements directly.'}
            </p>
          </div>

          {/* Quick Helpline Callout */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
            <a
              href={`tel:${storeInfo.phone}`}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-lg shadow-rose-900/30 transition cursor-pointer border border-rose-400/30"
            >
              <PhoneCall className="w-4 h-4 text-amber-300" />
              <span>{isHi ? 'हेल्पलाइन: 7483005197' : 'Store Helpline: 7483005197'}</span>
            </a>
            <button
              onClick={() => onOpenHelpModal('fraud_alert')}
              className="flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-rose-300 font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-700 transition cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{isHi ? 'शिकायत फॉर्म खोलें' : 'Open Ticket Form'}</span>
            </button>
          </div>
        </div>

        {/* 6 Category Help Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10">
          {supportBoxes.map((box) => {
            const Icon = box.icon;
            return (
              <div
                key={box.id}
                onClick={() => onOpenHelpModal(box.id)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:scale-[1.01] ${box.border}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${box.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${box.badgeColor}`}>
                      {isHi ? box.badgeHi : box.badgeEn}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition">
                    {isHi ? box.titleHi : box.titleEn}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">
                    {isHi ? box.descHi : box.descEn}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300">
                  <span>{isHi ? 'समस्या बताएं व समाधान पाएं' : 'Report & Get Solution'}</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time Interactive Number Authenticity Checker Container */}
        <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-700/80 space-y-3 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  {isHi ? 'लाइव सुरक्षा चेकर' : 'Live Anti-Fraud Tool'}
                </span>
                <span className="text-xs font-black text-white">
                  {isHi ? '📞 कॉलर नंबर ऑथेंटिसिटी चेकर (फ़ेक कॉल पहचानें)' : '📞 Verify Calling Number (Detect Fake Calls)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isHi
                  ? 'यदि किसी ने पटेल सीसीटीवी का नाम लेकर कॉल किया है, तो नंबर यहाँ डालकर तुरंत चेक करें कि वह हमारा असली नंबर है या नहीं।'
                  : 'Enter the caller\'s number to instantly verify if they are authorized Patel CCTV staff.'}
              </p>
            </div>

            <form onSubmit={handleQuickCheck} className="flex gap-2 w-full md:w-auto">
              <input
                type="tel"
                placeholder={isHi ? 'कॉलर का नंबर दर्ज करें...' : 'Enter 10-digit caller phone...'}
                value={quickPhoneCheck}
                onChange={(e) => {
                  setQuickPhoneCheck(e.target.value);
                  setQuickCheckResult(null);
                }}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden w-full sm:w-60"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shrink-0 shadow-md"
              >
                {isHi ? 'वेरीफाई करें' : 'Verify'}
              </button>
            </form>
          </div>

          {/* Quick Check Result Popout */}
          {quickCheckResult && quickCheckResult.checked && (
            <div className="pt-2 animate-fadeIn">
              {quickCheckResult.isOfficial ? (
                <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white">
                        {isHi ? '✅ अधिकृत नंबर:' : '✅ Verified Official Number:'} {quickCheckResult.details?.nameHi || quickCheckResult.details?.name}
                      </span>
                      <span className="block text-[11px] text-emerald-300">
                        {isHi ? 'यह पटेल सीसीटीवी कैमरा वर्ल्ड का आधिकारिक नंबर है।' : 'Official authorized Patel CCTV personnel.'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-950/90 border border-rose-500 text-rose-200 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
                    <div>
                      <span className="font-black text-white">
                        {isHi ? '⚠️ अनधिकृत / संदिग्ध नंबर:' : '⚠️ Unverified / Suspicious Number:'} {quickPhoneCheck}
                      </span>
                      <span className="block text-[11px] text-rose-300">
                        {isHi ? 'यह नंबर हमारे किसी भी स्टाफ का नहीं है। कृपया कोई पेमेंट न करें!' : 'This caller is NOT from Patel CCTV. Do not make any payments!'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenHelpModal('fraud_alert')}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shrink-0"
                  >
                    {isHi ? 'फ्रॉड रिपोर्ट दर्ज करें' : 'Report Scammer'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
