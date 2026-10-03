// Helper kompresi gambar di sisi klien menggunakan Canvas API
// Mengubah ukuran sisi terpanjang maksimal 2000px dengan kualitas ~0.85
// Menghasilkan WebP (atau JPEG fallback) untuk menghemat storage dan mempercepat pemuatan

export interface CompressedImageResult {
  blob: Blob;
  width: number;
  height: number;
  fileName: string;
}

export async function compressImage(
  file: File,
  maxDimension = 2000,
  quality = 0.85
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    // Validasi tipe file dasar
    if (!file.type.startsWith('image/')) {
      return reject(
        new Error(
          'Format berkas tidak didukung. Harap pilih gambar JPG, PNG, atau WEBP.'
        )
      );
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Hitung skala jika dimensi melebihi batas maksimum
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      // Buat canvas untuk rendering ulang
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Gagal menginisialisasi canvas untuk kompresi'));
      }

      // Pengaturan rendering berkualitas tinggi
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Coba konversi ke image/webp terlebih dahulu
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const cleanBaseName = file.name
              .replace(/\.[^/.]+$/, '')
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, '-');
            const newFileName = `${cleanBaseName}-${Date.now()}.webp`;

            resolve({
              blob,
              width,
              height,
              fileName: newFileName,
            });
          } else {
            // Fallback ke JPEG jika browser tidak mendukung toBlob webp
            canvas.toBlob(
              (jpegBlob) => {
                if (!jpegBlob) {
                  return reject(new Error('Gagal mengompresi gambar'));
                }
                const cleanBaseName = file.name
                  .replace(/\.[^/.]+$/, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9_-]/g, '-');
                const newFileName = `${cleanBaseName}-${Date.now()}.jpg`;

                resolve({
                  blob: jpegBlob,
                  width,
                  height,
                  fileName: newFileName,
                });
              },
              'image/jpeg',
              quality
            );
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          'Tidak dapat memproses gambar. Pastikan format didukung (JPG, PNG, WEBP).'
        )
      );
    };

    img.src = objectUrl;
  });
}
