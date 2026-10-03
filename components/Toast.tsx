'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-[2px] border text-xs leading-relaxed shadow-lg ${
                toast.type === 'error'
                  ? 'bg-[#FBF4F4] border-[#E8C4C4] text-[#7A2626]'
                  : toast.type === 'success'
                  ? 'bg-[#F4F8F4] border-[#C8DEC8] text-[#295629]'
                  : 'bg-[#F9F6EE] border-[#D8CCB4] text-[#2F2620]'
              }`}
            >
              {toast.type === 'error' && (
                <AlertCircle className="shrink-0 text-[#A84242]" size={16} />
              )}
              {toast.type === 'success' && (
                <CheckCircle2 className="shrink-0 text-[#3C7B3C]" size={16} />
              )}
              {toast.type === 'info' && (
                <Info className="shrink-0 text-[#A68A56]" size={16} />
              )}

              <div className="flex-1 font-serif text-[13px]">{toast.message}</div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#6B5D50] hover:text-[#2F2620] transition-colors p-0.5"
                aria-label="Tutup"
              >
                <X size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
