# 📸 PhotoVibes

<p align="center">
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  </a>
</p>

<p align="center">
  <strong>PhotoVibes</strong> — A modern photobooth web application with real-time camera effects, timer, and gallery.
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📷 **Live Camera** | Real-time camera preview with front/back camera support |
| 🎨 **50+ Effects** | Filters including B&W, Sepia, Vintage, Artistic, Distortion, Mirror, Lighting, Psychedelic, and Special effects |
| ⏱️ **Timer** | Countdown timer options: 0s, 3s, 5s, or 10s |
| ⚡ **Flash Modes** | Auto, On, or Off flash settings |
| 🎚️ **Intensity Control** | Adjustable effect intensity with slider |
| 📸 **Photo Gallery** | View, download, and delete captured photos |
| ⌨️ **Keyboard Shortcut** | Press `Space` to capture |
| 🎞️ **Countdown Overlay** | Visual countdown display |
| 🎭 **Canvas Effects** | Advanced real-time processing with cartoon, sketch, fisheye, and more |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm / yarn / pnpm / bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd photovibes

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
photovibes/
├── app/
│   ├── components/          # React components
│   │   ├── CameraStage.tsx  # Main camera interface
│   │   ├── EffectPanel.tsx  # Effect selection panel
│   │   ├── CountdownOverlay.tsx
│   │   └── Header.tsx
│   ├── effects/            # Effect definitions & processors
│   │   ├── effectDefinitions.ts
│   │   └── effectProcessors.ts
│   ├── hooks/
│   │   └── usePhotoStore.ts # Photo state management
│   ├── gallery/
│   │   └── page.tsx         # Photo gallery page
│   ├── page.tsx             # Main photobooth page
│   ├── layout.tsx
│   └── globals.css
├── public/
│   ├── frames/              # Photo frame overlays
│   └── stickers/            # Sticker assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vitest.config.ts
```

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

---

## 🎨 Effect Categories

| Category | Examples |
|----------|----------|
| **Standard** | Normal, B&W, Sepia, Vintage, Retro |
| **Color** | Warm, Cool, Berry, Citrus, Mint, Rose, Hot Pink |
| **Artistic** | Cartoon, Comic, Sketch, Watercolor, Oil Paint, Pop Art |
| **Distortion** | Fisheye, Bulge, Pinch, Swirl, Ripple, Wave |
| **Mirror** | H-Mirror, V-Mirror, Quad, Kaleidoscope |
| **Lighting** | Bloom, Soft Glow, Vignette, Light Leak, Lens Flare |
| **Psychedelic** | Rainbow, Neon, Glitch, Pixelate, RGB Split |
| **Special** | Thermal, Night Vision, X-Ray, Bokeh, Film Grain |

---

## 📸 Usage

1. **Allow Camera Access** — Grant permission when prompted
2. **Choose Effect** — Click the effect button to open the panel
3. **Set Timer** — Click the timer button to cycle options
4. **Capture** — Click the shutter button or press `Space`
5. **View Gallery** — Access your photos at `/gallery`

---

## 🧩 Cara Kerja Project

### Arsitektur Umum

PhotoVibes adalah aplikasi web photobooth yang dibangun dengan **Next.js 16** dan **React 19**. Aplikasi ini menggunakan pendekatan client-side processing untuk efectos kamera secara real-time.

### Alur Kerja Utama

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Camera    │────▶│  Processing  │────▶│   Canvas    │
│  (getUserMedia)   │   (Effects)   │     │   Output    │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                                                ▼
                                        ┌─────────────┐
                                        │   Capture   │
                                        │   (JPEG)    │
                                        └─────────────┘
                                                │
                                                ▼
                                        ┌─────────────┐
                                        │   Gallery   │
                                        │   (Store)   │
                                        └─────────────┘
```

### 1. Camera Access (`CameraStage.tsx`)

- Menggunakan **MediaDevices API** (`navigator.mediaDevices.getUserMedia`)
- Mendukung kamera depan (`user`) dan belakang (`environment`)
- Video stream ditampilkan di elemen `<video>` untuk preview
- Resolusi ideal: 1280x720

### 2. Effect Processing

Terdapat dua tipe efek:

#### a. CSS Filter Effects
- Menggunakan property CSS `filter` pada canvas
- Efek: Normal, B&W, Sepia, Vintage, Warm, Cool, Neon, Bloom, dll
- Proses: `buildCssFilter()` membangun string filter dinamis berdasarkan intensity

```typescript
// Contoh: Sepia dengan intensity 70%
buildCssFilter(effect, 70) 
// Hasil: "sepia(0.7) contrast(1.07) brightness(1.03)"
```

#### b. Canvas Processor Effects
- Menggunakan **Canvas 2D API** untuk manipulasi piksel real-time
- Efek: Cartoon, Sketch, Fisheye, Swirl, Kaleidoscope, Glitch, dll
- Setiap efek memiliki fungsi processor di `effectProcessors.ts`
- Diproses via `requestAnimationFrame` untuk performa optimal

### 3. Photo Capture (`doCapture`)

1. Ambil frame dari video menggunakan `createImageBitmap()`
2. Gambar ke canvas dengan efek yang aktif
3. Konversi canvas ke JPEG (`toDataURL`)
4. Simpan ke state management (`usePhotoStore`)
5. Tampilkan flash effect

### 4. State Management (`usePhotoStore`)

Menggunakan React Context + useState untuk menyimpan:
- Array foto yang diambil
- Fungsi `addPhoto()` dan `deletePhoto()`
- Foto disimpan sebagai base64 Data URL

### 5. Gallery Page

- Menampilkan grid foto menggunakan **Framer Motion** untuk animasi
- Fitur: Download (save as JPEG), Delete
- Responsive grid: 1 kolom (mobile) → 4 kolom (xl)

### 6. Timer & Countdown

- Opsi timer: 0s, 3s, 5s, 10s
- Saat timer > 0, muncul overlay hitung mundur
- bisa dibatalkan sebelum hitungan selesai
- Keyboard shortcut `Space` untuk capture cepat

### Tech Stack Details

| Teknologi | Fungsi |
|-----------|--------|
| **Next.js 16** | Framework React dengan App Router |
| **React 19** | UI Library |
| **Tailwind CSS 4** | Styling |
| **Framer Motion** | Animasi |
| **Lucide React** | Icons |
| **Vitest** | Testing |
| **Canvas API** | Image processing |

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## 📄 License

MIT License — feel free to use and modify this project.

---

<p align="center">
  Made with ❤️ using Next.js & React
</p>
