'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Photo, FrameType, FilterType } from '@/lib/types';
import FrameWrapper from '@/components/FrameWrapper';
import { useToast } from '@/components/Toast';
import { X, Trash2, Check } from 'lucide-react';

interface EditPhotoModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPhoto: Photo) => void;
  onDelete: (photoId: string) => void;
}

export default function EditPhotoModal({
  photo,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: EditPhotoModalProps) {
  const [caption, setCaption] = useState(photo?.caption || '');
  const [memoryDate, setMemoryDate] = useState(photo?.memory_date || '');
  const [frame, setFrame] = useState<FrameType>(photo?.frame || 'none');
  const [filter, setFilter] = useState<FilterType>(photo?.filter || 'original');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { showToast } = useToast();
  const supabase = createClient();

  if (!isOpen || !photo) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .update({
          caption: caption.trim() || null,
          memory_date: memoryDate || null,
          frame,
          filter,
        })
        .eq('id', photo.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      showToast('Perubahan kenangan berhasil disimpan.', 'success');
      onUpdate(data);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Hapus file dari Storage jika storage_path ada
      if (photo.storage_path) {
        await supabase.storage.from('photos').remove([photo.storage_path]);
      }

      // Hapus dari database
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (error) {
        throw new Error(error.message);
      }

      showToast('Lembaran foto telah dihapus dari kenangan.', 'info');
      onDelete(photo.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus foto.';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const framesList: { id: FrameType; label: string }[] = [
    { id: 'none', label: 'Polos' },
    { id: 'classic', label: 'Galeri Klasik' },
    { id: 'gold', label: 'Emas Ornamen' },
    { id: 'walnut', label: 'Kayu Walnut' },
    { id: 'polaroid', label: 'Polaroid Vintage' },
    { id: 'vintage_print', label: 'Cetak Lama (1950s)' },
  ];

  const filtersList: { id: FilterType; label: string }[] = [
    { id: 'original', label: 'Asli' },
    { id: 'sepia', label: 'Sepia Lembut' },
    { id: 'bw', label: 'Hitam Putih' },
    { id: 'faded', label: 'Pudar Hangat' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#231A14]/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FAF7F0] border border-[#D8CCB4] rounded-[2px] w-full max-w-2xl my-8 p-6 sm:p-8 shadow-2xl relative">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6B5D50] hover:text-[#2F2620] p-1.5 transition-colors"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#A68A56]">
            Pengaturan Kenangan
          </span>
          <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-medium text-[#2F2620] mt-1">
            Ubah Bingkai & Keterangan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Pratinjau Foto Langsung */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#F4EEE1] border border-[#D8CCB4] rounded-[1px] min-h-[260px]">
            <span className="text-[10px] uppercase tracking-wider text-[#A68A56] mb-3">
              Pratinjau Nyata
            </span>
            <div className="max-w-[200px] w-full">
              <FrameWrapper
                frame={frame}
                filter={filter}
                caption={caption}
                memoryDate={memoryDate}
              >
                <div className="relative w-full aspect-[4/5] overflow-hidden">
                  <Image
                    src={photo.public_url}
                    alt="Pratinjau"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              </FrameWrapper>
            </div>
          </div>

          {/* Form Pengaturan */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                Keterangan / Cerita
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Tuliskan secarik kenangan..."
                className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-3 py-2 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                Tanggal Kenangan
              </label>
              <input
                type="date"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-3 py-2 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                Gaya Bingkai
              </label>
              <select
                value={frame}
                onChange={(e) => setFrame(e.target.value as FrameType)}
                className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-3 py-2 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
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
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-3 py-2 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
              >
                {filtersList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Konfirmasi Hapus */}
        {showDeleteConfirm ? (
          <div className="mt-8 p-4 bg-[#FBF2F2] border border-[#E4BFBF] rounded-[1px] flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
            <span className="text-xs text-[#822C2C] font-serif">
              Yakin ingin menghapus foto ini selamanya dari galeri?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs text-[#6B5D50] hover:text-[#2F2620]"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-[#8E3232] hover:bg-[#722323] text-white text-xs uppercase tracking-wider rounded-[1px] disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        ) : (
          /* Footer Tombol Aksi */
          <div className="mt-8 pt-4 border-t border-[#D8CCB4] flex items-center justify-between">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-[#8E3232] hover:text-[#651F1F] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Hapus Foto</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#6B5D50] hover:text-[#2F2620] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#4A3426] hover:bg-[#2F2620] text-[#F4EEE1] text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Check size={14} />
                <span>{isSaving ? 'Menyimpan...' : 'Perbarui'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
