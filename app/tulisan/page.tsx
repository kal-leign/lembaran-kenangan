'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Note, NoteKind } from '@/lib/types';
import NoteCard from '@/components/NoteCard';
import NoteReaderModal from '@/components/NoteReaderModal';
import PaperEditor from '@/components/PaperEditor';
import { Plus, Search, BookOpen, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function TulisanPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | NoteKind>('all');

  const supabase = createClient();

  useEffect(() => {
    async function fetchNotes() {
      setIsLoading(true);

      // Cek sesi user
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;
      setIsOwner(!!currentUser);

      if (currentUser) {
        // HANYA ambil tulisan milik user yang sedang login
        const { data: dbNotes } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        setNotes(dbNotes || []);
      } else {
        // Pengunjung yang belum login TIDAK melihat tulisan akun mana pun
        setNotes([]);
      }

      setIsLoading(false);
    }

    fetchNotes();
  }, [supabase]);

  // Filter & Search tulisan
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Filter Jenis
      if (kindFilter !== 'all' && n.kind !== kindFilter) return false;

      // Filter Pencarian
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = n.title?.toLowerCase().includes(query);
        const bodyMatch = n.body.toLowerCase().includes(query);
        const authorMatch = n.author?.toLowerCase().includes(query);
        return titleMatch || bodyMatch || authorMatch;
      }

      return true;
    });
  }, [notes, kindFilter, searchQuery]);

  // Handler setelah berhasil menyimpan tulisan baru / edit
  const handleSaveSuccess = (saved: Note, isNew: boolean) => {
    if (isNew) {
      setNotes((prev) => [saved, ...prev]);
    } else {
      setNotes((prev) => prev.map((n) => (n.id === saved.id ? saved : n)));
      if (selectedNote?.id === saved.id) {
        setSelectedNote(saved);
      }
    }
  };

  // Handler setelah menghapus tulisan
  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  return (
    <div className="space-y-12">
      {/* ========================================================
          HEADER TULISAN & KONTROL
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D8CCB4] pb-6 gap-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A68A56] block mb-1">
            {isOwner ? 'Buku Catatan Pribadimu' : 'Catatan Bersifat Privat'}
          </span>
          <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-medium text-[#2F2620] tracking-tight">
            Lembar Tulisan
          </h1>
          <p className="font-['EB_Garamond',serif] italic text-sm sm:text-base text-[#6B5D50] mt-1.5">
            {isOwner
              ? 'Bait-bait puisi dan quotes yang tersimpan hening di akunmu.'
              : 'Privat per akun. Pengunjung belum login tidak dapat membaca catatan siapa pun.'}
          </p>
        </div>

        {/* Tombol Tulis Baru */}
        <button
          onClick={() => {
            setEditingNote(null);
            setIsEditorOpen(true);
          }}
          className="px-5 py-2.5 bg-[#4A3426] hover:bg-[#2F2620] text-[#F4EEE1] text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center gap-2 rounded-[1px] shadow-sm cursor-pointer self-start md:self-end"
        >
          <Plus size={15} />
          <span>{isOwner ? 'Tulis Baru' : 'Coba Menulis (Mode Tamu)'}</span>
        </button>
      </div>

      {/* Banner Peringatan Mode Tamu jika ada tulisan sementara */}
      {!isOwner && notes.length > 0 && (
        <div className="p-4 bg-[#FBF7EE] border border-[#D8CCB4] rounded-[1px] flex items-start gap-3 text-xs text-[#6B5D50] font-serif">
          <AlertCircle size={16} className="text-[#A68A56] shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong>Mode Pratinjau Tamu:</strong> Tulisan di bawah ini hanya tampil sementara di peramban Anda dan tidak disimpan ke server. Masuk atau daftar akun agar puisi dan kutipan Anda tersimpan aman dan privat.
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
          BAR PENCARIAN & FILTER KATEGORI (Hanya aktif jika ada tulisan)
          ======================================================== */}
      {(isOwner || notes.length > 0) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAF7F0] border border-[#D8CCB4]/70 p-3 sm:px-4 rounded-[1px]">
          {/* Filter Kategori */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: 'poem', label: 'Puisi' },
                { id: 'quote', label: 'Kutipan' },
                { id: 'note', label: 'Catatan' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setKindFilter(item.id)}
                className={`px-3 py-1 text-xs uppercase tracking-wider rounded-[1px] transition-colors cursor-pointer shrink-0 ${
                  kindFilter === item.id
                    ? 'bg-[#4A3426] text-[#F4EEE1]'
                    : 'text-[#6B5D50] hover:text-[#2F2620] hover:bg-[#E9DFCB]/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Kotak Pencarian */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, kata, atau penulis..."
              className="w-full bg-[#F4EEE1]/60 border border-[#D8CCB4] pl-8 pr-3 py-1.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56] rounded-[1px] font-serif"
            />
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B5D50]"
            />
          </div>
        </div>
      )}

      {/* ========================================================
          DAFTAR KERTAS PUISI & QUOTES (MASONRY)
          ======================================================== */}
      {isLoading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#E9DFCB]/40 h-64 rounded-[1px] border border-[#D8CCB4] break-inside-avoid"
            />
          ))}
        </div>
      ) : !isOwner && notes.length === 0 ? (
        /* KONDISI PENGUNJUNG BELUM LOGIN (TIDAK MELIHAT TULISAN APA PUN) */
        <div className="text-center py-20 px-6 bg-[#FAF7F0] border border-[#D8CCB4] rounded-[1px] max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#E9DFCB] text-[#4A3426] flex items-center justify-center mx-auto mb-4 border border-[#D8CCB4]">
            <Lock size={22} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A68A56]">
            Buku Catatan Pribadi
          </span>
          <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2F2620] mt-1">
            Tulisan Bersifat Privat
          </h2>
          <p className="font-serif italic text-sm text-[#6B5D50] mt-3 leading-relaxed">
            Setiap puisi, kutipan, dan catatan hanya dapat diakses oleh pemilik akun yang bersangkutan. Akun lain tidak bisa membaca tulisan Anda. Masuk atau daftar untuk membuka lembaran tulisanmu.
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
              onClick={() => {
                setEditingNote(null);
                setIsEditorOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 border border-[#D8CCB4] hover:border-[#A68A56] bg-white/70 text-[#2F2620] text-xs uppercase tracking-[0.18em] transition-colors rounded-[1px]"
            >
              Coba Menulis Puisi
            </button>
          </div>
        </div>
      ) : notes.length === 0 ? (
        /* KONDISI PEMILIK SUDAH LOGIN TAPI BELUM ADA CATATAN */
        <div className="text-center py-20 bg-[#FAF7F0] border border-[#D8CCB4]/60 rounded-[1px] p-8 max-w-md mx-auto">
          <BookOpen size={32} className="mx-auto text-[#A68A56] mb-3 opacity-70" />
          <h3 className="font-['Cormorant_Garamond',serif] text-2xl text-[#2F2620]">
            Buku Catatan Masih Kosong
          </h3>
          <p className="font-serif italic text-xs text-[#6B5D50] mt-1.5 leading-relaxed">
            Belum ada puisi atau kutipan di akun Anda. Goreskan bait pertamamu.
          </p>
          <button
            onClick={() => {
              setEditingNote(null);
              setIsEditorOpen(true);
            }}
            className="mt-6 px-5 py-2.5 bg-[#4A3426] text-[#F4EEE1] text-xs uppercase tracking-[0.18em] rounded-[1px] cursor-pointer"
          >
            + Goreskan Lembaran Pertama
          </button>
        </div>
      ) : (
        /* TAMPILAN LEMBARAN TULISAN */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isOwner={isOwner}
              onSelect={(n) => setSelectedNote(n)}
              onEdit={
                isOwner
                  ? (n) => {
                      setEditingNote(n);
                      setIsEditorOpen(true);
                    }
                  : undefined
              }
              onDelete={isOwner ? (n) => handleDeleteNote(n.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL PEMBACA & EDITOR
          ======================================================== */}
      <NoteReaderModal
        note={selectedNote}
        isOpen={!!selectedNote}
        isOwner={isOwner}
        onClose={() => setSelectedNote(null)}
        onEdit={
          isOwner
            ? (n) => {
                setSelectedNote(null);
                setEditingNote(n);
                setIsEditorOpen(true);
              }
            : undefined
        }
        onDelete={isOwner ? handleDeleteNote : undefined}
      />

      <PaperEditor
        initialNote={editingNote}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingNote(null);
        }}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
