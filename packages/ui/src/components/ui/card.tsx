"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  withNoise?: boolean;
  withHover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, withNoise = false, withHover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] relative overflow-hidden transition-all duration-300",
          withHover && "hover:-translate-y-1 hover:shadow-lg hover:border-[var(--accent-fill)] cursor-pointer",
          withNoise && "bg-noise",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card };
