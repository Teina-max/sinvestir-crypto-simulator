import { formatEUR } from "@/lib/format";

/**
 * Barre de progression bicolore façon S'investir : investi (bleu) + plus-value
 * (vert) en cas de gain ; valeur restante (rouge) sur fond investi en cas de perte.
 */
export function ProgressBar({
  invested,
  finalValue,
}: {
  invested: number;
  finalValue: number;
}) {
  const pnl = finalValue - invested;

  if (pnl >= 0) {
    const total = finalValue || 1;
    const investedPct = Math.max(0, Math.min(100, (invested / total) * 100));
    return (
      <div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <span style={{ width: `${investedPct}%` }} className="bg-[#2b7fff]" />
          <span style={{ width: `${100 - investedPct}%` }} className="bg-gain" />
        </div>
        <Legend
          left={{ label: "Somme investie", value: invested, color: "#2b7fff" }}
          right={{ label: "Plus-value", value: pnl, color: "var(--gain)" }}
        />
      </div>
    );
  }

  const remainingPct = Math.max(0, Math.min(100, (finalValue / (invested || 1)) * 100));
  return (
    <div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-loss/15">
        <span
          style={{ width: `${remainingPct}%` }}
          className="block h-full rounded-full bg-loss"
        />
      </div>
      <Legend
        left={{ label: "Valeur restante", value: finalValue, color: "var(--loss)" }}
        right={{ label: "Perte", value: pnl, color: "var(--loss)" }}
      />
    </div>
  );
}

function Legend({
  left,
  right,
}: {
  left: { label: string; value: number; color: string };
  right: { label: string; value: number; color: string };
}) {
  return (
    <div className="mt-2.5 flex items-center justify-between text-xs">
      {[left, right].map((item, i) => (
        <span key={i} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: item.color }} />
          {item.label}
          <span className="font-medium text-foreground tabular-nums">
            {formatEUR(item.value)}
          </span>
        </span>
      ))}
    </div>
  );
}
