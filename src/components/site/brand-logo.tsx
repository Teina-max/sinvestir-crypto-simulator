import { cn } from "@/lib/utils";

/**
 * Reconstitution du logo S'investir Simulateurs : monogramme « S » doré +
 * wordmark, fidèle à l'esprit de leur suite (accent or sur fond sombre).
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[#F7E3A1] to-[#C9952F] font-heading text-lg font-extrabold text-[#1a1205]"
      >
        S
      </span>
      <span className="flex flex-col leading-none">
        <span className="bg-gradient-to-r from-[#F7E3A1] to-[#D4A53C] bg-clip-text font-heading text-lg font-bold text-transparent">
          S&apos;investir
        </span>
        <span className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground">
          SIMULATEURS
        </span>
      </span>
    </span>
  );
}
