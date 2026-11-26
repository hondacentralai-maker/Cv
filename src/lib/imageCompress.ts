const MAX_DIMENSION = 320;
const MAX_BYTES = 120 * 1024; // 120KB ceiling

export interface CompressedAvatarResult {
  dataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('تعذّر قراءة الصورة المضغوطة.'));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });
}

function loadImageElement(file: File): Promise<{
  source: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  cleanup: () => void;
}> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file).then((bitmap) => ({
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      cleanup: () => bitmap.close(),
    }));
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        cleanup: () => URL.revokeObjectURL(objectUrl),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('تعذّر تحميل ملف الصورة — تأكد أنه صورة صالحة (JPG / PNG / WebP).'));
    };
    img.src = objectUrl;
  });
}

/**
 * Compresses a user-selected image file locally inside the browser to a WebP DataURL
 * constrained to at most 320x320 pixels and <= 120KB.
 */
export async function compressAvatarFile(file: File): Promise<CompressedAvatarResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('يرجى اختيار ملف صورة صالح (PNG أو JPG أو WebP).');
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('حجم الصورة الأصلي كبير جداً (الحد الأقصى 15MB قبل الضغط).');
  }

  const loaded = await loadImageElement(file);
  try {
    const dimensionSteps = [MAX_DIMENSION, 240, 180];
    const qualitySteps = [0.85, 0.74, 0.62, 0.5, 0.38, 0.28];

    for (const maxSide of dimensionSteps) {
      const scale = Math.min(1, maxSide / Math.max(1, loaded.width, loaded.height));
      const targetW = Math.max(1, Math.round(loaded.width * scale));
      const targetH = Math.max(1, Math.round(loaded.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('المتصفح لا يدعم معالجة الصور عبر Canvas.');
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(loaded.source, 0, 0, targetW, targetH);

      for (const mime of ['image/webp', 'image/jpeg']) {
        for (const quality of qualitySteps) {
          const blob = await canvasToBlob(canvas, mime, quality);
          if (!blob) continue;
          // Ensure actual binary size fits well under 120KB (and dataUrl remains compact)
          if (blob.size <= MAX_BYTES && blob.type === mime) {
            const dataUrl = await blobToDataUrl(blob);
            return {
              dataUrl,
              sizeBytes: blob.size,
              width: targetW,
              height: targetH,
            };
          }
        }
      }
    }

    throw new Error('تعذّر ضغط الصورة إلى أقل من 120KB — جرّب صورة أصغر حجماً.');
  } finally {
    loaded.cleanup();
  }
}
