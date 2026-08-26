import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  Camera, 
  Lock, 
  Wrench, 
  PhoneCall, 
  AlertCircle,
  HardDrive,
  Volume2
} from 'lucide-react';
import { AppVersionConfig, executeAppUpdate } from '../utils/appVersionManager';
import { Language } from '../types';
import { speakNotification } from '../utils/speech';

interface MandatoryUpdateModalProps {
  isOpen: boolean;
  language: Language;
  currentVersion: string;
  latestVersion: string;
  config: AppVersionConfig;
  isMaintenance: boolean;
  onUpdateCompleted: () => void;
}

export const MandatoryUpdateModal: React.FC<MandatoryUpdateModalProps> = ({
  isOpen,
  language,
  currentVersion,
  latestVersion,
  config,
  isMaintenance,
  onUpdateCompleted,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusTextHi, setStatusTextHi] = useState('अपडेट प्रक्रिया शुरू करने के लिए तैयार...');
  const [statusTextEn, setStatusTextEn] = useState('Ready to begin update sequence...');
  const [updateFinished, setUpdateFinished] = useState(false);

  const isHi = language === 'hi';

  // Speak notification on mount when update modal appears
  useEffect(() => {
    if (isOpen && !isMaintenance) {
      const msg = isHi
        ? 'नमस्ते, पटेल सीसीटीवी ऐप में नया सिस्टम अपडेट उपलब्ध है। बिना अपडेट के ऐप नहीं खुलेगा, कृपया अभी अपडेट करें।'
        : 'Hello, a mandatory update is available for Patel CCTV App. Please update now to continue using the app.';
      try {
        speakNotification(msg, language);
      } catch (e) {
        console.debug('Update voice notice skipped', e);
      }
    }
  }, [isOpen, isMaintenance, isHi, language]);

  if (!isOpen) return null;

  const handleStartUpdate = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    setProgress(5);

    try {
      await executeAppUpdate(latestVersion, (percent, textHi, textEn) => {
        setProgress(percent);
        setStatusTextHi(textHi);
        setStatusTextEn(textEn);
      });

      setUpdateFinished(true);
      setTimeout(() => {
        setIsUpdating(false);
        onUpdateCompleted();
        // Soft reload or state refresh
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Update failed:', err);
      setIsUpdating(false);
    }
  };

  return (
    <div 
      id="mandatory-app-update-overlay"
      className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto"
      // Prevent closing by clicking background or pressing keys
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        id="mandatory-app-update-card"
        className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto text-white animate-in zoom-in-95 duration-200"
      >
        
        {/* Top Header Badge */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-4 sm:p-5 flex items-center gap-3.5 border-b border-amber-400/30">
          <div className="w-12 h-12 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
            {isMaintenance ? (
              <Wrench className="w-6 h-6 text-amber-200 animate-spin" />
            ) : (
              <Zap className="w-6 h-6 text-amber-200 animate-bounce" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                {isMaintenance 
                  ? (isHi ? '🛠️ सर्वर मेंटेनेंस एवं लाइव अपडेट' : '🛠️ Server Maintenance & Live Sync')
                  : (isHi ? '🚀 नया ऐप अपडेट उपलब्ध है!' : '🚀 Mandatory App Update Required')}
              </h2>
            </div>
            <p className="text-xs text-amber-100/90 font-medium">
              {isMaintenance
                ? (isHi ? 'स्टोर ओनर द्वारा कैटलॉग अपडेट किया जा रहा है' : 'Store owner is syncing new inventory')
                : (isHi ? 'नया वर्ज़न इंस्टॉल किए बिना ऐप का उपयोग नहीं किया जा सकता' : 'Update required to continue using Patel CCTV')}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6">

          {/* Maintenance Screen */}
          {isMaintenance ? (
            <div className="space-y-5 text-center py-3">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
                <Lock className="w-10 h-10 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white mb-2">
                  {isHi ? config.maintenanceMessageHi || 'ऐप में नया अपडेट किया जा रहा है...' : config.maintenanceMessage || 'App is updating...'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                  {isHi 
                    ? 'पटेल सीसीटीवी स्टोर द्वारा नए कैमरा मॉडल व थोक मूल्य सूची जोड़ी जा रही है। यह प्रक्रिया जल्द पूरी होगी। कृपया कुछ समय बाद पुनः प्रयास करें।'
                    : 'Patel CCTV store is currently updating camera photos, stock inventory, and wholesale rates. The app will resume automatically.'}
                </p>
              </div>

              {/* Owner Direct Contact */}
              <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between gap-3 text-left">
                <div className="text-xs">
                  <p className="text-slate-400 font-semibold">{isHi ? 'स्टोर संचालक / ओनर संपर्क:' : 'Store In-charge Contact:'}</p>
                  <p className="text-amber-400 font-bold font-mono text-sm">+91 80009 51663</p>
                </div>
                <a 
                  href="tel:8000951663" 
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{isHi ? 'कॉल करें' : 'Call'}</span>
                </a>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isHi ? 'चेक करें (Refresh App Status)' : 'Check Server Status'}</span>
              </button>
            </div>
          ) : isUpdating ? (
            
            /* ACTIVE UPDATING STATE - FULL LOCK */
            <div className="space-y-6 text-center py-4">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
                  {updateFinished ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                  ) : (
                    <Download className="w-8 h-8 text-blue-400 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold px-1">
                  <span className="text-blue-300">
                    {isHi ? 'अपडेट प्रगति (Updating App)' : 'Installation Progress'}
                  </span>
                  <span className="text-white font-mono text-sm bg-blue-900/60 px-2 py-0.5 rounded-lg border border-blue-500/30">
                    {progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Current Action Status Message */}
              <div className="p-3.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-left space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Sparkles className="w-4 h-4 shrink-0 animate-spin" />
                  <span>{isHi ? 'सिंक स्थिति:' : 'Sync Status:'}</span>
                </div>
                <p className="text-xs text-slate-200 font-medium pl-6 leading-tight">
                  {isHi ? statusTextHi : statusTextEn}
                </p>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 font-medium flex items-center gap-2 justify-center">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>{isHi ? 'कृपया प्रतीक्षा करें, अपडेट के दौरान ऐप लॉक रहेगा।' : 'App is locked during update installation.'}</span>
              </div>
            </div>
          ) : (
            
            /* NORMAL UPDATE REQUIRED PROMPT */
            <div className="space-y-5">
              
              {/* Version Comparison Card */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                    Old
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      {isHi ? 'आपका वर्तमान वर्ज़न' : 'Your App Version'}
                    </p>
                    <p className="text-sm font-black text-slate-300 font-mono">v{currentVersion}</p>
                  </div>
                </div>

                <div className="text-slate-500 font-bold">➔</div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    New
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      {isHi ? 'नया उपलब्ध वर्ज़न' : 'Latest Version'}
                    </p>
                    <p className="text-sm font-black text-emerald-400 font-mono">v{latestVersion}</p>
                  </div>
                </div>
              </div>

              {/* Warning explanation */}
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-200 text-xs leading-relaxed">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white mb-0.5">
                    {isHi ? '⚠️ पुराना वर्ज़न बंद कर दिया गया है' : '⚠️ Outdated App Version Detected'}
                  </p>
                  <p className="text-[11px] text-amber-200/90">
                    {isHi 
                      ? 'नए कैमरा मॉडल्स, सटीक थोक मूल्य और व्हाट्सएप ऑर्डर सिस्टम का उपयोग करने के लिए तुरंत नया अपडेट इंस्टॉल करना अनिवार्य है।'
                      : 'To view updated camera stocks, real-time rates, and send WhatsApp orders, you must upgrade to the latest build.'}
                  </p>
                </div>
              </div>

              {/* Release Notes List */}
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHi ? 'इस नए अपडेट में क्या नया है:' : "What's New in this Update:"}</span>
                </p>
                
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3 space-y-2 max-h-44 overflow-y-auto">
                  {(isHi ? config.releaseNotesHi : config.releaseNotes).map((note, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button - Unclosable */}
              <div className="pt-2">
                <button
                  id="btn-perform-mandatory-update"
                  onClick={handleStartUpdate}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
                >
                  <Download className="w-5 h-5 text-slate-950 animate-bounce" />
                  <span>{isHi ? '⚡ अभी ऐप अपडेट करें (Update Now - Free)' : '⚡ Update Now (Mandatory)'}</span>
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                  {isHi ? '🔒 100% सुरक्षित • कोई डेटा नष्ट नहीं होगा • 5 सेकंड में पूरा होगा' : '🔒 Secure Fast Sync • No Data Loss • Takes ~5 seconds'}
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
