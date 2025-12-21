/**
 * Compress / resize images before uploading to Storage
 */
export const compressImage = async (
    file: File,
    opts: { maxW?: number; maxH?: number; quality?: number; mime?: string } = {}
): Promise<File> => {
    const maxW = opts.maxW ?? 1920;
    const maxH = opts.maxH ?? 1920;
    const quality = opts.quality ?? 0.82;
    const mime = opts.mime ?? 'image/webp';

    try {
        const bitmap = await createImageBitmap(file);

        let { width, height } = bitmap;

        // keep aspect ratio, only downscale
        const ratio = Math.min(maxW / width, maxH / height, 1);
        const targetW = Math.max(1, Math.round(width * ratio));
        const targetH = Math.max(1, Math.round(height * ratio));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext('2d');
        if (!ctx) return file;

        ctx.drawImage(bitmap, 0, 0, targetW, targetH);

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (b) => {
                    if (!b) return reject(new Error('Image compression failed: toBlob returned null'));
                    resolve(b);
                },
                mime,
                quality
            );
        });

        const safeBase = file.name.replace(/\.[^.]+$/, '').replace(/\s+/g, '_');
        const ext =
            mime === 'image/webp'
                ? 'webp'
                : mime === 'image/jpeg'
                ? 'jpg'
                : mime === 'image/png'
                ? 'png'
                : file.name.split('.').pop() || 'img';

        return new File([blob], `${safeBase}.${ext}`, { type: mime });
    } catch (err) {
        console.warn('compressImage failed, fallback to original file:', err);
        return file;
    }
};
