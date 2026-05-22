const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image-decode"));
    };
    img.src = url;
  });
}

async function decodeToDrawable(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {}
  }
  return loadImageFromFile(file);
}

export async function compressImageFileToJpegDataUrl(file: File): Promise<string> {
  const drawable = await decodeToDrawable(file);
  const w = drawable.width;
  const h = drawable.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const dw = Math.max(1, Math.round(w * scale));
  const dh = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("no-2d");
  }
  ctx.drawImage(drawable, 0, 0, dw, dh);

  if (drawable instanceof ImageBitmap) {
    drawable.close();
  }

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  if (!dataUrl.startsWith("data:image/jpeg")) {
    throw new Error("toDataURL-failed");
  }
  return dataUrl;
}
