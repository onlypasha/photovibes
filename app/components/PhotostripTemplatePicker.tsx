"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ImageIcon } from "lucide-react";
import type { PhotostripTemplate } from "../effects/photostripConfig";

interface PhotostripTemplatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    templates: PhotostripTemplate[];
    activeTemplateId: string;
    onSelectTemplate: (index: number) => void;
}

export default function PhotostripTemplatePicker({
    isOpen,
    onClose,
    templates,
    activeTemplateId,
    onSelectTemplate,
}: PhotostripTemplatePickerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Compact Modal Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="bg-neutral-dark/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pt-5 pb-3">
                            <div>
                                <h2 className="text-lg font-bold text-white">Choose Template</h2>
                                <p className="text-white/40 text-xs mt-0.5">Pick a frame for your photostrip</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 gap-3 px-5 pb-5">
                            {templates.map((template, index) => {
                                const isActive = template.id === activeTemplateId;
                                return (
                                    <motion.button
                                        key={template.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: 0.05 + index * 0.04,
                                            duration: 0.25,
                                        }}
                                        onClick={() => onSelectTemplate(index)}
                                        className={`group relative rounded-lg overflow-hidden transition-all duration-200 bg-white/5 border-2 ${isActive
                                            ? "border-primary shadow-md shadow-primary/20"
                                            : "border-white/10 hover:border-primary/50"
                                            }`}
                                    >
                                        {/* Frame Thumbnail */}
                                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/20">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={template.src}
                                                alt={template.name}
                                                className="w-full h-full object-contain p-1.5"
                                                loading="lazy"
                                            />

                                            {/* Active checkmark */}
                                            {isActive && (
                                                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10 shadow-sm">
                                                    <svg
                                                        className="w-3 h-3 text-primary-content"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={3}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Footer */}
                                        <div className="px-2 py-1.5 text-left">
                                            <p
                                                className={`text-xs font-bold truncate ${isActive ? "text-primary" : "text-white"
                                                    }`}
                                            >
                                                {template.name}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <ImageIcon className="w-2.5 h-2.5 text-white/40" />
                                                <span className="text-[10px] text-white/40">
                                                    {template.photosRequired} photos
                                                </span>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
