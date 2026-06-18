"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { SimulationPoint } from "@/lib/dca";
import { formatDate, formatEUR, formatMonthYear } from "@/lib/format";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";

const config = {
  value: { label: "Valeur du portefeuille", color: "var(--chart-1)" },
  invested: { label: "Investi cumulé", color: "var(--chart-2)" },
} satisfies ChartConfig;

/** Réduit la série à ~220 points max pour un rendu fluide. */
function downsample(series: SimulationPoint[], max = 220): SimulationPoint[] {
  if (series.length <= max) return series;
  const step = Math.ceil(series.length / max);
  const out = series.filter((_, i) => i % step === 0);
  const last = series[series.length - 1];
  if (out[out.length - 1]?.t !== last.t) out.push(last);
  return out;
}

export function PerformanceChart({ series }: { series: SimulationPoint[] }) {
  const data = useMemo(() => downsample(series), [series]);

  if (data.length === 0) return null;

  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillInvested" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={formatMonthYear}
          tickLine={false}
          axisLine={false}
          minTickGap={48}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          tickFormatter={(v) => formatEUR(v, true)}
          tickLine={false}
          axisLine={false}
          width={64}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <ChartTooltip content={<ChartTooltipBody />} />
        <Area
          dataKey="invested"
          type="monotone"
          stroke="var(--chart-2)"
          strokeWidth={1.5}
          fill="url(#fillInvested)"
          strokeDasharray="4 3"
          isAnimationActive={false}
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#fillValue)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: SimulationPoint }[];
}

function ChartTooltipBody({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const gain = p.pnl >= 0;
  return (
    <div className="rounded-xl border border-white/10 bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="mb-1.5 font-medium text-foreground">{formatDate(p.t)}</p>
      <Row label="Valeur" value={formatEUR(p.value)} dot="var(--chart-1)" />
      <Row label="Investi" value={formatEUR(p.invested)} dot="var(--chart-2)" />
      <p
        className="mt-1 border-t border-white/10 pt-1 tabular-nums"
        style={{ color: gain ? "var(--gain)" : "var(--loss)" }}
      >
        {gain ? "+" : ""}
        {formatEUR(p.pnl)}
      </p>
    </div>
  );
}

function Row({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <p className="flex items-center justify-between gap-4 tabular-nums">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-full" style={{ background: dot }} />
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </p>
  );
}
