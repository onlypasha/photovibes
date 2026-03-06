"use client";

import { useState, useEffect, useCallback } from "react";

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

export function usePhotoStore() {
    const [photos, setPhotos] = useState<PhotoData[]>(() => loadPhotos());
    const [storageError, setStorageError] = useState<"quota_exceeded" | null>(null);

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

        try {
            savePhotos(updatedPhotos);
            setPhotos(updatedPhotos);
            setStorageError(null);
        } catch (error) {
            console.error("Failed to save photos to localStorage:", error);
            if (error instanceof DOMException && error.name === "QuotaExceededError") {
                setStorageError("quota_exceeded");
            }
        }
    }, []);

    const deletePhoto = useCallback((id: string) => {
        const currentPhotos = loadPhotos();
        const updatedPhotos = currentPhotos.filter((p) => p.id !== id);

        try {
            savePhotos(updatedPhotos);
            setPhotos(updatedPhotos);
            if (storageError === "quota_exceeded") setStorageError(null);
        } catch (error) {
            console.error("Failed to delete photo from localStorage:", error);
        }
    }, [storageError]);

    const clearOldestPhotos = useCallback((count: number = 5) => {
        const currentPhotos = loadPhotos();
        // Array is newest-first, so slicing from start keeps newest and drops oldest
        const updatedPhotos = currentPhotos.slice(0, Math.max(0, currentPhotos.length - count));

        try {
            savePhotos(updatedPhotos);
            setPhotos(updatedPhotos);
            setStorageError(null);
        } catch (error) {
            console.error("Failed to clear old photos from localStorage:", error);
        }
    }, []);

    return { photos, addPhoto, deletePhoto, storageError, setStorageError, clearOldestPhotos };
}
