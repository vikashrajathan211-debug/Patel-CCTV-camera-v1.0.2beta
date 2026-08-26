import React from 'react';
import { ShieldCheck, Radio, Disc, Video, Sparkles } from 'lucide-react';
import { Language } from '../types';

export interface CCTVLoaderProps {
  language?: Language;
  title?: string;
  subtitle?: string;
  variant?: 'fullscreen' | 'overlay' | 'card' | 'compact' | 'mini';
  className?: string;
  showProgress?: boolean;
}

export const CCTVLoader: React.FC<CCTVLoaderProps> = ({
  language = 'hi',
  title,
  subtitle,
  variant = 'card',
  className = '',
  showProgress = true,
}) => {
  const isHi = language === 'hi';

  const defaultTitle = isHi ? 'पटेल सीसीटीवी कैमरा कनेक्ट हो रहा है...' : 'Connecting Patel CCTV Surveillance...';
  const defaultSubtitle = isHi ? 'कैमरा एवं DVR सिस्टम एक्टिव हो रहा है, कृपया प्रतीक्षा करें' : 'Synchronizing Live Camera Feeds & DVR Storage';

  // --- MINI VARIANT (For buttons, small icons) ---
  if (variant === 'mini') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div className="relative w-5 h-5 flex items-center justify-center">
          {/* Mini Bullet Camera rotating back and forth */}
          <div className="animate-cctv-pan origin-top-left">
            <Video className="w-4 h-4 text-blue-400" />
          </div>
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
        </div>
        {title && <span className="text-xs font-semibold">{title}</span>}
      </div>
    );
  }

  // --- COMPACT VARIANT (For form banners, inline spinners) ---
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-slate-900/90 text-white rounded-2xl border border-slate-700/80 shadow-lg ${className}`}>
        {/* Animated Bullet Camera */}
        <div className="relative flex items-center justify-center w-10 h-10 bg-slate-950 rounded-xl border border-slate-800 shrink-0 overflow-hidden">
          <div className="animate-cctv-pan origin-center">
            <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </div>

        {/* Text & DVR indicators */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-100 truncate">{title || defaultTitle}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
            <span className="text-amber-400">DVR: 1080P</span>
            <span>•</span>
            <span className="text-red-400 animate-pulse">● REC</span>
            <span>•</span>
            <span>PATEL CCTV</span>
          </div>
        </div>

        {/* Rotating DVR Disc */}
        <div className="shrink-0 relative w-7 h-7 flex items-center justify-center">
          <Disc className="w-6 h-6 text-emerald-400 animate-dvr-spin" />
        </div>
      </div>
    );
  }

  // --- FULLSCREEN OR CARD VARIANT (2-3 animated Cameras + DVR) ---
  const isFull = variant === 'fullscreen' || variant === 'overlay';

  const containerClasses = isFull
    ? 'fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-fadeIn'
    : `relative flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden ${className}`;

  return (
    <div className={containerClasses}>
      {/* Background High-Tech Surveillance Grid & Watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12)_0,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top Live Surveillance Banner */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-sm mb-4 px-2 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-red-400 font-bold tracking-wider">LIVE REC</span>
          <span className="text-slate-600">|</span>
          <span className="text-blue-400 font-semibold">PATEL CCTV</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SYSTEM ACTIVE</span>
        </div>
      </div>

      {/* MAIN ANIMATED STAGE: 3 Surveillance Units (Left Bullet Camera, Center DVR, Right PTZ Dome) */}
      <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 py-4 px-3 sm:px-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-inner w-full max-w-md">
        
        {/* 1. LEFT: Pan-Tilt Bullet Camera (Smooth Oscillating Pan Left & Right) */}
        <div className="flex flex-col items-center text-center space-y-1.5 group">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-950 rounded-2xl border border-blue-900/60 flex items-center justify-center shadow-lg shadow-blue-950/50 overflow-hidden">
            
            {/* Surveillance light cone scanning */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-transparent opacity-60 animate-cctv-scan-beam origin-top pointer-events-none" />
            
            {/* Animated Bullet Camera SVG that pans left and right */}
            <div className="animate-cctv-pan origin-center transition-transform">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" viewBox="0 0 64 64" fill="none">
                {/* Wall Bracket */}
                <rect x="8" y="16" width="6" height="24" rx="2" fill="#475569" />
                <path d="M14 26H22" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
                {/* Camera Body Cylinder */}
                <rect x="20" y="20" width="30" height="18" rx="4" fill="#1E293B" stroke="#60A5FA" strokeWidth="2" />
                {/* Lens Sunshield Roof */}
                <path d="M18 19L48 17L52 22H18V19Z" fill="#3B82F6" opacity="0.9" />
                {/* Camera Front Bezel & Glass Lens */}
                <ellipse cx="50" cy="29" rx="3" ry="8" fill="#0F172A" stroke="#93C5FD" strokeWidth="1.5" />
                <circle cx="50" cy="29" r="3" fill="#38BDF8" />
                {/* Blinking IR LED Ring */}
                <circle cx="46" cy="23" r="1.5" fill="#EF4444" className="animate-pulse" />
                <circle cx="46" cy="35" r="1.5" fill="#EF4444" className="animate-pulse" />
              </svg>
            </div>

            {/* Live Rec Dot */}
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>

            {/* Target Reticle in Corner */}
            <div className="absolute bottom-1 left-1 text-[8px] font-mono text-blue-400/80">CAM 01</div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-blue-300">
            {isHi ? 'कैमरा 1 (पैन)' : 'Bullet Cam'}
          </span>
        </div>

        {/* 2. CENTER: Animated DVR / NVR Unit (Spinning Surveillance Hard Drive + Channel LEDs) */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="relative w-20 h-16 sm:w-24 sm:h-20 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border-2 border-emerald-500/50 flex flex-col items-center justify-center p-2 shadow-lg shadow-emerald-950/50">
            
            {/* DVR Rotating HDD Disc & Optical Ring */}
            <div className="relative flex items-center justify-center mb-1">
              <div className="animate-dvr-spin origin-center">
                <svg className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" stroke="#34D399" strokeWidth="2" strokeDasharray="4 2" />
                  <circle cx="12" cy="12" r="4" fill="#064E3B" stroke="#6EE7B7" strokeWidth="1.5" />
                  <line x1="12" y1="2" x2="12" y2="6" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="18" x2="12" y2="22" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="absolute w-2 h-2 bg-white rounded-full shadow-sm shadow-white animate-ping" />
            </div>

            {/* DVR Front Panel Multi-Channel Status Lights (CH1 CH2 CH3 CH4) */}
            <div className="flex items-center justify-center gap-1.5 w-full bg-slate-950/80 px-1.5 py-0.5 rounded-md border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="CH 1 Active" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:150ms]" title="CH 2 Active" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:300ms]" title="CH 3 Active" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse [animation-delay:450ms]" title="HDD Write Active" />
            </div>

            <div className="text-[8px] font-mono text-emerald-300 font-bold mt-0.5">
              DVR RECORDER
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400">
            {isHi ? 'DVR / HDD' : 'DVR System'}
          </span>
        </div>

        {/* 3. RIGHT: 360° PTZ Dome Camera (Continuous 360° Surveillance Rotation & Radar Scan) */}
        <div className="flex flex-col items-center text-center space-y-1.5 group">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-950 rounded-2xl border border-purple-900/60 flex items-center justify-center shadow-lg shadow-purple-950/50 overflow-hidden">
            
            {/* 360 Radar sweep cone */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent animate-ptz-radar-sweep origin-center pointer-events-none" />

            {/* Dome Camera SVG with 360 Rotating Optical Dome Lens */}
            <div className="relative flex items-center justify-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]" viewBox="0 0 64 64" fill="none">
                {/* Ceiling Mount Base */}
                <path d="M12 16H52V22C52 24 50 26 48 26H16C14 26 12 24 12 22V16Z" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
                {/* Transparent Dome Outer Bubble */}
                <path d="M16 26C16 39.25 23.16 50 32 50C40.84 50 48 39.25 48 26" stroke="#C084FC" strokeWidth="2" fill="#1E1B4B" fillOpacity="0.6" />
                {/* Internal Rotating PTZ Eye Lens Ball */}
                <g className="animate-ptz-rotate origin-[32px_34px]">
                  <circle cx="32" cy="34" r="10" fill="#0F172A" stroke="#E879F9" strokeWidth="2" />
                  <circle cx="35" cy="35" r="4" fill="#A855F7" />
                  <circle cx="36" cy="34" r="1.5" fill="#FFFFFF" />
                  {/* Infrared LED Arc */}
                  <circle cx="27" cy="31" r="1" fill="#EF4444" className="animate-pulse" />
                  <circle cx="27" cy="37" r="1" fill="#EF4444" className="animate-pulse" />
                </g>
              </svg>
            </div>

            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>

            <div className="absolute bottom-1 right-1 text-[8px] font-mono text-purple-400/80">PTZ 360°</div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-purple-300">
            {isHi ? 'कैमरा 2 (घूमता PTZ)' : '360° PTZ Cam'}
          </span>
        </div>

      </div>

      {/* Surveillance Crosshair Grid Overlay Corners */}
      <div className="relative z-10 mt-5 text-center max-w-sm space-y-1.5 px-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
            {title || defaultTitle}
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
          {subtitle || defaultSubtitle}
        </p>

        {/* Animated Scanning Progress Bar */}
        {showProgress && (
          <div className="pt-2 w-full max-w-xs mx-auto">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
              <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-purple-500 rounded-full animate-cctv-progress" />
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>SCANNING PORTS...</span>
              <span className="text-emerald-400 font-bold">100% READY</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Tagline */}
      <div className="relative z-10 mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
        <div className="text-[10px] text-slate-400 font-mono tracking-wider flex items-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>PATEL CCTV CAMERA WORLD • RAJKOT</span>
        </div>
        <div className="text-[10px] text-amber-300 font-bold tracking-wider flex items-center gap-1 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-400/40 shadow-xs">
          <span>⚡</span>
          <span>Powered by Vikash Patel</span>
        </div>
      </div>
    </div>
  );
};
