import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, BadgeCheck, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Language, SiteVisitBooking } from '../types';
import { getStoredSurveyBookings, getActiveCustomerSurveyId } from '../utils/surveyStorage';

interface CustomerApprovalNotificationBannerProps {
  language: Language;
  onOpenTrackModal: (surveyId: string) => void;
}

export const CustomerApprovalNotificationBanner: React.FC<CustomerApprovalNotificationBannerProps> = ({
  language,
  onOpenTrackModal,
}) => {
  const isHi = language === 'hi';
  const [approvedBooking, setApprovedBooking] = useState<SiteVisitBooking | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const checkApprovedStatus = () => {
    const activeId = getActiveCustomerSurveyId();
    const all = getStoredSurveyBookings();
    
    let target: SiteVisitBooking | undefined;
    if (activeId) {
      target = all.find(b => b.id.toLowerCase() === activeId.toLowerCase());
    }
    if (!target) {
      target = all.find(b => b.status === 'approved');
    }

    if (target && target.status === 'approved') {
      setApprovedBooking(target);
    } else {
      setApprovedBooking(null);
    }
  };

  useEffect(() => {
    checkApprovedStatus();
    const handleUpdate = () => checkApprovedStatus();
    window.addEventListener('cctv_survey_updated', handleUpdate);
    return () => window.removeEventListener('cctv_survey_updated', handleUpdate);
  }, []);

  if (!approvedBooking || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-40 animate-bounce-short">
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-3.5 shadow-2xl border-2 border-emerald-400/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
          <BadgeCheck className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-md">
              YOUR REQUEST IS SUCCESSFUL
            </span>
            <span className="text-[10px] font-mono text-emerald-300 font-bold">
              {approvedBooking.id}
            </span>
          </div>

          <h4 className="text-xs font-black text-white mt-0.5 truncate">
            {isHi ? '🎉 आपका सर्वे अप्रूव हो गया है!' : '🎉 Survey Approved Successfully!'}
          </h4>
          <p className="text-[11px] text-emerald-200 truncate">
            {approvedBooking.placeName} ({approvedBooking.city})
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onOpenTrackModal(approvedBooking.id)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span>{isHi ? 'देखें' : 'View'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            title="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
