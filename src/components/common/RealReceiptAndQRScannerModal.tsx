import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  X,
  Camera,
  Upload,
  QrCode,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Copy,
  Check,
  Maximize2,
  FileX2,
  Info
} from 'lucide-react';

export interface ScannedReceiptResult {
  isValidPaymentReceipt?: boolean;
  rejectionReason?: string;
  receiptType?: string;
  merchantOrBank: string;
  receiptNumber: string;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: string;
  paymentType: 'SavingsDeposit' | 'LoanRepayment' | 'SharePurchase' | 'FinePayment' | 'General';
  payerName?: string;
  receiverName?: string;
  qrCodeData?: string;
  rawSummary: string;
  confidence: number;
  imageDataUrl?: string;
}

interface RealReceiptAndQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned?: (result: ScannedReceiptResult) => void;
  onQRCodeScanned?: (qrText: string) => void;
  initialMode?: 'camera' | 'upload';
  title?: string;
  subtitle?: string;
}

export const RealReceiptAndQRScannerModal: React.FC<RealReceiptAndQRScannerModalProps> = ({
  isOpen,
  onClose,
  onReceiptScanned,
  onQRCodeScanned,
  initialMode = 'camera',
  title = 'Scan & Uhakiki wa Resiti za Malipo (Live AI Verifier)',
  subtitle = 'Piga au pakia picha ya stakabadhi halisi ya PBZ, CRDB, NMB, M-Pesa, Mixx, Airtel Money au GePG.'
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>(initialMode);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanning & AI State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [detectedQR, setDetectedQR] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScannedReceiptResult | null>(null);
  const [isInvalidReceipt, setIsInvalidReceipt] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Play audio beep on successful detection
  const playScanBeep = (isSuccess: boolean = true) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      if (isSuccess) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12); // E6
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        // Error / rejection sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(180, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        'Kamera haijapatikana au ruhusa imezuiwa kwenye kivinjari chako. Unaweza kupakia picha moja kwa moja badala yake.'
      );
      setIsCameraActive(false);
    }
  }, [cameraFacing]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Real-time QR Code scanning loop from video element
  const scanVideoForQR = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive || isAnalyzing) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Run jsQR decoder
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data && code.data !== detectedQR) {
          setDetectedQR(code.data);
          playScanBeep(true);
          if (onQRCodeScanned) {
            onQRCodeScanned(code.data);
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoForQR);
  }, [isCameraActive, isAnalyzing, detectedQR, onQRCodeScanned]);

  // Initialize and clean up camera
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, startCamera, stopCamera]);

  // Trigger QR Loop when camera is active
  useEffect(() => {
    if (isCameraActive && activeTab === 'camera') {
      animationFrameRef.current = requestAnimationFrame(scanVideoForQR);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, activeTab, scanVideoForQR]);

  // Helper to parse QR Code image from a File or Data URL
  const extractQRFromDataUrl = (dataUrl: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = img.width;
        testCanvas.height = img.height;
        const ctx = testCanvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth'
        });
        resolve(code ? code.data : null);
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  };

  // Analyze Receipt with AI Backend with Anti-Fraud Validation
  const analyzeReceiptImage = async (dataUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress('Inachunguza uhalisi wa stakabadhi na QR Code kupitia AI Vision...');
    setScanResult(null);
    setIsInvalidReceipt(false);
    setRejectionReason(null);

    try {
      // 1. Check client-side QR Code first
      const foundQR = await extractQRFromDataUrl(dataUrl);
      if (foundQR) {
        setDetectedQR(foundQR);
      }

      setAnalysisProgress('Inakagua utambulisho wa benki, namba ya muamala na kiasi...');

      // 2. Call Server-Side Gemini OCR & Validator Endpoint
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: 'image/jpeg'
        })
      });

      const data = await response.json();

      // Check if server rejected the image because it is not a valid payment receipt
      if (data.isValidReceipt === false || data.extracted?.isValidPaymentReceipt === false) {
        setIsInvalidReceipt(true);
        setRejectionReason(
          data.rejectionReason ||
          data.extracted?.rejectionReason ||
          'Picha uliyopakia siyo risiti au kithibitisho halisi cha malipo ya fedha. Mfumo unakataa picha zote zisizohusu malipo ya kifedha.'
        );
        playScanBeep(false);
        return;
      }

      if (data.success && data.extracted) {
        const result: ScannedReceiptResult = {
          ...data.extracted,
          qrCodeData: foundQR || data.extracted.qrCodeData || '',
          imageDataUrl: dataUrl
        };
        setScanResult(result);
        setIsInvalidReceipt(false);
        setRejectionReason(null);
        playScanBeep(true);
      } else {
        throw new Error(data.error || 'Uchambuzi haukukamilika');
      }
    } catch (err: any) {
      console.warn('AI Receipt analysis error:', err);
      setIsInvalidReceipt(true);
      setRejectionReason('Hitilafu katika uhakiki wa picha. Tafadhali hakikisha unapiga picha safi na inayosomeka ya risiti ya malipo.');
      playScanBeep(false);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  // Capture Photo from Live Camera
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);

    // Run AI OCR & validation on snapshot
    analyzeReceiptImage(dataUrl);
  };

  // Handle File Upload (Manual Selection or Drag Drop)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      analyzeReceiptImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Copy helper
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Apply Scanned Data to Parent
  const handleApplyResult = () => {
    if (scanResult && !isInvalidReceipt && onReceiptScanned) {
      onReceiptScanned(scanResult);
      onClose();
    }
  };

  // Reset current scan
  const handleResetScan = () => {
    setCapturedImage(null);
    setScanResult(null);
    setIsInvalidReceipt(false);
    setRejectionReason(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="real-receipt-scanner-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black">{title}</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-extrabold text-[10px] border border-emerald-400/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  Anti-Fraud AI Verified
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium line-clamp-1">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Strict Verification Notice */}
        <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-4 py-2 flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Mfumo unaruhusu <strong>risiti halali za malipo pekee</strong> (PBZ, M-Pesa, Mixx, Airtel, GePG, TRA EFD). Picha nyingine zote zitakataliwa kiotomatiki.</span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              handleResetScan();
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Kamera ya Moja kwa Moja (Live Scanner)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Pakia Picha ya Resiti</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              {!capturedImage ? (
                <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-4/3 sm:aspect-16/10 flex items-center justify-center border-2 border-slate-800 shadow-inner">
                  {/* Hidden Canvas for QR processing */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Video Viewport */}
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-cover"
                  />

                  {/* Visual Scanner HUD Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                    {/* Top Status */}
                    <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 text-white text-[11px] font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Lenga Risiti ya Benki au Muamala katikati</span>
                    </div>

                    {/* Center Targeting Box */}
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 border-2 border-dashed border-emerald-400/80 rounded-3xl flex items-center justify-center overflow-hidden">
                      {/* Corner Target Markers */}
                      <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                      {/* Moving Laser Bar */}
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse" />

                      {detectedQR && (
                        <div className="absolute bottom-3 inset-x-3 bg-emerald-950/90 text-emerald-200 border border-emerald-500/60 p-2 rounded-xl text-center text-[11px] font-mono truncate shadow-lg">
                          ✨ QR Code Imetambuliwa: <strong>{detectedQR}</strong>
                        </div>
                      )}
                    </div>

                    {/* Bottom Prompt */}
                    <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-slate-300 text-[10px]">
                      Inakagua uhalisi wa risiti za PBZ, CRDB, NMB, M-Pesa, Mixx, Airtel & GePG
                    </div>
                  </div>

                  {/* Camera Error Fallback */}
                  {cameraError && (
                    <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                      <AlertCircle className="w-10 h-10 text-amber-400" />
                      <p className="text-xs text-slate-300 max-w-md">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Tumia Njia ya Kupakia Picha
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Preview of Captured Image */
                <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-4/3 sm:aspect-16/10 flex items-center justify-center border border-slate-800">
                  <img
                    src={capturedImage}
                    alt="Captured receipt"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleResetScan}
                    className="absolute top-4 right-4 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-md cursor-pointer border border-white/20"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Piga Tena</span>
                  </button>
                </div>
              )}

              {/* Camera Action Buttons */}
              {!capturedImage && (
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
                    }}
                    className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl transition-colors cursor-pointer"
                    title="Badilisha Kamera (Front / Back)"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    disabled={isAnalyzing}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl shadow-xl flex items-center gap-2 text-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Piga Picha na Uhakiki Resiti (AI Scan)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-3xl p-8 text-center hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer relative group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {capturedImage ? (
                  <div className="space-y-3">
                    <img
                      src={capturedImage}
                      alt="Uploaded receipt"
                      className="max-h-60 mx-auto rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md object-contain"
                    />
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Bofya kubadilisha picha nyingine
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        Pakia Picha ya Resiti au Screenshot ya Muamala
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                        Inakubali stakabadhi za PBZ, CRDB, NMB, M-Pesa, Mixx, Airtel Money au GePG. Picha zisizohusu malipo hazitapokewa.
                      </p>
                    </div>
                    <span className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-xs">
                      Chagua Faili Kwenye Kifaa
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ANALYSIS IN PROGRESS LOADER */}
          {isAnalyzing && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin shrink-0" />
              <div>
                <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                  AI Inachunguza na Kuhakiki Risiti...
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {analysisProgress || 'Inakagua iwapo picha ni stakabadhi halisi ya muamala...'}
                </p>
              </div>
            </div>
          )}

          {/* REJECTED / INVALID IMAGE ALERT */}
          {isInvalidReceipt && !isAnalyzing && (
            <div className="bg-red-50 dark:bg-red-950/40 rounded-2xl border-2 border-red-300 dark:border-red-800 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-red-900 dark:text-red-200">
                      Picha Imekataliwa: Siyo Risiti Halali ya Malipo
                    </h4>
                    <span className="px-2 py-0.5 bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-300 font-extrabold text-[10px] rounded-md">
                      HAIRUHUSIWI
                    </span>
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                    {rejectionReason || 'Picha uliyoweka haijatambuliwa kama risiti wala kithibitisho cha malipo ya fedha.'}
                  </p>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-red-200 dark:border-red-900/40 text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5">
                <span className="font-bold block text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileX2 className="w-3.5 h-3.5 text-red-500" /> Kanuni za Mfumo wa SACCOS Zanzibar:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                  <li>Picha za watu, picha za mazingira, wanyama, memes au nyaraka zisizohusu malipo haziwezi kupokewa.</li>
                  <li>Tafadhali weka picha safi ya <strong>Stakabadhi ya Benki (PBZ, CRDB, NMB)</strong> au <strong>Screenshot ya SMS ya M-Pesa / Mixx / Airtel Money / GePG</strong>.</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Jaribu Tena na Risiti Halisi</span>
                </button>
              </div>
            </div>
          )}

          {/* EXTRACTED VALID RESULT CARD */}
          {scanResult && !isInvalidReceipt && !isAnalyzing && (
            <div className="bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Risiti ya Malipo Imethibitishwa (AI Verified)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Uhakika wa AI: <strong>{Math.round(scanResult.confidence * 100)}%</strong>
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg text-xs border border-emerald-300 dark:border-emerald-700">
                  {scanResult.merchantOrBank}
                </span>
              </div>

              {/* Data Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Receipt Number */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Namba ya Risiti / TxID</span>
                    <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                      {scanResult.receiptNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(scanResult.receiptNumber, 'receiptNo')}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
                    title="Copy"
                  >
                    {copiedField === 'receiptNo' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Amount */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Kiasi Kilicholipwa</span>
                    <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                      TZS {scanResult.amount.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-bold">
                    {scanResult.currency}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Njia ya Malipo</span>
                  <span className="font-bold text-slate-900 dark:text-white">{scanResult.paymentMethod}</span>
                </div>

                {/* Date */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Tarehe ya Risiti</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{scanResult.date}</span>
                </div>

                {/* QR Code Payload (if detected) */}
                {scanResult.qrCodeData && (
                  <div className="col-span-1 sm:col-span-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5" /> Data ya QR Code / Barcode
                      </span>
                      <p className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all">
                        {scanResult.qrCodeData}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(scanResult.qrCodeData!, 'qrData')}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer shrink-0"
                    >
                      {copiedField === 'qrData' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Swahili Summary */}
              {scanResult.rawSummary && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
                  "{scanResult.rawSummary}"
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Soma Resiti Nyingine
                </button>

                <button
                  type="button"
                  onClick={handleApplyResult}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Thibitisha na Tumia Risiti Hii</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

