"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface PhotoData {
    id: string;
    src: string; // base64 data URL
    effect: string;
    intensity?: number; // Optional intensity value for effects that support it
    timestamp: number;
}

const STORAGE_KEY = "photovibes_gallery";

function loadPhotos(): PhotoData[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function savePhotos(photos: PhotoData[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    } catch (error) {
        console.error("Failed to save photos to localStorage:", error);
        // Optional: Dispatch a custom event or toast to notify user
        if (error instanceof DOMException && error.name === "QuotaExceededError") {
            alert("Gallery is full! Please delete some photos to save new ones.");
        }
    }
}

export function usePhotoStore() {
    const [photos, setPhotos] = useState<PhotoData[]>([]);

    // Load on mount
    useEffect(() => {
        setPhotos(loadPhotos());
    }, []);

    // Listen for storage changes from other tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                setPhotos(loadPhotos());
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const addPhoto = useCallback((src: string, effect: string, intensity?: number) => {
        const newPhoto: PhotoData = {
            id: crypto.randomUUID(),
            src,
            effect,
            ...(intensity !== undefined && { intensity }), // Include intensity only if provided
            timestamp: Date.now(),
        };
        
        const currentPhotos = loadPhotos();
        const updatedPhotos = [newPhoto, ...currentPhotos];
        
        savePhotos(updatedPhotos);
        
        setPhotos(updatedPhotos);
    }, []);

    const deletePhoto = useCallback((id: string) => {
        const currentPhotos = loadPhotos();
        const updatedPhotos = currentPhotos.filter((p) => p.id !== id);
        
        savePhotos(updatedPhotos);
        
        setPhotos(updatedPhotos);
    }, []);

    return { photos, addPhoto, deletePhoto };
}