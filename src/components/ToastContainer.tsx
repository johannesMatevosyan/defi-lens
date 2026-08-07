// src/components/ToastContainer.tsx
'use client';

import { useToastStore } from '@/lib/stores/toast-store';

const STYLES: Record<string, string> = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function ToastContainer() {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-8 right-4 z-[9999] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`rounded-lg border px-4 py-3 shadow-lg text-sm max-w-sm ${STYLES[toast.type]}`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <span>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="opacity-60 hover:opacity-100 cursor-pointer">
                        ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
