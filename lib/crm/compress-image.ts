import { MAX_PHOTO_COMPRESSED_BYTES, MAX_PHOTO_EDGE_PX } from "@/lib/crm/constants";

export type CompressedImage = {
  dataUrl: string;
  mime: "image/jpeg" | "image/png";
  bytes: number;
};

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
    } catch {
      /* fall through */
    }
  }
  return loadImageFromFile(file);
}

export function dataUrlByteSize(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) {
    return dataUrl.length;
  }
  const b64 = dataUrl.slice(comma + 1);
  return Math.ceil((b64.length * 3) / 4);
}

function canvasHasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const { data } = ctx.getImageData(0, 0, w, h);
  const step = Math.max(4, Math.floor(data.length / 4 / 8000) * 4);
  for (let i = 3; i < data.length; i += step) {
    if (data[i] < 255) {
      return true;
    }
  }
  return false;
}

function drawScaled(
  drawable: ImageBitmap | HTMLImageElement,
  maxEdge: number
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const w = drawable.width;
  const h = drawable.height;
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const dw = Math.max(1, Math.round(w * scale));
  const dh = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("no-2d");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, dw, dh);
  ctx.drawImage(drawable, 0, 0, dw, dh);
  return { canvas, ctx };
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  usePng: boolean,
  quality: number
): CompressedImage {
  const mime = usePng ? "image/png" : "image/jpeg";
  const dataUrl = usePng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", quality);
  if (!dataUrl.startsWith(`data:${mime}`)) {
    throw new Error("encode-failed");
  }
  return { dataUrl, mime, bytes: dataUrlByteSize(dataUrl) };
}

export async function compressImageFile(file: File): Promise<CompressedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("not-image");
  }

  const drawable = await decodeToDrawable(file);
  try {
    let maxEdge = MAX_PHOTO_EDGE_PX;
    let best: CompressedImage | null = null;

    while (maxEdge >= 480) {
      const { canvas, ctx } = drawScaled(drawable, maxEdge);
      const usePng =
        file.type === "image/png" && canvasHasTransparency(ctx, canvas.width, canvas.height);

      if (usePng) {
        const encoded = encodeCanvas(canvas, ctx, true, 1);
        if (encoded.bytes <= MAX_PHOTO_COMPRESSED_BYTES) {
          return encoded;
        }
        best = !best || encoded.bytes < best.bytes ? encoded : best;
      } else {
        for (let q = 0.88; q >= 0.45; q -= 0.07) {
          const encoded = encodeCanvas(canvas, ctx, false, q);
          if (encoded.bytes <= MAX_PHOTO_COMPRESSED_BYTES) {
            return encoded;
          }
          if (!best || encoded.bytes < best.bytes) {
            best = encoded;
          }
        }
      }

      maxEdge = Math.round(maxEdge * 0.82);
    }

    if (best) {
      return best;
    }
    throw new Error("compress-failed");
  } finally {
    if (drawable instanceof ImageBitmap) {
      drawable.close();
    }
  }
}
