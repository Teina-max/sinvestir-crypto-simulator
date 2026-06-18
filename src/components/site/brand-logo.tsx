import { cn } from "@/lib/utils";

/** Logo S'investir Simulateurs : blason doré officiel + wordmark « SIMULATEURS ». */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/sinvestir-blason.svg"
        alt="S'investir"
        className="h-8 w-auto"
        width={33}
        height={32}
      />
      <span className="font-heading text-[17px] font-medium tracking-[0.22em] text-white">
        SIMULATEURS
      </span>
    </span>
  );
}
