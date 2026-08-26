import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Phone,
  MessageSquare,
  CheckCircle2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ArrowRight,
  Radio,
  Languages,
  Sparkles
} from 'lucide-react';
import { Language, StoreInfo, CustomerUser } from '../types';
import {
  speakLoginSecurityWarningAudio,
  stopWelcomeAudio,
  SECURITY_WARNING_TEXTS,
} from '../utils/speech';
import { CCTVLoader } from './CCTVLoader';

interface LoginSecurityWarningOverlayProps {
  isOpen: boolean;
  language: Language;
  storeInfo: StoreInfo;
  user?: CustomerUser | null;
  onClose: () => void;
}

interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇮🇳' },
];

export const LoginSecurityWarningOverlay: React.FC<LoginSecurityWarningOverlayProps> = ({
  isOpen,
  language,
  storeInfo,
  user,
  onClose,
}) => {
  // Current active language for audio and text
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'hi');

  // Phases: 'white_screen' (initial scanning loader) -> 'warning_header' -> 'typing_text' -> 'complete'
  const [phase, setPhase] = useState<'white_screen' | 'warning_header' | 'typing_text' | 'complete'>('white_screen');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const typingIndexRef = useRef<number>(0);
  const speechCancelRef = useRef<(() => void) | null>(null);

  // Keep selectedLang updated if prop changes initially
  useEffect(() => {
    if (language) {
      setSelectedLang(language);
    }
  }, [language]);

  const currentWarning = SECURITY_WARNING_TEXTS[selectedLang] || SECURITY_WARNING_TEXTS.hi;

  // Start speech in selected language
  const triggerSpeech = (targetLang: Language) => {
    stopWelcomeAudio();
    if (speechCancelRef.current) {
      speechCancelRef.current();
    }
    setIsSpeaking(true);
    speakLoginSecurityWarningAudio(
      targetLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    ).then(cancelFn => {
      speechCancelRef.current = cancelFn;
    });
  };

  // Initial Open sequence
  useEffect(() => {
    if (!isOpen) {
      setPhase('white_screen');
      setDisplayedText('');
      setIsSpeaking(false);
      typingIndexRef.current = 0;
      if (speechCancelRef.current) {
        speechCancelRef.current();
      }
      stopWelcomeAudio();
      return;
    }

    // Step 1: Start with scanning cctv loader for 650ms
    setPhase('white_screen');
    setDisplayedText('');
    typingIndexRef.current = 0;

    let warningHeaderTimer: any;
    const whiteScreenTimer = setTimeout(() => {
      // Step 2: Show WARNING title
      setPhase('warning_header');

      warningHeaderTimer = setTimeout(() => {
        // Step 3: Begin typing text and start speaking simultaneously in sweet female voice
        setPhase('typing_text');
        triggerSpeech(selectedLang);
      }, 550);
    }, 650);

    return () => {
      clearTimeout(whiteScreenTimer);
      if (warningHeaderTimer) {
        clearTimeout(warningHeaderTimer);
      }
      if (speechCancelRef.current) {
        speechCancelRef.current();
      }
      stopWelcomeAudio();
    };
  }, [isOpen]);

  // Gradual typing effect for the active language
  useEffect(() => {
    if (phase !== 'typing_text') return;

    const textToType = currentWarning.written;
    typingIndexRef.current = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (typingIndexRef.current < textToType.length) {
        const nextChar = textToType.charAt(typingIndexRef.current);
        setDisplayedText(prev => prev + nextChar);
        typingIndexRef.current += 1;
      } else {
        clearInterval(interval);
        setPhase('complete');
      }
    }, 18); // Smooth progressive typing speed

    return () => clearInterval(interval);
  }, [phase, selectedLang]);

  // Switch language handler
  const handleLanguageChange = (newLang: Language) => {
    if (newLang === selectedLang) {
      // If already selected, replay voice
      triggerSpeech(newLang);
      return;
    }
    setSelectedLang(newLang);
    const newWarning = SECURITY_WARNING_TEXTS[newLang] || SECURITY_WARNING_TEXTS.hi;
    setDisplayedText(newWarning.written);
    setPhase('complete');
    triggerSpeech(newLang);
  };

  const handleSkipAnimation = () => {
    setDisplayedText(currentWarning.written);
    setPhase('complete');
  };

  const handleReplayVoice = () => {
    triggerSpeech(selectedLang);
  };

  const handleStopVoice = () => {
    stopWelcomeAudio();
    if (speechCancelRef.current) {
      speechCancelRef.current();
    }
    setIsSpeaking(false);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(label);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const handleConfirmAndProceed = () => {
    handleStopVoice();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="login-security-warning-overlay"
      className="fixed inset-0 z-[999999] bg-white flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300 select-text"
    >
      {/* Background subtle security watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
        <ShieldAlert className="w-[600px] h-[600px] text-red-600" />
      </div>

      {/* PHASE 1: Scanning stage */}
      {phase === 'white_screen' && (
        <div className="w-full max-w-lg p-2 animate-in fade-in duration-200">
          <CCTVLoader
            language={selectedLang}
            variant="card"
            title="सुरक्षा सत्यापन व चेतावनी लोड हो रही है..."
            subtitle="Patel CCTV Surveillance Authentication Active"
          />
        </div>
      )}

      {/* PHASE 2, 3, 4: Warning Container on Clean White Screen */}
      {phase !== 'white_screen' && (
        <div className="relative w-full max-w-2xl bg-white rounded-3xl p-4 sm:p-7 sm:shadow-2xl sm:border border-slate-200/80 my-auto text-slate-900 animate-in zoom-in-95 fade-in duration-300">
          
          {/* Top Warning Banner Ribbon */}
          <div className="flex flex-col items-center text-center space-y-3 pb-3 border-b border-slate-100">
            <div className="inline-flex items-center gap-2 bg-red-600 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg shadow-red-500/30 uppercase tracking-wider animate-bounce">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>WARNING / अति महत्वपूर्ण चेतावनी</span>
              <AlertTriangle className="w-4 h-4 text-amber-300" />
            </div>

            {/* Language Selector Bar (हिंदी, English, ગુજરાતી, मराठी, ಕನ್ನಡ, தமிழ்) */}
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2 px-1">
                <span className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-blue-600" />
                  <span>आवाज व भाषा चुनें (Select Audio Voice):</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5 text-rose-500" />
                  <span>लड़की जैसी प्यारी आवाज 🎙️</span>
                </span>
              </div>

              {/* Language Pills Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {LANGUAGE_OPTIONS.map(opt => {
                  const isSelected = selectedLang === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => handleLanguageChange(opt.code)}
                      className={`relative flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border text-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-500/30 scale-[1.03] font-bold'
                          : 'bg-white hover:bg-blue-50/60 border-slate-200 text-slate-700 hover:text-blue-700 font-medium'
                      }`}
                      title={`${opt.label} में आवाज सुनें`}
                    >
                      <span className="text-xs font-black leading-tight flex items-center gap-1">
                        {opt.nativeLabel}
                      </span>
                      <span className={`text-[9px] leading-none mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {opt.label}
                      </span>

                      {/* Active Speaking Indicator Dot */}
                      {isSelected && isSpeaking && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600 inline" />
                <span>{currentWarning.title}</span>
              </h1>
            </div>

            {user && (
              <p className="text-xs text-slate-500 font-medium">
                नमस्ते <span className="font-bold text-slate-800">{user.name}</span> ({user.phone}), कृपया लॉग इन के तुरंत बाद यह सुरक्षा निर्देश ध्यानपूर्वक पढ़ें व सुनें:
              </p>
            )}

            {/* Audio Speech Status Live Badge & Controls */}
            <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
              {isSpeaking ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200 animate-pulse">
                  <Volume2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                  <span>
                    {LANGUAGE_OPTIONS.find(l => l.code === selectedLang)?.nativeLabel} में आवाज बोल रही है...
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>ऑडियो मूक (Audio Paused)</span>
                </span>
              )}

              <button
                type="button"
                onClick={isSpeaking ? handleStopVoice : handleReplayVoice}
                className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3.5 py-1.5 rounded-full border border-blue-200 transition cursor-pointer"
                title="आवाज दोबारा सुनें या रोकें"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-blue-600" />
                    <span>आवाज बंद करें</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>दोबारा आवाज सुनें (Replay)</span>
                  </>
                )}
              </button>

              {phase === 'typing_text' && (
                <button
                  type="button"
                  onClick={handleSkipAnimation}
                  className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  पूरा टेक्स्ट तुरंत देखें
                </button>
              )}
            </div>
          </div>

          {/* Progressive Animated Typed Out Text Box */}
          <div className="my-4 bg-amber-50/70 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-inner">
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
              <Radio className="w-3 h-3 text-red-600 animate-pulse" />
              <span>आधिकारिक सुरक्षा सूचना</span>
            </div>

            <div className="prose prose-slate max-w-none text-slate-900 text-sm sm:text-base leading-relaxed font-medium whitespace-pre-line">
              {displayedText}
              {phase === 'typing_text' && (
                <span className="inline-block w-2 h-4 bg-red-600 ml-1 animate-pulse" />
              )}
            </div>
          </div>

          {/* Quick Action Official Numbers Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* WhatsApp Official Verification */}
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>एकमात्र अधिकृत नंबर</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/60 px-1.5 py-0.2 rounded">
                    Official WhatsApp
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-900 tracking-wide font-mono">
                  +91 74830 05197
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  इस नंबर के अलावा किसी अन्य नंबर पर बिना पुष्टि भरोसा न करें।
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-200/60">
                <a
                  href="https://wa.me/917483005197?text=Hello%20Patel%20CCTV,%20I%20want%20to%20verify%20official%20communication"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-2 rounded-lg text-center flex items-center justify-center gap-1 transition"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>व्हाट्सएप चेक करें</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy('+917483005197', 'wa')}
                  className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition"
                  title="नंबर कॉपी करें"
                >
                  {copiedNumber === 'wa' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Helpline / Police Report Assistance */}
            <div className="bg-rose-50/80 border border-rose-300 rounded-2xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    <span>इमरजेंसी व फ्रॉड हेल्पलाइन</span>
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-200/60 px-1.5 py-0.2 rounded">
                    Direct Call
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black text-rose-900 tracking-wide font-mono">
                  +91 80009 51663
                </div>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  फ्रॉड की स्थिति में तुरंत नजदीकी पुलिस स्टेशन या इस नंबर पर कॉल करें।
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-rose-200/60">
                <a
                  href="tel:+918000951663"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-1.5 px-2 rounded-lg text-center flex items-center justify-center gap-1 transition"
                >
                  <Phone className="w-3 h-3" />
                  <span>सीधा कॉल करें</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy('+918000951663', 'call')}
                  className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition"
                  title="हेल्पलाइन नंबर कॉपी करें"
                >
                  {copiedNumber === 'call' ? <Check className="w-3.5 h-3.5 text-rose-700" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Acknowledge & Enter Store Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              🔒 <span className="font-semibold">सुरक्षा प्रथम:</span> हमेशा अधिकृत नंबरों पर ही कॉल या पेमेंट करें।
            </div>

            <button
              id="confirm-security-warning-btn"
              type="button"
              onClick={handleConfirmAndProceed}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>मैंने पढ़ व समझ लिया — स्टोर में जाएं</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
