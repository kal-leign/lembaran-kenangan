'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Note,
  NoteKind,
  PaperType,
  FontType,
  InkType,
  DecorationType,
} from '@/lib/types';
import { useToast } from '@/components/Toast';
import { X, Sparkles, Eye, Feather } from 'lucide-react';

interface PaperEditorProps {
  initialNote?: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (savedNote: Note, isNew: boolean) => void;
}

export default function PaperEditor({
  initialNote,
  isOpen,
  onClose,
  onSaveSuccess,
}: PaperEditorProps) {
  const [kind, setKind] = useState<NoteKind>(initialNote?.kind || 'quote');
  const [title, setTitle] = useState(initialNote?.title || '');
  const [body, setBody] = useState(initialNote?.body || '');
  const [author, setAuthor] = useState(initialNote?.author || '');
  const [paper, setPaper] = useState<PaperType>(initialNote?.paper || 'ivory');
  const [font, setFont] = useState<FontType>(initialNote?.font || 'serif');
  const [ink, setInk] = useState<InkType>(initialNote?.ink || 'brown');
  const [decoration, setDecoration] = useState<DecorationType>(
    initialNote?.decoration || 'tape'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);

  const { showToast } = useToast();
  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) {
      showToast('Isi tulisan tidak boleh kosong.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const isNew = !initialNote?.id;

      // Rotasi acak halus (-1.2° sampai 1.2°) untuk kesan natural
      const rotation = initialNote?.rotation ?? Number(((Math.random() - 0.5) * 2.4).toFixed(1));

      const payload = {
        kind,
        title: title.trim() || null,
        body: body,
        author: author.trim() || null,
        paper,
        font,
        ink,
        decoration,
        rotation,
      };

      if (isNew) {
        const { data, error } = await supabase
          .from('notes')
          .insert(payload)
          .select()
          .single();

        if (error) throw new Error(error.message);

        showToast('Lembaran kata baru berhasil diabadikan.', 'success');
        onSaveSuccess(data, true);
      } else {
        const { data, error } = await supabase
          .from('notes')
          .update(payload)
          .eq('id', initialNote.id)
          .select()
          .single();

        if (error) throw new Error(error.message);

        showToast('Tulisan berhasil diperbarui.', 'success');
        onSaveSuccess(data, false);
      }

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan tulisan.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paperOptions: { id: PaperType; label: string }[] = [
    { id: 'ivory', label: 'Gading Polos' },
    { id: 'aged', label: 'Kertas Tua' },
    { id: 'lined', label: 'Kertas Bergaris' },
    { id: 'letter', label: 'Surat Klasik' },
    { id: 'torn', label: 'Sobekan Tepi' },
  ];

  const fontOptions: { id: FontType; label: string }[] = [
    { id: 'serif', label: 'Serif Klasik (EB Garamond)' },
    { id: 'italic', label: 'Italic Elegan (Cormorant)' },
    { id: 'script', label: 'Tulisan Tangan (Pinyon)' },
  ];

  const inkOptions: { id: InkType; label: string; color: string }[] = [
    { id: 'brown', label: 'Cokelat Tua', color: '#2F2620' },
    { id: 'black', label: 'Hitam Pudar', color: '#383533' },
    { id: 'blue', label: 'Biru Tinta', color: '#1C2833' },
    { id: 'wine', label: 'Merah Anggur', color: '#4A1521' },
  ];

  const decorationOptions: { id: DecorationType; label: string }[] = [
    { id: 'none', label: 'Polos' },
    { id: 'tape', label: 'Selotip Kertas' },
    { id: 'pin', label: 'Paku Kuningan' },
  ];

  // Helper preview classes
  const paperClass =
    paper === 'aged'
      ? 'paper-aged'
      : paper === 'lined'
      ? 'paper-lined'
      : paper === 'letter'
      ? 'paper-letter'
      : paper === 'torn'
      ? 'paper-torn'
      : 'paper-ivory';

  const fontClass =
    font === 'italic'
      ? 'font-style-italic'
      : font === 'script'
      ? 'font-style-script'
      : 'font-style-serif';

  const inkClass =
    ink === 'black'
      ? 'ink-black'
      : ink === 'blue'
      ? 'ink-blue'
      : ink === 'wine'
      ? 'ink-wine'
      : 'ink-brown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#231A14]/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FAF7F0] border border-[#D8CCB4] rounded-[2px] w-full max-w-3xl my-8 p-6 sm:p-8 shadow-2xl relative">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 text-[#6B5D50] hover:text-[#2F2620] p-1.5 transition-colors"
          aria-label="Tutup editor"
        >
          <X size={20} />
        </button>

        {/* Header Editor */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#A68A56]">
              {initialNote ? 'Sunting Lembaran' : 'Menulis Lembaran Baru'}
            </span>
            <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-medium text-[#2F2620] mt-1 flex items-center gap-2">
              <Feather size={22} className="text-[#A68A56]" />
              <span>Goresan Pena & Puisi</span>
            </h2>
          </div>

          {/* Toggle Pratinjau Mobile */}
          <button
            type="button"
            onClick={() => setPreviewActive(!previewActive)}
            className="sm:hidden text-xs uppercase tracking-wider text-[#A68A56] border border-[#D8CCB4] px-2.5 py-1 flex items-center gap-1"
          >
            <Eye size={12} />
            {previewActive ? 'Editor' : 'Pratinjau'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Input (Sebelah Kiri / Atas) */}
          <form
            onSubmit={handleSubmit}
            className={`space-y-4 lg:col-span-7 ${
              previewActive ? 'hidden sm:block' : 'block'
            }`}
          >
            {/* Pilihan Jenis */}
            <div className="flex gap-2">
              {(['quote', 'poem', 'note'] as NoteKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`flex-1 py-1.5 text-xs uppercase tracking-wider border transition-colors cursor-pointer ${
                    kind === k
                      ? 'bg-[#4A3426] text-[#F4EEE1] border-[#4A3426]'
                      : 'bg-[#F4EEE1] text-[#6B5D50] border-[#D8CCB4] hover:border-[#A68A56]'
                  }`}
                >
                  {k === 'quote' ? 'Kutipan' : k === 'poem' ? 'Puisi' : 'Catatan'}
                </button>
              ))}
            </div>

            {/* Judul (Opsional) */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                Judul (Opsional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Hujan Bulan Juni"
                className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-3 py-2 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
              />
            </div>

            {/* Isi Tulisan */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                Isi Puisi / Kutipan / Catatan <span className="text-[#A68A56]">*</span>
              </label>
              <textarea
                rows={7}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tuliskan bait puisi atau bait kenangan di sini... (baris baru tetap terjaga persis)"
                className="w-full bg-[#FAF7F0] border border-[#D8CCB4] p-3 text-xs sm:text-sm text-[#2F2620] focus:outline-none focus:border-[#A68A56] leading-relaxed resize-y font-serif"
                required
              />
            </div>

            {/* Penulis / Sumber */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                Penulis / Sumber (Opsional)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Contoh: Sapardi Djoko Damono / Anonim"
                className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-3 py-2 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
              />
            </div>

            {/* Pilihan Gaya Kertas & Font */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                  Gaya Kertas
                </label>
                <select
                  value={paper}
                  onChange={(e) => setPaper(e.target.value as PaperType)}
                  className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-2.5 py-1.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
                >
                  {paperOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                  Gaya Tulisan
                </label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value as FontType)}
                  className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-2.5 py-1.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
                >
                  {fontOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Warna Tinta & Dekorasi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                  Warna Tinta
                </label>
                <select
                  value={ink}
                  onChange={(e) => setInk(e.target.value as InkType)}
                  className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-2.5 py-1.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
                >
                  {inkOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6B5D50] mb-1">
                  Dekorasi Atas
                </label>
                <select
                  value={decoration}
                  onChange={(e) => setDecoration(e.target.value as DecorationType)}
                  className="w-full bg-[#FAF7F0] border border-[#D8CCB4] px-2.5 py-1.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56]"
                >
                  {decorationOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tombol Simpan Form */}
            <div className="pt-4 border-t border-[#D8CCB4] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#6B5D50] hover:text-[#2F2620] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#4A3426] hover:bg-[#2F2620] text-[#F4EEE1] text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Sparkles size={14} />
                <span>{isSubmitting ? 'Menyimpan...' : 'Goreskan ke Lembar'}</span>
              </button>
            </div>
          </form>

          {/* Pratinjau Kertas Langsung (Sebelah Kanan) */}
          <div
            className={`lg:col-span-5 flex flex-col items-center justify-center p-4 bg-[#F4EEE1]/60 border border-[#D8CCB4] rounded-[1px] min-h-[350px] ${
              !previewActive ? 'hidden sm:flex' : 'flex'
            }`}
          >
            <div className="w-full text-center mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#A68A56]">
                Pratinjau Kertas Nyata
              </span>
            </div>

            <div className="w-full max-w-sm relative">
              {/* Dekorasi Tape/Pin di Pratinjau */}
              {decoration === 'tape' && <div className="tape-decor" />}
              {decoration === 'pin' && <div className="pin-decor" />}

              <div
                className={`p-6 sm:p-7 min-h-[220px] transition-all duration-300 ${paperClass} ${inkClass}`}
              >
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">
                  {kind === 'poem' ? 'Puisi' : kind === 'quote' ? 'Kutipan' : 'Catatan'}
                </div>

                {title && (
                  <h4 className="font-['Cormorant_Garamond',serif] text-lg font-medium tracking-tight mb-2 border-b border-current/15 pb-1">
                    {title}
                  </h4>
                )}

                <div
                  className={`whitespace-pre-wrap leading-relaxed text-xs sm:text-sm ${fontClass} ${
                    kind === 'quote' ? 'text-center italic' : ''
                  }`}
                >
                  {body || 'Ketik kata-katamu, pratinjau akan tampak anggun di sini...'}
                </div>

                {author && (
                  <div
                    className={`mt-4 pt-2 flex items-center gap-1.5 text-xs font-serif italic opacity-85 ${
                      kind === 'quote' ? 'justify-center' : 'justify-end'
                    }`}
                  >
                    <span>—</span>
                    <span className="font-['Pinyon_Script',cursive] text-base">
                      {author}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
