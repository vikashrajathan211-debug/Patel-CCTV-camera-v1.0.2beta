import React, { useState, useEffect, useRef } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  minDuration?: number; // duration in ms (default 2800ms matching Flutter code)
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDuration = 2800,
}) => {
  const [stage, setStage] = useState<'initial' | 'animating' | 'fading_out'>('initial');
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    // Start animation immediately after mount
    const animTimer = setTimeout(() => {
      setStage('animating');
    }, 50);

    // Fade out after duration
    const fadeOutTimer = setTimeout(() => {
      setStage('fading_out');
    }, minDuration);

    // Complete and unmount
    const finishTimer = setTimeout(() => {
      onFinishRef.current();
    }, minDuration + 500);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [minDuration]);

  const handleSkip = () => {
    setStage('fading_out');
    setTimeout(() => {
      onFinishRef.current();
    }, 250);
  };

  return (
    <div
      id="patel-cctv-splash-screen"
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999999] flex flex-col items-center justify-center cursor-pointer select-none transition-opacity duration-500 ease-out ${
        stage === 'fading_out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#0F111A' }}
    >
      {/* Subtle ambient cyan glow center */}
      <div 
        className="absolute w-72 h-72 rounded-full pointer-events-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(0, 229, 255, 0.12) 0%, rgba(15, 17, 26, 0) 70%)',
          opacity: stage === 'animating' ? 1 : 0,
        }}
      />

      <div className="flex flex-col items-center justify-center relative z-10">
        
        {/* Top Designer Cyan Gradient Line (0px -> 220px) */}
        <div
          className="h-[2px] rounded-full transition-all duration-1000 ease-out"
          style={{
            width: stage === 'animating' || stage === 'fading_out' ? '220px' : '0px',
            background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)',
          }}
        />

        {/* Spacing 18px */}
        <div className="h-[18px]" />

        {/* Text Section (Slide up + Fade in) */}
        <div
          className="flex flex-col items-center text-center transition-all duration-1000"
          style={{
            transform: stage === 'animating' || stage === 'fading_out' ? 'translateY(0)' : 'translateY(24px)',
            opacity: stage === 'animating' || stage === 'fading_out' ? 1 : 0,
            transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // easeOutBack
          }}
        >
          {/* Main Brand Title: PATEL */}
          <h1
            className="text-white font-black leading-none"
            style={{
              fontSize: '32px',
              letterSpacing: '8px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textShadow: '0 0 25px rgba(0, 229, 255, 0.3)',
            }}
          >
            PATEL
          </h1>

          {/* Spacing 4px */}
          <div className="h-[4px]" />

          {/* Subtitle: CCTV CAMERA */}
          <span
            className="font-semibold leading-none"
            style={{
              color: 'rgba(0, 229, 255, 0.9)',
              fontSize: '13px',
              letterSpacing: '4px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textShadow: '0 0 12px rgba(0, 229, 255, 0.4)',
            }}
          >
            CCTV CAMERA
          </span>

          {/* Powered by Vikash Patel */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-[11px] font-bold text-amber-300 tracking-wider shadow-sm animate-pulse">
            <span className="text-amber-400">⚡</span>
            <span>Powered by Vikash Patel</span>
          </div>
        </div>

        {/* Spacing 18px */}
        <div className="h-[18px]" />

        {/* Bottom Designer Cyan Gradient Line (0px -> 220px) */}
        <div
          className="h-[2px] rounded-full transition-all duration-1000 ease-out"
          style={{
            width: stage === 'animating' || stage === 'fading_out' ? '220px' : '0px',
            background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)',
          }}
        />

        {/* Animated CCTV Cameras & DVR Surveillance Rig */}
        <div 
          className="mt-6 flex items-center justify-center gap-4 transition-all duration-1000"
          style={{
            opacity: stage === 'animating' || stage === 'fading_out' ? 1 : 0,
            transform: stage === 'animating' || stage === 'fading_out' ? 'scale(1)' : 'scale(0.8)',
          }}
        >
          {/* Left: Bullet Camera panning */}
          <div className="relative w-12 h-12 bg-slate-900/90 rounded-xl border border-blue-500/40 flex items-center justify-center shadow-lg">
            <div className="animate-cctv-pan origin-center">
              <svg className="w-7 h-7 text-blue-400" viewBox="0 0 64 64" fill="none">
                <rect x="8" y="16" width="6" height="24" rx="2" fill="#475569" />
                <path d="M14 26H22" stroke="#64748B" strokeWidth="4" />
                <rect x="20" y="20" width="30" height="18" rx="4" fill="#1E293B" stroke="#60A5FA" strokeWidth="2" />
                <ellipse cx="50" cy="29" rx="3" ry="8" fill="#0F172A" stroke="#93C5FD" strokeWidth="1.5" />
                <circle cx="50" cy="29" r="3" fill="#38BDF8" />
              </svg>
            </div>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
          </div>

          {/* Center: Spinning DVR HDD Disc */}
          <div className="relative w-14 h-12 bg-slate-900/90 rounded-xl border border-emerald-500/50 flex flex-col items-center justify-center shadow-lg p-1">
            <div className="animate-dvr-spin origin-center">
              <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" stroke="#34D399" strokeWidth="2" strokeDasharray="3 2" />
                <circle cx="12" cy="12" r="3" fill="#064E3B" stroke="#6EE7B7" />
              </svg>
            </div>
            <div className="flex gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
            </div>
          </div>

          {/* Right: PTZ 360 Dome rotating */}
          <div className="relative w-12 h-12 bg-slate-900/90 rounded-xl border border-purple-500/40 flex items-center justify-center shadow-lg">
            <div className="relative flex items-center justify-center">
              <svg className="w-7 h-7 text-purple-400" viewBox="0 0 64 64" fill="none">
                <path d="M12 16H52V22C52 24 50 26 48 26H16C14 26 12 24 12 22V16Z" fill="#334155" />
                <path d="M16 26C16 39.25 23.16 50 32 50C40.84 50 48 39.25 48 26" stroke="#C084FC" strokeWidth="2" fill="#1E1B4B" />
                <g className="animate-ptz-rotate origin-[32px_34px]">
                  <circle cx="32" cy="34" r="8" fill="#0F172A" stroke="#E879F9" strokeWidth="2" />
                  <circle cx="34" cy="34" r="3" fill="#A855F7" />
                </g>
              </svg>
            </div>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" />
          </div>
        </div>

        {/* Live Loading Text & Version */}
        <div
          className="mt-3 flex flex-col items-center gap-1 transition-opacity duration-1000"
          style={{ opacity: stage === 'animating' ? 1 : 0 }}
        >
          <div className="text-[11px] font-mono text-cyan-300/80 tracking-widest animate-pulse">
            ● INITIALIZING PATEL CCTV FEEDS & DVR...
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 border border-cyan-500/30 text-[10px] font-mono text-amber-300 font-bold tracking-wider">
            <span>APP VERSION: v1.0.3beta</span>
            <span className="text-cyan-400">• HIGH SPEED</span>
          </div>
        </div>
      </div>

      {/* Skip indicator hint at bottom */}
      <div 
        className="absolute bottom-8 text-[11px] text-slate-500 font-mono tracking-wider opacity-60 hover:opacity-100 transition"
      >
        Click anywhere to skip
      </div>
    </div>
  );
};
