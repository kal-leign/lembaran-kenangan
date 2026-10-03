import React from 'react';
import { FrameType, FilterType } from '@/lib/types';
import { formatTanggalIndo } from '@/lib/date';

interface FrameWrapperProps {
  frame: FrameType;
  filter?: FilterType;
  caption?: string | null;
  memoryDate?: string | null;
  rotation?: number;
  className?: string;
  children: React.ReactNode;
}

export default function FrameWrapper({
  frame = 'none',
  filter = 'original',
  caption,
  memoryDate,
  rotation = 0,
  className = '',
  children,
}: FrameWrapperProps) {
  // Mapping filter CSS
  const filterClass =
    filter === 'sepia'
      ? 'filter-sepia'
      : filter === 'bw'
      ? 'filter-bw'
      : filter === 'faded'
      ? 'filter-faded'
      : 'filter-original';

  // Mapping frame CSS
  const frameClass =
    frame === 'classic'
      ? 'frame-classic'
      : frame === 'gold'
      ? 'frame-gold'
      : frame === 'walnut'
      ? 'frame-walnut'
      : frame === 'polaroid'
      ? 'frame-polaroid'
      : frame === 'vintage_print'
      ? 'frame-vintage-print'
      : 'frame-none';

  const rotateStyle = rotation ? { transform: `rotate(${rotation}deg)` } : {};

  return (
    <div
      className={`relative inline-block w-full overflow-hidden select-none transition-transform duration-300 ${frameClass} ${className}`}
      style={rotateStyle}
    >
      {/* Gambar dengan filter */}
      <div className={`relative w-full h-full overflow-hidden ${filterClass}`}>
        {children}
      </div>

      {/* Bagian khusus Polaroid untuk teks tulisan tangan di bagian bawah */}
      {frame === 'polaroid' && (
        <div className="pt-3 pb-1 px-2 text-center">
          {caption && (
            <p className="font-['Pinyon_Script',cursive] text-lg sm:text-xl text-[#2F2620] leading-none truncate px-1">
              {caption}
            </p>
          )}
          {memoryDate && (
            <p className="font-serif italic text-[11px] text-[#6B5D50] mt-1 tracking-wide">
              {formatTanggalIndo(memoryDate)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
