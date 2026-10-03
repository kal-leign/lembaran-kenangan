'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/image-compression';
import { FrameType, FilterType, Photo } from '@/lib/types';
import { useToast } from '@/components/Toast';
import {
  UploadCloud,
  X,
  CheckCircle,
  AlertCircle,
  RotateCw,
  Sparkles,
} from 'lucide-react';

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'compressing' | 'uploading' | 'saving' | 'done' | 'error';
  progress: number;
  errorMessage?: string;
  caption: string;
  memoryDate: string;
  frame: FrameType;
  filter: FilterType;
  savedPhoto?: Photo;
}

interface UploadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newPhotos: Photo[]) => void;
}

export default function UploadPanel({
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadPanelProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const supabase = createClient();

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: UploadItem[] = [];

    Array.from(files).forEach((file) => {
      // Periksa ekstensi
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'heic' || ext === 'heif') {
        showToast(
          `Berkas ${file.name} berformat HEIC. Silakan ubah ke JPG atau PNG sebelum diunggah.`,
          'info'
        );
        return;
      }

      if (!file.type.startsWith('image/')) {
        showToast(
          `Berkas ${file.name} bukan format gambar yang didukung.`,
          'error'
        );
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl,
        status: 'idle',
        progress: 0,
        caption: '',
        memoryDate: todayStr,
        frame: 'none',
        filter: 'original',
      });
    });

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const updateItemField = <K extends keyof UploadItem>(
    id: string,
    field: K,
    value: UploadItem[K]
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Proses upload seluruh item
  const startUpload = async () => {
    setIsProcessing(true);
    const successfullySaved: Photo[] = [];

    // Periksa user terautentikasi
    const { data: { user } } = await supabase.auth.getUser();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === 'done') continue;

      try {
        // Langkah 1: Kompresi Gambar di sisi klien
        updateItemField(item.id, 'status', 'compressing');
        updateItemField(item.id, 'progress', 30);

        const compressed = await compressImage(item.file, 2000, 0.85);

        // Rotasi acak halus (-1° hingga 1°)
        const randomRotation = Number(((Math.random() - 0.5) * 2).toFixed(1));

        if (user) {
          // ==================== MODE AKUN TERAUTENTIKASI ====================
          // Langkah 2: Unggah ke Supabase Storage dalam folder user.id
          updateItemField(item.id, 'status', 'uploading');
          updateItemField(item.id, 'progress', 65);

          const fileExt = compressed.fileName.split('.').pop();
          const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, compressed.blob, {
              contentType: compressed.blob.type || 'image/webp',
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            throw new Error(
              uploadError.message || 'Gagal mengunggah berkas ke penyimpanan.'
            );
          }

          // Dapatkan Public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from('photos').getPublicUrl(filePath);

          // Langkah 3: Simpan Record ke Tabel Database 'photos' dengan user_id
          updateItemField(item.id, 'status', 'saving');
          updateItemField(item.id, 'progress', 90);

          const photoPayload = {
            user_id: user.id,
            storage_path: filePath,
            public_url: publicUrl,
            width: compressed.width,
            height: compressed.height,
            caption: item.caption.trim() || null,
            memory_date: item.memoryDate || null,
            frame: item.frame,
            filter: item.filter,
            rotation: randomRotation,
          };

          const { data: dbData, error: dbError } = await supabase
            .from('photos')
            .insert(photoPayload)
            .select()
            .single();

          if (dbError) {
            throw new Error(
              dbError.message || 'Gagal menyimpan data foto ke database.'
            );
          }

          updateItemField(item.id, 'status', 'done');
          updateItemField(item.id, 'progress', 100);
          updateItemField(item.id, 'savedPhoto', dbData);
          successfullySaved.push(dbData);
        } else {
          // ==================== MODE TAMU (BELUM LOGIN) ====================
          // Foto dapat dicoba & dipratinjau tapi TIDAK tersimpan ke database/storage
          updateItemField(item.id, 'status', 'saving');
          updateItemField(item.id, 'progress', 80);

          const previewObjectUrl = URL.createObjectURL(compressed.blob);
          const guestPhoto: Photo = {
            id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            storage_path: '',
            public_url: previewObjectUrl,
            width: compressed.width,
            height: compressed.height,
            caption: item.caption.trim() || null,
            memory_date: item.memoryDate || null,
            frame: item.frame,
            filter: item.filter,
            rotation: randomRotation,
            created_at: new Date().toISOString(),
          };

          updateItemField(item.id, 'status', 'done');
          updateItemField(item.id, 'progress', 100);
          updateItemField(item.id, 'savedPhoto', guestPhoto);
          successfullySaved.push(guestPhoto);
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Terjadi kendala saat mengunggah foto.';
        updateItemField(item.id, 'status', 'error');
        updateItemField(item.id, 'errorMessage', errorMsg);
        showToast(`Gagal: ${errorMsg}`, 'error');
      }
    }

    setIsProcessing(false);

    if (successfullySaved.length > 0) {
      if (user) {
        showToast(
          `Berhasil menyimpan ${successfullySaved.length} lembaran kenangan ke album akun Anda!`,
          'success'
        );
      } else {
        showToast(
          `Mode Tamu: ${successfullySaved.length} foto tampil di layar untuk pratinjau, namun tidak tersimpan ke server. Masuk atau daftar akun agar tersimpan selamanya.`,
          'info'
        );
      }
      onUploadSuccess(successfullySaved);
    }
  };

  const framesList: { id: FrameType; label: string }[] = [
    { id: 'none', label: 'Polos' },
    { id: 'classic', label: 'Klasik' },
    { id: 'gold', label: 'Emas' },
    { id: 'walnut', label: 'Walnut' },
    { id: 'polaroid', label: 'Polaroid' },
    { id: 'vintage_print', label: 'Cetak Lama' },
  ];

  const filtersList: { id: FilterType; label: string }[] = [
    { id: 'original', label: 'Asli' },
    { id: 'sepia', label: 'Sepia Lembut' },
    { id: 'bw', label: 'Hitam Putih' },
    { id: 'faded', label: 'Pudar Hangat' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#231A14]/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FAF7F0] border border-[#D8CCB4] rounded-[2px] w-full max-w-3xl my-8 p-6 sm:p-8 shadow-2xl relative">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 text-[#6B5D50] hover:text-[#2F2620] p-1.5 transition-colors disabled:opacity-40"
          aria-label="Tutup panel unggah"
        >
          <X size={20} />
        </button>

        {/* Header Panel */}
        <div className="mb-6">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#A68A56]">
            Tambah ke Galeri
          </span>
          <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-medium text-[#2F2620] mt-1">
            Menyematkan Kenangan Baru
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5D50] mt-1 font-serif">
            Unggah satu atau beberapa foto. Gambar otomatis dioptimasi agar tetap jernih dan ringan dibuka.
          </p>
        </div>

        {/* Kotak Drag & Drop */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-[2px] p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#A68A56] bg-[#E9DFCB]/50'
              : 'border-[#D8CCB4] hover:border-[#A68A56] bg-[#F4EEE1]/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E9DFCB] flex items-center justify-center text-[#4A3426]">
              <UploadCloud size={24} />
            </div>
            <div>
              <p className="font-['Cormorant_Garamond',serif] text-lg text-[#2F2620]">
                Tarik & letakkan foto di sini, atau{' '}
                <span className="text-[#A68A56] underline decoration-1 underline-offset-4">
                  pilih dari perangkat
                </span>
              </p>
              <p className="text-xs text-[#6B5D50] mt-1 font-serif">
                Mendukung JPG, PNG, WEBP (bisa banyak foto sekaligus)
              </p>
            </div>
          </div>
        </div>

        {/* Daftar Foto yang Dipilih & Form Metadata */}
        {items.length > 0 && (
          <div className="mt-8 space-y-6 max-h-[50vh] overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-[#F4EEE1] border border-[#D8CCB4] rounded-[1px] flex flex-col md:flex-row gap-5 items-start relative"
              >
                {/* Thumbnail Preview */}
                <div className="w-full md:w-36 h-36 shrink-0 bg-[#E9DFCB] overflow-hidden rounded-[1px] flex items-center justify-center border border-[#D8CCB4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt="Pratinjau"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Form Pengaturan Foto */}
                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif text-[#6B5D50] truncate max-w-[200px]">
                      {item.file.name} ({(item.file.size / 1024).toFixed(0)} KB)
                    </span>
                    {item.status === 'idle' && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#6B5D50] hover:text-[#8E3232] text-xs transition-colors p-1"
                      >
                        Batal
                      </button>
                    )}
                  </div>

                  {/* Input Caption & Tanggal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                        Keterangan / Cerita
                      </label>
                      <input
                        type="text"
                        value={item.caption}
                        placeholder="Contoh: Senja di teras tua"
                        onChange={(e) =>
                          updateItemField(item.id, 'caption', e.target.value)
                        }
                        disabled={item.status !== 'idle' && item.status !== 'error'}
                        className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-3 py-1.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                        Tanggal Kenangan
                      </label>
                      <input
                        type="date"
                        value={item.memoryDate}
                        onChange={(e) =>
                          updateItemField(item.id, 'memoryDate', e.target.value)
                        }
                        disabled={item.status !== 'idle' && item.status !== 'error'}
                        className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-3 py-1.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
                      />
                    </div>
                  </div>

                  {/* Pilihan Frame & Filter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                        Pilihan Bingkai
                      </label>
                      <select
                        value={item.frame}
                        onChange={(e) =>
                          updateItemField(
                            item.id,
                            'frame',
                            e.target.value as FrameType
                          )
                        }
                        disabled={item.status !== 'idle' && item.status !== 'error'}
                        className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-2.5 py-1.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
                      >
                        {framesList.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                        Filter Warna
                      </label>
                      <select
                        value={item.filter}
                        onChange={(e) =>
                          updateItemField(
                            item.id,
                            'filter',
                            e.target.value as FilterType
                          )
                        }
                        disabled={item.status !== 'idle' && item.status !== 'error'}
                        className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-2.5 py-1.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
                      >
                        {filtersList.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status & Bar Progres */}
                  {item.status !== 'idle' && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] text-[#6B5D50] mb-1 font-serif">
                        <span className="flex items-center gap-1.5">
                          {item.status === 'compressing' && (
                            <>
                              <RotateCw className="animate-spin" size={12} />
                              Mengompresi gambar...
                            </>
                          )}
                          {item.status === 'uploading' && (
                            <>
                              <RotateCw className="animate-spin" size={12} />
                              Mengunggah ke penyimpanan...
                            </>
                          )}
                          {item.status === 'saving' && (
                            <>
                              <RotateCw className="animate-spin" size={12} />
                              Menyimpan ke album...
                            </>
                          )}
                          {item.status === 'done' && (
                            <span className="text-[#3C7B3C] flex items-center gap-1">
                              <CheckCircle size={12} /> Tersimpan abadi
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className="text-[#A84242] flex items-center gap-1">
                              <AlertCircle size={12} /> {item.errorMessage}
                            </span>
                          )}
                        </span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#D8CCB4]/60 overflow-hidden rounded-full">
                        <div
                          className="h-full bg-[#A68A56] transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Tombol Aksi */}
        <div className="mt-8 pt-4 border-t border-[#D8CCB4] flex items-center justify-between">
          <span className="text-xs text-[#6B5D50] font-serif">
            {items.length > 0
              ? `${items.length} foto siap disematkan`
              : 'Belum ada foto yang dipilih'}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#6B5D50] hover:text-[#2F2620] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={startUpload}
              disabled={items.length === 0 || isProcessing}
              className="px-5 py-2.5 bg-[#4A3426] hover:bg-[#2F2620] text-[#F4EEE1] text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              <Sparkles size={14} />
              <span>{isProcessing ? 'Menyimpan...' : 'Simpan Kenangan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
