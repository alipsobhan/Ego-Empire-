import React from 'react';
import { CheckCircle2, ShieldAlert, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  return (
    <div
      id="global-toast-notification"
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0d0d17] border border-[#ff1a3c]/70 text-white px-5 py-3.5 rounded-md shadow-[0_0_25px_rgba(255,26,60,0.5)] transition-all animate-bounce-short"
    >
      <div className="w-8 h-8 rounded bg-[#ff1a3c]/20 border border-[#ff1a3c] flex items-center justify-center text-[#ff1a3c]">
        {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
      </div>
      <div className="pr-2">
        <p className="text-xs uppercase tracking-wider text-[#ff4d6a] font-mono font-semibold">EGO EMPIRE SYSTEM</p>
        <p className="text-sm font-semibold text-white tracking-wide">{message}</p>
      </div>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="text-gray-400 hover:text-white p-1 ml-2 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
