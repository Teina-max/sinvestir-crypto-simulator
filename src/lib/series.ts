/** Réduit une série à ~`max` points pour un rendu fluide, en gardant le dernier. */
export function downsample<T extends { t: number }>(series: T[], max = 220): T[] {
  if (series.length <= max) return series;
  const step = Math.ceil(series.length / max);
  const out = series.filter((_, i) => i % step === 0);
  const last = series[series.length - 1];
  if (out[out.length - 1]?.t !== last.t) out.push(last);
  return out;
}
