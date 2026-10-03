'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { LogIn, LogOut, Menu, X, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Periksa status auth awal
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/galeri', label: 'Galeri' },
    { href: '/tulisan', label: 'Tulisan' },
  ];

  return (
    <header className="w-full border-b border-[#D8CCB4]/60 bg-[#F4EEE1]/85 backdrop-blur-[2px] sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo / Monogram */}
        <Link
          href="/"
          className="group flex items-baseline gap-2.5 text-[#2F2620] no-underline focus:outline-none"
        >
          <span className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-medium tracking-tight group-hover:text-[#A68A56] transition-colors">
            Lembaran Kenangan
          </span>
          <span className="text-[#A68A56] text-xs font-serif italic hidden sm:inline">
            ✦ arsip rasa
          </span>
        </Link>

        {/* Menu Navigasi Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors py-1 relative ${
                  isActive
                    ? 'text-[#2F2620]'
                    : 'text-[#6B5D50] hover:text-[#A68A56]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#A68A56]" />
                )}
              </Link>
            );
          })}

          <div className="h-4 w-[1px] bg-[#D8CCB4]" />

          {user ? (
            <div className="flex items-center gap-3">
              <span
                className="text-[11px] font-serif text-[#2F2620] bg-[#E9DFCB]/70 px-2.5 py-1 rounded-[1px] border border-[#D8CCB4] flex items-center gap-1.5 max-w-[150px] truncate"
                title={user.email}
              >
                <UserIcon size={11} className="text-[#A68A56] shrink-0" />
                <span className="truncate">{user.email?.split('@')[0]}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-xs uppercase tracking-[0.18em] text-[#6B5D50] hover:text-[#2F2620] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Keluar dari akun"
              >
                <LogOut size={13} />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <Link
              href="/masuk"
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/masuk'
                  ? 'text-[#2F2620]'
                  : 'text-[#6B5D50] hover:text-[#A68A56]'
              }`}
            >
              <LogIn size={13} />
              <span>Masuk / Daftar</span>
            </Link>
          )}
        </nav>

        {/* Tombol Menu Mobile */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#2F2620] hover:text-[#A68A56] transition-colors focus:outline-none"
            aria-label="Buka menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu Navigasi Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#D8CCB4] bg-[#F4EEE1] px-6 py-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm uppercase tracking-[0.2em] py-1.5 ${
                  isActive ? 'text-[#2F2620] font-semibold' : 'text-[#6B5D50]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="h-[1px] w-full bg-[#D8CCB4] my-1" />

          {user ? (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-serif text-[#2F2620] flex items-center gap-1.5 truncate max-w-[200px]">
                <UserIcon size={12} className="text-[#A68A56]" />
                <span className="truncate">{user.email}</span>
              </span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-xs uppercase tracking-[0.15em] text-[#6B5D50] flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <Link
              href="/masuk"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-[0.2em] text-[#6B5D50] flex items-center gap-2 py-1.5"
            >
              <LogIn size={15} />
              <span>Masuk / Daftar Akun</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
