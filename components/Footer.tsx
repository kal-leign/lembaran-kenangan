import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full mt-20 pb-12 pt-6 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ornamen Pemisah Halus */}
        <div className="ornament-divider my-8">
          <span className="text-sm select-none">✦</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B5D50]">
          <div className="font-['EB_Garamond',serif] italic text-sm text-[#2F2620]/80">
            &ldquo;Waktu boleh berlalu, namun lembaran ini tetap berbisik pelan.&rdquo;
          </div>

          <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.18em]">
            <span>Lembaran Kenangan © {new Date().getFullYear()}</span>
            <span className="text-[#D8CCB4]">·</span>
            <Link
              href="/masuk"
              className="hover:text-[#A68A56] transition-colors"
            >
              Ruang Masuk
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
