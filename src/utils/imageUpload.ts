import { uploadImageToApi } from './api';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compresses an image file on the client using HTML5 Canvas.
 * Keeps aspect ratio and scales down to maxWidth/maxHeight.
 * Outputs both a Blob (for multipart server upload) and a compact dataUrl (for fallback preview/storage).
 */
export async function compressImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<{ blob: Blob; dataUrl: string }> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;

  // If already SVG, read directly as dataUrl and blob
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '';
        resolve({ blob: file, dataUrl });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Calculate new dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context could not be created'));
        return;
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Determine MIME type (JPEG is universally small and supported)
      const mimeType = 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, quality);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, dataUrl });
          } else {
            // Fallback: convert dataUrl to blob
            fetch(dataUrl)
              .then((res) => res.blob())
              .then((b) => resolve({ blob: b, dataUrl }))
              .catch(() => reject(new Error('Failed to create image blob')));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không thể đọc dữ liệu ảnh qua Canvas'));
    };

    img.src = objectUrl;
  });
}

/**
 * Handles end-to-end image processing & upload with multi-tier fallback:
 * 1. Validates reasonable size (< 25MB).
 * 2. Compresses client-side to minimize payload and optimize rendering.
 * 3. Attempts to upload to the server API (/api/upload).
 * 4. If backend is not available (offline/static/server down), safely falls back
 *    to the highly-compressed dataUrl (~40-80KB) so localStorage and URLs never overflow.
 * 5. If Canvas fails (e.g. HEIC/HEIF on Windows Chrome), directly uploads to server API.
 */
export async function processAndUploadImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<string> {
  // 1. Validation
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('Dung lượng ảnh quá lớn (>25MB). Vui lòng chọn ảnh nhỏ hơn.');
  }

  // 2. Try client-side canvas compression first
  try {
    const { blob, dataUrl } = await compressImage(file, options);

    // 3. Attempt server upload with compressed blob
    try {
      const serverUrl = await uploadImageToApi(blob, file.name);
      if (serverUrl) {
        return serverUrl;
      }
    } catch (apiErr) {
      console.warn('Server upload failed, using compressed dataUrl', apiErr);
    }

    // 4. Safe fallback to compressed inline data
    return dataUrl;
  } catch (canvasErr) {
    console.warn('Client-side canvas compression skipped or failed, trying direct server upload', canvasErr);

    // 5. If canvas fails (e.g. HEIC format), try direct server upload with original file
    try {
      const serverUrl = await uploadImageToApi(file, file.name);
      if (serverUrl) {
        return serverUrl;
      }
    } catch (e) {
      console.warn('Direct server upload failed', e);
    }

    // 6. Ultimate fallback: raw FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'));
      reader.readAsDataURL(file);
    });
  }
}
