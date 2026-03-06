// Canvas pixel manipulation processors for complex effects
// Each processor takes (ctx, canvas, intensity 0-100, frameCount for animation)

type Processor = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    intensity: number,
    frame: number
) => void;

// ── Helpers ──

function getPixels(ctx: CanvasRenderingContext2D, w: number, h: number) {
    return ctx.getImageData(0, 0, w, h);
}

function clamp(v: number) {
    return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}

// Clamp coordinate to valid range [min, max]
function clampCoord(value: number, min: number, max: number) {
    return value < min ? min : value > max ? max : value;
}

// ── Artistic ──

const cartoon: Processor = (ctx, w, h, intensity) => {
    const t = intensity / 100;
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    const levels = Math.max(2, Math.round(4 + (1 - t) * 8));

    for (let i = 0; i < d.length; i += 4) {
        d[i] = Math.round(d[i] / (256 / levels)) * (256 / levels);
        d[i + 1] = Math.round(d[i + 1] / (256 / levels)) * (256 / levels);
        d[i + 2] = Math.round(d[i + 2] / (256 / levels)) * (256 / levels);
        // Boost saturation slightly
        const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
        d[i] = clamp(avg + (d[i] - avg) * 1.3);
        d[i + 1] = clamp(avg + (d[i + 1] - avg) * 1.3);
        d[i + 2] = clamp(avg + (d[i + 2] - avg) * 1.3);
    }
    ctx.putImageData(imageData, 0, 0);
};

const comic: Processor = (ctx, w, h) => {
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    // Posterize + high contrast
    for (let i = 0; i < d.length; i += 4) {
        d[i] = Math.round(d[i] / 64) * 64;
        d[i + 1] = Math.round(d[i + 1] / 64) * 64;
        d[i + 2] = Math.round(d[i + 2] / 64) * 64;
        // Increase contrast
        d[i] = clamp((d[i] - 128) * 1.5 + 128);
        d[i + 1] = clamp((d[i + 1] - 128) * 1.5 + 128);
        d[i + 2] = clamp((d[i + 2] - 128) * 1.5 + 128);
    }
    ctx.putImageData(imageData, 0, 0);
};

