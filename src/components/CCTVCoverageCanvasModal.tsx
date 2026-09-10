import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  X,
  Camera,
  Ruler,
  Maximize2,
  Minimize2,
  Trash2,
  RotateCcw,
  Download,
  Share2,
  Check,
  Compass,
  Layers,
  Sparkles,
  Info,
  Video,
  VideoOff,
  RefreshCw,
  Eye,
  Grid,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Language, StoreInfo, Product } from '../types';
import { STORE_INFO, PRODUCTS } from '../data/products';

interface PlacedCamera {
  id: string;
  name: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  distancePx: number;
  distanceMeters: number;
  angle: number;
  fovAngle: number;
  lensLabel: string;
  color: string;
}

interface CCTVCoverageCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  storeInfo?: StoreInfo;
  onSelectProductForCart?: (product: Product) => void;
}

export const CCTVCoverageCanvasModal: React.FC<CCTVCoverageCanvasModalProps> = ({
  isOpen,
  onClose,
  language,
  storeInfo = STORE_INFO,
  onSelectProductForCart,
}) => {
  const isHi = language === 'hi';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Canvas dimensions
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 500,
  });

  // Scale (1 meter = 20 pixels as requested by user)
  const [scale, setScale] = useState<number>(20);

  // Selected Lens & FOV
  // 60 deg cone half-angle is Math.PI / 6 (total 60 deg) as per user's code
  const [lensConfig, setLensConfig] = useState<{
    focalLength: string;
    totalDegrees: number;
    fovHalfAngle: number;
    zoomFactor: number;
    description: string;
    descriptionHi: string;
  }>({
    focalLength: '3.6mm',
    totalDegrees: 60,
    fovHalfAngle: Math.PI / 6, // 30 deg half-angle = 60 deg cone
    zoomFactor: 1.25,
    description: 'Standard 60° Angle (Ideal for living rooms, shops, courtyards)',
    descriptionHi: 'मानक 60° कोण (हॉल, दुकान व सामान्य कमरों के लिए)',
  });

  // Background blueprint preset
  const [backgroundType, setBackgroundType] = useState<'grid' | 'shop' | 'home' | 'blank'>('grid');

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentLine, setCurrentLine] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Placed Cameras list
  const [placedCameras, setPlacedCameras] = useState<PlacedCamera[]>([]);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // --- LIVE CAMERA STATE ---
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState<'idle' | 'granted' | 'denied' | 'simulated'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showAlignmentGrid, setShowAlignmentGrid] = useState<boolean>(true);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const [deviceTilt, setDeviceTilt] = useState<number>(0); // tilt angle in degrees (-90 to 90)
  const [viewMode, setViewMode] = useState<'ar_canvas' | 'blueprint_pip'>('ar_canvas');

  // Available Lens Options
  const LENS_OPTIONS = [
    {
      focalLength: '2.8mm',
      totalDegrees: 90,
      fovHalfAngle: Math.PI / 4, // 45 deg half = 90 deg cone
      zoomFactor: 1.0,
      label: '2.8mm (90° Wide)',
      labelHi: '2.8mm (90° चौड़ा कोण)',
      desc: 'Wide FOV for small rooms, parking & wide lobbies',
      descHi: 'छोटे कमरों, पार्किंग व मेन गेट के लिए चौड़ा विज़न',
    },
    {
      focalLength: '3.6mm',
      totalDegrees: 60,
      fovHalfAngle: Math.PI / 6, // 30 deg half = 60 deg cone (Standard User default)
      zoomFactor: 1.25,
      label: '3.6mm (60° Standard)',
      labelHi: '3.6mm (60° स्टैंडर्ड)',
      desc: 'Balanced distance & coverage (Bestseller)',
      descHi: 'दूरी व कवरेज का सबसे संतुलित कोण (बेस्टसेलर)',
    },
    {
      focalLength: '6.0mm',
      totalDegrees: 45,
      fovHalfAngle: Math.PI / 8, // 22.5 deg half = 45 deg cone
      zoomFactor: 1.75,
      label: '6.0mm (45° Long)',
      labelHi: '6.0mm (45° लंबी दूरी)',
      desc: 'Narrow focus for long corridors & boundary walls',
      descHi: 'लंबे कॉरिडोर व बाउंड्री दीवार के लिए',
    },
    {
      focalLength: '12.0mm',
      totalDegrees: 25,
      fovHalfAngle: Math.PI / 14,
      zoomFactor: 2.8,
      label: '12.0mm (25° Zoom)',
      labelHi: '12.0mm (25° जूम / गेट)',
      desc: 'Tight zoom for gate entry & license plates',
      descHi: 'मेन गेट व गाड़ी की नंबर प्लेट पहचानने के लिए',
    },
  ];

  // Colors for placed cameras
  const CAMERA_COLORS = [
    'rgba(0, 150, 255, 0.28)',
    'rgba(16, 185, 129, 0.28)',
    'rgba(245, 158, 11, 0.28)',
    'rgba(168, 85, 247, 0.28)',
    'rgba(239, 68, 68, 0.28)',
  ];

  // Auto-resize canvas according to container
  useEffect(() => {
    if (!isOpen) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const targetWidth = Math.min(containerWidth - 24, isFullscreen ? 1400 : 960);
        const targetHeight = Math.max(380, Math.round(targetWidth * 0.58));
        setCanvasDimensions({
          width: Math.max(340, targetWidth),
          height: Math.min(650, targetHeight),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isOpen, isFullscreen]);

  // Mobile device orientation listener to check if camera is level
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.gamma !== undefined) {
        // gamma is left-to-right tilt in degrees
        setDeviceTilt(Math.round(e.gamma));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // --- LIVE CAMERA STREAM CONTROLLER ---
  const startLiveCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device API not supported in this browser');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = newStream;

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }

      setCameraFacingMode(facing);
      setCameraPermissionStatus('granted');
      setIsLiveCameraActive(true);
      setFrozenFrame(null);
    } catch (err: any) {
      console.warn('Live Camera access blocked or unavailable:', err);
      setCameraError(
        isHi
          ? 'डिवाइस कैमरा अनुमति उपलब्ध नहीं है या आईफ्रेम में ब्लॉक है। सिमुलेटेड लाइव CCTV फीड शुरू की गई है।'
          : 'Live camera permission denied or unavailable in iframe. Activated simulated live CCTV feed.'
      );
      setCameraPermissionStatus('simulated');
      setIsLiveCameraActive(true);
      setFrozenFrame(null);
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveCameraActive(false);
    setCameraPermissionStatus('idle');
  };

  const toggleCameraFacing = () => {
    const newFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(newFacing);
    if (isLiveCameraActive) {
      startLiveCamera(newFacing);
    }
  };

  // Freeze current frame as room blueprint photo
  const handleFreezeCurrentFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setFrozenFrame(dataUrl);
    stopLiveCamera();
  };

  // Clear frozen room blueprint photo
  const handleClearFrozenFrame = () => {
    setFrozenFrame(null);
  };

  // Stop camera when closing modal
  useEffect(() => {
    if (!isOpen) {
      stopLiveCamera();
    }
  }, [isOpen]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Main drawing engine on Canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 0. Clear canvas
    ctx.clearRect(0, 0, width, height);

    // --- RENDER LIVE CAMERA VIDEO FEED ---
    let isDrawingOnVideo = false;

    if (isLiveCameraActive && viewMode === 'ar_canvas') {
      isDrawingOnVideo = true;

      if (videoRef.current && videoRef.current.readyState >= 2 && cameraPermissionStatus === 'granted') {
        // Draw real device video with optical zoom simulation according to selected lens
        const zoom = lensConfig.zoomFactor;
        const vw = videoRef.current.videoWidth || 640;
        const vh = videoRef.current.videoHeight || 480;
        const cropW = vw / zoom;
        const cropH = vh / zoom;
        const cropX = (vw - cropW) / 2;
        const cropY = (vh - cropH) / 2;

        ctx.drawImage(videoRef.current, cropX, cropY, cropW, cropH, 0, 0, width, height);
      } else {
        // High quality simulated surveillance feed when camera is in simulation mode or waiting
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Perspective corridor / room wireframe
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Ceiling lines
        ctx.moveTo(0, 0);
        ctx.lineTo(width * 0.35, height * 0.35);
        ctx.moveTo(width, 0);
        ctx.lineTo(width * 0.65, height * 0.35);
        // Floor lines
        ctx.moveTo(0, height);
        ctx.lineTo(width * 0.35, height * 0.7);
        ctx.moveTo(width, height);
        ctx.lineTo(width * 0.65, height * 0.7);
        // Far doorway
        ctx.strokeRect(width * 0.42, height * 0.4, width * 0.16, height * 0.3);
        ctx.stroke();

        // Far doorway text
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.font = '10px monospace';
        ctx.fillText(isHi ? 'प्रवेश द्वार (Doorway Target)' : 'Doorway Target Zone', width * 0.43, height * 0.38);

        // Simulated Person Target Silhouette at 8m
        const targetX = width * 0.5;
        const targetY = height * 0.58;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.beginPath();
        ctx.arc(targetX, targetY - 20, 6, 0, Math.PI * 2); // head
        ctx.rect(targetX - 5, targetY - 14, 10, 22); // body
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('TARGET [8.0m]', targetX - 24, targetY - 26);
      }

      // CCTV On-Screen Display (OSD) Timestamp & Camera Info
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(10, 10, 240, 52);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, 240, 52);

      // Blinking RED REC Dot
      const now = new Date();
      const blink = Math.floor(now.getTime() / 600) % 2 === 0;
      ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(22, 24, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`PATEL CCTV LIVE [CAM-01]`, 34, 28);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`${now.toLocaleTimeString()} | 1080P FHD`, 22, 42);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px monospace';
      ctx.fillText(`LENS: ${lensConfig.focalLength} (${lensConfig.totalDegrees}°) | FOV ACTIVE`, 22, 54);

      // --- REAL-TIME CAMERA ALIGNMENT & HORIZON LEVEL CHECKER ("कैमरा बराबर है") ---
      if (showAlignmentGrid) {
        // Alignment Grid (Rule of Thirds)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(width / 3, 0);
        ctx.lineTo(width / 3, height);
        ctx.moveTo((width * 2) / 3, 0);
        ctx.lineTo((width * 2) / 3, height);

        ctx.moveTo(0, height / 3);
        ctx.lineTo(width, height / 3);
        ctx.moveTo(0, (height * 2) / 3);
        ctx.lineTo(width, (height * 2) / 3);
        ctx.stroke();
        ctx.setLineDash([]);

        // Center Crosshair Target
        const cx = width / 2;
        const cy = height / 2;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.moveTo(cx - 36, cy);
        ctx.lineTo(cx - 10, cy);
        ctx.moveTo(cx + 10, cy);
        ctx.lineTo(cx + 36, cy);
        ctx.moveTo(cx, cy - 36);
        ctx.lineTo(cx, cy - 10);
        ctx.moveTo(cx, cy + 10);
        ctx.lineTo(cx, cy + 36);
        ctx.stroke();

        // Horizon Level Bar
        const isLevel = Math.abs(deviceTilt) <= 3;
        ctx.strokeStyle = isLevel ? '#22c55e' : '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 80, cy);
        ctx.lineTo(cx + 80, cy);
        ctx.stroke();

        // Level text indicator
        ctx.fillStyle = isLevel ? '#22c55e' : '#f59e0b';
        ctx.font = 'bold 11px sans-serif';
        const levelText = isLevel
          ? (isHi ? '✓ कैमरा लेवल बराबर है (Level OK)' : '✓ Camera Level OK')
          : (isHi ? `⚠️ कैमरा थोड़ा झुका है (${deviceTilt}°)` : `⚠️ Camera Tilted (${deviceTilt}°)`);
        ctx.fillText(levelText, cx - 70, cy + 38);
      }
    } else if (frozenFrame) {
      // Draw frozen customer room photo as background
      const img = new Image();
      img.src = frozenFrame;
      ctx.drawImage(img, 0, 0, width, height);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(10, 10, 200, 26);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(isHi ? '📸 फ्रोजन रूम फोटो लेआउट' : '📸 Frozen Room Photo', 18, 27);
    } else {
      // Regular Blueprint / Architectural Grid (#f1f5f9)
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, width, height);

      // Architectural Grid (1 Meter = SCALE px)
      if (backgroundType === 'grid' || backgroundType === 'shop' || backgroundType === 'home') {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;

        // Small grid lines (every 1 meter)
        ctx.beginPath();
        for (let x = 0; x <= width; x += scale) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += scale) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Major grid lines (every 5 meters)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x <= width; x += scale * 5) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += scale * 5) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Meter markers along top & left edge
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        for (let x = scale * 5; x <= width; x += scale * 5) {
          ctx.fillText(`${x / scale}m`, x + 3, 14);
        }
        for (let y = scale * 5; y <= height; y += scale * 5) {
          ctx.fillText(`${y / scale}m`, 4, y - 4);
        }
      }

      // Optional Architectural Presets (Shop layout / Home layout)
      if (backgroundType === 'shop') {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(scale * 3, scale * 3, scale * 8, scale * 2);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(scale * 3, scale * 3, scale * 8, scale * 2);
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(isHi ? 'कैशियर काउंटर' : 'Cashier Counter', scale * 3.5, scale * 4.3);

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(scale * 16, height - 10);
        ctx.lineTo(scale * 22, height - 10);
        ctx.stroke();
        ctx.fillStyle = '#1d4ed8';
        ctx.fillText(isHi ? 'मुख्य प्रवेश द्वार (Entry)' : 'Main Entrance Door', scale * 16.5, height - 18);

        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(scale * 18, scale * 3, scale * 12, scale * 3);
        ctx.strokeRect(scale * 18, scale * 3, scale * 12, scale * 3);
        ctx.fillStyle = '#64748b';
        ctx.fillText(isHi ? 'डिस्प्ले रैक' : 'Display Racks', scale * 20, scale * 4.8);
      } else if (backgroundType === 'home') {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(scale * 2, scale * 2, width - scale * 4, height - scale * 4);
        ctx.setLineDash([]);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(isHi ? 'लिविंग हॉल / पार्किंग एरिया' : 'Living Hall & Parking Area', scale * 3, scale * 3.5);

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(width / 2 - scale * 3, height - scale * 2);
        ctx.lineTo(width / 2 + scale * 3, height - scale * 2);
        ctx.stroke();
        ctx.fillStyle = '#047857';
        ctx.fillText(isHi ? 'मेन गेट' : 'Main Gate', width / 2 - scale * 1.5, height - scale * 2 - 8);
      }
    }

    // --- CCTV CAMERA FOV CONE & MEASURING TAPE ENGINE (User's Exact Formulas) ---
    const renderCameraElement = (
      startX: number,
      startY: number,
      targetX: number,
      targetY: number,
      fov: number,
      coneColor: string,
      cameraLabel: string,
      lensName: string
    ) => {
      const dx = targetX - startX;
      const dy = targetY - startY;
      const distancePx = Math.hypot(dx, dy);
      if (distancePx < 2) return;
      const distanceMeters = (distancePx / scale).toFixed(2);
      const angle = Math.atan2(dy, dx);

      // 1. कैमरा विज़न कोन (FOV कोण - 60 डिग्री या चयनित लेंस)
      ctx.fillStyle = isDrawingOnVideo ? 'rgba(6, 182, 212, 0.4)' : coneColor;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.arc(startX, startY, distancePx, angle - fov, angle + fov);
      ctx.closePath();
      ctx.fill();

      // Cone outer arc border
      ctx.strokeStyle = isDrawingOnVideo ? '#22d3ee' : 'rgba(0, 120, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(startX, startY, distancePx, angle - fov, angle + fov);
      ctx.stroke();

      // 2. फीता/दूरी की लाइन (Red dashed line as requested)
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Target point indicator (End crosshair point)
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 5, 0, Math.PI * 2);
      ctx.fill();

      // 3. कैमरा पॉइंट (आइकन / बेस)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(startX, startY, 9, 0, Math.PI * 2);
      ctx.fill();

      // Inner camera lens circle
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(startX, startY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Direction pointer triangle on camera
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      const pointerDist = 14;
      ctx.moveTo(
        startX + Math.cos(angle) * pointerDist,
        startY + Math.sin(angle) * pointerDist
      );
      ctx.lineTo(
        startX + Math.cos(angle + 2.5) * 6,
        startY + Math.sin(angle + 2.5) * 6
      );
      ctx.lineTo(
        startX + Math.cos(angle - 2.5) * 6,
        startY + Math.sin(angle - 2.5) * 6
      );
      ctx.closePath();
      ctx.fill();

      // 4. दूरी का टेक्स्ट (Exact user formula: midX + 10, midY - 10)
      const midX = (startX + targetX) / 2;
      const midY = (startY + targetY) / 2;

      // Distance bubble background for supreme contrast
      const textLabel = `${distanceMeters} m (${(parseFloat(distanceMeters) * 3.28084).toFixed(1)} ft)`;
      ctx.font = 'bold 13px sans-serif';
      const textMetrics = ctx.measureText(textLabel);
      const textWidth = textMetrics.width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.roundRect
        ? ctx.roundRect(midX + 6, midY - 26, textWidth + 18, 24, 6)
        : ctx.fillRect(midX + 6, midY - 26, textWidth + 18, 24);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(textLabel, midX + 14, midY - 10);

      // Camera badge near base
      ctx.fillStyle = isDrawingOnVideo ? '#38bdf8' : '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${cameraLabel} (${lensName})`, startX + 14, startY + 4);
    };

    // Render already placed/saved cameras
    placedCameras.forEach((cam, idx) => {
      renderCameraElement(
        cam.startX,
        cam.startY,
        cam.currentX,
        cam.currentY,
        cam.fovAngle,
        cam.color,
        cam.name || `Cam ${idx + 1}`,
        cam.lensLabel
      );
    });

    // Render currently active drawing camera
    if (currentLine) {
      renderCameraElement(
        currentLine.startX,
        currentLine.startY,
        currentLine.currentX,
        currentLine.currentY,
        lensConfig.fovHalfAngle,
        'rgba(0, 150, 255, 0.35)',
        isHi ? 'लाइव कैमरा' : 'Live Camera',
        lensConfig.focalLength
      );
    }
  }, [
    backgroundType,
    cameraFacingMode,
    cameraPermissionStatus,
    canvasDimensions,
    currentLine,
    deviceTilt,
    frozenFrame,
    isHi,
    isLiveCameraActive,
    lensConfig,
    placedCameras,
    scale,
    showAlignmentGrid,
    viewMode,
  ]);

  // Continuous animation frame loop when live camera is streaming
  useEffect(() => {
    if (!isLiveCameraActive) {
      redraw();
      return;
    }

    let animationFrameId: number;
    const renderLoop = () => {
      redraw();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isLiveCameraActive, redraw]);

  // Trigger redraw on changes when camera is paused
  useEffect(() => {
    if (!isLiveCameraActive) {
      redraw();
    }
  }, [redraw, isLiveCameraActive]);

  // Coordinate helper: computes relative offset inside canvas
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Mouse / Touch handlers matching the user's exact specification
  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);
    setCurrentLine({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentLine) return;
    const { x, y } = getCanvasCoords(e);
    setCurrentLine((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentX: x,
        currentY: y,
      };
    });
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  // Lock and save currently drawn camera to permanent list
  const handleLockCamera = () => {
    if (!currentLine) return;
    const dx = currentLine.currentX - currentLine.startX;
    const dy = currentLine.currentY - currentLine.startY;
    const distancePx = Math.hypot(dx, dy);
    if (distancePx < 5) return;

    const distanceMeters = parseFloat((distancePx / scale).toFixed(2));
    const angle = Math.atan2(dy, dx);
    const color = CAMERA_COLORS[placedCameras.length % CAMERA_COLORS.length];

    const newCam: PlacedCamera = {
      id: `cam-${Date.now()}`,
      name: `${isHi ? 'कैमरा' : 'Cam'} ${placedCameras.length + 1}`,
      startX: currentLine.startX,
      startY: currentLine.startY,
      currentX: currentLine.currentX,
      currentY: currentLine.currentY,
      distancePx,
      distanceMeters,
      angle,
      fovAngle: lensConfig.fovHalfAngle,
      lensLabel: lensConfig.focalLength,
      color,
    };

    setPlacedCameras((prev) => [...prev, newCam]);
    setCurrentLine(null);
  };

  // Clear all
  const handleClearAll = () => {
    setPlacedCameras([]);
    setCurrentLine(null);
  };

  // Undo last
  const handleUndo = () => {
    if (currentLine) {
      setCurrentLine(null);
    } else if (placedCameras.length > 0) {
      setPlacedCameras((prev) => prev.slice(0, prev.length - 1));
    }
  };

  // Export Canvas Image with Watermark
  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height + 40;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    tCtx.drawImage(canvas, 0, 0);

    // Branded bottom watermark
    tCtx.fillStyle = '#0f172a';
    tCtx.fillRect(0, canvas.height, canvas.width, 40);

    tCtx.fillStyle = '#f8fafc';
    tCtx.font = 'bold 12px sans-serif';
    tCtx.fillText(
      `Patel CCTV Camera • Real-time FOV & Alignment Verification • Powered by Vikash Patel (+91 80009 51663)`,
      16,
      canvas.height + 25
    );

    const link = document.createElement('a');
    link.download = `patel-cctv-live-fov-check-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  // Share on WhatsApp to Patel CCTV
  const handleShareWhatsApp = () => {
    const allCams = [...placedCameras];
    if (currentLine) {
      const dx = currentLine.currentX - currentLine.startX;
      const dy = currentLine.currentY - currentLine.startY;
      const distanceMeters = (Math.hypot(dx, dy) / scale).toFixed(2);
      allCams.push({
        id: 'live',
        name: isHi ? 'वर्तमान एक्टिव कैमरा' : 'Live Camera',
        startX: currentLine.startX,
        startY: currentLine.startY,
        currentX: currentLine.currentX,
        currentY: currentLine.currentY,
        distancePx: Math.hypot(dx, dy),
        distanceMeters: parseFloat(distanceMeters),
        angle: 0,
        fovAngle: lensConfig.fovHalfAngle,
        lensLabel: lensConfig.focalLength,
        color: '',
      });
    }

    const camLines = allCams
      .map(
        (c, idx) =>
          `📷 *कैमरा ${idx + 1} (${c.lensLabel}):* दूरी = ${c.distanceMeters}m (${(c.distanceMeters * 3.28).toFixed(1)}ft)`
      )
      .join('\n');

    const msg = encodeURIComponent(
      `*🛡️ पटेल सीसीटीवी कैमरा - रियल टाइम लाइव कैमरा FOV व दूरी नाप*\n\n` +
        `नमस्ते विकास भाई, मैंने आपके लाइव कैमरा विज़न कोन से अपनी साइट चेक की है:\n\n` +
        `📹 *कैमरा विज़न स्टेटस:* लाइव कैमरा अलाइनमेंट चेक किया गया (${lensConfig.focalLength} FOV)\n` +
        (camLines || `दूरी नाप: 1 कैमरा प्लान`) +
        `\n\nकृपया इस लेआउट के अनुसार बेस्ट कैमरे व इंस्टॉलेशन का कोटेशन भेजें।\n\n` +
        `⚡ _Powered by Vikash Patel (+91 80009 51663)_`
    );

    const whatsappUrl = `https://wa.me/${storeInfo.whatsappNumber}?text=${msg}`;
    window.open(whatsappUrl, '_blank');
  };

  // Active or last measured distance stats
  const activeDistMeters = currentLine
    ? parseFloat(
        (Math.hypot(currentLine.currentX - currentLine.startX, currentLine.currentY - currentLine.startY) / scale).toFixed(2)
      )
    : placedCameras.length > 0
    ? placedCameras[placedCameras.length - 1].distanceMeters
    : 0;

  // DORI standards based on distance
  const getDORIClassification = (meters: number) => {
    if (meters <= 0) return { label: isHi ? 'नाप शुरू करें' : 'Start Measuring', color: 'text-slate-400', badge: 'bg-slate-100' };
    if (meters <= 4)
      return {
        label: isHi ? '🟢 स्पष्ट पहचान (Identification) - चेहरा, नोट, बिल साफ दिखता है' : '🟢 Identification - Crisp Facial Features & Currency',
        color: 'text-emerald-700',
        badge: 'bg-emerald-100 border-emerald-300',
      };
    if (meters <= 9)
      return {
        label: isHi ? '🔵 पहचान (Recognition) - ज्ञात व्यक्ति व कपड़े स्पष्ट' : '🔵 Recognition - Known Persons & Details Clear',
        color: 'text-blue-700',
        badge: 'bg-blue-100 border-blue-300',
      };
    if (meters <= 18)
      return {
        label: isHi ? '🟡 सामान्य निगरानी (Observation) - गतिविधि व वस्तुएं स्पष्ट' : '🟡 Observation - Activity & Body Shape Visible',
        color: 'text-amber-700',
        badge: 'bg-amber-100 border-amber-300',
      };
    return {
      label: isHi ? '🟠 डिटेक्ट (Detection) - व्यक्ति या वाहन की मौजूदगी का पता चलता है' : '🟠 Detection - Motion of Persons or Vehicles Detected',
      color: 'text-rose-700',
      badge: 'bg-rose-100 border-rose-300',
    };
  };

  const dori = getDORIClassification(activeDistMeters);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Hidden Video element for real-time camera stream capture */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className="hidden"
      />

      <div
        ref={containerRef}
        className={`bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 w-full ${
          isFullscreen ? 'fixed inset-2 z-50 max-w-none' : 'max-w-5xl max-h-[96vh]'
        }`}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/30 border border-cyan-400/40 shrink-0">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>{isHi ? 'लाइव CCTV कैमरा FOV व दूरी नाप टूल' : 'Live CCTV Camera FOV & Tape Measure Tool'}</span>
                </h2>
                {isLiveCameraActive ? (
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>REC LIVE FEED</span>
                  </span>
                ) : (
                  <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                    Real-time FOV Check
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isHi
                  ? 'रियल-टाइम कैमरा विज़न, एंगल व कवरेज चेक करें ताकि पता चले कैमरा बिल्कुल बराबर है'
                  : 'Live camera stream with FOV vision cone & horizon level check to verify alignment'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={isFullscreen ? 'Restore' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Camera Master Control Bar */}
        <div className="bg-slate-950 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2.5 flex-wrap border-b border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Live Camera Toggle */}
            {!isLiveCameraActive ? (
              <button
                type="button"
                onClick={() => startLiveCamera()}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md shadow-cyan-500/25 flex items-center gap-1.5 transition cursor-pointer active:scale-95 animate-pulse"
              >
                <Video className="w-4 h-4 text-white" />
                <span>{isHi ? '🎥 लाइव कैमरा चालू करें (Live View)' : '🎥 Start Live Camera'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopLiveCamera}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <VideoOff className="w-4 h-4 text-white" />
                <span>{isHi ? '⏹️ कैमरा बंद करें' : '⏹️ Stop Camera'}</span>
              </button>
            )}

            {/* Switch Camera (Rear / Front) */}
            {isLiveCameraActive && (
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                title="Switch Front/Rear Camera"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>{cameraFacingMode === 'environment' ? (isHi ? 'रियर कैमरा' : 'Rear') : (isHi ? 'फ्रंट कैमरा' : 'Front')}</span>
              </button>
            )}

            {/* Freeze Room Photo Frame */}
            {isLiveCameraActive && (
              <button
                type="button"
                onClick={handleFreezeCurrentFrame}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                title="Freeze room frame to draw plan"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isHi ? '📸 फ्रेम फ्रीज करें' : '📸 Freeze Photo'}</span>
              </button>
            )}

            {/* Clear Frozen Frame */}
            {frozenFrame && (
              <button
                type="button"
                onClick={handleClearFrozenFrame}
                className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>{isHi ? '✕ फ्रोजन फ्रेम हटाएं' : '✕ Clear Photo'}</span>
              </button>
            )}

            {/* Alignment Grid Toggle */}
            {isLiveCameraActive && (
              <button
                type="button"
                onClick={() => setShowAlignmentGrid(!showAlignmentGrid)}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                  showAlignmentGrid
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{isHi ? 'लेवल ग्रिड' : 'Level Grid'}</span>
              </button>
            )}
          </div>

          {/* Real-time Alignment Status Badge ("कैमरा बराबर है") */}
          {isLiveCameraActive ? (
            <div className="flex items-center gap-2">
              <div
                className={`text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 border ${
                  Math.abs(deviceTilt) <= 3
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                }`}
              >
                {Math.abs(deviceTilt) <= 3 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isHi ? 'कैमरा एंगल 100% बराबर है' : 'Camera Angle Level OK'}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHi ? `कैमरा झुका हुआ है (${deviceTilt}°)` : `Camera Tilted (${deviceTilt}°)`}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? 'कैमरा चालू करके वास्तविक विज़न देखें' : 'Turn on Live Camera to verify view'}</span>
            </div>
          )}
        </div>

        {/* Camera Error / Simulated Alert Notice */}
        {cameraError && isLiveCameraActive && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 text-[11px] font-bold text-amber-800 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{cameraError}</span>
            </span>
            <button
              onClick={() => startLiveCamera()}
              className="underline text-amber-900 hover:text-black font-black cursor-pointer"
            >
              {isHi ? 'कैमरा पुनः कनेक्ट करें' : 'Retry Camera'}
            </button>
          </div>
        )}

        {/* Controls Ribbon: Lens Angle & Layout Presets */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 py-2 flex items-center justify-between gap-2.5 flex-wrap">
          {/* Lens Angle Selection */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black text-slate-600 flex items-center gap-1 mr-1">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>{isHi ? 'लेंस FOV:' : 'Lens FOV:'}</span>
            </span>
            {LENS_OPTIONS.map((lens) => (
              <button
                key={lens.focalLength}
                onClick={() =>
                  setLensConfig({
                    focalLength: lens.focalLength,
                    totalDegrees: lens.totalDegrees,
                    fovHalfAngle: lens.fovHalfAngle,
                    zoomFactor: lens.zoomFactor,
                    description: lens.desc,
                    descriptionHi: lens.descHi,
                  })
                }
                className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                  lensConfig.focalLength === lens.focalLength
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{isHi ? lens.labelHi : lens.label}</span>
              </button>
            ))}
          </div>

          {/* Blueprint Layout & Scale (when not in full live camera) */}
          {!isLiveCameraActive && !frozenFrame && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">{isHi ? 'लेआउट:' : 'Layout:'}</span>
              </span>
              <select
                value={backgroundType}
                onChange={(e) => setBackgroundType(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="grid">{isHi ? 'ब्लूप्रिंट ग्रिड (1m स्केल)' : 'Blueprint Grid (1m)'}</option>
                <option value="shop">{isHi ? 'दुकान / शोरूम लेआउट' : 'Retail Shop Layout'}</option>
                <option value="home">{isHi ? 'घर / हॉल / पार्किंग' : 'Home / Hall Layout'}</option>
                <option value="blank">{isHi ? 'सफेद कैनवास' : 'Plain Canvas'}</option>
              </select>

              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                title="Scale factor (pixels per meter)"
              >
                <option value={15}>1m = 15px (Zoom Out)</option>
                <option value={20}>1m = 20px (Standard)</option>
                <option value={30}>1m = 30px (Zoom In)</option>
              </select>
            </div>
          )}
        </div>

        {/* Canvas & Measurement Workspace */}
        <div className="flex-1 p-2 sm:p-4 flex flex-col items-center justify-center bg-slate-900/90 overflow-hidden select-none relative">
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-black flex items-center justify-center max-w-full">
            {/* The interactive HTML5 canvas */}
            <canvas
              id="cctvCanvas"
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              className="cursor-crosshair block touch-none"
              style={{
                width: `${canvasDimensions.width}px`,
                height: `${canvasDimensions.height}px`,
              }}
            />

            {/* Float Overlay helper badge on canvas bottom-left */}
            <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-xl text-[11px] font-mono flex items-center gap-2 pointer-events-none shadow-md border border-slate-700">
              <span className="text-emerald-400">● 1m = {scale}px</span>
              <span>•</span>
              <span className="text-cyan-300">
                {lensConfig.focalLength} ({lensConfig.totalDegrees}°)
              </span>
              {isLiveCameraActive && (
                <>
                  <span>•</span>
                  <span className="text-amber-300">
                    {Math.abs(deviceTilt) <= 3 ? '✓ 0° Level' : `${deviceTilt}° Tilt`}
                  </span>
                </>
              )}
            </div>

            {/* Clear / Undo Quick Floating Actions on Top Right of Canvas */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              {currentLine && (
                <button
                  type="button"
                  onClick={handleLockCamera}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer active:scale-95 animate-pulse"
                  title="Fix this camera onto plan"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isHi ? '📌 यह कैमरा लॉक करें' : '📌 Lock Camera'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleUndo}
                disabled={placedCameras.length === 0 && !currentLine}
                className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 disabled:opacity-40 p-2 rounded-xl shadow-sm border border-slate-700 transition cursor-pointer"
                title="Undo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={placedCameras.length === 0 && !currentLine}
                className="bg-slate-900/80 hover:bg-rose-900/80 text-rose-300 disabled:opacity-40 p-2 rounded-xl shadow-sm border border-slate-700 transition cursor-pointer"
                title="Clear All"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Distance & DORI Surveillance Analysis Bar */}
        <div className="bg-white border-t border-slate-200 p-3 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center shrink-0">
          {/* Active Distance Stat */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {isHi ? 'वर्तमान नापी गई दूरी' : 'Measured Distance'}
              </div>
              <div className="text-lg font-black text-slate-900 leading-tight flex items-baseline gap-1.5">
                <span>
                  {activeDistMeters.toFixed(2)} {isHi ? 'मीटर' : 'Meters'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({(activeDistMeters * 3.28084).toFixed(1)} {isHi ? 'फीट' : 'ft'})
                </span>
              </div>
            </div>
          </div>

          {/* DORI Status */}
          <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {isHi ? 'CCTV निगरानी स्तर (DORI)' : 'Surveillance Rating (DORI)'}
              </div>
              <div className={`text-xs font-black truncate ${dori.color}`}>{dori.label}</div>
              <p className="text-[10px] text-slate-400 truncate">
                {isHi ? lensConfig.descriptionHi : lensConfig.description}
              </p>
            </div>
          </div>

          {/* Export & WhatsApp Quotation Buttons */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleDownloadSnapshot}
              className="flex-1 md:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
              title="Download Snapshot Image"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>{isHi ? 'नक्शा डाउनलोड' : 'Export PNG'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>{isHi ? 'WhatsApp पर कोटेशन' : 'Quote on WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
