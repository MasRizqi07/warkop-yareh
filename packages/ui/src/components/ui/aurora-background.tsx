'use client';

export function AuroraBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-aurora="homepage"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-canvas-obsidian to-surface-secondary" />

      {/* Aurora blobs */}
      <div className="animate-aurora-1 absolute left-[5%] top-[10%] h-[400px] w-[600px] rounded-full bg-brand-coffee/60 opacity-[0.15] blur-[120px]" />
      <div className="animate-aurora-2 absolute right-[5%] top-[40%] h-[600px] w-[500px] rounded-full bg-accent-amber/50 opacity-[0.1] blur-[150px]" />
      <div className="animate-aurora-3 absolute bottom-[10%] left-[40%] h-[300px] w-[400px] rounded-full bg-brand-coffee/40 opacity-[0.08] blur-[100px]" />

      {/* Noise texture */}
      <div className="absolute inset-0 bg-grid opacity-20" />
    </div>
  );
}
