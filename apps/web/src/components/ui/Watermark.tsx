/** The tilted "MSEEZEE" word pattern printed faintly across lime surfaces —
 *  the selected amount tile, the profile's giving card. */
export function Watermark({ className = "text-[1.7rem]" }: { className?: string }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span
        className={`absolute -inset-16 -rotate-12 break-all font-extrabold leading-[1.02] tracking-tight opacity-[0.1] ${className}`}
      >
        {"MSEEZEE ".repeat(60)}
      </span>
    </span>
  );
}