const sketch: Processor = (ctx, w, h, intensity) => {
    const t = intensity / 100;
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    const copy = new Uint8ClampedArray(d);

    // Edge detection via Sobel-like
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;
            const idxL = (y * w + x - 1) * 4;
            const idxR = (y * w + x + 1) * 4;
            const idxU = ((y - 1) * w + x) * 4;
            const idxD = ((y + 1) * w + x) * 4;

            const gx = (-copy[idxL] + copy[idxR] - copy[idxL + 1] + copy[idxR + 1] - copy[idxL + 2] + copy[idxR + 2]) / 3;
            const gy = (-copy[idxU] + copy[idxD] - copy[idxU + 1] + copy[idxD + 1] - copy[idxU + 2] + copy[idxD + 2]) / 3;
            const edge = Math.min(255, Math.sqrt(gx * gx + gy * gy) * (1 + t * 2));
            const val = 255 - edge;

            d[idx] = val;
            d[idx + 1] = val;
            d[idx + 2] = val;
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const watercolor: Processor = (ctx, w, h) => {
    // Blur + saturate + soften
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    const copy = new Uint8ClampedArray(d);
    const radius = 2;

    for (let y = radius; y < h - radius; y++) {
        for (let x = radius; x < w - radius; x++) {
            let r = 0, g = 0, b = 0, count = 0;
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const idx = ((y + dy) * w + (x + dx)) * 4;
                    r += copy[idx];
                    g += copy[idx + 1];
                    b += copy[idx + 2];
                    count++;
                }
            }
            const idx = (y * w + x) * 4;
            const avg_r = r / count;
            const avg_g = g / count;
            const avg_b = b / count;
            // Boost saturation
            const avg = (avg_r + avg_g + avg_b) / 3;
            d[idx] = clamp(avg + (avg_r - avg) * 1.5);
            d[idx + 1] = clamp(avg + (avg_g - avg) * 1.5);
            d[idx + 2] = clamp(avg + (avg_b - avg) * 1.5);
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const oilpainting: Processor = (ctx, w, h) => {
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    const copy = new Uint8ClampedArray(d);
    const radius = 3;
    const levels = 8;

    for (let y = radius; y < h - radius; y++) {
        for (let x = radius; x < w - radius; x++) {
            const intensityCount = new Array(levels + 1).fill(0);
            const avgR = new Array(levels + 1).fill(0);
            const avgG = new Array(levels + 1).fill(0);
            const avgB = new Array(levels + 1).fill(0);

            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const si = ((y + dy) * w + (x + dx)) * 4;
                    const curIntensity = Math.round(((copy[si] + copy[si + 1] + copy[si + 2]) / 3) * levels / 255);
                    intensityCount[curIntensity]++;
                    avgR[curIntensity] += copy[si];
                    avgG[curIntensity] += copy[si + 1];
                    avgB[curIntensity] += copy[si + 2];
                }
            }

            let maxCount = 0;
            let maxIndex = 0;
            for (let i = 0; i <= levels; i++) {
                if (intensityCount[i] > maxCount) {
                    maxCount = intensityCount[i];
                    maxIndex = i;
                }
            }

            const idx = (y * w + x) * 4;
            d[idx] = avgR[maxIndex] / maxCount;
            d[idx + 1] = avgG[maxIndex] / maxCount;
            d[idx + 2] = avgB[maxIndex] / maxCount;
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const popart: Processor = (ctx, w, h) => {
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
        // High contrast posterize with hue shift
        d[i] = d[i] > 128 ? 255 : 0;
        d[i + 1] = d[i + 1] > 100 ? 255 : 0;
        d[i + 2] = d[i + 2] > 150 ? 255 : 0;
    }
    ctx.putImageData(imageData, 0, 0);
};

// ── Distortion ── (uses downscaled copy for perf)

const fisheye: Processor = (ctx, w, h, intensity) => {
    const t = (intensity / 100) * 1.5 + 0.5;
    const imageData = getPixels(ctx, w, h);
    const copy = new Uint8ClampedArray(imageData.data);
    const d = imageData.data;
    const cx = w / 2, cy = h / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const dx = (x - cx) / cx;
            const dy = (y - cy) / cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const r = Math.pow(dist, t) * maxR / Math.pow(maxR, t);
            const theta = Math.atan2(dy, dx);
            const srcX = Math.round(cx + r * Math.cos(theta));
            const srcY = Math.round(cy + r * Math.sin(theta));

            // Clamp coordinates to valid ranges [0, width-1] and [0, height-1]
            const clampedX = clampCoord(srcX, 0, w - 1);
            const clampedY = clampCoord(srcY, 0, h - 1);

            const dstIdx = (y * w + x) * 4;
            const srcIdx = (clampedY * w + clampedX) * 4;

            d[dstIdx] = copy[srcIdx];
            d[dstIdx + 1] = copy[srcIdx + 1];
            d[dstIdx + 2] = copy[srcIdx + 2];
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const bulge: Processor = (ctx, w, h, intensity) => {
    const t = intensity / 100;
    const imageData = getPixels(ctx, w, h);
    const copy = new Uint8ClampedArray(imageData.data);
    const d = imageData.data;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.4;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const dx = x - cx, dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const dstIdx = (y * w + x) * 4;

            if (dist < radius) {
                const amount = 1 - (dist / radius);
                const scale = 1 - amount * t * 0.6;
                const srcX = Math.round(cx + dx * scale);
                const srcY = Math.round(cy + dy * scale);

                // Clamp coordinates to valid ranges [0, width-1] and [0, height-1]
                const clampedX = clampCoord(srcX, 0, w - 1);
                const clampedY = clampCoord(srcY, 0, h - 1);

                const srcIdx = (clampedY * w + clampedX) * 4;
                d[dstIdx] = copy[srcIdx];
                d[dstIdx + 1] = copy[srcIdx + 1];
                d[dstIdx + 2] = copy[srcIdx + 2];
            } else {
                // Outside radius, copy original pixel
                const srcIdx = (y * w + x) * 4;
                d[dstIdx] = copy[srcIdx];
                d[dstIdx + 1] = copy[srcIdx + 1];
                d[dstIdx + 2] = copy[srcIdx + 2];
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const pinch: Processor = (ctx, w, h, intensity) => {
    const t = intensity / 100;
    const imageData = getPixels(ctx, w, h);
    const copy = new Uint8ClampedArray(imageData.data);
    const d = imageData.data;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.45;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const dx = x - cx, dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const dstIdx = (y * w + x) * 4;

            if (dist < radius) {
                const amount = (dist / radius);
                const scale = Math.pow(amount, 1 + t * 2);
                const angle = Math.atan2(dy, dx);
                const srcX = Math.round(cx + Math.cos(angle) * scale * radius);
                const srcY = Math.round(cy + Math.sin(angle) * scale * radius);

                // Clamp coordinates to valid ranges [0, width-1] and [0, height-1]
                const clampedX = clampCoord(srcX, 0, w - 1);
                const clampedY = clampCoord(srcY, 0, h - 1);

                const srcIdx = (clampedY * w + clampedX) * 4;
                d[dstIdx] = copy[srcIdx];
                d[dstIdx + 1] = copy[srcIdx + 1];
                d[dstIdx + 2] = copy[srcIdx + 2];
            } else {
                // Outside radius, copy original pixel
                const srcIdx = (y * w + x) * 4;
                d[dstIdx] = copy[srcIdx];
                d[dstIdx + 1] = copy[srcIdx + 1];
                d[dstIdx + 2] = copy[srcIdx + 2];
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const swirl: Processor = (ctx, w, h, intensity, frame) => {
    const t = (intensity / 100) * 4 + frame * 0.02;
    const imageData = getPixels(ctx, w, h);
    const copy = new Uint8ClampedArray(imageData.data);
    const d = imageData.data;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) / 2;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const dx = x - cx, dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const dstIdx = (y * w + x) * 4;

            if (dist < radius) {
                const angle = t * (1 - dist / radius);
                const cos = Math.cos(angle), sin = Math.sin(angle);
                const srcX = Math.round(cx + dx * cos - dy * sin);
                const srcY = Math.round(cy + dx * sin + dy * cos);
                if (srcX >= 0 && srcX < w && srcY >= 0 && srcY < h) {
                    const srcIdx = (srcY * w + srcX) * 4;
                    d[dstIdx] = copy[srcIdx];
                    d[dstIdx + 1] = copy[srcIdx + 1];
                    d[dstIdx + 2] = copy[srcIdx + 2];
                }
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const ripple: Processor = (ctx, w, h, intensity, frame) => {
    const t = intensity / 100;
    const imageData = getPixels(ctx, w, h);
    const copy = new Uint8ClampedArray(imageData.data);
    const d = imageData.data;
    const amplitude = t * 15;
    const frequency = 0.05;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const offsetX = Math.round(amplitude * Math.sin(y * frequency + frame * 0.05));
            const offsetY = Math.round(amplitude * Math.cos(x * frequency + frame * 0.05));
            const srcX = x + offsetX;
            const srcY = y + offsetY;
            const dstIdx = (y * w + x) * 4;

            if (srcX >= 0 && srcX < w && srcY >= 0 && srcY < h) {
                const srcIdx = (srcY * w + srcX) * 4;
                d[dstIdx] = copy[srcIdx];
                d[dstIdx + 1] = copy[srcIdx + 1];
                d[dstIdx + 2] = copy[srcIdx + 2];
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const wave: Processor = (ctx, w, h, intensity, frame) => {
    const t = intensity / 100;
    const imageData = getPixels(ctx, w, h);
    const copy = new Uint8ClampedArray(imageData.data);
    const d = imageData.data;
    const amplitude = t * 20;

    for (let y = 0; y < h; y++) {
        const offset = Math.round(amplitude * Math.sin((y * 0.03) + frame * 0.04));
        for (let x = 0; x < w; x++) {
            const srcX = x + offset;
            const dstIdx = (y * w + x) * 4;
            if (srcX >= 0 && srcX < w) {
                const srcIdx = (y * w + srcX) * 4;
                d[dstIdx] = copy[srcIdx];
                d[dstIdx + 1] = copy[srcIdx + 1];
                d[dstIdx + 2] = copy[srcIdx + 2];
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

// ── Mirror ──

const hmirror: Processor = (ctx, w, h) => {
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    const half = Math.floor(w / 2);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < half; x++) {
            const srcIdx = (y * w + x) * 4;
            const dstIdx = (y * w + (w - 1 - x)) * 4;
            d[dstIdx] = d[srcIdx];
            d[dstIdx + 1] = d[srcIdx + 1];
            d[dstIdx + 2] = d[srcIdx + 2];
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const vmirror: Processor = (ctx, w, h) => {
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    const half = Math.floor(h / 2);
    for (let y = 0; y < half; y++) {
        for (let x = 0; x < w; x++) {
            const srcIdx = (y * w + x) * 4;
            const dstIdx = ((h - 1 - y) * w + x) * 4;
            d[dstIdx] = d[srcIdx];
            d[dstIdx + 1] = d[srcIdx + 1];
            d[dstIdx + 2] = d[srcIdx + 2];
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const quadmirror: Processor = (ctx, w, h) => {
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    const hw = Math.floor(w / 2);
    const hh = Math.floor(h / 2);

    // Copy top-left to other 3 quadrants
    for (let y = 0; y < hh; y++) {
        for (let x = 0; x < hw; x++) {
            const src = (y * w + x) * 4;
            // Top-right
            const tr = (y * w + (w - 1 - x)) * 4;
            // Bottom-left
            const bl = ((h - 1 - y) * w + x) * 4;
            // Bottom-right
            const br = ((h - 1 - y) * w + (w - 1 - x)) * 4;
            for (let c = 0; c < 3; c++) {
                d[tr + c] = d[src + c];
                d[bl + c] = d[src + c];
                d[br + c] = d[src + c];
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const kaleidoscope: Processor = (ctx, w, h, intensity) => {
    const segments = Math.max(3, Math.round((intensity / 100) * 8 + 2));
    const imageData = getPixels(ctx, w, h);
    const copy = new Uint8ClampedArray(imageData.data);
    const d = imageData.data;
    const cx = w / 2, cy = h / 2;
    const sliceAngle = (Math.PI * 2) / segments;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const dx = x - cx, dy = y - cy;
            let angle = Math.atan2(dy, dx);
            if (angle < 0) angle += Math.PI * 2;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Map to first slice
            let mappedAngle = angle % sliceAngle;
            if (Math.floor(angle / sliceAngle) % 2 === 1) {
                mappedAngle = sliceAngle - mappedAngle;
            }

            const srcX = Math.round(cx + Math.cos(mappedAngle) * dist);
            const srcY = Math.round(cy + Math.sin(mappedAngle) * dist);
            const dstIdx = (y * w + x) * 4;

            if (srcX >= 0 && srcX < w && srcY >= 0 && srcY < h) {
                const srcIdx = (srcY * w + srcX) * 4;
                d[dstIdx] = copy[srcIdx];
                d[dstIdx + 1] = copy[srcIdx + 1];
                d[dstIdx + 2] = copy[srcIdx + 2];
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

// ── Lighting ──

const vignette: Processor = (ctx, w, h, intensity) => {
    const t = intensity / 100;
    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
    gradient.addColorStop(0, `rgba(0,0,0,0)`);
    gradient.addColorStop(1, `rgba(0,0,0,${0.7 * t})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
};

const lightleak: Processor = (ctx, w, h, intensity, frame) => {
    const t = intensity / 100;
    const offset = (frame * 2) % w;
    const gradient = ctx.createLinearGradient(offset - w * 0.3, 0, offset + w * 0.3, h);
    gradient.addColorStop(0, `rgba(255,120,50,${0.3 * t})`);
    gradient.addColorStop(0.3, `rgba(255,200,50,${0.2 * t})`);
    gradient.addColorStop(0.6, `rgba(255,100,150,${0.15 * t})`);
    gradient.addColorStop(1, `rgba(200,50,255,${0.1 * t})`);
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
};

const lensflare: Processor = (ctx, w, h, intensity, frame) => {
    const t = intensity / 100;
    const fx = w * 0.65 + Math.sin(frame * 0.03) * w * 0.1;
    const fy = h * 0.3 + Math.cos(frame * 0.02) * h * 0.05;

    ctx.globalCompositeOperation = "screen";
    // Main flare
    const g1 = ctx.createRadialGradient(fx, fy, 0, fx, fy, w * 0.3);
    g1.addColorStop(0, `rgba(255,255,220,${0.6 * t})`);
    g1.addColorStop(0.3, `rgba(255,200,100,${0.2 * t})`);
    g1.addColorStop(1, `rgba(255,150,50,0)`);
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    // Secondary spot
    const g2 = ctx.createRadialGradient(w - fx, h - fy, 0, w - fx, h - fy, w * 0.15);
    g2.addColorStop(0, `rgba(100,150,255,${0.3 * t})`);
    g2.addColorStop(1, `rgba(100,150,255,0)`);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
};

// ── Psychedelic ──

const rainbow: Processor = (ctx, w, h, intensity, frame) => {
    const t = intensity / 100;
    const hueShift = frame * 3;
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;

    for (let y = 0; y < h; y++) {
        const rowHue = ((y / h) * 360 + hueShift) % 360;
        const rad = (rowHue * Math.PI) / 180;
        for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            d[idx] = clamp(d[idx] + Math.sin(rad) * 60 * t);
            d[idx + 1] = clamp(d[idx + 1] + Math.sin(rad + 2.094) * 60 * t);
            d[idx + 2] = clamp(d[idx + 2] + Math.sin(rad + 4.189) * 60 * t);
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const glitch: Processor = (ctx, w, h, _i, frame) => {
    const seed = Math.floor(frame / 8);
    const rand = (offset: number) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
    };

    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    const copy = new Uint8ClampedArray(d);

    const numSlices = Math.floor(rand(0) * 3) + 3;

    for (let i = 0; i < numSlices; i++) {
        const y = Math.floor(rand(i + 1) * h);
        const sliceH = Math.floor(rand(i + 10) * 20 + 5);
        const shift = Math.floor(rand(i + 20) * 40 - 20);

        for (let sy = y; sy < Math.min(y + sliceH, h); sy++) {
            for (let x = 0; x < w; x++) {
                const srcX = (x + shift + w) % w;
                const srcIdx = (sy * w + srcX) * 4;
                const dstIdx = (sy * w + x) * 4;

                d[dstIdx] = copy[srcIdx];
                d[dstIdx + 1] = copy[srcIdx + 1];
                d[dstIdx + 2] = copy[srcIdx + 2];
                d[dstIdx + 3] = copy[srcIdx + 3];
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const pixelate: Processor = (ctx, w, h, intensity) => {
    const size = Math.max(2, Math.round((intensity / 100) * 20 + 2));
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;

    for (let y = 0; y < h; y += size) {
        for (let x = 0; x < w; x += size) {
            let r = 0, g = 0, b = 0, count = 0;
            for (let dy = 0; dy < size && y + dy < h; dy++) {
                for (let dx = 0; dx < size && x + dx < w; dx++) {
                    const idx = ((y + dy) * w + (x + dx)) * 4;
                    r += d[idx]; g += d[idx + 1]; b += d[idx + 2];
                    count++;
                }
            }
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);
            for (let dy = 0; dy < size && y + dy < h; dy++) {
                for (let dx = 0; dx < size && x + dx < w; dx++) {
                    const idx = ((y + dy) * w + (x + dx)) * 4;
                    d[idx] = r; d[idx + 1] = g; d[idx + 2] = b;
                }
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const rgbsplit: Processor = (ctx, w, h, intensity) => {
    const shift = Math.round((intensity / 100) * 15 + 2);
    const imageData = getPixels(ctx, w, h);
    const copy = new Uint8ClampedArray(imageData.data);
    const d = imageData.data;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            // Red channel shifted left
            const rIdx = (y * w + Math.max(0, x - shift)) * 4;
            // Blue channel shifted right
            const bIdx = (y * w + Math.min(w - 1, x + shift)) * 4;
            d[idx] = copy[rIdx];
            d[idx + 2] = copy[bIdx + 2];
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

// ── Special ──

const thermal: Processor = (ctx, w, h) => {
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
        const val = (d[i] + d[i + 1] + d[i + 2]) / 3;
        const norm = val / 255;
        // Blue → Cyan → Green → Yellow → Red
        if (norm < 0.25) {
            d[i] = 0; d[i + 1] = clamp(norm * 4 * 255); d[i + 2] = 255;
        } else if (norm < 0.5) {
            d[i] = 0; d[i + 1] = 255; d[i + 2] = clamp((1 - (norm - 0.25) * 4) * 255);
        } else if (norm < 0.75) {
            d[i] = clamp((norm - 0.5) * 4 * 255); d[i + 1] = 255; d[i + 2] = 0;
        } else {
            d[i] = 255; d[i + 1] = clamp((1 - (norm - 0.75) * 4) * 255); d[i + 2] = 0;
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const nightvision: Processor = (ctx, w, h) => {
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
        const luma = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
        d[i] = clamp(luma * 0.2);
        d[i + 1] = clamp(luma * 1.2);
        d[i + 2] = clamp(luma * 0.2);
        // Add noise
        const noise = (Math.random() - 0.5) * 30;
        d[i] = clamp(d[i] + noise);
        d[i + 1] = clamp(d[i + 1] + noise);
        d[i + 2] = clamp(d[i + 2] + noise);
    }
    ctx.putImageData(imageData, 0, 0);
};

const xray: Processor = (ctx, w, h) => {
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
        const luma = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
        const inverted = 255 - luma;
        // High contrast inversion with blue tint
        d[i] = clamp(inverted * 0.8);
        d[i + 1] = clamp(inverted * 0.9);
        d[i + 2] = clamp(inverted * 1.2);
    }
    ctx.putImageData(imageData, 0, 0);
};

const filmgrain: Processor = (ctx, w, h, intensity) => {
    const t = intensity / 100;
    const imageData = getPixels(ctx, w, h);
    const d = imageData.data;
    const amount = t * 60;

    for (let i = 0; i < d.length; i += 4) {
        const noise = (Math.random() - 0.5) * amount;
        d[i] = clamp(d[i] + noise);
        d[i + 1] = clamp(d[i + 1] + noise);
        d[i + 2] = clamp(d[i + 2] + noise);
    }
    ctx.putImageData(imageData, 0, 0);
};

// ── Registry ──

export const processors: Record<string, Processor> = {
    cartoon,
    comic,
    sketch,
    watercolor,
    oilpainting,
    popart,
    fisheye,
    bulge,
    pinch,
    swirl,
    ripple,
    wave,
    hmirror,
    vmirror,
    quadmirror,
    kaleidoscope,
    vignette,
    lightleak,
    lensflare,
    rainbow,
    glitch,
    pixelate,
    rgbsplit,
    thermal,
    nightvision,
    xray,
    filmgrain,
};
