"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Camera,
    Settings,
    Download,
    Trash2,
    ImageIcon,
} from "lucide-react";
import { usePhotoStore } from "../hooks/usePhotoStore";

function timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" as const },
    },
};

export default function GalleryPage() {
    const { photos, deletePhoto } = usePhotoStore();

    const handleDownload = (src: string, id: string) => {
        const link = document.createElement("a");
        link.href = src;
        link.download = `photovibes-${id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this photo?")) {
            deletePhoto(id);
        }
    };

    return (
        <div className="bg-background-light text-neutral-dark font-display min-h-screen flex flex-col transition-colors duration-300">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-background-light/90 backdrop-blur-sm border-b border-primary/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Left: Back Button */}
                        <div className="flex-shrink-0">
                            <Link
                                href="/"
                                className="group flex items-center gap-2 bg-primary hover:bg-primary/80 text-neutral-dark px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                Back to Camera
                            </Link>
                        </div>

                        {/* Center: Logo */}
                        <div className="hidden md:flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <Camera className="w-5 h-5 text-neutral-dark" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">
                                PhotoVibes
                            </span>
                        </div>

                        {/* Right: Settings */}
                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                                <Settings className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header Section */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
                            My Photos
                        </h1>
                        <p className="text-neutral-dark/60 text-lg font-medium">
                            {photos.length} {photos.length === 1 ? "memory" : "memories"} captured
                        </p>
                    </motion.div>
                </header>

                {/* Empty State */}
                {photos.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                            <ImageIcon className="w-20 h-20 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold mb-3">No photos yet!</h2>
                        <p className="text-neutral-dark/60 mb-8 max-w-md text-lg">
                            Your gallery is looking a little empty. Time to strike a pose and make some magic.
                        </p>
                        <Link
                            href="/"
                            className="bg-primary text-neutral-dark font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg"
                        >
                            Start Camera
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* Photo Grid */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                        >
                            <AnimatePresence>
                                {photos.map((photo) => (
                                    <motion.div
                                        key={photo.id}
                                        variants={cardVariants}
                                        layout
                                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                        className="photo-card group relative aspect-square rounded-xl overflow-hidden shadow-lg bg-white ring-1 ring-black/5"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            alt={`Photo with ${photo.effect} effect`}
                                            className="w-full h-full object-cover"
                                            src={photo.src}
                                        />

                                        {/* Effect Badge + Timestamp */}
                                        <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex items-center gap-2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary text-neutral-dark shadow-sm">
                                                {photo.effect}
                                            </span>
                                            <span className="text-xs font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                                                {timeAgo(photo.timestamp)}
                                            </span>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="overlay absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 p-6">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleDownload(photo.src, photo.id)}
                                                    className="w-12 h-12 rounded-full bg-white text-neutral-dark flex items-center justify-center hover:bg-primary transition-colors shadow-lg"
                                                    title="Download"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(photo.id)}
                                                className="flex items-center gap-2 text-white hover:text-red-400 transition-colors text-sm font-semibold mt-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-background-light border-t border-neutral-200 py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-neutral-dark/40 text-sm">
                        © 2025 PhotoVibes. Capture the moment.
                    </p>
                    <div className="flex gap-4">
                        <a className="text-neutral-dark/40 hover:text-primary transition-colors" href="#">Privacy</a>
                        <a className="text-neutral-dark/40 hover:text-primary transition-colors" href="#">Terms</a>
                        <a className="text-neutral-dark/40 hover:text-primary transition-colors" href="#">Help</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
