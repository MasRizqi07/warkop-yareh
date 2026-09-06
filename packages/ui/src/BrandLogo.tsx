"use client";

import * as React from "react";
import { cn } from "./lib/utils";

export interface BrandEmblemProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const BrandEmblem: React.FC<BrandEmblemProps> = ({
  size = 36,
  className,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id="coffeeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#9c6b3a" />
          <stop offset="100%" stopColor="#5e3f25" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="#f59e0b"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        fill="#111114"
      />
      <circle cx="50" cy="50" r="40" stroke="url(#coffeeGrad)" strokeWidth="2.5" />
      <path
        d="M30 42 C30 38 34 35 38 35 H62 C66 35 70 38 70 42 V54 C70 64 61 72 50 72 C39 72 30 64 30 54 Z"
        fill="url(#coffeeGrad)"
        filter="url(#glow)"
      />
      <path
        d="M70 43 H76 C79.5 43 82 45.5 82 49 C82 52.5 79.5 55 76 55 H70"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M42 28 C41 24 45 20 44 16"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M50 30 C49 25 53 21 52 15"
        stroke="#e8c47a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M58 28 C57 24 61 20 60 16"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="78" r="2.5" fill="#f59e0b" />
    </svg>
  );
};

export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number | string;
  showSubtitle?: boolean;
  subtitle?: string;
  theme?: "dark" | "light";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 36,
  showSubtitle = true,
  subtitle = "Surabaya 1998",
  className,
  ...props
}) => {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)} {...props}>
      <BrandEmblem size={size} />
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-lg tracking-tight text-[#f8fafc] font-sans group-hover:text-[#f7bb82] transition-colors">
          Warkop Ya'reh
        </span>
        {showSubtitle && (
          <span className="font-mono text-[11px] tracking-widest text-[#94a3b8] uppercase">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
