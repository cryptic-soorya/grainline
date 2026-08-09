/**
 * lib/imageResize.ts
 *
 * Swatch photos are stored directly inside the Firestore document as a
 * base64 data URL, not in Firebase Cloud Storage. Reason: since late 2024,
 * new Firebase projects must be on the paid "Blaze" plan just to enable
 * Cloud Storage, even for a few kilobytes — and keeping this app free to
 * run is a hard requirement (see CLAUDE.md, "keep the girlfriend's account
 * free forever"). Firestore documents cap out at 1MB, so we resize and
 * compress the photo client-side (on the phone, before it's ever uploaded)
 * to comfortably fit a fabric swatch photo well under that limit.
 */
export function resizeImageToDataUrl(
  file: File,
  maxDimension = 800,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't read that image."));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
