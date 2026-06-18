"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import type { SimulationPoint } from "@/lib/dca";
import { downsample } from "@/lib/series";
import { formatDate, formatEUR, formatMonthYear } from "@/lib/format";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";

const config = {
  pnl: { label: "Plus/moins-value", color: "var(--gain)" },
} satisfies ChartConfig;

/** Graphique de la plus/moins-value latente dans le temps (vert/rouge autour de 0). */
export function PnlChart({ series }: { series: SimulationPoint[] }) {
  const data = useMemo(() => downsample(series), [series]);

  // Position du 0 dans la plage verticale → frontière vert/rouge du dégradé.
  const offset = useMemo(() => {
    const max = Math.max(0, ...data.map((d) => d.pnl));
    const min = Math.min(0, ...data.map((d) => d.pnl));
    if (max <= 0) return 0;
    if (min >= 0) return 1;
    return max / (max - min);
  }, [data]);

  if (data.length === 0) return null;

  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="pnlSplit" x1="0" y1="0" x2="0" y2="1">
            <stop offset={offset} stopColor="var(--gain)" stopOpacity={0.9} />
            <stop offset={offset} stopColor="var(--loss)" stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset={offset} stopColor="var(--gain)" stopOpacity={0.35} />
            <stop offset={offset} stopColor="var(--loss)" stopOpacity={0.35} />
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
        <ReferenceLine y={0} stroke="var(--border)" />
        <ChartTooltip content={<PnlTooltip />} />
        <Area
          dataKey="pnl"
          type="monotone"
          stroke="url(#pnlSplit)"
          strokeWidth={2}
          fill="url(#pnlFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function PnlTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: SimulationPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const gain = p.pnl >= 0;
  return (
    <div className="rounded-xl border border-white/10 bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="mb-1 font-medium text-foreground">{formatDate(p.t)}</p>
      <p
        className="tabular-nums"
        style={{ color: gain ? "var(--gain)" : "var(--loss)" }}
      >
        {gain ? "+" : ""}
        {formatEUR(p.pnl)}
      </p>
    </div>
  );
}
