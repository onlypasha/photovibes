import { PhotostripTemplate, SlotShape } from "./photostripConfig";

export async function generatePhotostrip(
  template: PhotostripTemplate,
  photoDataUrls: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return reject(new Error("Could not get 2d context for photostrip canvas"));
    }

    const templateImg = new Image();
    templateImg.crossOrigin = "anonymous";
    templateImg.onload = async () => {
      // Set canvas to match template dimensions exactly
      canvas.width = templateImg.width;
      canvas.height = templateImg.height;

      // Load all user photos into Image objects
      const loadedPhotos = await Promise.all(
        photoDataUrls.map((dataUrl) => {
          return new Promise<HTMLImageElement>((res, rej) => {
            const img = new Image();
            img.onload = () => res(img);
            img.onerror = rej;
            img.src = dataUrl;
          });
        })
      );

      // 2. Draw each photo into its corresponding slots
      // Note: If layout is double, slots array contains both left and right sides.
      // E.g., for 3 photos, slots will have 6 items. photo index = slotIndex % 3
      template.slots.forEach((slot, index) => {
        const photoIndex = index % template.photosRequired;
        const photoImg = loadedPhotos[photoIndex];

        if (!photoImg) return;

        // Convert percentages to actual pixel values based on template dimensions
        const px = (slot.x / 100) * canvas.width;
        const py = (slot.y / 100) * canvas.height;
        const pw = (slot.width / 100) * canvas.width;
        const ph = (slot.height / 100) * canvas.height;

        ctx.save();

        // Optional rotation
        if (slot.rotation) {
          // Translate to center of slot, rotate, translate back
          const cx = px + pw / 2;
          const cy = py + ph / 2;
          ctx.translate(cx, cy);
          ctx.rotate((slot.rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }

        // Apply clipping path based on shape
        ctx.beginPath();
        if (slot.shape === "rounded") {
          const radius = Math.min(pw, ph) * 0.1; // 10% border radius
          ctx.moveTo(px + radius, py);
          ctx.arcTo(px + pw, py, px + pw, py + ph, radius);
          ctx.arcTo(px + pw, py + ph, px, py + ph, radius);
          ctx.arcTo(px, py + ph, px, py, radius);
          ctx.arcTo(px, py, px + pw, py, radius);
        } else if (slot.shape === "heart") {
          // Heart shape approximation fitting into pw and ph
          ctx.moveTo(px + pw / 2, py + ph * 0.3);
          ctx.bezierCurveTo(px + pw / 2, py, px, py, px, py + ph * 0.4);
          ctx.bezierCurveTo(px, py + ph * 0.7, px + pw / 2, py + ph * 0.9, px + pw / 2, py + ph);
          ctx.bezierCurveTo(px + pw / 2, py + ph * 0.9, px + pw, py + ph * 0.7, px + pw, py + ph * 0.4);
          ctx.bezierCurveTo(px + pw, py, px + pw / 2, py, px + pw / 2, py + ph * 0.3);
        } else {
          // Default rectangle
          ctx.rect(px, py, pw, ph);
        }
        ctx.clip();

        // Calculate aspect ratio covering (Object-fit: cover)
        const photoAspect = photoImg.width / photoImg.height;
        const slotAspect = pw / ph;

        let drawW = pw;
        let drawH = ph;
        let drawX = px;
        let drawY = py;

        if (photoAspect > slotAspect) {
          // Photo is wider than slot -> scale height to fit slot height, crop width
          drawH = ph;
          drawW = photoImg.width * (ph / photoImg.height);
          drawX = px - (drawW - pw) / 2; // Center horizontally
        } else {
          // Photo is taller than slot -> scale width to fit slot width, crop height
          drawW = pw;
          drawH = photoImg.height * (pw / photoImg.width);
          drawY = py - (drawH - ph) / 2; // Center vertically
        }

        ctx.drawImage(photoImg, drawX, drawY, drawW, drawH);

        ctx.restore();
      });

      // 2. Draw the template overlay on top (must be PNG with transparent photo areas)
      ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

      // Export as high-quality JPEG
      const finalDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      resolve(finalDataUrl);
    };

    templateImg.onerror = (err) => {
      reject(new Error("Failed to load photostrip template: " + err));
    };

    templateImg.src = template.src;
  });
}