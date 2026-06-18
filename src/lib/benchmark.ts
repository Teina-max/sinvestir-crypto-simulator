/**
 * Comparaison à des placements de référence sans risque : on applique le même
 * échéancier de versements (mêmes dates, mêmes montants) à un rendement annuel
 * fixe. Permet de répondre à « et si j'avais mis la même somme ailleurs ? ».
 */

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

export interface Contribution {
  t: number;
  amount: number;
}

export const BENCHMARKS = [
  { key: "livretA", label: "Livret A", rate: 0.03, color: "#f0b100" },
  { key: "inflation", label: "Inflation", rate: 0.02, color: "#9ca3af" },
] as const;

/**
 * Série de la valeur d'un placement à taux fixe, alignée sur `timestamps`.
 * Calcul incrémental : la valeur capitalise entre deux points, puis on ajoute
 * les versements échus.
 */
export function benchmarkSeries(
  timestamps: number[],
  contributions: Contribution[],
  annualRate: number
): { t: number; value: number }[] {
  if (timestamps.length === 0) return [];
  const out: { t: number; value: number }[] = [];
  let value = 0;
  let ci = 0;
  let prev = timestamps[0];
  for (const t of timestamps) {
    if (t > prev) value *= Math.pow(1 + annualRate, (t - prev) / YEAR_MS);
    while (ci < contributions.length && contributions[ci].t <= t) {
      value += contributions[ci].amount;
      ci++;
    }
    out.push({ t, value });
    prev = t;
  }
  return out;
}

/** Valeur finale d'un placement à taux fixe pour l'échéancier donné. */
export function benchmarkFinalValue(
  contributions: Contribution[],
  annualRate: number,
  effectiveTo: number
): number {
  return contributions.reduce(
    (sum, c) =>
      sum + c.amount * Math.pow(1 + annualRate, (effectiveTo - c.t) / YEAR_MS),
    0
  );
}
