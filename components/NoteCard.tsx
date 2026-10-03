'use client';

import { Note } from '@/lib/types';
import { Edit2, Trash2 } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  isOwner?: boolean;
  onSelect: (note: Note) => void;
  onEdit?: (note: Note) => void;
  onDelete?: (note: Note) => void;
}

export default function NoteCard({
  note,
  isOwner = false,
  onSelect,
  onEdit,
  onDelete,
}: NoteCardProps) {
  // Mapping class CSS kertas
  const paperClass =
    note.paper === 'aged'
      ? 'paper-aged'
      : note.paper === 'lined'
      ? 'paper-lined'
      : note.paper === 'letter'
      ? 'paper-letter'
      : note.paper === 'torn'
      ? 'paper-torn'
      : 'paper-ivory';

  // Mapping class CSS font
  const fontClass =
    note.font === 'italic'
      ? 'font-style-italic'
      : note.font === 'script'
      ? 'font-style-script'
      : 'font-style-serif';

  // Mapping class CSS tinta
  const inkClass =
    note.ink === 'black'
      ? 'ink-black'
      : note.ink === 'blue'
      ? 'ink-blue'
      : note.ink === 'wine'
      ? 'ink-wine'
      : 'ink-brown';

  const rotateStyle = note.rotation
    ? { transform: `rotate(${note.rotation}deg)` }
    : {};

  const isQuote = note.kind === 'quote';

  return (
    <div
      className="group relative break-inside-avoid mb-8 cursor-pointer select-none transition-all duration-300 hover:-translate-y-1"
      style={rotateStyle}
      onClick={() => onSelect(note)}
    >
      {/* Dekorasi Selotip (Tape) atau Paku (Pin) */}
      {note.decoration === 'tape' && <div className="tape-decor" />}
      {note.decoration === 'pin' && <div className="pin-decor" />}

      {/* Badan Kertas */}
      <div
        className={`p-6 sm:p-7 transition-shadow duration-300 ${paperClass} ${inkClass}`}
      >
        {/* Label Jenis Kecil */}
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] opacity-60 mb-3">
          <span>
            {note.kind === 'poem'
              ? 'Puisi'
              : note.kind === 'quote'
              ? 'Kutipan'
              : 'Catatan'}
          </span>
          <span className="font-serif italic text-[11px] lowercase opacity-80">
            ✦ lembar
          </span>
        </div>

        {/* Judul (jika ada) */}
        {note.title && (
          <h3 className="font-['Cormorant_Garamond',serif] text-xl font-medium tracking-tight mb-3 border-b border-current/15 pb-1">
            {note.title}
          </h3>
        )}

        {/* Isi Teks (Line Break Terjaga Penuh) */}
        <div
          className={`whitespace-pre-wrap leading-relaxed text-sm sm:text-base ${fontClass} ${
            isQuote ? 'text-center italic text-base sm:text-lg my-2' : ''
          }`}
        >
          {note.body.length > 340
            ? `${note.body.slice(0, 340)}...`
            : note.body}
        </div>

        {/* Penulis / Sumber */}
        {note.author && (
          <div
            className={`mt-4 pt-2 flex items-center gap-1.5 text-xs font-serif italic opacity-85 ${
              isQuote ? 'justify-center' : 'justify-end'
            }`}
          >
            <span>—</span>
            <span className="font-['Pinyon_Script',cursive] text-lg sm:text-xl">
              {note.author}
            </span>
          </div>
        )}
      </div>

      {/* Kontrol Pemilik (Edit & Hapus) */}
      {isOwner && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#FAF6EE]/90 backdrop-blur-sm p-1 rounded-sm border border-[#D8CCB4] shadow-md z-30">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="p-1 text-[#6B5D50] hover:text-[#2F2620] transition-colors"
              title="Ubah tulisan"
            >
              <Edit2 size={12} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note);
              }}
              className="p-1 text-[#6B5D50] hover:text-[#8E3232] transition-colors"
              title="Hapus tulisan"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
