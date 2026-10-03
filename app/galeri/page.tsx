'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Photo } from '@/lib/types';
import PhotoCard from '@/components/PhotoCard';
import Lightbox from '@/components/Lightbox';
import UploadPanel from '@/components/UploadPanel';
import EditPhotoModal from '@/components/EditPhotoModal';
import { Plus, Image as ImageIcon, Filter, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function GaleriPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const supabase = createClient();

  useEffect(() => {
    async function fetchPhotos() {
      setIsLoading(true);

      // Cek status sesi pemilik akun
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;
      setIsOwner(!!currentUser);

      if (currentUser) {
        // HANYA ambil foto milik user yang sedang login
        const { data: dbPhotos } = await supabase
          .from('photos')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('memory_date', { ascending: false, nullsFirst: false });

        setPhotos(dbPhotos || []);
      } else {
        // Pengguna yang belum login TIDAK melihat galeri akun mana pun
        setPhotos([]);
      }

      setIsLoading(false);
    }

    fetchPhotos();
  }, [supabase]);

  // Ekstrak daftar tahun unik dari memory_date
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    photos.forEach((photo) => {
      if (photo.memory_date) {
        const y = photo.memory_date.split('-')[0];
        if (y && y.length === 4) years.add(y);
      }
    });
    return Array.from(years).sort().reverse();
  }, [photos]);

  // Filter foto berdasarkan tahun
  const filteredPhotos = useMemo(() => {
    if (selectedYear === 'all') return photos;
    return photos.filter((photo) => photo.memory_date?.startsWith(selectedYear));
  }, [photos, selectedYear]);

  // Handler setelah foto baru diunggah
  const handleUploadSuccess = (newPhotos: Photo[]) => {
    setPhotos((prev) => [...newPhotos, ...prev]);
    setIsUploadOpen(false);
  };

  // Handler setelah foto diedit
  const handlePhotoUpdated = (updated: Photo) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  // Handler setelah foto dihapus
  const handlePhotoDeleted = (deletedId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== deletedId));
  };

  return (
    <div className="space-y-12">
      {/* ========================================================
          HEADER GALERI & KONTROL
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8CCB4] pb-6 gap-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A68A56] block mb-1">
            {isOwner ? 'Album Galeri Pribadimu' : 'Ruang Galeri Terkunci'}
          </span>
          <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-medium text-[#2F2620] tracking-tight">
            Galeri Kenangan
          </h1>
          <p className="font-['EB_Garamond',serif] italic text-sm sm:text-base text-[#6B5D50] mt-1.5">
            {isOwner
              ? 'Potret-potret privat yang hanya bisa dilihat dan dikelola oleh akunmu.'
              : 'Privat per akun. Pengunjung belum login tidak dapat melihat foto apa pun.'}
          </p>
        </div>

        {/* Filter Tahun & Tombol Tambah Foto */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter Tahun */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#FAF7F0] border border-[#D8CCB4] px-3 py-1.5 rounded-[1px] text-xs">
              <Filter size={13} className="text-[#A68A56]" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-[#2F2620] focus:outline-none cursor-pointer uppercase tracking-wider text-[11px]"
              >
                <option value="all">Semua Tahun</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tombol Tambah Foto */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-[#4A3426] hover:bg-[#2F2620] text-[#F4EEE1] text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center gap-2 rounded-[1px] shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>{isOwner ? 'Tambah Foto' : 'Coba Unggah (Mode Tamu)'}</span>
          </button>
        </div>
      </div>

      {/* Banner Peringatan Mode Tamu jika ada foto sementara */}
      {!isOwner && photos.length > 0 && (
        <div className="p-4 bg-[#FBF7EE] border border-[#D8CCB4] rounded-[1px] flex items-start gap-3 text-xs text-[#6B5D50] font-serif">
          <AlertCircle size={16} className="text-[#A68A56] shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong>Mode Pratinjau Tamu:</strong> Foto di bawah ini hanya tampil sementara di peramban Anda dan tidak disimpan ke server. Masuk atau daftar akun agar kenangan Anda tersimpan aman dan permanen.
          </div>
          <Link
            href="/masuk"
            className="text-xs uppercase tracking-wider font-semibold text-[#A68A56] hover:underline"
          >
            Masuk / Daftar
          </Link>
        </div>
      )}

      {/* ========================================================
          TAMPILAN MASONRY FOTO
          ======================================================== */}
      {isLoading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#E9DFCB]/50 h-72 rounded-[1px] border border-[#D8CCB4] break-inside-avoid"
            />
          ))}
        </div>
      ) : !isOwner && photos.length === 0 ? (
        /* KONDISI PENGUNJUNG BELUM LOGIN (TIDAK BISA MELIHAT GALERI APA-APA) */
        <div className="text-center py-20 px-6 bg-[#FAF7F0] border border-[#D8CCB4] rounded-[1px] max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#E9DFCB] text-[#4A3426] flex items-center justify-center mx-auto mb-4 border border-[#D8CCB4]">
            <Lock size={22} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A68A56]">
            Privasi Terjaga Penuh
          </span>
          <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2F2620] mt-1">
            Galeri Akun Bersifat Privat
          </h2>
          <p className="font-serif italic text-sm text-[#6B5D50] mt-3 leading-relaxed">
            Setiap kenangan disimpan terpisah per akun. Pengguna lain tidak bisa melihat album Anda, dan Anda tidak bisa melihat album mereka. Silakan masuk atau daftar akun untuk membuka album kenangan Anda sendiri.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/masuk"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#4A3426] hover:bg-[#2F2620] text-[#F4EEE1] text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 rounded-[1px]"
            >
              <LogIn size={14} />
              <span>Masuk / Buka Akun</span>
            </Link>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 border border-[#D8CCB4] hover:border-[#A68A56] bg-white/70 text-[#2F2620] text-xs uppercase tracking-[0.18em] transition-colors rounded-[1px]"
            >
              Coba Pratinjau Bingkai
            </button>
          </div>
        </div>
      ) : photos.length === 0 ? (
        /* KONDISI PEMILIK SUDAH LOGIN TAPI BELUM ADA FOTO */
        <div className="text-center py-20 bg-[#FAF7F0] border border-[#D8CCB4]/60 rounded-[1px] p-8 max-w-md mx-auto">
          <ImageIcon size={32} className="mx-auto text-[#A68A56] mb-3 opacity-70" />
          <h3 className="font-['Cormorant_Garamond',serif] text-2xl text-[#2F2620]">
            Album Anda Masih Sunyi
          </h3>
          <p className="font-serif italic text-xs text-[#6B5D50] mt-1.5 leading-relaxed">
            Belum ada foto yang disematkan di album pribadi ini. Mulailah dari satu kenangan manis.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="mt-6 px-5 py-2.5 bg-[#4A3426] text-[#F4EEE1] text-xs uppercase tracking-[0.18em] rounded-[1px] cursor-pointer"
          >
            + Unggah Foto Pertama
          </button>
        </div>
      ) : (
        /* TAMPILAN FOTO PENGGUNA */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8">
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isOwner={isOwner}
              onSelect={(p) => setSelectedPhoto(p)}
              onEdit={isOwner ? (p) => setEditingPhoto(p) : undefined}
              onDelete={isOwner ? (p) => handlePhotoDeleted(p.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL LIGHTBOX, UPLOAD, & EDIT
          ======================================================== */}
      <Lightbox
        photos={filteredPhotos}
        activePhoto={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onNavigate={(p) => setSelectedPhoto(p)}
      />

      <UploadPanel
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <EditPhotoModal
        photo={editingPhoto}
        isOpen={!!editingPhoto}
        onClose={() => setEditingPhoto(null)}
        onUpdate={handlePhotoUpdated}
        onDelete={handlePhotoDeleted}
      />
    </div>
  );
}
