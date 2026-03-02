"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
    effects as allEffects,
    buildCssFilter,
    type EffectDefinition,
} from "../effects/effectDefinitions";
import { processors } from "../effects/effectProcessors";

const GRID_SIZE = 9; // 3x3
// Lower resolution for grid previews to maintain performance
const PREVIEW_SCALE = 0.2;

interface EffectPanelProps {
    isOpen: boolean;
    onClose: () => void;
    activeEffectId: string;
    intensity: number;
    onIntensityChange: (v: number) => void;
    onSelectEffect: (effect: EffectDefinition) => void;
    stream: MediaStream | null;
    effects: EffectDefinition[];
}

function LiveEffectCell({
    effect,
    video, // shared video element source
    isActive,
    onClick,
}: {
    effect: EffectDefinition;
    video: HTMLVideoElement | null;
    isActive: boolean;
    onClick: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const frameRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        let running = true;

        const render = () => {
            if (!running) return;

            if (video.readyState >= 2) {
                // Set low-res canvas size for performance
                const w = Math.floor(video.videoWidth * PREVIEW_SCALE);
                const h = Math.floor(video.videoHeight * PREVIEW_SCALE);

                if (canvas.width !== w || canvas.height !== h) {
                    canvas.width = w;
                    canvas.height = h;
                }

                ctx.save();
                // Mirror for selfie feel
                ctx.translate(w, 0);
                ctx.scale(-1, 1);

                // Apply CSS filter for CSS-type effects if any
                if (effect.type === "css" && effect.cssFilter) {
                    // Use default intensity for preview if not active, else use whatever (but here we just use default/100 for preview grid)
                    ctx.filter = buildCssFilter(effect, effect.defaultIntensity ?? 100);
                } else {
                    ctx.filter = "none";
                }

                ctx.drawImage(video, 0, 0, w, h);
                ctx.restore();

                // Apply canvas processor
                if (effect.type === "canvas" && effect.canvasProcessor) {
                    const processor = processors[effect.canvasProcessor];
                    if (processor) {
                        // Use default intensity for previews to show off the effect best
                        const previewIntensity = effect.defaultIntensity ?? 70;
                        processor(ctx, w, h, previewIntensity, frameRef.current);
                    }
                }

                frameRef.current++;
            }
            rafRef.current = requestAnimationFrame(render);
        };

        rafRef.current = requestAnimationFrame(render);

        return () => {
            running = false;
            cancelAnimationFrame(rafRef.current);
        };
    }, [video, effect]);

    return (
        <button
            onClick={onClick}
            className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${isActive
                ? "ring-[3px] ring-primary scale-[1.02] shadow-lg z-10"
                : "ring-1 ring-white/10 hover:ring-primary/60 hover:scale-[1.01]"
                }`}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
            />

            {/* Label Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full p-2 z-10 text-left pointer-events-none">
                <span className="text-xs md:text-sm font-bold text-white drop-shadow-md tracking-wide">
                    {effect.name}
                </span>
            </div>

            {/* Active Check */}
            {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10 shadow-sm pointer-events-none">
                    <svg
                        className="w-3 h-3 text-primary-content"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </button>
    );
}

export default function EffectPanel({
    isOpen,
    onClose,
    activeEffectId,
    onSelectEffect,
    stream,
    effects,
}: EffectPanelProps) {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(effects.length / GRID_SIZE);

    // Use state to store the video element so children re-render when it's available
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (videoElement && stream) {
            videoElement.srcObject = stream;
            videoElement.play().catch(() => { });
        }
    }, [stream, videoElement]);

    // Reset page to current effect when opening
    useEffect(() => {
        if (isOpen) {
            const idx = effects.findIndex((e) => e.id === activeEffectId);
            if (idx >= 0) setPage(Math.floor(idx / GRID_SIZE));
        }
    }, [isOpen, activeEffectId, effects]);

    const pageEffects = effects.slice(page * GRID_SIZE, page * GRID_SIZE + GRID_SIZE);
    const prevPage = () => setPage((p) => Math.max(0, p - 1));
    const nextPage = () => setPage((p) => Math.min(totalPages - 1, p + 1));

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[80] bg-neutral-dark/95 backdrop-blur-md flex flex-col"
                >
                    {/* Shared source video - use opacity-0 instead of hidden to ensure it plays */}
                    <video
                        ref={setVideoElement}
                        playsInline
                        autoPlay
                        muted
                        className="absolute opacity-0 pointer-events-none w-1 h-1"
                    />

                    {/* Grid Content */}
                    <motion.main
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden w-full max-w-5xl mx-auto"
                    >
                        <div className="w-full h-full max-h-[75vh] flex flex-col justify-center items-center gap-4 overflow-y-auto scrollbar-thin">
                            {/* Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-4xl auto-rows-fr">
                                {pageEffects.map((effect) => (
                                    <LiveEffectCell
                                        key={effect.id}
                                        effect={effect}
                                        video={videoElement}
                                        isActive={effect.id === activeEffectId}
                                        onClick={() => onSelectEffect(effect)}
                                    />
                                ))}
                                {/* Fillers to maintain grid shape if needed, or just let it flow */}
                                {pageEffects.length < GRID_SIZE &&
                                    Array.from({ length: GRID_SIZE - pageEffects.length }).map(
                                        (_, i) => (
                                            <div
                                                key={`empty-${i}`}
                                                className="hidden md:block aspect-video rounded-lg bg-white/5 border border-white/5"
                                            />
                                        )
                                    )}
                            </div>
                        </div>
                    </motion.main>

                    {/* Controls Footer */}
                    <div className="shrink-0 pb-8 pt-2 flex flex-col items-center gap-4">
                        {/* Nav Buttons */}
                        <div className="flex gap-6">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={prevPage}
                                disabled={page === 0}
                                className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center disabled:opacity-30 shadow-lg shadow-primary/20"
                            >
                                <ChevronUp className="w-8 h-8" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={nextPage}
                                disabled={page >= totalPages - 1}
                                className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center disabled:opacity-30 shadow-lg shadow-primary/20"
                            >
                                <ChevronDown className="w-8 h-8" />
                            </motion.button>
                        </div>

                        {/* Page Dots */}
                        <div className="flex gap-2 mt-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 rounded-full transition-all duration-300 ${i === page ? "w-6 bg-primary" : "w-2 bg-white/20"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
