"use client";

import * as React from "react";
import { cn } from "./lib/utils";

export { cn };

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";
    const variants = {
      default: "bg-[var(--accent-fill)] text-[var(--text-on-brand)] hover:brightness-110 shadow-md",
      destructive: "bg-[var(--danger-fill)] text-white hover:brightness-110",
      outline: "border border-[var(--border-default)] bg-transparent hover:bg-[var(--bg-surface-overlay)] text-[var(--text-primary)]",
      secondary: "bg-[var(--bg-surface-raised)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-surface-overlay)]",
      ghost: "hover:bg-[var(--bg-surface-overlay)] text-[var(--text-primary)]",
      link: "text-[var(--accent-fill)] underline-offset-4 hover:underline",
    };
    const sizes = {
      default: "h-11 px-5 py-2.5 text-sm min-h-[44px]",
      sm: "h-9 rounded-lg px-3 text-xs min-h-[36px]",
      lg: "h-14 rounded-2xl px-8 text-base min-h-[56px]",
      icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  withNoise?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, withNoise, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] relative overflow-hidden shadow-sm",
          withNoise && "bg-noise",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

// Dialog
export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-raised)] p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-[var(--text-primary)]">
        {title && (
          <div className="mb-4">
            <h3 className="font-heading text-lg font-bold">{title}</h3>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// Drawer
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, children }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md h-full border-l border-[var(--border-default)] bg-[var(--bg-surface-raised)] p-6 shadow-2xl z-10 animate-in slide-in-from-right duration-200 overflow-y-auto text-[var(--text-primary)]">
        {children}
      </div>
    </div>
  );
}

// FormField
export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
        {label}
        {required && <span className="text-[var(--danger-fill)]">*</span>}
      </label>
      {children}
      {error && <span className="text-[10px] font-semibold text-[var(--danger-fill)]">{error}</span>}
    </div>
  );
}

// Toast
interface ToastContextType {
  toast: (msg: { title?: string; description: string; type?: "success" | "error" | "info" }) => void;
  success: (description: string, title?: string) => void;
  error: (description: string, title?: string) => void;
}

const ToastContext = React.createContext<ToastContextType>({
  toast: () => {},
  success: () => {},
  error: () => {},
});

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<Array<{ id: string; title?: string; description: string; type?: "success" | "error" | "info" }>>([]);

  const toast = React.useCallback((msg: { title?: string; description: string; type?: "success" | "error" | "info" }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setMessages((prev) => [...prev, { id, ...msg }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 4000);
  }, []);

  const success = React.useCallback((desc: string, title?: string) => toast({ title, description: desc, type: "success" }), [toast]);
  const error = React.useCallback((desc: string, title?: string) => toast({ title, description: desc, type: "error" }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {messages.map((m) => (
          <div
            key={m.id}
            className="pointer-events-auto p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-raised)] shadow-xl text-xs flex flex-col gap-1 min-w-[280px] animate-in slide-in-from-bottom-2 duration-200"
          >
            {m.title && <p className="font-bold text-[var(--text-primary)]">{m.title}</p>}
            <p className="text-[var(--text-secondary)]">{m.description}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Table
export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-xs text-left", className)} {...props} />
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b border-[var(--border-default)] sticky top-0 bg-[var(--bg-surface-raised)]", className)} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  )
);
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("border-b border-[var(--border-default)]/30 transition-colors hover:bg-[var(--bg-surface-overlay)]", className)} {...props} />
  )
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn("h-10 px-4 text-left align-middle font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[10px]", className)} {...props} />
  )
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-4 align-middle text-[var(--text-primary)]", className)} {...props} />
  )
);
TableCell.displayName = "TableCell";
