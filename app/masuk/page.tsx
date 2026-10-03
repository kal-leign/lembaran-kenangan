'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { KeyRound, Lock, Mail, ArrowRight, UserPlus, LogIn, Sparkles } from 'lucide-react';

export default function MasukPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast('Harap isi alamat surel dan kata sandi.', 'error');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok.', 'error');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      showToast('Kata sandi minimal 6 karakter demi keamanan album.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw new Error(error.message);

        if (data.user) {
          showToast('Selamat datang kembali di lembaran kenanganmu.', 'success');
          router.push('/galeri');
          router.refresh();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) throw new Error(error.message);

        if (data.session) {
          showToast('Akun pribadimu telah siap. Selamat mengabadikan kenangan.', 'success');
          router.push('/galeri');
          router.refresh();
        } else if (data.user) {
          showToast(
            'Tautan konfirmasi telah dikirim ke surel Anda. Harap periksa kotak masuk untuk mengaktifkan akun.',
            'info'
          );
          setMode('signin');
        }
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Terjadi kendala saat memproses akun.';
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[68vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#D8CCB4] p-8 sm:p-10 rounded-[1px] shadow-xl relative">
        {/* Ornamen Sudut Klasik */}
        <div className="absolute top-2 left-2 text-[#A68A56] text-xs select-none">✦</div>
        <div className="absolute top-2 right-2 text-[#A68A56] text-xs select-none">✦</div>
        <div className="absolute bottom-2 left-2 text-[#A68A56] text-xs select-none">✦</div>
        <div className="absolute bottom-2 right-2 text-[#A68A56] text-xs select-none">✦</div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#E9DFCB] text-[#4A3426] flex items-center justify-center mx-auto mb-4 border border-[#D8CCB4]">
            {mode === 'signin' ? <KeyRound size={20} /> : <Sparkles size={20} />}
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A68A56] block mb-1">
            {mode === 'signin' ? 'Pintu Lembaran Pribadi' : 'Membuka Lembaran Baru'}
          </span>
          <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-medium text-[#2F2620] tracking-tight">
            {mode === 'signin' ? 'Buka Album Anda' : 'Daftar Akun Album'}
          </h1>
          <p className="font-serif italic text-xs text-[#6B5D50] mt-1.5 leading-relaxed">
            {mode === 'signin'
              ? 'Setiap kenangan bersifat privat dan hanya dapat dilihat oleh pemilik akun.'
              : 'Buat lembaran pribadimu sendiri. Kenanganmu tidak akan bisa diintip akun lain.'}
          </p>
        </div>

        {/* Tab Toggle: Masuk vs Daftar Baru */}
        <div className="flex border border-[#D8CCB4] rounded-[1px] p-0.5 bg-[#F4EEE1] mb-6">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#4A3426] text-[#F4EEE1] shadow-xs'
                : 'text-[#6B5D50] hover:text-[#2F2620]'
            }`}
          >
            <LogIn size={13} />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#4A3426] text-[#F4EEE1] shadow-xs'
                : 'text-[#6B5D50] hover:text-[#2F2620]'
            }`}
          >
            <UserPlus size={13} />
            <span>Daftar Baru</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="nama@surel.id"
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

          {mode === 'signup' && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-[11px] uppercase tracking-[0.18em] text-[#6B5D50] mb-1.5">
                Ulangi Kata Sandi
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F4EEE1]/60 border border-[#D8CCB4] pl-9 pr-3 py-2.5 text-xs text-[#2F2620] focus:outline-none focus:border-[#A68A56] rounded-[1px]"
                />
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5D50]"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#4A3426] hover:bg-[#2F2620] text-[#F4EEE1] text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 rounded-[1px] shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <span>
                {isLoading
                  ? 'Sedang Memproses...'
                  : mode === 'signin'
                  ? 'Buka Lembaran'
                  : 'Buat Akun Pribadi'}
              </span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#D8CCB4]/60 text-center">
          <p className="text-[11px] font-serif text-[#6B5D50] leading-relaxed">
            {mode === 'signin' ? (
              <>
                Belum memiliki lembaran pribadi?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#A68A56] underline hover:text-[#4A3426] transition-colors"
                >
                  Daftar akun sekarang
                </button>
              </>
            ) : (
              <>
                Sudah memiliki akun kenangan?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-[#A68A56] underline hover:text-[#4A3426] transition-colors"
                >
                  Masuk di sini
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
