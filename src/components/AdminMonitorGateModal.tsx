import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  Store, 
  ShoppingCart, 
  X, 
  KeyRound, 
  Phone, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Language, StoreInfo, CustomerUser } from '../types';

interface AdminMonitorGateModalProps {
  isOpen: boolean;
  language: Language;
  storeInfo: StoreInfo;
  currentUser: CustomerUser | null;
  onClose: () => void;
  onUnlockSeller: () => void;
}

export const AdminMonitorGateModal: React.FC<AdminMonitorGateModalProps> = ({
  isOpen,
  language,
  storeInfo,
  currentUser,
  onClose,
  onUnlockSeller,
}) => {
  const isHi = language === 'hi';
  const [pinCode, setPinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinCode.trim();
    // Master Monitor PINs: 8000 or 1663 or 8000951663 or Master Phone: 8000951663
    if (cleanPin === '8000' || cleanPin === '1663' || cleanPin === '8000951663' || cleanPin === '918000951663' || cleanPin === storeInfo.phone.replace(/\D/g, '')) {
      setErrorMsg(null);
      setPinCode('');
      onUnlockSeller();
    } else {
      setErrorMsg(
        isHi
          ? `❌ अमान्य मास्टर पिन! यह पैनल केवल अधिकृत स्टोर मॉनिटर (+91 80009 51663) के लिए सुरक्षित है।`
          : `❌ Invalid Master PIN! Access restricted exclusively to Authorized Monitor (+91 80009 51663).`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] uppercase font-black px-2 py-0.5 rounded-md inline-block mb-1">
                {isHi ? 'अधिकृत स्टोर मॉनिटर सुरक्षा' : 'Authorized Store Monitor Only'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                {isHi ? 'सेलर व कैटलॉग मैनेजमेंट लॉक है' : 'Seller & Product Management Locked'}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Explanation Notice */}
          <div className="p-4 bg-blue-50/90 border border-blue-200 rounded-2xl space-y-2">
            <div className="flex items-start gap-2.5">
              <ShoppingCart className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-blue-950">
                  {isHi ? '🛒 आपका खाता: अधिकृत खरीदार (Buyer Account)' : '🛒 Your Account: Verified Buyer'}
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  {isHi
                    ? 'पटेल सीसीटीवी कैमरा वर्ल्ड में सभी ग्राहकों का खाता केवल खरीदारी (Buying) के लिए है। आप सभी कैमरे, कॉम्बो किट व DVR थोक दामों पर ऑर्डर कर सकते हैं।'
                    : 'All customer accounts are set to Buyer mode. You have full access to purchase CCTV products, combo kits, and request free site inspections.'}
                </p>
              </div>
            </div>
          </div>

          {/* Master Monitor Ownership Note */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">
                  {isHi ? 'मुख्य स्टोर मॉनिटर:' : 'Master Store Monitor:'}
                </span>
                <span className="text-amber-900 font-black ml-1.5 font-mono">
                  +91 80009 51663
                </span>
              </div>
            </div>
            <a
              href="tel:8000951663"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-xl text-[11px] transition shrink-0"
            >
              {isHi ? 'संपर्क करें' : 'Call Owner'}
            </a>
          </div>

          {/* Master Admin PIN Unlock (For Store Owner) */}
          <form onSubmit={handleVerifyPin} className="space-y-2.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {isHi 
                  ? 'क्या आप स्टोर ओनर / मॉनिटर हैं? (मास्टर PIN दर्ज करें):' 
                  : 'Are you the Store Owner? Enter Master PIN to unlock:'}
              </span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="password"
                maxLength={10}
                placeholder={isHi ? 'मास्टर PIN (उदा. 7483)' : 'Master PIN (e.g. 7483)'}
                value={pinCode}
                onChange={(e) => {
                  setPinCode(e.target.value);
                  setErrorMsg(null);
                }}
                className="flex-1 text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md"
              >
                {isHi ? 'अनलॉक करें' : 'Unlock'}
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                {errorMsg}
              </p>
            )}
          </form>

          {/* Action to continue shopping */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer text-xs sm:text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isHi ? 'ठीक है, स्टोर पर खरीदारी जारी रखें' : 'Continue Shopping as Buyer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
