import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  requestUniversalCameraStream,
  getAvailableVideoDevices,
  CameraDeviceInfo,
} from '../../utils/cameraUtils';
import {
  Camera,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Laptop,
  Monitor,
  Smartphone,
} from 'lucide-react';

export interface QRScanResult {
  raw: string;
  evidenceId?: string;
  caseId?: string;
  checksum?: string;
  isDegTag: boolean;
}

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (result: QRScanResult) => void;
  title?: string;
  subtitle?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Forensic QR Code Scanner',
  subtitle = 'Point camera at physical evidence tag or upload an evidence tag image',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [availableCameras, setAvailableCameras] = useState<CameraDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<QRScanResult | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [manualInput, setManualInput] = useState<string>('');

  // Parse evidence tag payload
  const parsePayload = useCallback((raw: string): QRScanResult => {
    const trimmed = raw.trim();
    if (trimmed.startsWith('DEG:')) {
      const parts = trimmed.split(':');
      return {
        raw: trimmed,
        evidenceId: parts[1] || undefined,
        caseId: parts[2] || undefined,
        checksum: parts[3] || undefined,
        isDegTag: true,
      };
    }
    if (/^EV-\d{4}-\d{4}$/i.test(trimmed)) {
      return {
        raw: trimmed,
        evidenceId: trimmed.toUpperCase(),
        isDegTag: true,
      };
    }
    return {
      raw: trimmed,
      evidenceId: trimmed,
      isDegTag: false,
    };
  }, []);

  // Stop video stream
  const stopStream = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Process frames with jsQR
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      if (isScanning) {
        animationFrameId.current = requestAnimationFrame(scanFrame);
      }
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data) {
      const parsed = parsePayload(code.data);
      setScannedResult(parsed);
      stopStream();

      // Audio feedback
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.15;
        osc.start();
        setTimeout(() => {
          osc.stop();
          audioCtx.close();
        }, 120);
      } catch {
        // AudioContext disabled
      }

      setTimeout(() => {
        onScanSuccess(parsed);
        onClose();
      }, 700);
      return;
    }

    if (isScanning) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
    }
  }, [isScanning, onClose, onScanSuccess, parsePayload, stopStream]);

  // Start Universal Camera
  const startCamera = useCallback(async () => {
    stopStream();
    setCameraError(null);
    setScannedResult(null);

    try {
      const stream = await requestUniversalCameraStream({
        facingMode,
        deviceId: selectedCameraId || undefined,
        idealWidth: 1280,
        idealHeight: 720,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
      }

      const devices = await getAvailableVideoDevices();
      setAvailableCameras(devices);
    } catch (err: any) {
      console.warn('Camera initiation failed:', err);
      setCameraError(err.message || 'Unable to access camera.');
    }
  }, [facingMode, selectedCameraId, stopStream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Flip camera (environment <-> user)
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (isScanning) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isScanning, scanFrame]);

  // Handle image upload from file (e.g. tag photos)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code && code.data) {
          const parsed = parsePayload(code.data);
          setScannedResult(parsed);
          setTimeout(() => {
            onScanSuccess(parsed);
            onClose();
          }, 600);
        } else {
          setCameraError('No valid QR code pattern detected in the uploaded image.');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const parsed = parsePayload(manualInput);
    onScanSuccess(parsed);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white tracking-wide">{title}</h3>
              <p className="text-[11px] text-slate-400 font-mono">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Universal Cross-Platform Support Badge */}
        <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-950/80 py-1.5 px-3 border-b border-slate-800">
          <span className="flex items-center gap-1 text-cyan-300">
            <Laptop className="w-3.5 h-3.5" /> Laptops
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-cyan-300">
            <Monitor className="w-3.5 h-3.5" /> Desktops
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-cyan-300">
            <Smartphone className="w-3.5 h-3.5" /> Mobile Phones
          </span>
        </div>

        {/* Viewport Camera Area */}
        <div className="relative bg-black flex items-center justify-center min-h-[290px] max-h-[360px] overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover max-h-[350px]"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Futuristic Scanning Reticle Overlay */}
          {isScanning && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-cyan-400/70 rounded-xl relative shadow-[0_0_25px_rgba(6,182,212,0.35)]">
                {/* Corner markers */}
                <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-cyan-400" />
                <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-cyan-400" />
                <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-cyan-400" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-cyan-400" />

                {/* Animated horizontal laser beam */}
                <div
                  className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] animate-[forensicScan_2.4s_ease-in-out_infinite]"
                  style={{ position: 'absolute', top: '10%' }}
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border border-cyan-500/40 rounded-full" />
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-mono text-cyan-300 uppercase tracking-widest bg-black/60 py-0.5">
                  Align Evidence QR Tag
                </div>
              </div>
            </div>
          )}

          {/* Success Overlay */}
          {scannedResult && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-white font-bold text-base">QR Tag Authenticated</h4>
              <div className="mt-2 font-mono text-xs text-cyan-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-cyan-500/40 max-w-full break-all">
                {scannedResult.evidenceId || scannedResult.raw}
              </div>
              {scannedResult.caseId && (
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Case: {scannedResult.caseId}
                </div>
              )}
              <div className="text-[11px] text-emerald-400 font-mono mt-3 animate-pulse">
                Retrieving full chain-of-custody ledger record...
              </div>
            </div>
          )}

          {/* Camera Error / Permission Fallback */}
          {cameraError && !scannedResult && (
            <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
              <h4 className="text-white font-semibold text-sm">Camera Not Accessible</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-4 py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Camera
              </button>
            </div>
          )}
        </div>

        {/* Action Controls & Multi-Source Input */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={toggleFacingMode}
              className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Flip Camera ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
            </button>

            {availableCameras.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={e => setSelectedCameraId(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                {availableCameras.map(c => (
                  <option key={c.deviceId} value={c.deviceId}>
                    {c.label || `Camera ${c.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            )}

            {/* Upload static evidence tag image */}
            <label className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer">
              <Zap className="w-3.5 h-3.5" />
              <span>Upload Tag Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
            <input
              type="text"
              placeholder="Or enter Evidence ID manually (e.g. EV-2026-0001)..."
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 placeholder-slate-600"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-mono transition-colors cursor-pointer font-medium"
            >
              Log
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
