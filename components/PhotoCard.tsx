'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Photo } from '@/lib/types';
import FrameWrapper from '@/components/FrameWrapper';
import { formatTanggalIndo } from '@/lib/date';
import { Edit2, Trash2 } from 'lucide-react';

interface PhotoCardProps {
  photo: Photo;
  isOwner?: boolean;
  onSelect: (photo: Photo) => void;
  onEdit?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
}

export default function PhotoCard({
  photo,
  isOwner = false,
  onSelect,
  onEdit,
  onDelete,
}: PhotoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="group relative break-inside-avoid mb-8 cursor-pointer">
      <div onClick={() => onSelect(photo)}>
        <FrameWrapper
          frame={photo.frame}
          filter={photo.filter}
          caption={photo.caption}
          memoryDate={photo.memory_date}
          rotation={photo.rotation || 0}
        >
          <div className="relative w-full aspect-[4/5] sm:aspect-auto min-h-[220px] max-h-[500px] bg-[#E9DFCB]/40 overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-[#E9DFCB]/60 animate-pulse flex items-center justify-center text-xs text-[#6B5D50] font-serif italic">
                Memuat kenangan...
              </div>
            )}
            <Image
              src={photo.public_url}
              alt={photo.caption || 'Foto kenangan'}
              width={photo.width || 800}
              height={photo.height || 1000}
              className={`w-full h-auto object-cover transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </div>
        </FrameWrapper>
      </div>

      {/* Caption & Tanggal di Luar (Untuk frame non-polaroid) */}
      {photo.frame !== 'polaroid' && (photo.caption || photo.memory_date) && (
        <div
          onClick={() => onSelect(photo)}
          className="mt-3 px-1 text-center transition-opacity"
        >
          {photo.caption && (
            <p className="font-['EB_Garamond',serif] text-sm text-[#2F2620] leading-snug">
              {photo.caption}
            </p>
          )}
          {photo.memory_date && (
            <p className="font-serif italic text-xs text-[#6B5D50] mt-0.5">
              {formatTanggalIndo(photo.memory_date)}
            </p>
          )}
        </div>
      )}

      {/* Kontrol Pemilik (Edit & Hapus) */}
      {isOwner && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-[#FAF6EE]/90 backdrop-blur-sm p-1.5 rounded-sm border border-[#D8CCB4] shadow-md z-20">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(photo);
              }}
              className="p-1 text-[#6B5D50] hover:text-[#2F2620] transition-colors"
              title="Ubah detail foto"
            >
              <Edit2 size={13} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(photo);
              }}
              className="p-1 text-[#6B5D50] hover:text-[#8E3232] transition-colors"
              title="Hapus foto"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
