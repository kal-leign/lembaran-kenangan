'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Note, NoteKind } from '@/lib/types';
import { INITIAL_SAMPLE_NOTES } from '@/lib/seed-data';
import NoteCard from '@/components/NoteCard';
import NoteReaderModal from '@/components/NoteReaderModal';
import PaperEditor from '@/components/PaperEditor';
import { Plus, Search, BookOpen } from 'lucide-react';

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
      setIsOwner(!!authData.user);

      // Ambil tulisan dari Supabase
      const { data: dbNotes, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbNotes && dbNotes.length > 0) {
        setNotes(dbNotes);
      } else {
        setNotes(INITIAL_SAMPLE_NOTES);
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
            Goresan Pena & Puisi
          </span>
          <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-medium text-[#2F2620] tracking-tight">
            Lembar Tulisan
          </h1>
          <p className="font-['EB_Garamond',serif] italic text-sm sm:text-base text-[#6B5D50] mt-1.5">
            Bait-bait puisi, kutipan hening, dan catatan yang dijaga dari lupa.
          </p>
        </div>

        {/* Tombol Tulis Baru (Hanya tampil jika login) */}
        {isOwner && (
          <button
            onClick={() => {
              setEditingNote(null);
              setIsEditorOpen(true);
            }}
            className="px-5 py-2.5 bg-[#4A3426] hover:bg-[#2F2620] text-[#F4EEE1] text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center gap-2 rounded-[1px] shadow-sm cursor-pointer self-start md:self-end"
          >
            <Plus size={15} />
            <span>Tulis Baru</span>
          </button>
        )}
      </div>

      {/* ========================================================
          BAR PENCARIAN & FILTER KATEGORI
          ======================================================== */}
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

      {/* ========================================================
          DAFTAR KERTAS PUISI & QUOTES (MASONRY)
          ======================================================== */}
      {isLoading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-[#E9DFCB]/40 h-64 rounded-[1px] border border-[#D8CCB4] break-inside-avoid"
            />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20 bg-[#FAF7F0] border border-[#D8CCB4]/60 rounded-[1px] p-8 max-w-md mx-auto">
          <BookOpen size={32} className="mx-auto text-[#A68A56] mb-3 opacity-70" />
          <h3 className="font-['Cormorant_Garamond',serif] text-2xl text-[#2F2620]">
            Belum Ada Lembaran
          </h3>
          <p className="font-serif italic text-xs text-[#6B5D50] mt-1.5 leading-relaxed">
            Tidak ditemukan tulisan yang cocok dengan pencarian atau kurasi ini.
          </p>
          {isOwner && (
            <button
              onClick={() => {
                setEditingNote(null);
                setIsEditorOpen(true);
              }}
              className="mt-6 px-5 py-2.5 bg-[#4A3426] text-[#F4EEE1] text-xs uppercase tracking-[0.18em] rounded-[1px]"
            >
              + Goreskan Lembaran Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isOwner={isOwner}
              onSelect={(n) => setSelectedNote(n)}
              onEdit={(n) => {
                setEditingNote(n);
                setIsEditorOpen(true);
              }}
              onDelete={(n) => handleDeleteNote(n.id)}
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
        onEdit={(n) => {
          setSelectedNote(null);
          setEditingNote(n);
          setIsEditorOpen(true);
        }}
        onDelete={handleDeleteNote}
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
