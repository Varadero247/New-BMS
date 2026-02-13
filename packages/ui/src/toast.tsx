'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { cn } from './utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

const variantConfig: Record<ToastVariant, { icon: string; bg: string; border: string; text: string }> = {
  success: {
    icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-600',
  },
  error: {
    icon: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-600',
  },
  warning: {
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-600',
  },
  info: {
    icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const config = variantConfig[toast.variant];
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      timerRef.current = setTimeout(() => onRemove(toast.id), duration);
      return () => clearTimeout(timerRef.current);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 w-80 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right',
        config.bg,
        config.border
      )}
      role="alert"
    >
      <svg className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.text)} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
