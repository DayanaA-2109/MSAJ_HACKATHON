// src/components/KolamStrip.tsx
export default function KolamStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`kolam-strip ${className}`}
      role="presentation"
      aria-hidden="true"
    />
  );
}
