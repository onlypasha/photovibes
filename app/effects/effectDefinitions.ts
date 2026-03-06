export type EffectType = "css" | "canvas";

export interface EffectCategory {
    id: string;
    name: string;
    icon: string;
}

export interface EffectDefinition {
    id: string;
    name: string;
    categoryId: string;
    icon: string;
    type: EffectType;
    cssFilter?: string;
    previewCssFilter?: string; // CSS approximation for live video preview thumbnails
    canvasProcessor?: string;
    hasIntensity?: boolean;
    defaultIntensity?: number;
}

export const categories: EffectCategory[] = [
    { id: "standard", name: "Standard", icon: "🎨" },
    { id: "color", name: "Color", icon: "🌈" },
    { id: "artistic", name: "Artistic", icon: "🖌️" },
    { id: "distortion", name: "Distortion", icon: "🌀" },
    { id: "mirror", name: "Mirror", icon: "🪞" },
    { id: "lighting", name: "Lighting", icon: "💡" },
    { id: "psychedelic", name: "Psychedelic", icon: "✨" },
    { id: "special", name: "Special", icon: "🔬" },
];

export const effects: EffectDefinition[] = [
    // ── Standard ──
    { id: "normal", name: "Normal", categoryId: "standard", icon: "📷", type: "css", cssFilter: "none" },
    { id: "bw", name: "B&W", categoryId: "standard", icon: "⚫", type: "css", cssFilter: "grayscale(1)", hasIntensity: true, defaultIntensity: 100 },
    { id: "sepia", name: "Sepia", categoryId: "standard", icon: "🟤", type: "css", cssFilter: "sepia(1)", hasIntensity: true, defaultIntensity: 100 },
    { id: "vintage", name: "Vintage", categoryId: "standard", icon: "📼", type: "css", cssFilter: "sepia(0.4) contrast(1.1) brightness(0.9) saturate(0.8)" },
    { id: "retro", name: "Retro", categoryId: "standard", icon: "📺", type: "css", cssFilter: "sepia(0.6) contrast(1.25) saturate(1.2)" },

    // ── Color ──
    { id: "warm", name: "Warm", categoryId: "color", icon: "🔥", type: "css", cssFilter: "sepia(0.3) saturate(1.4) brightness(1.05)", hasIntensity: true, defaultIntensity: 70 },
    { id: "cool", name: "Cool", categoryId: "color", icon: "🧊", type: "css", cssFilter: "saturate(0.9) brightness(1.05) hue-rotate(15deg)", hasIntensity: true, defaultIntensity: 70 },
    { id: "berry", name: "Berry", categoryId: "color", icon: "🫐", type: "css", cssFilter: "saturate(1.3) hue-rotate(-20deg) contrast(1.1)" },
    { id: "citrus", name: "Citrus", categoryId: "color", icon: "🍋", type: "css", cssFilter: "saturate(1.5) hue-rotate(10deg) brightness(1.1)" },
    { id: "mint", name: "Mint", categoryId: "color", icon: "🌿", type: "css", cssFilter: "saturate(0.8) hue-rotate(100deg) brightness(1.1)" },
    { id: "rose", name: "Rose", categoryId: "color", icon: "🌹", type: "css", cssFilter: "saturate(1.2) hue-rotate(-10deg) brightness(1.05)" },
    { id: "hotpink", name: "Hot Pink", categoryId: "color", icon: "💖", type: "css", cssFilter: "saturate(1.8) hue-rotate(-30deg) contrast(1.1)" },

    // ── Artistic ──
    { id: "cartoon", name: "Cartoon", categoryId: "artistic", icon: "🎭", type: "canvas", canvasProcessor: "cartoon", previewCssFilter: "saturate(1.4) contrast(1.3)", hasIntensity: true, defaultIntensity: 60 },
    { id: "comic", name: "Comic", categoryId: "artistic", icon: "💥", type: "canvas", canvasProcessor: "comic", previewCssFilter: "contrast(1.5) saturate(2)" },
    { id: "sketch", name: "Sketch", categoryId: "artistic", icon: "✏️", type: "canvas", canvasProcessor: "sketch", previewCssFilter: "grayscale(1) contrast(1.5) brightness(1.2)", hasIntensity: true, defaultIntensity: 80 },
    { id: "watercolor", name: "Watercolor", categoryId: "artistic", icon: "💧", type: "canvas", canvasProcessor: "watercolor", previewCssFilter: "blur(1px) saturate(1.5) brightness(1.1)" },
    { id: "oilpainting", name: "Oil Paint", categoryId: "artistic", icon: "🖼️", type: "canvas", canvasProcessor: "oilpainting", previewCssFilter: "blur(0.5px) saturate(1.3) contrast(1.2)" },
    { id: "popart", name: "Pop Art", categoryId: "artistic", icon: "🎪", type: "canvas", canvasProcessor: "popart", previewCssFilter: "contrast(2) saturate(2.5)" },

    // ── Distortion ──
    { id: "fisheye", name: "Fisheye", categoryId: "distortion", icon: "🐟", type: "canvas", canvasProcessor: "fisheye", previewCssFilter: "none", hasIntensity: true, defaultIntensity: 50 },
    { id: "bulge", name: "Bulge", categoryId: "distortion", icon: "🎈", type: "canvas", canvasProcessor: "bulge", previewCssFilter: "none", hasIntensity: true, defaultIntensity: 50 },
    { id: "pinch", name: "Pinch", categoryId: "distortion", icon: "🤏", type: "canvas", canvasProcessor: "pinch", previewCssFilter: "none", hasIntensity: true, defaultIntensity: 50 },
    { id: "swirl", name: "Swirl", categoryId: "distortion", icon: "🌀", type: "canvas", canvasProcessor: "swirl", previewCssFilter: "none", hasIntensity: true, defaultIntensity: 50 },
    { id: "ripple", name: "Ripple", categoryId: "distortion", icon: "🌊", type: "canvas", canvasProcessor: "ripple", previewCssFilter: "none", hasIntensity: true, defaultIntensity: 50 },
    { id: "wave", name: "Wave", categoryId: "distortion", icon: "〰️", type: "canvas", canvasProcessor: "wave", previewCssFilter: "none", hasIntensity: true, defaultIntensity: 50 },

    // ── Mirror ──
    { id: "hmirror", name: "H-Mirror", categoryId: "mirror", icon: "↔️", type: "canvas", canvasProcessor: "hmirror", previewCssFilter: "none" },
    { id: "vmirror", name: "V-Mirror", categoryId: "mirror", icon: "↕️", type: "canvas", canvasProcessor: "vmirror", previewCssFilter: "none" },
    { id: "quadmirror", name: "Quad", categoryId: "mirror", icon: "🔲", type: "canvas", canvasProcessor: "quadmirror", previewCssFilter: "none" },
    { id: "kaleidoscope", name: "Kaleidoscope", categoryId: "mirror", icon: "🔮", type: "canvas", canvasProcessor: "kaleidoscope", previewCssFilter: "none", hasIntensity: true, defaultIntensity: 60 },

    // ── Lighting ──
    { id: "bloom", name: "Bloom", categoryId: "lighting", icon: "🌟", type: "css", cssFilter: "brightness(1.2) contrast(1.1) blur(0.5px)", hasIntensity: true, defaultIntensity: 60 },
    { id: "softglow", name: "Soft Glow", categoryId: "lighting", icon: "✨", type: "css", cssFilter: "brightness(1.15) blur(0.3px) saturate(1.1)", hasIntensity: true, defaultIntensity: 50 },
    { id: "vignette", name: "Vignette", categoryId: "lighting", icon: "⭕", type: "canvas", canvasProcessor: "vignette", previewCssFilter: "brightness(0.85) contrast(1.1)", hasIntensity: true, defaultIntensity: 70 },
    { id: "lightleak", name: "Light Leak", categoryId: "lighting", icon: "🌅", type: "canvas", canvasProcessor: "lightleak", previewCssFilter: "brightness(1.15) sepia(0.2)", hasIntensity: true, defaultIntensity: 50 },
    { id: "lensflare", name: "Lens Flare", categoryId: "lighting", icon: "☀️", type: "canvas", canvasProcessor: "lensflare", previewCssFilter: "brightness(1.2) contrast(1.05)", hasIntensity: true, defaultIntensity: 60 },

    // ── Psychedelic ──
    { id: "rainbow", name: "Rainbow", categoryId: "psychedelic", icon: "🌈", type: "canvas", canvasProcessor: "rainbow", previewCssFilter: "hue-rotate(45deg) saturate(1.5)", hasIntensity: true, defaultIntensity: 50 },
    { id: "neon", name: "Neon", categoryId: "psychedelic", icon: "💜", type: "css", cssFilter: "hue-rotate(90deg) saturate(2) contrast(1.3)", hasIntensity: true, defaultIntensity: 70 },
    { id: "glitch", name: "Glitch", categoryId: "psychedelic", icon: "📡", type: "canvas", canvasProcessor: "glitch", previewCssFilter: "hue-rotate(20deg) contrast(1.2)" },
    { id: "pixelate", name: "Pixelate", categoryId: "psychedelic", icon: "🟩", type: "canvas", canvasProcessor: "pixelate", previewCssFilter: "blur(2px)", hasIntensity: true, defaultIntensity: 50 },
    { id: "rgbsplit", name: "RGB Split", categoryId: "psychedelic", icon: "🔴", type: "canvas", canvasProcessor: "rgbsplit", previewCssFilter: "hue-rotate(10deg) saturate(1.3)", hasIntensity: true, defaultIntensity: 40 },

    // ── Special ──
    { id: "thermal", name: "Thermal", categoryId: "special", icon: "🌡️", type: "canvas", canvasProcessor: "thermal", previewCssFilter: "hue-rotate(90deg) saturate(3) contrast(1.5)" },
    { id: "nightvision", name: "Night Vision", categoryId: "special", icon: "🌙", type: "canvas", canvasProcessor: "nightvision", previewCssFilter: "hue-rotate(80deg) saturate(0.5) brightness(1.3)" },
    { id: "xray", name: "X-Ray", categoryId: "special", icon: "☠️", type: "canvas", canvasProcessor: "xray", previewCssFilter: "invert(1) contrast(1.5) brightness(0.8)" },
    { id: "bokeh", name: "Bokeh", categoryId: "special", icon: "🔵", type: "css", cssFilter: "blur(1.5px) brightness(1.1) saturate(1.2)", hasIntensity: true, defaultIntensity: 40 },
    { id: "filmgrain", name: "Film Grain", categoryId: "special", icon: "🎞️", type: "canvas", canvasProcessor: "filmgrain", previewCssFilter: "contrast(1.1) brightness(0.95)", hasIntensity: true, defaultIntensity: 40 },
];

