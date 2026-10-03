import type { Metadata } from 'next';
import { Cormorant_Garamond, EB_Garamond, Pinyon_Script } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-eb-garamond',
  display: 'swap',
});

const pinyon = Pinyon_Script({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pinyon',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lembaran Kenangan — Galeri & Catatan Abadi',
  description:
    'Sebuah galeri foto klasik dan buku catatan sunyi untuk menyimpan puisi, kenangan, dan quotes indah.',
  keywords: ['galeri kenangan', 'puisi', 'quotes', 'album klasik', 'lembaran kenangan'],
  authors: [{ name: 'Lembaran Kenangan' }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✦</text></svg>",
  },
  robots: process.env.NEXT_PUBLIC_PUBLIC_VIEW === 'false' ? 'noindex, nofollow' : 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${cormorant.variable} ${ebGaramond.variable} ${pinyon.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col justify-between selection:bg-[#E2D3B8] selection:text-[#2F2620]">
        <ToastProvider>
          {/* Lapisan Grain Tekstur Kertas Halus */}
          <div className="vintage-grain" aria-hidden="true" />
          <div className="page-vignette" aria-hidden="true" />

          <Navbar />

          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
            {children}
          </main>

          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
