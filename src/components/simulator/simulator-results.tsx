"use client";

import { AlertCircle } from "lucide-react";
import type { Frequency, SimulationResult } from "@/lib/dca";
import {
  formatCrypto,
  formatDate,
  formatEUR,
  formatPercent,
  formatPercentAbs,
  formatPrice,
} from "@/lib/format";
import { BENCHMARKS, benchmarkFinalValue } from "@/lib/benchmark";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultCard } from "./result-card";
import { ProgressBar } from "./progress-bar";

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

  if (loading || !result) return <ResultsSkeleton />;

  if (result.invested === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-sm text-muted-foreground">
        Aucune donnée sur cette période. Élargissez l&apos;intervalle de dates.
      </div>
    );
  }

  const isGain = result.pnl >= 0;
  const signClass = isGain ? "text-gain" : "text-loss";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="h-6 w-1 rounded-full bg-[#1098f7]" />
        <h2 className="font-heading text-2xl font-normal">Vos résultats</h2>
      </div>

      {/* KPI principal */}
      <ResultCard label="Capital final" info="Valeur de votre portefeuille à la date de fin.">
        <p className="mt-1 text-3xl font-light tabular-nums">
          {formatEUR(result.finalValue)}
        </p>
        <div className="mt-4">
          <ProgressBar invested={result.invested} finalValue={result.finalValue} />
        </div>
        <p className="mt-4 border-t border-white/[0.06] pt-3 text-xs text-muted-foreground">
          Acquis{" "}
          <span className="font-medium text-foreground">
            {formatCrypto(result.quantity)} {symbol}
          </span>{" "}
          · Prix moyen{" "}
          <span className="font-medium text-foreground">
            {formatPrice(result.averagePrice)}
          </span>
        </p>
      </ResultCard>

      {/* Performance + plus/moins-value */}
      <div className="grid grid-cols-2 gap-4">
        <ResultCard label="Performance" info="ROI simple sur toute la période.">
          <p className={cn("mt-1 text-3xl font-light tabular-nums", signClass)}>
            {formatPercent(result.performance)}
          </p>
        </ResultCard>
        <ResultCard label="Plus/moins-value">
          <p className={cn("mt-1 text-3xl font-light tabular-nums", signClass)}>
            {isGain ? "+" : ""}
            {formatEUR(result.pnl)}
          </p>
        </ResultCard>
      </div>

      {/* Indicateurs de risque */}
      <div className="grid grid-cols-3 gap-4">
        <ResultCard label="Perf. annualisée" info="Rendement annuel pondéré par les flux (TRI).">
          <p className={cn("mt-1 text-xl font-light tabular-nums", signClass)}>
            {formatPercent(result.annualizedReturn)}
          </p>
        </ResultCard>
        <ResultCard label="Volatilité" info="Volatilité annualisée de l'actif (risque).">
          <p className="mt-1 text-xl font-light tabular-nums text-[#f0b100]">
            {formatPercentAbs(result.volatility)}
          </p>
        </ResultCard>
        <ResultCard label="Drawdown max" info="Plus forte baisse depuis un sommet sur la période.">
          <p className="mt-1 text-xl font-light tabular-nums text-loss">
            −{formatPercentAbs(result.maxDrawdown)}
          </p>
        </ResultCard>
      </div>

      {/* Récap */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Investir{" "}
          <span className="font-medium text-foreground">{formatEUR(amount)}</span>{" "}
          {ADVERB[frequency]} en {coinName}, du {formatDate(Date.parse(from))} au{" "}
          {formatDate(result.effectiveTo)}, aurait transformé{" "}
          <span className="font-medium text-foreground">
            {formatEUR(result.invested)}
          </span>{" "}
          en{" "}
          <span className="font-medium text-foreground">
            {formatEUR(result.finalValue)}
          </span>{" "}
          — soit une {isGain ? "plus-value" : "moins-value"} de{" "}
          <span className={cn("font-semibold", signClass)}>
            {formatEUR(result.pnl)} ({formatPercent(result.performance)})
          </span>
          .
        </p>
      </div>

      {/* Comparaison à des placements sans risque (même échéancier de versements) */}
      <ResultCard
        label="À titre de comparaison"
        info="Les mêmes versements, placés à un taux fixe."
      >
        <p className="mt-1 text-sm text-muted-foreground">
          À versements identiques, votre capital aurait atteint :
        </p>
        <div className="mt-3 space-y-2 text-sm">
          {BENCHMARKS.map((b) => {
            const value = benchmarkFinalValue(
              result.contributions,
              b.rate,
              result.effectiveTo
            );
            return (
              <div key={b.key} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: b.color }}
                  />
                  {b.label} ({(b.rate * 100).toLocaleString("fr-FR")} %/an)
                </span>
                <span className="font-medium tabular-nums">{formatEUR(value)}</span>
              </div>
            );
          })}
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-2">
            <span className="flex items-center gap-2 font-medium">
              <span className="size-2 rounded-full bg-gain" />
              {coinName}
            </span>
            <span className={cn("font-semibold tabular-nums", signClass)}>
              {formatEUR(result.finalValue)}
            </span>
          </div>
        </div>
      </ResultCard>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-[168px] w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    </div>
  );
}
