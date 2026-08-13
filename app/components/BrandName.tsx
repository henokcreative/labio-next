type BrandNameProps = {
  showDot?: boolean;
  variant?: "auto" | "dark" | "light";
  className?: string;
};

export default function BrandName({
  showDot = false,
  variant = "dark",
  className = "",
}: BrandNameProps) {
  return (
    <span
      className={`brand-name brand-name-${variant} ${className}`.trim()}
      aria-label="LaBio Media"
    >
      {showDot && <span className="brand-dot" aria-hidden="true" />}
      <span className="brand-labio" aria-hidden="true">LABIO</span>
      <span className="brand-media" aria-hidden="true">MEDIA</span>
    </span>
  );
}
