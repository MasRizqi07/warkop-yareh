"use client";

export function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base dark gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--bg-canvas)] to-[var(--bg-surface-raised)]"
      />

      {/* Aurora blobs */}
      <div
        className="absolute w-[600px] h-[400px] rounded-full blur-[120px] opacity-[0.15] animate-aurora-1 top-[10%] left-[5%] bg-[radial-gradient(circle,rgba(196,98,45,0.6),transparent_70%)]"
      />
      <div
        className="absolute w-[500px] h-[600px] rounded-full blur-[150px] opacity-[0.1] animate-aurora-2 top-[40%] right-[5%] bg-[radial-gradient(circle,rgba(255,186,0,0.5),transparent_70%)]"
      />
      <div
        className="absolute w-[400px] h-[300px] rounded-full blur-[100px] opacity-[0.08] animate-aurora-3 bottom-[10%] left-[40%] bg-[radial-gradient(circle,rgba(196,98,45,0.4),transparent_70%)]"
      />

      {/* Noise texture */}
      <div className="absolute inset-0 bg-noise" />
    </div>
  );
}
