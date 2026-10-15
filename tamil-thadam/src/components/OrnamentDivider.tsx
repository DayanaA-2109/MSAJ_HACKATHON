// src/components/OrnamentDivider.tsx
export default function OrnamentDivider({
  className = "",
  symbols = "✦ ❋ ✦",
}: {
  className?: string;
  symbols?: string;
}) {
  return (
    <div
      className={`ornament-divider ${className}`}
      role="separator"
      aria-hidden="true"
    >
      <span className="ornament-line" />
      <span className="ornament-symbols">{symbols}</span>
      <span className="ornament-line" />
    </div>
  );
}
