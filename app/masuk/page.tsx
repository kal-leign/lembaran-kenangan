'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { KeyRound, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MasukPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast('Harap masukkan email dan kata sandi pemilik.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        showToast('Selamat datang kembali di Lembaran Kenangan.', 'success');
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Kredensial tidak valid.';
      showToast(`Akses ditolak: ${errorMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[65vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#D8CCB4] p-8 sm:p-10 rounded-[1px] shadow-xl relative">
        {/* Ornamen Sudut Klasik */}
        <div className="absolute top-2 left-2 text-[#A68A56] text-xs select-none">✦</div>
        <div className="absolute top-2 right-2 text-[#A68A56] text-xs select-none">✦</div>
        <div className="absolute bottom-2 left-2 text-[#A68A56] text-xs select-none">✦</div>
        <div className="absolute bottom-2 right-2 text-[#A68A56] text-xs select-none">✦</div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#E9DFCB] text-[#4A3426] flex items-center justify-center mx-auto mb-4 border border-[#D8CCB4]">
            <KeyRound size={20} />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A68A56] block mb-1">
            Pintu Pribadi
          </span>
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2F2620] tracking-tight">
            Ruang Pemilik
          </h1>
          <p className="font-serif italic text-xs text-[#6B5D50] mt-1.5">
            Masuk untuk menyematkan foto kenangan atau menuliskan puisi baru.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-[#6B5D50] mb-1.5">
              Alamat Surel (Email)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pemilik@lembaran.id"
                className="w-full bg-[#F4EEE1]/60 border border-[#D8CCB4] pl-9 pr-3 py-2.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56] rounded-[1px]"
              />
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5D50]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-[#6B5D50] mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F4EEE1]/60 border border-[#D8CCB4] pl-9 pr-3 py-2.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56] rounded-[1px]"
              />
              <Lock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5D50]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#4A3426] hover:bg-[#2F2620] text-[#F4EEE1] text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 rounded-[1px] shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Membuka Kunci...' : 'Buka Lembaran'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-[#D8CCB4]/60 text-center">
          <p className="text-[11px] font-serif text-[#6B5D50] flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-[#A68A56]" />
            <span>Pendaftaran publik dinonaktifkan demi privasi album.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
