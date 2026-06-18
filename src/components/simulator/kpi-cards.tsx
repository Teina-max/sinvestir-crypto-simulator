"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { SimulationResult } from "@/lib/dca";
import {
  formatCrypto,
  formatEUR,
  formatPercent,
  formatPrice,
} from "@/lib/format";
import { cn } from "@/lib/utils";

interface KpiCardsProps {
  result: SimulationResult;
  symbol: string;
}

function Kpi({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-card/60 p-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className={cn("mt-1.5 text-xl font-semibold tabular-nums", className)}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Les 5 chiffres clés de la simulation (transposés du panneau Fritzy). */
export function KpiCards({ result, symbol }: KpiCardsProps) {
  const isGain = result.pnl >= 0;
  const periodHint =
    result.frequency === "once"
      ? "en 1 versement"
      : `en ${result.periods} versements`;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <Kpi
        label="Investi"
        value={formatEUR(result.invested)}
        hint={periodHint}
      />
      <Kpi
        label="Acquis"
        value={formatCrypto(result.quantity)}
        hint={symbol}
      />
      <Kpi
        label="Prix moyen d'achat"
        value={formatPrice(result.averagePrice)}
      />
      <Kpi label="Capital final" value={formatEUR(result.finalValue)} />
      <Kpi
        label="Plus/moins-value"
        value={formatEUR(result.pnl)}
        className={isGain ? "text-gain" : "text-loss"}
      />
      <div
        className={cn(
          "flex flex-col justify-center rounded-2xl border p-4",
          isGain
            ? "border-gain/20 bg-gain/10"
            : "border-loss/20 bg-loss/10"
        )}
      >
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Performance
        </p>
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1 text-2xl font-bold tabular-nums",
            isGain ? "text-gain" : "text-loss"
          )}
        >
          {isGain ? (
            <ArrowUpRight className="size-5" />
          ) : (
            <ArrowDownRight className="size-5" />
          )}
          {formatPercent(result.performance)}
        </p>
      </div>
    </div>
  );
}
