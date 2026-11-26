import React, { createContext, useCallback, useContext, useState } from 'react';

export type ToastTone = 'default' | 'amber' | 'rose';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = 'default') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev.slice(-3), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="no-print fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2.5rem)] sm:w-auto pointer-events-none"
      >
        {toasts.map((toast) => {
          const dotColor =
            toast.tone === 'rose'
              ? 'bg-rose-400'
              : toast.tone === 'amber'
              ? 'bg-amber-400'
              : 'bg-emerald-400';
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between gap-2.5 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg border border-slate-700/80 animate-fade-up"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                <span className="leading-relaxed">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="text-slate-400 hover:text-white text-sm leading-none px-1 shrink-0"
                aria-label="إغلاق الإشعار"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
