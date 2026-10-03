'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Photo, Note } from '@/lib/types';
import { INITIAL_SAMPLE_PHOTOS, INITIAL_SAMPLE_NOTES } from '@/lib/seed-data';
import PhotoCard from '@/components/PhotoCard';
import NoteCard from '@/components/NoteCard';
import Lightbox from '@/components/Lightbox';
import NoteReaderModal from '@/components/NoteReaderModal';
import { ArrowRight, Compass, Feather } from 'lucide-react';

export default function HomePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // Cek sesi user
      const { data: authData } = await supabase.auth.getUser();
      setIsOwner(!!authData.user);

      // Ambil foto dari Supabase
      const { data: dbPhotos } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (dbPhotos && dbPhotos.length > 0) {
        setPhotos(dbPhotos);
      } else {
        setPhotos(INITIAL_SAMPLE_PHOTOS.slice(0, 4));
      }

      // Ambil catatan dari Supabase
      const { data: dbNotes } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (dbNotes && dbNotes.length > 0) {
        setNotes(dbNotes);
      } else {
        setNotes(INITIAL_SAMPLE_NOTES.slice(0, 3));
      }

      setIsLoading(false);
    }

    loadData();
  }, [supabase]);

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* ========================================================
          HERO MINIMALIS & ELEGAN
          ======================================================== */}
      <section className="text-center pt-8 sm:pt-16 pb-6 max-w-3xl mx-auto flex flex-col items-center">
        <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#A68A56] mb-4 block">
          Arsip Pribadi & Kurasi Sunyi
        </span>

        <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-7xl font-normal text-[#2F2620] tracking-tight leading-[1.08] mb-6">
          Lembaran Kenangan
        </h1>

        <div className="w-16 h-[1px] bg-[#A68A56]/60 mb-6" />

        <p className="font-['EB_Garamond',serif] italic text-lg sm:text-2xl text-[#6B5D50] leading-relaxed max-w-xl mx-auto mb-10">
          &ldquo;Tempat menyimpan yang tak ingin dilupakan.&rdquo;
        </p>

        {/* Tombol Aksi Menuju Galeri & Tulisan */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8 text-xs uppercase tracking-[0.2em]">
          <Link
            href="/galeri"
            className="w-full sm:w-auto px-7 py-3.5 bg-[#4A3426] hover:bg-[#2F2620] text-[#F4EEE1] transition-all flex items-center justify-center gap-2.5 rounded-[1px] shadow-sm hover:shadow group"
          >
            <Compass size={15} className="text-[#D8CCB4]" />
            <span>Jelajahi Galeri</span>
            <ArrowRight
              size={14}
              className="text-[#D8CCB4] group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            href="/tulisan"
            className="w-full sm:w-auto px-7 py-3.5 border border-[#D8CCB4] hover:border-[#A68A56] bg-[#FAF7F0] text-[#2F2620] transition-all flex items-center justify-center gap-2.5 rounded-[1px] hover:bg-[#F4EEE1]"
          >
            <Feather size={15} className="text-[#A68A56]" />
            <span>Bacaan & Puisi</span>
          </Link>
        </div>
      </section>

      {/* ========================================================
          DINDING KENANGAN (PRATINJAU FOTO & KERTAS TERKINI)
          ======================================================== */}
      <section className="space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#D8CCB4] pb-4 gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A68A56]">
              Pratinjau Dinding
            </span>
            <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2F2620] tracking-tight">
              Bercak Cerita Terkini
            </h2>
          </div>
          <p className="font-serif italic text-xs text-[#6B5D50]">
            Tersusun santai seperti lembaran yang disematkan di dinding ruang baca.
          </p>
        </div>

        {/* Kolom Campuran Dinding (Foto & Catatan Puisi) */}
        {isLoading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#E9DFCB]/50 h-64 rounded-[1px] border border-[#D8CCB4] break-inside-avoid"
              />
            ))}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
            {photos.slice(0, 3).map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isOwner={false}
                onSelect={(p) => setSelectedPhoto(p)}
              />
            ))}

            {notes.slice(0, 2).map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isOwner={false}
                onSelect={(n) => setSelectedNote(n)}
              />
            ))}

            {photos.length > 3 && (
              <PhotoCard
                photo={photos[3]}
                isOwner={false}
                onSelect={(p) => setSelectedPhoto(p)}
              />
            )}
          </div>
        )}

        {/* Tautan Cepat ke Galeri Lengkap */}
        <div className="text-center pt-8">
          <Link
            href="/galeri"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#6B5D50] hover:text-[#A68A56] transition-colors py-2 border-b border-transparent hover:border-[#A68A56]"
          >
            <span>Buka Seluruh Album Foto ({photos.length > 0 ? `${photos.length}+ Foto` : 'Koleksi'})</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* ========================================================
          LIGHTBOX & READER MODAL
          ======================================================== */}
      <Lightbox
        photos={photos}
        activePhoto={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onNavigate={(p) => setSelectedPhoto(p)}
      />

      <NoteReaderModal
        note={selectedNote}
        isOpen={!!selectedNote}
        isOwner={isOwner}
        onClose={() => setSelectedNote(null)}
      />
    </div>
  );
}
