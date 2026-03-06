export type SlotShape = "rectangle" | "heart" | "rounded";

export interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: SlotShape;
  rotation?: number; // Optional rotation in degrees
}

export interface PhotostripTemplate {
  id: string;
  name: string;
  src: string;
  layout: "single" | "double";
  photosRequired: number;
  slots: PhotoSlot[];
}

// NOTE: Coordinates (x, y, width, height) are estimated percentages (0-100) 
// or relative values based on the template's aspect ratio. 
// For precise pixel-perfect mapping, we will need to calibrate these values.
// We use percentages so it scales nicely regardless of the image's actual resolution.

export const photostripTemplates: PhotostripTemplate[] = [
  {
    id: "cinema-3",
    name: "Cinema Classic",
    src: "/frames/cinema-3-frame.png",
    layout: "single",
    photosRequired: 3,
    slots: [
      { x: 15, y: 15, width: 70, height: 20, shape: "rectangle" }, // Top
      { x: 15, y: 38, width: 70, height: 20, shape: "rectangle" }, // Middle
      { x: 15, y: 61, width: 70, height: 20, shape: "rectangle" }, // Bottom
    ],
  },
  {
    id: "fruit-6",
    name: "Fruit Pop",
    src: "/frames/fruit-6-frame.png",
    layout: "double",
    photosRequired: 3,
    slots: [
      // Left Column
      { x: 5, y: 10, width: 40, height: 20, shape: "rectangle" },
      { x: 5, y: 32, width: 40, height: 20, shape: "rectangle" },
      { x: 5, y: 54, width: 40, height: 20, shape: "rectangle" },
      // Right Column (duplicated photos)
      { x: 55, y: 10, width: 40, height: 20, shape: "rectangle" },
      { x: 55, y: 32, width: 40, height: 20, shape: "rectangle" },
      { x: 55, y: 54, width: 40, height: 20, shape: "rectangle" },
    ],
  },
  {
    id: "vintage-8",
    name: "Vintage Scrapbook",
    src: "/frames/vintage-8-frame.png",
    layout: "double",
    photosRequired: 4,
    slots: [
      // Left Column
      { x: 5, y: 5, width: 40, height: 18, shape: "rectangle" },
      { x: 5, y: 25, width: 40, height: 18, shape: "rectangle" },
      { x: 5, y: 45, width: 40, height: 18, shape: "rectangle" },
      { x: 5, y: 65, width: 40, height: 18, shape: "rectangle" },
      // Right Column
      { x: 55, y: 5, width: 40, height: 18, shape: "rectangle" },
      { x: 55, y: 25, width: 40, height: 18, shape: "rectangle" },
      { x: 55, y: 45, width: 40, height: 18, shape: "rectangle" },
      { x: 55, y: 65, width: 40, height: 18, shape: "rectangle" },
    ],
  },
  {
    id: "vintage-call-8",
    name: "Retro Gadgets",
    src: "/frames/vintage-call-8-frame.png",
    layout: "double",
    photosRequired: 4,
    slots: [
      // Left Column
      { x: 5, y: 5, width: 40, height: 18, shape: "rectangle" },
      { x: 5, y: 25, width: 40, height: 18, shape: "rectangle" },
      { x: 5, y: 45, width: 40, height: 18, shape: "rectangle" },
      { x: 5, y: 65, width: 40, height: 18, shape: "rectangle" },
      // Right Column
      { x: 55, y: 5, width: 40, height: 18, shape: "rectangle" },
      { x: 55, y: 25, width: 40, height: 18, shape: "rectangle" },
      { x: 55, y: 45, width: 40, height: 18, shape: "rectangle" },
      { x: 55, y: 65, width: 40, height: 18, shape: "rectangle" },
    ],
  },
];

