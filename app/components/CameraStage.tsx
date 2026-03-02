"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  RefreshCw,
  Maximize,
  Timer,
  Zap,
  ZapOff,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import CountdownOverlay from "./CountdownOverlay";
import EffectPanel from "./EffectPanel";
import {
  effects as allEffects,
  getEffectById,
  buildCssFilter,
  type EffectDefinition,
} from "../effects/effectDefinitions";
import { processors } from "../effects/effectProcessors";
import { usePhotoStore } from "../hooks/usePhotoStore";

const TIMER_OPTIONS = [0, 3, 5, 10];
const RENDER_SCALE = 0.5;

export default function CameraStage() {
  const [showCountdown, setShowCountdown] = useState(false);
  const [activeEffectId, setActiveEffectId] = useState("normal");
  const [timerIndex, setTimerIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [showOverlayText, setShowOverlayText] = useState(true);
  const [flashMode, setFlashMode] = useState<"auto" | "on" | "off">("auto");
  const [intensity, setIntensity] = useState(100);
  const [showEffectPanel, setShowEffectPanel] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isCapturing = useRef(false);
  const handleCaptureRef = useRef<() => void>(() => {});
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const { addPhoto } = usePhotoStore();

  const timerDuration = TIMER_OPTIONS[timerIndex];
  const activeEffect = getEffectById(activeEffectId) || allEffects[0];

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          if (playErr instanceof DOMException && playErr.name === "AbortError")
            return;
          throw playErr;
        }
        setCameraReady(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Could not access camera. Please check permissions.");
      setCameraReady(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  useEffect(() => {
    if (!cameraReady) return;

    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    if (!video || !canvas) return;

    if (activeEffectId === "normal") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const rw = Math.round(video.videoWidth * RENDER_SCALE);
      const rh = Math.round(video.videoHeight * RENDER_SCALE);
      if (canvas.width !== rw || canvas.height !== rh) {
        canvas.width = rw;
        canvas.height = rh;
      }

      ctx.save();

      if (facingMode === "user") {
        ctx.translate(rw, 0);
        ctx.scale(-1, 1);
      }

      if (activeEffect.type === "css" && activeEffect.cssFilter) {
        ctx.filter = buildCssFilter(activeEffect, intensity);
      } else {
        ctx.filter = "none";
      }

      ctx.drawImage(video, 0, 0, rw, rh);
      ctx.restore();

      if (activeEffect.type === "canvas" && activeEffect.canvasProcessor) {
        const processor = processors[activeEffect.canvasProcessor];
        if (processor) {
          processor(ctx, rw, rh, intensity, frameRef.current);
        }
      }

      frameRef.current++;
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [cameraReady, activeEffect, facingMode, intensity, activeEffectId]);

  const doCapture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return;

    try {
      const frameBitmap = await createImageBitmap(video);

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        frameBitmap.close();
        return;
      }

      const isMirrored = facingMode === "user";
      const cssFilter =
        activeEffect.type === "css" && activeEffect.cssFilter
          ? buildCssFilter(activeEffect, intensity)
          : "none";

      ctx.save();
      ctx.filter = cssFilter;
      if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(frameBitmap, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      if (activeEffect.type === "canvas" && activeEffect.canvasProcessor) {
        const processor = processors[activeEffect.canvasProcessor];
        if (processor) {
          processor(ctx, canvas.width, canvas.height, intensity, frameRef.current);
        }
      }

      frameBitmap.close();

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      addPhoto(dataUrl, activeEffect.name, intensity);
    } catch (error) {
      console.error("Error during photo capture:", error);
      throw error;
    }
  }, [activeEffect, facingMode, intensity, addPhoto]);

  const measureBrightness = useCallback((): number => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return 0;

    const sampleCanvas = document.createElement("canvas");
    const sampleSize = 64;
    sampleCanvas.width = sampleSize;
    sampleCanvas.height = sampleSize;
    const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!sampleCtx) return 0;

    sampleCtx.drawImage(video, 0, 0, sampleSize, sampleSize);
    const imageData = sampleCtx.getImageData(0, 0, sampleSize, sampleSize);
    const data = imageData.data;

    let totalLuminance = 0;
    const pixelCount = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      // ITU-R BT.709 luminance
      totalLuminance += data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
    }

    return totalLuminance / pixelCount;
  }, []);

  const capturePhoto = useCallback(() => {
    if (isCapturing.current) return;
    isCapturing.current = true;

    let shouldFlash: boolean;
    if (flashMode === "on") {
      shouldFlash = true;
    } else if (flashMode === "off") {
      shouldFlash = false;
    } else {
      // "auto": flash only when scene is dark (brightness below ~40% of max)
      const brightness = measureBrightness();
      shouldFlash = brightness < 100;
    }

    const resetCapturing = () => {
      isCapturing.current = false;
    };

    if (shouldFlash) {
      setShowFlash(true);
      setTimeout(async () => {
        try {
          await doCapture();
        } catch (error) {
          console.error("Error during flash capture:", error);
        } finally {
          setTimeout(() => {
            setShowFlash(false);
            resetCapturing();
          }, 300);
        }
      }, 150);
    } else {
      (async () => {
        try {
          await doCapture();
        } catch (error) {
          console.error("Error during capture:", error);
        } finally {
          setTimeout(() => {
            resetCapturing();
          }, 500);
        }
      })();
    }
  }, [flashMode, doCapture, measureBrightness]);

  useEffect(() => {
    handleCaptureRef.current = capturePhoto;
  }, [capturePhoto]);

  const handleCapture = useCallback(() => {
    handleCaptureRef.current();
    setShowCountdown(false);
    setCount(0);
  }, []);

  useEffect(() => {
    if (!showCountdown) {
      // Clear interval when countdown mode is disabled
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
      return;
    }

    // Clear any existing interval before creating a new one
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }

    setCount(timerDuration); 

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
          }
          handleCaptureRef.current();
          setShowCountdown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    countdownInterval.current = interval;

    // Cleanup function to clear interval on component unmount
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
    };
  }, [showCountdown, timerDuration]); 

  const cancelCountdown = useCallback(() => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    setShowCountdown(false);
    setCount(0);
  }, []);

  const handleShutterClick = useCallback(() => {
    if (timerDuration > 0) {
      setShowCountdown(true);
    } else {
      handleCapture();
    }
  }, [timerDuration, handleCapture]);

  const cycleTimer = () => setTimerIndex((prev) => (prev + 1) % TIMER_OPTIONS.length);
  const cycleFlash = () => setFlashMode((prev) => prev === "auto" ? "on" : prev === "on" ? "off" : "auto");
  const flipCamera = () => setFacingMode((prev) => prev === "user" ? "environment" : "user");
  const handleSelectEffect = (effect: EffectDefinition) => {
    setActiveEffectId(effect.id);
    setIntensity(effect.defaultIntensity ?? 100);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !showCountdown && cameraReady) {
        e.preventDefault();
        handleShutterClick();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showCountdown, cameraReady, handleShutterClick]);

  return (
    <>
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={captureCanvasRef} className="hidden" />

      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 bg-white z-[100] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-col items-center w-full max-w-4xl">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] ring-4 ring-offset-4 ring-offset-background-light ring-primary/30 group"
          >
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className={`absolute inset-0 w-full h-full object-cover ${activeEffectId === 'normal' ? 'block' : 'hidden'}`}
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
            <canvas 
              ref={previewCanvasRef} 
              className={`absolute inset-0 w-full h-full object-cover ${activeEffectId !== 'normal' ? 'block' : 'hidden'}`} 
            />

            {!cameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30">
                {cameraError ? (
                  <div className="text-center px-8">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-white text-lg font-medium mb-2">
                      Camera Access Required
                    </p>
                    <p className="text-gray-400 text-sm mb-6">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="bg-primary text-primary-content font-bold px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg font-medium">Starting camera...</p>
                  </div>
                )}
              </div>
            )}

            <AnimatePresence>
              {cameraReady && !showCountdown && showOverlayText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                >
                  <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-lg tracking-tight floating-text text-center leading-none opacity-60">
                    Ready?
                    <br />
                    <span className="text-primary">Smile!</span>
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
              <button
                onClick={flipCamera}
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-primary hover:text-primary-content transition-all flex items-center justify-center group/btn"
              >
                <RefreshCw className="w-5 h-5 group-hover/btn:animate-spin" />
              </button>
              <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-primary hover:text-primary-content transition-all flex items-center justify-center">
                <Maximize className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowOverlayText((prev) => !prev)}
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-primary hover:text-primary-content transition-all flex items-center justify-center"
              >
                {showOverlayText ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="absolute bottom-6 left-6 flex gap-3 z-20">
              <button
                onClick={cycleTimer}
                className="h-10 px-4 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Timer className="w-4 h-4" />
                <span>{timerDuration === 0 ? "Off" : `${timerDuration}s`}</span>
              </button>
              <button
                onClick={cycleFlash}
                className={`h-10 px-4 rounded-full backdrop-blur-md hover:bg-white hover:text-black transition-all flex items-center gap-2 text-sm font-medium ${
                  flashMode === "on"
                    ? "bg-primary text-black"
                    : flashMode === "off"
                    ? "bg-black/40 text-white/50"
                    : "bg-black/40 text-white"
                }`}
              >
                {flashMode === "off" ? (
                  <ZapOff className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span className="capitalize">{flashMode}</span>
              </button>
            </div>

            <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
              <button
                onClick={() => setShowEffectPanel(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer ${
                  activeEffectId !== "normal"
                    ? "bg-primary text-primary-content"
                    : "bg-black/40 backdrop-blur-md text-white hover:bg-primary hover:text-primary-content"
                }`}
              >
                {`${activeEffect.icon} ${activeEffect.name}`}
              </button>
            </div>
          </motion.div>

          <div className="w-full mt-6 flex flex-col items-center gap-4 min-h-[100px] justify-center">
            <AnimatePresence mode="wait">
              {!showCountdown || count === 0 ? (
                <motion.button
                  key="shutter-btn"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShutterClick}
                  disabled={!cameraReady}
                  className="shutter-btn w-20 h-20 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center relative group transition-all duration-300 disabled:opacity-50"
                >
                  <div className="absolute inset-0 rounded-full border-2 border-gray-200 group-hover:border-primary transition-colors" />
                  <div className="w-16 h-16 rounded-full bg-rose-500 group-hover:bg-rose-600 shadow-inner flex items-center justify-center transition-colors">
                    <Camera className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              ) : (
                <motion.div
                  key="cancel-pill"
                  initial={{ scale: 0.8, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex items-center gap-2 bg-neutral-900/60 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-2xl"
                >
                  <div className="flex items-center gap-2 px-4 py-2 text-white/90 font-medium min-w-[80px] justify-center border-r border-white/10">
                    <Timer className="w-5 h-5" />
                    <span className="text-lg tabular-nums">{count}s</span>
                  </div>
                  <button
                    onClick={cancelCountdown}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-full font-bold hover:bg-[#e6e205] transition-colors active:scale-95"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <EffectPanel
        isOpen={showEffectPanel}
        onClose={() => setShowEffectPanel(false)}
        activeEffectId={activeEffectId}
        intensity={intensity}
        onIntensityChange={setIntensity}
        stream={streamRef.current}
        effects={allEffects}
        onSelectEffect={(effect) => {
          handleSelectEffect(effect);
          setShowEffectPanel(false);
        }}
      />

      <CountdownOverlay isOpen={showCountdown && count > 0} count={count} />
    </>
  );
}
