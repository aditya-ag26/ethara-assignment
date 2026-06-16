import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${toast.exiting ? 'toast-exit' : 'toast-enter'} ${
              toast.type === 'success'
                ? 'bg-[#ecfdf5] border-[#a7f3d0]'
                : 'bg-[#fef2f2] border-[#fecaca]'
            } border rounded-lg shadow-lg p-4 flex items-start gap-3 w-80`}
          >
            <span
              className={`material-symbols-outlined filled ${
                toast.type === 'success' ? 'text-[#10b981]' : 'text-[#ef4444]'
              }`}
            >
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <div className="flex-1">
              <h4
                className={`text-sm font-semibold ${
                  toast.type === 'success' ? 'text-[#065f46]' : 'text-[#991b1b]'
                }`}
              >
                {toast.type === 'success' ? 'Success' : 'Error'}
              </h4>
              <p
                className={`text-xs mt-0.5 ${
                  toast.type === 'success' ? 'text-[#064e3b]' : 'text-[#7f1d1d]'
                }`}
              >
                {toast.message}
              </p>
            </div>
            <button
              className={`${
                toast.type === 'success'
                  ? 'text-[#065f46] hover:text-[#064e3b]'
                  : 'text-[#991b1b] hover:text-[#7f1d1d]'
              }`}
              onClick={() => removeToast(toast.id)}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
