/**
 * Logo St. Nikolaus Hospital Eupen
 * Inspiré du logo officiel hospital-eupen.be (4 feuilles stylisées + texte)
 * Recréé en navy HSNE #1D2C50
 */

export function HSNELogo({
  className = "",
  variant = "full",
  textColor,
}: {
  className?: string;
  variant?: "full" | "icon";
  textColor?: string;
}) {
  const navy = "#1D2C50";
  const finalTextColor = textColor ?? navy;

  if (variant === "icon") {
    return (
      <svg
        className={className}
        viewBox="0 0 145 137"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 4 leaves stylized — inspired by hospital-eupen.be logo */}
        <path d="M64.5 52.9V0L43.97 24.5C51.88 33.17 58.75 42.72 64.5 52.9Z" fill={navy} />
        <path d="M20.72 51.76C45.77 80.21 50.65 121.47 51.59 137h12.89V109.07C64.57 82.09 55.06 55.97 37.64 35.37c-0.54-0.63-1.08-1.26-1.64-1.89L20.72 51.76Z" fill={navy} />
        <path d="M78.04 0V52.95C83.76 42.71 90.64 33.17 98.54 24.51L78.04 0Z" fill={navy} />
        <path d="M103.28 137h17.49C123.14 124.82 130.08 94.31 142.86 76.93L129.8 61.31C108.86 86.3 104.27 122.65 103.28 137Z" fill={navy} />
        <path d="M39.58 137H22.09C19.72 124.82 12.77 94.31 0 76.93L13.06 61.31C34 86.3 38.58 122.65 39.58 137Z" fill={navy} />
        <path d="M106.52 33.48c-0.55 0.63-1.1 1.27-1.64 1.89C87.46 55.97 77.94 82.09 78.04 109.07V137h12.89c0.94-15.53 5.81-56.79 30.87-85.24L106.52 33.48Z" fill={navy} />
      </svg>
    );
  }

  // Full logo with text
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 145 137"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-auto shrink-0"
      >
        <path d="M64.5 52.9V0L43.97 24.5C51.88 33.17 58.75 42.72 64.5 52.9Z" fill={navy} />
        <path d="M20.72 51.76C45.77 80.21 50.65 121.47 51.59 137h12.89V109.07C64.57 82.09 55.06 55.97 37.64 35.37c-0.54-0.63-1.08-1.26-1.64-1.89L20.72 51.76Z" fill={navy} />
        <path d="M78.04 0V52.95C83.76 42.71 90.64 33.17 98.54 24.51L78.04 0Z" fill={navy} />
        <path d="M103.28 137h17.49C123.14 124.82 130.08 94.31 142.86 76.93L129.8 61.31C108.86 86.3 104.27 122.65 103.28 137Z" fill={navy} />
        <path d="M39.58 137H22.09C19.72 124.82 12.77 94.31 0 76.93L13.06 61.31C34 86.3 38.58 122.65 39.58 137Z" fill={navy} />
        <path d="M106.52 33.48c-0.55 0.63-1.1 1.27-1.64 1.89C87.46 55.97 77.94 82.09 78.04 109.07V137h12.89c0.94-15.53 5.81-56.79 30.87-85.24L106.52 33.48Z" fill={navy} />
      </svg>
      <div className="leading-tight">
        <div
          className="font-extrabold text-[14px] tracking-[0.02em] uppercase"
          style={{ color: finalTextColor }}
        >
          St. Nikolaus
        </div>
        <div
          className="font-extrabold text-[14px] tracking-[0.02em] uppercase"
          style={{ color: finalTextColor }}
        >
          Hospital
        </div>
        <div
          className="text-[10px] tracking-[0.18em] uppercase font-bold mt-0.5"
          style={{ color: finalTextColor }}
        >
          ▸ Eupen ◂
        </div>
      </div>
    </div>
  );
}
