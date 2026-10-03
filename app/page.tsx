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
import { ArrowRight, Compass, Feather, Lock, LogIn, Sparkles } from 'lucide-react';

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
      const currentUser = authData.user;
      setIsOwner(!!currentUser);

      if (currentUser) {
        // Ambil HANYA foto & catatan milik user yang sedang login
        const { data: dbPhotos } = await supabase
          .from('photos')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(4);

        setPhotos(dbPhotos || []);

        const { data: dbNotes } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(3);

        setNotes(dbNotes || []);
      } else {
        // Tamu yang belum login TIDAK melihat data pengguna siapa pun
        setPhotos([]);
        setNotes([]);
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
          Arsip Personal & Kurasi Sunyi
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
            <span>{isOwner ? 'Galeri Akun Anda' : 'Buka Galeri'}</span>
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
            <span>{isOwner ? 'Buku Catatan Anda' : 'Lembar Tulisan'}</span>
          </Link>
        </div>
      </section>

      {/* ========================================================
          DINDING KENANGAN
          ======================================================== */}
      <section className="space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#D8CCB4] pb-4 gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A68A56]">
              {isOwner ? 'Dinding Pribadi Anda' : 'Privasi Lembaran'}
            </span>
            <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2F2620] tracking-tight">
              {isOwner ? 'Bercak Cerita Terkini' : 'Album Privat Per Akun'}
            </h2>
          </div>
          <p className="font-serif italic text-xs text-[#6B5D50]">
            {isOwner
              ? 'Lembaran foto dan puisi yang baru Anda sematkan.'
              : 'Akun lain tidak dapat melihat kenangan Anda, begitu pula sebaliknya.'}
          </p>
        </div>

        {isLoading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#E9DFCB]/50 h-64 rounded-[1px] border border-[#D8CCB4] break-inside-avoid"
              />
            ))}
          </div>
        ) : isOwner ? (
          /* JIKA PEMILIK LOGIN */
          photos.length === 0 && notes.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF7F0] border border-[#D8CCB4] rounded-[1px] p-6 max-w-md mx-auto">
              <Sparkles size={28} className="mx-auto text-[#A68A56] mb-3 opacity-80" />
              <h3 className="font-['Cormorant_Garamond',serif] text-2xl text-[#2F2620]">
                Dinding Anda Masih Sunyi
              </h3>
              <p className="font-serif italic text-xs text-[#6B5D50] mt-1.5 leading-relaxed">
                Anda belum menyematkan foto atau bait puisi di akun ini.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/galeri"
                  className="px-4 py-2 bg-[#4A3426] text-[#F4EEE1] text-xs uppercase tracking-wider rounded-[1px]"
                >
                  + Tambah Foto
                </Link>
                <Link
                  href="/tulisan"
                  className="px-4 py-2 border border-[#D8CCB4] text-[#2F2620] text-xs uppercase tracking-wider rounded-[1px]"
                >
                  + Tulis Puisi
                </Link>
              </div>
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
          )
        ) : (
          /* JIKA BELUM LOGIN (PENGUNJUNG TAMU) */
          <div className="space-y-10">
            <div className="text-center py-14 px-6 bg-[#FAF7F0] border border-[#D8CCB4] rounded-[1px] max-w-xl mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#E9DFCB] text-[#4A3426] flex items-center justify-center mx-auto mb-4 border border-[#D8CCB4]">
                <Lock size={20} />
              </div>
              <h3 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl text-[#2F2620]">
                Ruang Pribadi yang Terkunci Aman
              </h3>
              <p className="font-serif italic text-sm text-[#6B5D50] mt-3 leading-relaxed">
                Di Lembaran Kenangan, semua foto, bait puisi, dan quotes bersifat sepenuhnya privat per akun. Orang yang belum masuk tidak dapat melihat kenangan apa pun.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/masuk"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#4A3426] hover:bg-[#2F2620] text-[#F4EEE1] text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 rounded-[1px]"
                >
                  <LogIn size={14} />
                  <span>Masuk / Buat Akun Pribadi</span>
                </Link>
                <Link
                  href="/galeri"
                  className="w-full sm:w-auto px-5 py-2.5 border border-[#D8CCB4] hover:border-[#A68A56] bg-white/70 text-[#2F2620] text-xs uppercase tracking-[0.18em] transition-colors rounded-[1px]"
                >
                  Coba Pratinjau (Tamu)
                </Link>
              </div>
            </div>

            {/* Cuplikan Sampel Estetika (Hanya Sebagai Panduan Nuansa Desain) */}
            <div className="border-t border-[#D8CCB4]/60 pt-8">
              <div className="text-center mb-8">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#A68A56]">
                  Pratinjau Nuansa Desain
                </span>
                <p className="font-serif italic text-xs text-[#6B5D50] mt-1">
                  Contoh tampilan bingkai klasik dan kertas yang akan menghiasi album Anda setelah mendaftar:
                </p>
              </div>

              <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 opacity-90">
                <PhotoCard
                  photo={INITIAL_SAMPLE_PHOTOS[0]}
                  isOwner={false}
                  onSelect={(p) => setSelectedPhoto(p)}
                />
                <NoteCard
                  note={INITIAL_SAMPLE_NOTES[0]}
                  isOwner={false}
                  onSelect={(n) => setSelectedNote(n)}
                />
                <PhotoCard
                  photo={INITIAL_SAMPLE_PHOTOS[2]}
                  isOwner={false}
                  onSelect={(p) => setSelectedPhoto(p)}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================
          LIGHTBOX & READER MODAL
          ======================================================== */}
      <Lightbox
        photos={isOwner ? photos : INITIAL_SAMPLE_PHOTOS}
        activePhoto={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onNavigate={(p) => setSelectedPhoto(p)}
      />

      <NoteReaderModal
        note={selectedNote}
        isOpen={!!selectedNote}
        isOwner={false}
        onClose={() => setSelectedNote(null)}
      />
    </div>
  );
}
