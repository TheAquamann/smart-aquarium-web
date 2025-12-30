import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 min-w-[300px] p-4 rounded-lg shadow-lg border transition-all duration-300 animate-in slide-in-from-right-full ${
            toast.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100' 
              : toast.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-100'
              : 'bg-slate-800 border-slate-700 text-slate-100'
          }`}
        >
          <div className={`p-1 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
            toast.type === 'error' ? 'bg-rose-500/20 text-rose-400' :
            'bg-slate-700 text-slate-400'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {toast.type === 'info' && <Info className="w-4 h-4" />}
          </div>
          
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          
          <button 
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
