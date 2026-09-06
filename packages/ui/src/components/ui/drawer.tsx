"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  side?: "right" | "bottom";
}

export function Drawer({ isOpen, onClose, title, children, className, side = "right" }: DrawerProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isBottom = side === "bottom";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn("fixed inset-0 z-[100] flex", isBottom ? "items-end" : "justify-end")}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={isBottom ? { y: "100%" } : { x: "100%" }}
            animate={isBottom ? { y: 0 } : { x: 0 }}
            exit={isBottom ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className={cn(
              "relative bg-[var(--card-bg)] border-[var(--card-border)] shadow-2xl z-10 flex flex-col gap-6",
              isBottom 
                ? "w-full max-h-[85vh] rounded-t-3xl border-t p-6" 
                : "w-full max-w-md h-full border-l p-6",
              className
            )}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              {title ? (
                <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">{title}</h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-overlay)] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