export function getEffectsByCategory(categoryId: string): EffectDefinition[] {
    return effects.filter((e) => e.categoryId === categoryId);
}

export function getEffectById(id: string): EffectDefinition | undefined {
    return effects.find((e) => e.id === id);
}

// Build a dynamic CSS filter string with intensity support
export function buildCssFilter(effect: EffectDefinition, intensity: number): string {
    if (!effect.cssFilter || effect.cssFilter === "none") return "none";
    if (!effect.hasIntensity) return effect.cssFilter;

    const scale = intensity / 100;

    // Parse individual filter functions and scale their values
    return effect.cssFilter.replace(
        /(\w[\w-]*)\(([^)]+)\)/g,
        (match, fn, val) => {
            const num = parseFloat(val);
            if (isNaN(num)) return match;

            // For filters that default to 1 (like saturate, contrast, brightness)
            if (["grayscale", "sepia", "blur"].includes(fn)) {
                // Fix #8: Safer unit extraction via regex
                const unit = val.match(/[a-z%]+$/i)?.[0] || "";
                return `${fn}(${(num * scale).toFixed(2)}${unit})`;
            }
            // For hue-rotate, scale the degrees
            if (fn === "hue-rotate") {
                const unit = val.match(/[a-z%]+$/i)?.[0] || "";
                return `${fn}(${(num * scale).toFixed(1)}${unit})`;
            }
            // For brightness, contrast, saturate: interpolate toward 1
            const adjusted = 1 + (num - 1) * scale;
            const unit = val.match(/[a-z%]+$/i)?.[0] || "";
            return `${fn}(${adjusted.toFixed(2)}${unit})`;
        }
    );
}
