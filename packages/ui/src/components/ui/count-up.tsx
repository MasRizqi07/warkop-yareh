'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

type CountUpProps = Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> & {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
};

function readDurationToken(): number {
  const raw = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--duration-normal')
    .trim();

  const parsed = raw.endsWith('ms')
    ? Number.parseFloat(raw)
    : raw.endsWith('s')
      ? Number.parseFloat(raw) * 1_000
      : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 300;
}

export function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  formatter,
  className,
  ...props
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const frameRef = React.useRef<number | null>(null);
  const [displayValue, setDisplayValue] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      setDisplayValue(value);
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        observer.disconnect();
        setHasStarted(true);
        const duration = Math.max(1, readDurationToken());
        const startedAt = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
          setDisplayValue(value * eased);

          if (progress < 1) {
            frameRef.current = window.requestAnimationFrame(tick);
          }
        };

        frameRef.current = window.requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value]);

  const text = formatter
    ? formatter(displayValue)
    : displayValue.toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return (
    <span
      ref={ref}
      className={cn('tabular-nums', className)}
      data-countup-active={hasStarted ? 'true' : 'false'}
      data-countup-value={value}
      aria-label={`${prefix}${formatter ? formatter(value) : value.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`}
      {...props}
    >
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
