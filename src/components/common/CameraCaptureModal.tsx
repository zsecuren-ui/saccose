import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RotateCcw,
  Check,
  X,
  FlipHorizontal,
  Sparkles,
  AlertTriangle,
  Upload,
  RefreshCw,
  Sun,
  ShieldCheck,
  Video,
  Timer,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "Piga Picha ya Profile (Camera Capture)",
  subtitle = "Weka uso wako ndani ya fremu kisha bonyeza kitufe cha kamera kupiga picha."
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileFallbackInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [useCountdownTimer, setUseCountdownTimer] = useState(false);

  // Play synthetic camera shutter sound via Web Audio API
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      }
    } catch {
      // Audio context might be restricted before interaction; safe to ignore
    }
  }, []);

  // Stop current active media stream tracks
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
  }, [stream]);

  // Check available camera devices
  const checkCameraDevices = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (err) {
        console.warn('Unable to enumerate camera devices:', err);
      }
    }
  }, []);

  // Initialize and start camera stream
  const startCamera = useCallback(async () => {
    setIsLoadingCamera(true);
    setCameraError(null);
    stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Kifaa chako hakiruhusu kamera ya moja kwa moja kwenye browser hii. Unaweza kupakia picha kutoka kwenye simu yako.');
      setIsLoadingCamera(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }

      await checkCameraDevices();
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const errorMsg = (err as Error).message || '';
      if (errorMsg.includes('Permission') || errorMsg.includes('NotAllowedError')) {
        setCameraError('Ruhusa ya kamera imezuiwa. Tafadhali ruhusu kamera (Allow Camera) kwenye browser au tumia kitufe cha "Pakia Picha".');
      } else if (errorMsg.includes('NotFound') || errorMsg.includes('DevicesNotFoundError')) {
        setCameraError('Hakuna kamera iliyopatikana kwenye kifaa hiki. Unaweza kupakia picha kutoka kwenye simu au kompyuta yako.');
      } else {
        setCameraError('Imeshindikana kuunganisha kamera. Tafadhali hakikisha programu nyingine haitumii kamera, au pakia picha moja kwa moja.');
      }
    } finally {
      setIsLoadingCamera(false);
    }
  }, [facingMode, stopStream, checkCameraDevices]);

  // When modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setCountdown(null);
      startCamera();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Handle camera switch (Front/Back)
  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    setIsMirrored(prev => !prev);
  };

  // Perform actual snapshot capture from video feed onto square canvas
  const performSnap = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    // Crop square center
    const size = Math.min(videoWidth, videoHeight);
    const startX = (videoWidth - size) / 2;
    const startY = (videoHeight - size) / 2;

    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.save();
      // Mirror if user mode and mirrored
      if (facingMode === 'user' && isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        video,
        startX,
        startY,
        size,
        size,
        0,
        0,
        canvas.width,
        canvas.height
      );
      ctx.restore();

      // Trigger flash effect and shutter sound
      setIsFlashActive(true);
      playShutterSound();
      setTimeout(() => setIsFlashActive(false), 200);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      stopStream();
    }
  };

  // Trigger shutter click with optional countdown
  const handleShutterClick = () => {
    if (useCountdownTimer) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            performSnap();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      performSnap();
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setCountdown(null);
    startCamera();
  };

  // Confirm photo and pass back
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopStream();
      onClose();
    }
  };

  // Handle local image upload as direct fallback
  const handleFallbackFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Tafadhali chagua picha yenye ukubwa chini ya 8MB.');
        return;
      }
      // Compress user-uploaded fallback images to reasonable size
      (async () => {
        try {
          const r = new FileReader();
          const data = await new Promise<string>((res, rej) => {
            r.onloadend = () => res(r.result as string);
            r.onerror = rej;
            r.readAsDataURL(file);
          });
          const { compressDataUrl } = await import('../../lib/imageUtils');
          const compressed = await compressDataUrl(data, 800, 800, 0.85, 'image/jpeg');
          setCapturedImage(compressed);
          stopStream();
        } catch (err) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setCapturedImage(reader.result);
              stopStream();
            }
          };
          reader.readAsDataURL(file);
        }
      })();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        
        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden file input fallback */}
        <input
          type="file"
          ref={fileFallbackInputRef}
          accept="image/*"
          capture="user"
          onChange={handleFallbackFileUpload}
          className="hidden"
        />

        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                <span>{title}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Live HD
                </span>
              </h3>
              <p className="text-slate-400 text-xs line-clamp-1">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Funga (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport or Captured Preview */}
        <div className="relative flex-1 min-h-[320px] sm:min-h-[380px] bg-slate-950 overflow-hidden flex items-center justify-center p-4">
          
          {/* Visual Flash effect overlay */}
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {/* Captured Preview State */}
          {capturedImage ? (
            <div className="relative w-full flex flex-col items-center justify-center">
              <div className="relative aspect-square w-64 sm:w-72 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-emerald-500/40 animate-in zoom-in-95 duration-200">
                <img
                  src={capturedImage}
                  alt="Captured Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md rounded-xl p-1.5 text-center text-[10px] text-emerald-300 font-bold border border-emerald-500/20">
                  ✓ Picha imepigwa kikamilifu
                </div>
              </div>
            </div>
          ) : (
            /* Live Camera Stream State */
            <div className="relative w-full flex items-center justify-center">
              
              {/* Video Element */}
              <div className="relative aspect-square w-64 sm:w-72 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === 'user' && isMirrored ? 'scale-x-[-1]' : ''
                  }`}
                />

                {/* Loading State Spinner */}
                {isLoadingCamera && (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 z-20">
                    <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                    <span className="text-xs text-slate-300 font-medium">Inafungua kamera...</span>
                  </div>
                )}

                {/* Error State */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 p-4 flex flex-col items-center justify-center text-center gap-3 z-30">
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {cameraError}
                    </p>
                    <div className="flex flex-col gap-2 w-full mt-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Jaribu Tena Kamera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileFallbackInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Pakia Picha Kutoka Kwenye Simu / Kompyuta</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Live Framing Guideline (Circle Mask overlay) */}
                {!cameraError && !isLoadingCamera && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Elliptical Face Alignment Ring */}
                    <div className="w-48 h-56 rounded-[50%] border-2 border-dashed border-emerald-400/60 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] flex items-center justify-center">
                      <div className="text-emerald-400/80 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-slate-950/60 rounded-full backdrop-blur-xs">
                        Weka Uso Hapa
                      </div>
                    </div>
                  </div>
                )}

                {/* Countdown Timer Display */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-30 animate-in zoom-in-75 duration-150">
                    <span className="text-7xl font-black text-white drop-shadow-[0_4px_16px_rgba(16,185,129,0.8)] animate-pulse">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Mirror Toggle Button */}
                {!cameraError && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                    <button
                      type="button"
                      onClick={() => setIsMirrored(prev => !prev)}
                      className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                        isMirrored
                          ? 'bg-emerald-500/30 border-emerald-400/40 text-emerald-300'
                          : 'bg-slate-900/70 border-slate-700 text-slate-400'
                      }`}
                      title={isMirrored ? 'Kioo: Imewashwa (Mirrored)' : 'Kioo: Imezimwa (Normal)'}
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Countdown Setting Toggle */}
                {!cameraError && (
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
                    <button
                      type="button"
                      onClick={() => setUseCountdownTimer(prev => !prev)}
                      className={`px-2.5 py-1 rounded-xl backdrop-blur-md border flex items-center gap-1.5 text-[10px] font-bold transition-all cursor-pointer ${
                        useCountdownTimer
                          ? 'bg-amber-500/30 border-amber-400/40 text-amber-300'
                          : 'bg-slate-900/70 border-slate-700 text-slate-400'
                      }`}
                      title="Kipima Muda (3s Timer)"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>{useCountdownTimer ? '3s Timer' : 'Papo Hapo'}</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800">
          
          {capturedImage ? (
            /* Controls after photo is taken */
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Piga Tena (Retake)</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 transition-transform active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Tumia Picha Hii (Apply)</span>
              </button>
            </div>
          ) : (
            /* Live Camera Controls */
            <div className="flex items-center justify-between gap-3">
              
              {/* Flip Camera Button (if multiple cameras or on mobile) */}
              <button
                type="button"
                onClick={toggleCameraFacing}
                disabled={isLoadingCamera || !!cameraError}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Geuza Kamera (Switch Front/Back Camera)"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Geuza Kamera</span>
              </button>

              {/* Main Shutter Button */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleShutterClick}
                  disabled={isLoadingCamera || !!cameraError || countdown !== null}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 p-1 shadow-lg shadow-emerald-500/30 flex items-center justify-center group active:scale-90 transition-transform disabled:opacity-40 cursor-pointer border-4 border-slate-900 ring-4 ring-emerald-500/40"
                  title="Piga Picha (Snap Photo)"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:scale-95 transition-transform">
                    <Camera className="w-6 h-6 text-emerald-700" />
                  </div>
                </button>
              </div>

              {/* Upload fallback button */}
              <button
                type="button"
                onClick={() => fileFallbackInputRef.current?.click()}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Pakia Kutoka Kwenye Faili"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Pakia Faili</span>
              </button>

            </div>
          )}

          {/* Help footer note */}
          <p className="text-[10px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Picha yako inasafishwa na kuhifadhiwa salama kwenye wasifu wako wa SACCOS.</span>
          </p>

        </div>

      </div>
    </div>
  );
};
