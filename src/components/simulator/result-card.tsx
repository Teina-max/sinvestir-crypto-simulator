import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Carte de résultat S'investir : label + ⓘ optionnelle, puis contenu. */
export function ResultCard({
  label,
  info,
  children,
  className,
}: {
  label: string;
  info?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>{label}</span>
        {info && (
          <span title={info}>
            <Info className="size-3.5 opacity-50" aria-hidden />
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
