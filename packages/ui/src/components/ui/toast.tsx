"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ToastMessage {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title?: string;
  description: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, "id">) => void;
  success: (description: string, title?: string) => void;
  error: (description: string, title?: string) => void;
  warning: (description: string, title?: string) => void;
  info: (description: string, title?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    ({ type, title, description, duration = 4000 }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, description, duration }]);
      
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const success = React.useCallback((desc: string, title?: string) => toast({ type: "success", description: desc, title }), [toast]);
  const error = React.useCallback((desc: string, title?: string) => toast({ type: "error", description: desc, title }), [toast]);
  const warning = React.useCallback((desc: string, title?: string) => toast({ type: "warning", description: desc, title }), [toast]);
  const info = React.useCallback((desc: string, title?: string) => toast({ type: "info", description: desc, title }), [toast]);

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-[var(--green-500)]" />,
              warning: <AlertTriangle className="w-5 h-5 text-[var(--gold-highlight)]" />,
              error: <AlertCircle className="w-5 h-5 text-[var(--danger-fill)]" />,
              info: <Info className="w-5 h-5 text-[var(--accent-fill)]" />,
            };
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={cn(
                  "pointer-events-auto flex gap-3 p-4 rounded-xl border bg-[var(--card-bg)] border-[var(--card-border)] shadow-xl relative overflow-hidden",
                  "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5",
                  t.type === "success" && "before:bg-[var(--green-500)]",
                  t.type === "warning" && "before:bg-[var(--gold-highlight)]",
                  t.type === "error" && "before:bg-[var(--danger-fill)]",
                  t.type === "info" && "before:bg-[var(--accent-fill)]"
                )}
              >
                <div className="shrink-0 pt-0.5">{icons[t.type]}</div>
                <div className="flex-1 flex flex-col gap-0.5 pr-6">
                  {t.title && <h4 className="text-sm font-bold text-[var(--text-primary)]">{t.title}</h4>}
                  <p className="text-xs text-[var(--text-secondary)]">{t.description}</p>
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="absolute top-3 right-3 p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-overlay)] transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                  aria-label="Close toast"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
