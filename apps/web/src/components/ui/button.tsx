"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg active:shadow-sm focus-visible:ring-primary-500",
        secondary:
          "bg-secondary-100 text-primary-800 hover:bg-secondary-200 dark:bg-neutral-800 dark:text-secondary-200 dark:hover:bg-neutral-700",
        outline:
          "border-2 border-[var(--border-default)] bg-transparent hover:bg-[var(--surface-tertiary)] text-[var(--text-primary)]",
        ghost:
          "hover:bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        destructive: "bg-error-500 text-white hover:bg-error-600 shadow-md",
        gold: "bg-gradient-to-r from-accent-400 to-accent-600 text-white hover:from-accent-500 hover:to-accent-700 shadow-lg shadow-accent-500/25",
        link: "text-primary-500 underline-offset-4 hover:underline",
        magnetic: "bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-default)] shadow-sm hover:shadow-[var(--shadow-glow-soft)] hover:scale-[1.02] active:scale-[0.97] transition-all",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-lg",
        default: "h-11 px-6 py-2",
        lg: "h-13 px-8 text-base rounded-xl",
        xl: "h-14 px-10 text-base rounded-2xl",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

// Motion-enhanced Button using CSS transitions to avoid Framer Motion type conflicts
const MotionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <span className="inline-flex transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]">
        <Button ref={ref} {...props} />
      </span>
    );
  },
);
MotionButton.displayName = "MotionButton";

export { Button, MotionButton, buttonVariants };
