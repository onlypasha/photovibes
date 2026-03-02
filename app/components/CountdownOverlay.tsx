"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CountdownOverlayProps {
    isOpen: boolean;
    count: number;
}

export default function CountdownOverlay({
    isOpen,
    count,
}: CountdownOverlayProps) {
    // We no longer need to clone the video stream since we overlay transparently

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                >
                    {/* UI Layer: Center Countdown */}
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                        <AnimatePresence mode="wait">
                            <motion.h1
                                key={count}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 0.9 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="text-[12rem] md:text-[18rem] lg:text-[22rem] leading-none font-bold text-white drop-shadow-2xl mix-blend-overlay"
                            >
                                {count > 0 ? count : "📸"}
                            </motion.h1>
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
