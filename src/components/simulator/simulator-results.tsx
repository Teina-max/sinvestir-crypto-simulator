"use client";

import { AlertCircle } from "lucide-react";
import type { Frequency, SimulationResult } from "@/lib/dca";
import { formatDate, formatEUR, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCards } from "./kpi-cards";
import { PerformanceChart } from "./performance-chart";

const ADVERB: Record<Frequency, string> = {
  once: "en une fois",
  daily: "chaque jour",
  weekly: "chaque semaine",
  monthly: "chaque mois",
};

interface SimulatorResultsProps {
  result: SimulationResult | null;
  symbol: string;
  coinName: string;
  amount: number;
  frequency: Frequency;
  from: string;
  to: string;
  loading: boolean;
  error: string | null;
}

export function SimulatorResults({
  result,
  symbol,
  coinName,
  amount,
  frequency,
  from,
  to,
  loading,
  error,
}: SimulatorResultsProps) {
  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-loss/20 bg-loss/10 p-4 text-sm text-loss">
        <AlertCircle className="size-5 shrink-0" />
        {error}
      </div>
    );
  }

  if (loading || !result) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    );
  }

  if (result.invested === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-card/60 p-6 text-sm text-muted-foreground">
        Aucune donnée sur cette période. Élargissez l&apos;intervalle de dates.
      </div>
    );
  }

  const isGain = result.pnl >= 0;

  return (
    <div className="space-y-5">
      {/* Résumé pédagogique : le « magic moment » de l'outil */}
      <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-card/80 to-card/30 p-5">
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">
            {formatEUR(amount)} {ADVERB[frequency]}
          </span>{" "}
          en {coinName}, du {formatDate(Date.parse(from))} au{" "}
          {formatDate(Date.parse(to))}, vaudraient aujourd&apos;hui{" "}
          <span className="font-semibold text-foreground">
            {formatEUR(result.finalValue)}
          </span>{" "}
          —{" "}
          <span className={cn("font-semibold", isGain ? "text-gain" : "text-loss")}>
            {formatPercent(result.performance)}
          </span>
          .
        </p>
      </div>

      <KpiCards result={result} symbol={symbol} />

      <div className="rounded-2xl border border-white/5 bg-card/60 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold">Évolution du portefeuille</h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-1" /> Valeur
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-2" /> Investi
            </span>
          </div>
        </div>
        <PerformanceChart series={result.series} />
      </div>
    </div>
  );
}
