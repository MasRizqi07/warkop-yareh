"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, required = false, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5 w-full", className)} {...props}>
        {label && (
          <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1 select-none">
            {label}
            {required && <span className="text-[var(--danger-fill)]">*</span>}
          </label>
        )}
        {children}
        {error && (
          <p className="text-xs font-medium text-[var(--danger-fill)] mt-0.5 animate-in fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";
