import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 md:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/20 bg-slate-900/95 text-slate-100',
    error: 'border-rose-500/20 bg-slate-900/95 text-slate-100',
    info: 'border-sky-500/20 bg-slate-900/95 text-slate-100',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200 ${borders[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
