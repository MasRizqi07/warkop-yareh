"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-[var(--input-bg)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-200",
            "border-[var(--border-default)] hover:border-[var(--border-strong)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)]/20 focus:border-[var(--input-focus-ring)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            error &&
              "border-[var(--danger-fill)] focus:ring-[var(--danger-fill)]/20 focus:border-[var(--danger-fill)]",
            className,
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-xs text-error-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
