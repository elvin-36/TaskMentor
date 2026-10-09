import React from 'react';
import { Bot, CheckCircle2, AlertTriangle, Clock, X } from 'lucide-react';

export interface ToastData {
  id: string;
  title: string;
  message: string;
  type?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const type = toast.type || 'indigo';

  const icons = {
    indigo: <Bot className="w-5 h-5 text-indigo-400" />,
    emerald: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    amber: <Clock className="w-5 h-5 text-amber-400" />,
    rose: <AlertTriangle className="w-5 h-5 text-rose-400" />,
  };

  const bgStyles = {
    indigo: 'border-indigo-500/50 bg-slate-900',
    emerald: 'border-emerald-500/50 bg-slate-900',
    amber: 'border-amber-500/50 bg-slate-900',
    rose: 'border-rose-500/50 bg-slate-900',
  };

  const iconBgStyles = {
    indigo: 'bg-indigo-500/20 text-indigo-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/20 text-rose-400',
  };

  return (
    <div className={`fixed top-16 right-5 z-50 max-w-sm w-full border ${bgStyles[type]} shadow-2xl rounded-xl p-3 flex items-start gap-3 animate-bounce-in transition-all duration-300`}>
      <div className={`p-2 rounded-lg shrink-0 ${iconBgStyles[type]}`}>
        {icons[type]}
      </div>
      <div className="flex-1 text-xs">
        <div className="font-bold text-white text-sm">{toast.title}</div>
        <div className="text-slate-300 mt-0.5 leading-relaxed">{toast.message}</div>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-md transition"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
