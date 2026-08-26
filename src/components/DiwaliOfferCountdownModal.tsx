import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Calendar, 
  Gift, 
  Percent, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  Zap,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../types';

interface DiwaliOfferCountdownModalProps {
  language: Language;
  onClose: () => void;
  onExploreOffer?: () => void;
}

// Target Diwali Mega Offer Date: November 8, 2026 (8/11/2026)
const DIWALI_TARGET_DATE = new Date('2026-11-08T00:00:00');
const OFFER_EXPIRY_DATE = new Date('2026-11-16T23:59:59'); // Offer period completes after festive week

export const DiwaliOfferCountdownModal: React.FC<DiwaliOfferCountdownModalProps> = ({
  language,
  onClose,
  onExploreOffer
}) => {
  const isHi = language === 'hi';
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
    isExpired: boolean;
  }>({
    days: 77,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
    isExpired: false
  });

  // 3-Second Auto-Dismiss Progress
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute exact days and time countdown
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diffMs = DIWALI_TARGET_DATE.getTime() - now.getTime();
      const expiryDiffMs = OFFER_EXPIRY_DATE.getTime() - now.getTime();

      if (expiryDiffMs <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: false,
          isExpired: true
        });
        return;
      }

      if (diffMs <= 0) {
        // Offer is currently LIVE!
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
          isExpired: false
        });
        return;
      }

      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({
        days: Math.max(0, days),
        hours,
        minutes,
        seconds,
        isLive: false,
        isExpired: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3-Second Auto Dismiss Timer
  useEffect(() => {
    const totalDuration = 3000; // 3000ms = 3 Seconds
    const intervalTime = 30;
    let elapsed = 0;

    const timer = setInterval(() => {
      if (isPaused) return;

      elapsed += intervalTime;
      const progress = Math.min(100, (elapsed / totalDuration) * 100);
      setProgressPercent(progress);
      
      const secsLeft = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));
      setSecondsRemaining(secsLeft);

      if (elapsed >= totalDuration) {
        clearInterval(timer);
        onClose();
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, onClose]);

  // Firecracker Fountain ("अनार / फव्वारा / स्प्रिंकल") Canvas Particle Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
      gravity: number;
      sparkleSpeed: number;
      angle: number;
      originX: number;
      originY: number;
    }

    const particles: Particle[] = [];
    const colors = [
      '#FFD700', // Gold
      '#FFA500', // Orange
      '#FF4500', // Red Orange
      '#FF1493', // Deep Pink
      '#00FFFF', // Cyan
      '#7CFF01', // Bright Green
      '#FFF4CC', // Light Gold
      '#FFE4B5', // Moccasin
      '#FF69B4', // Hot Pink
      '#FFF'     // Pure White
    ];

    // Dual Bottom Fountain Launchers (Left and Right Anar/Fountain)
    const createFountainSparks = () => {
      const origins = [
        { x: width * 0.15, y: height * 0.95 },
        { x: width * 0.85, y: height * 0.95 },
        { x: width * 0.50, y: height * 0.96 }
      ];

      origins.forEach(origin => {
        // Emit 4-6 sparks per frame from each fountain
        for (let i = 0; i < 4; i++) {
          const spread = (Math.random() - 0.5) * 4.5;
          const upwardSpeed = -(Math.random() * 8 + 6);
          particles.push({
            x: origin.x,
            y: origin.y,
            vx: spread,
            vy: upwardSpeed,
            size: Math.random() * 3.5 + 1.2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1.0,
            decay: Math.random() * 0.025 + 0.015,
            gravity: 0.18,
            sparkleSpeed: Math.random() * 0.2 + 0.1,
            angle: Math.random() * Math.PI * 2,
            originX: origin.x,
            originY: origin.y
          });
        }
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      createFountainSparks();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity; // Gravity pulls sparks down after rising
        p.alpha -= p.decay;
        p.size *= 0.985;

        if (p.alpha <= 0 || p.y > height + 20 || p.size <= 0.2) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;

        // Sparkle star shape or glowing dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra twinkle cross on larger sparks
        if (p.size > 2.5) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size * 1.5, p.y);
          ctx.lineTo(p.x + p.size * 1.5, p.y);
          ctx.moveTo(p.x, p.y - p.size * 1.5);
          ctx.lineTo(p.x, p.y + p.size * 1.5);
          ctx.stroke();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      id="diwali-mega-offer-popup-backdrop"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Background Interactive Firecracker Fountain & Sprinkles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Main Diwali Festive Modal Box */}
      <div 
        id="diwali-countdown-modal-box"
        className="relative z-20 w-full max-w-lg bg-gradient-to-b from-slate-950 via-amber-950/80 to-slate-950 border-2 border-amber-400/70 rounded-3xl sm:rounded-[32px] shadow-[0_0_60px_rgba(245,158,11,0.45)] text-white overflow-hidden flex flex-col transform transition-all duration-300 scale-100 animate-in zoom-in-95"
      >
        {/* Festive Golden Top Arch Pattern & Diya Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-radial from-amber-500/30 via-orange-600/15 to-transparent pointer-events-none" />

        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          id="diwali-modal-close-button"
          className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-amber-400/40 text-amber-300 hover:text-white flex items-center justify-center transition shadow-lg cursor-pointer active:scale-95"
          title="Close (3s Auto)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge with Diyas & Sparkles */}
        <div className="p-4 sm:p-6 pb-2 text-center relative z-20 space-y-2">
          <div className="flex items-center justify-center gap-2">
            {/* Left Diya Icon */}
            <span className="text-xl sm:text-2xl animate-pulse">🪔</span>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 border border-amber-400/60 text-amber-300 text-xs sm:text-sm font-black tracking-wider uppercase shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              {isHi ? 'पटेल सीसीटीवी स्पेशल' : 'PATEL CCTV SPECIAL'}
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            </span>

            {/* Right Diya Icon */}
            <span className="text-xl sm:text-2xl animate-pulse">🪔</span>
          </div>

          {/* Grand Diwali Offer Title with Glowing Gradient Text */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]">
            {isHi ? '✨ ग्रैंड दिवाली महा धमाका ऑफर ✨' : '✨ GRAND DIWALI MEGA DHAMAKA OFFER ✨'}
          </h2>

          <p className="text-xs sm:text-sm font-medium text-amber-100/90 leading-relaxed max-w-sm mx-auto">
            {isHi 
              ? 'थोक रेट पर HD/4K CCTV कैमरे, DVR किट व फ्री इंस्टॉलेशन के साथ महा बचत!'
              : 'Mega festive savings on 4K CCTV setups, AcuSense DVRs & free installation!'}
          </p>
        </div>

        {/* Dynamic Countdown Section: Target 8/11/2026 & Days Left */}
        <div className="px-4 sm:px-6 py-3 relative z-20 space-y-3">
          {/* Target Date Banner */}
          <div className="bg-gradient-to-r from-amber-900/60 via-red-950/80 to-amber-900/60 p-3 rounded-2xl border border-amber-500/50 shadow-inner flex flex-col items-center justify-center gap-1 text-center">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? 'दिवाली ऑफर तिथि (Launch Date)' : 'Offer Target Launch Date'}</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/30 border border-amber-400 text-amber-200 font-mono">
                8/11/2026
              </span>
              <span className="text-amber-300 font-semibold text-xs sm:text-sm">
                ({isHi ? '8 नवंबर 2026' : '8th November 2026'})
              </span>
            </div>
          </div>

          {/* Big High-Contrast Days Remaining Countdown Box */}
          <div className="bg-slate-900/90 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.25)] text-center space-y-2">
            {!timeLeft.isLive && !timeLeft.isExpired ? (
              <>
                <div className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-300 flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{isHi ? 'ऑफर शुरू होने में शेष समय' : 'COUNTDOWN TO MEGA LAUNCH'}</span>
                </div>

                {/* Big Days Pill */}
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-gradient-to-b from-amber-500 to-amber-700 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-lg border border-amber-300 flex flex-col items-center min-w-[110px]">
                    <span className="text-3xl sm:text-4xl font-mono leading-none tracking-tight">
                      {timeLeft.days}
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 mt-0.5">
                      {isHi ? 'दिन बाकी (Days)' : 'Days Left'}
                    </span>
                  </div>

                  <div className="text-left space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-200 font-bold">
                      <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span>{isHi ? 'हर दिन कम होगा समय!' : 'Live daily countdown!'}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {isHi 
                        ? `आज ${timeLeft.days} दिन शेष, 8 नवंबर को ऑफर लाइव होगा!` 
                        : `${timeLeft.days} days remaining until 8th Nov mega launch!`}
                    </div>
                  </div>
                </div>

                {/* Sub-ticker: Hours, Minutes, Seconds */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-center">
                    <span className="block text-sm font-mono font-bold text-amber-300">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">{isHi ? 'घंटे' : 'Hours'}</span>
                  </div>
                  <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-center">
                    <span className="block text-sm font-mono font-bold text-amber-300">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">{isHi ? 'मिनट' : 'Mins'}</span>
                  </div>
                  <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-center">
                    <span className="block text-sm font-mono font-bold text-amber-300">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">{isHi ? 'सेकंड' : 'Secs'}</span>
                  </div>
                </div>
              </>
            ) : timeLeft.isLive ? (
              <div className="py-2 space-y-2 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase animate-bounce">
                  🎉 {isHi ? 'धमाका ऑफर लाइव है!' : 'MEGA OFFER IS LIVE!'} 🎉
                </span>
                <h3 className="text-xl font-black text-yellow-300">
                  {isHi ? 'दिवाली स्पेशल छूट का लाभ अभी उठाएं!' : 'Claim Your Diwali Discounts Now!'}
                </h3>
                <p className="text-xs text-slate-200">
                  {isHi ? 'सभी CP Plus, Hikvision और Dahua कैमरों पर फ्लैट 25% तक की छूट।' : 'Flat up to 25% OFF on top CCTV brands.'}
                </p>
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-amber-200">
                {isHi ? 'दिवाली उत्सव ऑफर संपन्न हो चुका है।' : 'Diwali Mega Festive Offer Concluded.'}
              </div>
            )}
          </div>

          {/* Quick Festive Highlights: 2 Columns */}
          <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
            <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded-xl flex items-center gap-2">
              <Gift className="w-4 h-4 text-yellow-400 shrink-0" />
              <span className="text-amber-100 font-semibold truncate">
                {isHi ? 'फ्री इंस्टॉलेशन किट' : 'Free Installation Kit'}
              </span>
            </div>
            <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-amber-100 font-semibold truncate">
                {isHi ? '2 साल ऑनसाइट वारंटी' : '2-Year Onsite Warranty'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons & 3-Second Auto-Dismiss Footer */}
        <div className="p-4 sm:p-5 pt-2 bg-slate-950/90 border-t border-amber-500/30 relative z-20 space-y-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onExploreOffer?.();
                onClose();
              }}
              id="diwali-explore-offer-btn"
              className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-xl shadow-lg shadow-amber-500/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isHi ? 'दुकान देखें / प्री-बुक करें' : 'Browse Store & Pre-Book'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              id="diwali-dismiss-btn"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold py-2.5 sm:py-3 px-3.5 rounded-xl transition cursor-pointer active:scale-95 shrink-0"
            >
              {isHi ? 'बंद करें' : 'Close'}
            </button>
          </div>

          {/* 3-Second Auto-Close Progress Bar Indicator */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-amber-300/80 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                {isPaused ? (isHi ? 'रोक दिया गया (Paused on Hover)' : 'Paused on Hover') : (isHi ? `3 सेकंड में अपने आप बंद होगा (${secondsRemaining}s)` : `Auto-closing in ${secondsRemaining}s...`)}
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            
            {/* Smooth Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-amber-400/20">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-emerald-400 transition-all duration-75 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
