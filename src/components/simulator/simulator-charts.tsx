"use client";

import { useMemo, useState } from "react";
import type { SimulationResult } from "@/lib/dca";
import { BENCHMARKS, benchmarkSeries } from "@/lib/benchmark";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PerformanceChart } from "./performance-chart";
import { PnlChart } from "./pnl-chart";

type Tab = "evolution" | "pnl";

interface SimulatorChartsProps {
  result: SimulationResult | null;
  loading: boolean;
}

export function SimulatorCharts({ result, loading }: SimulatorChartsProps) {
  const [tab, setTab] = useState<Tab>("evolution");

  // Référence Livret A alignée sur les points de la série, pour overlay.
  const benchmark = useMemo(() => {
    if (!result) return [];
    return benchmarkSeries(
      result.series.map((p) => p.t),
      result.contributions,
      BENCHMARKS[0].rate
    );
  }, [result]);

  if (loading) return <Skeleton className="h-[360px] w-full rounded-2xl" />;
  if (!result || result.series.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-normal">Graphiques</h3>
        <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-1 text-sm">
          <TabButton active={tab === "evolution"} onClick={() => setTab("evolution")}>
            Évolution
          </TabButton>
          <TabButton active={tab === "pnl"} onClick={() => setTab("pnl")}>
            Gains / pertes
          </TabButton>
        </div>
      </div>

      {tab === "evolution" ? (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-1" /> Valeur du portefeuille
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-2" /> Investi cumulé
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#f0b100]" /> Livret A (3 %/an)
            </span>
          </div>
          <PerformanceChart series={result.series} benchmark={benchmark} />
        </>
      ) : (
        <PnlChart series={result.series} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 transition-colors",
        active
          ? "bg-[#0049c6] font-medium text-white"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
