import { createContext, useContext, useState, useCallback } from "react";

// export ToastContext directly so ToastContainer can consume 
// it without a hook (avoids circular dependency)
export const ToastContext = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration) => {
    const id = ++_id;
    const ms = duration ?? (type === "error" ? 6000 : 4000);

    setToasts(prev => {
      const next = [...prev, { id, message, type }];
      return next.length > 3 ? next.slice(next.length - 3) : next;
    });

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, ms);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}