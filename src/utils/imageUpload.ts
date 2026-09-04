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

  // If already SVG or tiny file (< 30KB), read directly as dataUrl and blob
  if (file.type === 'image/svg+xml' || file.size < 30 * 1024) {
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
      reject(new Error('Không thể đọc dữ liệu ảnh. Vui lòng thử ảnh khác.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Handles end-to-end image processing & upload:
 * 1. Validates file format and reasonable size (< 20MB).
 * 2. Compresses client-side to minimize payload and optimize rendering.
 * 3. Attempts to upload to the server API (/api/upload).
 * 4. If backend is not available (offline/static/server down), safely falls back
 *    to the highly-compressed dataUrl (~40-80KB) so localStorage and URLs never overflow.
 */
export async function processAndUploadImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<string> {
  // 1. Validation
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('Dung lượng ảnh quá lớn (>20MB). Vui lòng chọn ảnh nhỏ hơn.');
  }

  const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg|bmp|heic|heif)$/i.test(file.name);
  if (!isImage) {
    throw new Error('Tệp đã chọn không phải hình ảnh hợp lệ.');
  }

  // 2. Client compression
  const { blob, dataUrl } = await compressImage(file, options);

  // 3. Attempt server upload
  try {
    const serverUrl = await uploadImageToApi(blob, file.name);
    if (serverUrl) {
      return serverUrl;
    }
  } catch (err) {
    console.warn('Server upload failed, falling back to compressed inline data', err);
  }

  // 4. Safe fallback to compressed inline data
  return dataUrl;
}
