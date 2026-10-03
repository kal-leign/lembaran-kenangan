'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Photo } from '@/lib/types';
import FrameWrapper from '@/components/FrameWrapper';
import { formatTanggalIndo } from '@/lib/date';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LightboxProps {
  photos: Photo[];
  activePhoto: Photo | null;
  onClose: () => void;
  onNavigate?: (photo: Photo) => void;
}

export default function Lightbox({
  photos,
  activePhoto,
  onClose,
  onNavigate,
}: LightboxProps) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const activeIdx = activePhoto
    ? photos.findIndex((p) => p.id === activePhoto.id)
    : -1;
  const currentIndex = activeIdx !== -1 ? activeIdx : 0;
  const currentPhoto = photos[currentIndex] || activePhoto;

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    const newIdx = (currentIndex - 1 + photos.length) % photos.length;
    if (onNavigate) onNavigate(photos[newIdx]);
  }, [currentIndex, photos, onNavigate]);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    const newIdx = (currentIndex + 1) % photos.length;
    if (onNavigate) onNavigate(photos[newIdx]);
  }, [currentIndex, photos, onNavigate]);

  // Keyboard navigation & ESC
  useEffect(() => {
    if (!activePhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto, handlePrev, handleNext, onClose]);

  // Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Geser ke kiri -> Foto Berikutnya
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Geser ke kanan -> Foto Sebelumnya
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!activePhoto || !currentPhoto) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#231A14]/88 backdrop-blur-md p-4 sm:p-8 select-none"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-8 sm:right-8 z-50 text-[#F4EEE1]/80 hover:text-[#F4EEE1] p-2 transition-colors cursor-pointer"
          aria-label="Tutup pratinjau"
        >
          <X size={26} />
        </button>

        {/* Tombol Navigasi Sebelumnya */}
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 text-[#F4EEE1]/70 hover:text-[#F4EEE1] p-3 transition-colors hidden sm:block cursor-pointer"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft size={36} />
          </button>
        )}

        {/* Konten Foto Lightbox */}
        <motion.div
          key={currentPhoto.id}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-[70vh] flex items-center justify-center">
            <FrameWrapper
              frame={currentPhoto.frame}
              filter={currentPhoto.filter}
              caption={currentPhoto.caption}
              memoryDate={currentPhoto.memory_date}
              className="max-h-[68vh] shadow-2xl"
            >
              <div className="relative max-h-[65vh] w-auto flex items-center justify-center">
                <Image
                  src={currentPhoto.public_url}
                  alt={currentPhoto.caption || 'Foto kenangan'}
                  width={currentPhoto.width || 1200}
                  height={currentPhoto.height || 900}
                  className="max-h-[65vh] w-auto object-contain rounded-[1px]"
                  priority
                />
              </div>
            </FrameWrapper>
          </div>

          {/* Caption & Keterangan Tambahan di Bawah Foto (untuk frame selain Polaroid) */}
          {currentPhoto.frame !== 'polaroid' && (
            <div className="mt-4 text-center max-w-lg">
              {currentPhoto.caption && (
                <p className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl text-[#F4EEE1] tracking-wide">
                  {currentPhoto.caption}
                </p>
              )}
              {currentPhoto.memory_date && (
                <p className="font-serif italic text-sm text-[#D8CCB4]/80 mt-1">
                  {formatTanggalIndo(currentPhoto.memory_date)}
                </p>
              )}
            </div>
          )}

          {/* Indikator Angka */}
          {photos.length > 1 && (
            <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[#A68A56]">
              {currentIndex + 1} dari {photos.length}
            </div>
          )}
        </motion.div>

        {/* Tombol Navigasi Berikutnya */}
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 text-[#F4EEE1]/70 hover:text-[#F4EEE1] p-3 transition-colors hidden sm:block cursor-pointer"
            aria-label="Foto berikutnya"
          >
            <ChevronRight size={36} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
