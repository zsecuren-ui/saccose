// Image compression helper using canvas. Runs in browser environment.
export async function compressDataUrl(
  dataUrl: string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75,
  outputType: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        let { width, height } = img;
        // Compute target size preserving aspect ratio
        const aspect = width / height;
        let targetWidth = width;
        let targetHeight = height;
        if (width > maxWidth || height > maxHeight) {
          if (aspect > 1) {
            // landscape
            targetWidth = maxWidth;
            targetHeight = Math.round(maxWidth / aspect);
          } else {
            // portrait
            targetHeight = maxHeight;
            targetWidth = Math.round(maxHeight * aspect);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);
        // Fill white background for JPEG to avoid transparency artifacts
        if (outputType === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL(outputType, quality);
        resolve(compressed);
      } catch (err) {
        // On any error, fallback to original
        resolve(dataUrl);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

export async function compressFile(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.75, outputType: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg') {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      try {
        const compressed = await compressDataUrl(result, maxWidth, maxHeight, quality, outputType);
        resolve(compressed);
      } catch (err) {
        resolve(result);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
