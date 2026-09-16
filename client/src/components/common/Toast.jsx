import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertCircle size={18} />,
  info:    <Info size={18} />,
};

const DEFAULT_DURATION = 4000;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const add = useCallback((message, type = 'info', duration = DEFAULT_DURATION) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      timers.current[id] = setTimeout(() => remove(id), duration);
    }

    return id;
  }, [remove]);

  const toast = {
    success: (msg, dur) => add(msg, 'success', dur),
    error:   (msg, dur) => add(msg, 'error', dur),
    warning: (msg, dur) => add(msg, 'warning', dur),
    info:    (msg, dur) => add(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type} toast-enter`}>
            <span className="flex-shrink-0 text-white">{ICONS[t.type]}</span>
            <span className="flex-1 text-sm">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="flex-shrink-0 text-white/70 hover:text-white transition-colors ml-2"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
