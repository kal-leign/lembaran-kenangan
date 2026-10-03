'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { X, Edit2, Trash2 } from 'lucide-react';

interface NoteReaderModalProps {
  note: Note | null;
  isOpen: boolean;
  isOwner?: boolean;
  onClose: () => void;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
}

export default function NoteReaderModal({
  note,
  isOpen,
  isOwner = false,
  onClose,
  onEdit,
  onDelete,
}: NoteReaderModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !note) return null;

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

  const fontClass =
    note.font === 'italic'
      ? 'font-style-italic'
      : note.font === 'script'
      ? 'font-style-script'
      : 'font-style-serif';

  const inkClass =
    note.ink === 'black'
      ? 'ink-black'
      : note.ink === 'blue'
      ? 'ink-blue'
      : note.ink === 'wine'
      ? 'ink-wine'
      : 'ink-brown';

  const isQuote = note.kind === 'quote';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', note.id);

      if (error) throw new Error(error.message);

      showToast('Lembaran tulisan telah dihapus.', 'info');
      if (onDelete) onDelete(note.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus tulisan.';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#231A14]/80 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative w-full max-w-2xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tombol Tutup */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-[#F4EEE1]/80 hover:text-[#F4EEE1] p-1.5 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={24} />
          </button>

          {/* Lembaran Kertas Pembaca */}
          <div className="relative">
            {/* Dekorasi Selotip / Paku */}
            {note.decoration === 'tape' && <div className="tape-decor" />}
            {note.decoration === 'pin' && <div className="pin-decor" />}

            <div
              className={`p-8 sm:p-12 md:p-14 shadow-2xl relative select-text ${paperClass} ${inkClass}`}
            >
              {/* Jenis & Ornamen */}
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] opacity-60 mb-6">
                <span>
                  {note.kind === 'poem'
                    ? 'Puisi'
                    : note.kind === 'quote'
                    ? 'Kutipan Pilihan'
                    : 'Catatan Hening'}
                </span>
                <span className="text-[#A68A56]">✦</span>
              </div>

              {/* Judul Puisi / Catatan */}
              {note.title && (
                <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-medium tracking-tight mb-6 pb-2 border-b border-current/15">
                  {note.title}
                </h2>
              )}

              {/* Isi Tulisan Penuh */}
              <div
                className={`whitespace-pre-wrap leading-relaxed text-base sm:text-lg sm:leading-loose max-h-[60vh] overflow-y-auto pr-2 ${fontClass} ${
                  isQuote ? 'text-center italic text-lg sm:text-xl py-4' : ''
                }`}
              >
                {note.body}
              </div>

              {/* Penulis / Sumber */}
              {note.author && (
                <div
                  className={`mt-8 pt-4 flex items-center gap-2 text-sm font-serif italic opacity-90 border-t border-current/10 ${
                    isQuote ? 'justify-center' : 'justify-end'
                  }`}
                >
                  <span>—</span>
                  <span className="font-['Pinyon_Script',cursive] text-2xl">
                    {note.author}
                  </span>
                </div>
              )}

              {/* Panel Kontrol Pemilik di Bagian Bawah Modal */}
              {isOwner && (
                <div className="mt-8 pt-4 border-t border-current/15 flex items-center justify-between">
                  {showConfirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8E3232] font-serif">
                        Hapus tulisan ini?
                      </span>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-2.5 py-1 bg-[#8E3232] text-white text-[11px] uppercase tracking-wider rounded-[1px]"
                      >
                        {isDeleting ? '...' : 'Ya'}
                      </button>
                      <button
                        onClick={() => setShowConfirmDelete(false)}
                        className="text-xs opacity-70 hover:opacity-100 px-1"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirmDelete(true)}
                      className="text-xs opacity-70 hover:opacity-100 flex items-center gap-1.5 transition-opacity"
                    >
                      <Trash2 size={13} />
                      <span>Hapus</span>
                    </button>
                  )}

                  {onEdit && (
                    <button
                      onClick={() => {
                        onClose();
                        onEdit(note);
                      }}
                      className="text-xs opacity-70 hover:opacity-100 flex items-center gap-1.5 transition-opacity"
                    >
                      <Edit2 size={13} />
                      <span>Sunting</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
