import { cn } from "@/lib/utils";

/** Badge pill à bordure animée (« reflet qui tourne »), signature S'investir. */
export function EyebrowBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("eyebrow", className)}>{children}</span>;
}
