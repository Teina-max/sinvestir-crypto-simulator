/**
 * Indicateurs de risque/performance dérivés d'une simulation.
 * Fonctions pures, isolées du moteur DCA pour rester testables.
 */

import type { PricePoint } from "./dca";

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

/** Un flux de trésorerie : négatif = versement (sortie), positif = valorisation. */
export interface CashFlow {
  t: number;
  amount: number;
}

/**
 * Rendement annualisé pondéré par les flux (TRI / money-weighted return),
 * résolu par bisection sur la VAN. Gère correctement le DCA (versements à des
 * dates différentes), contrairement à un simple (final/investi)^(1/durée).
 * Retourne un pourcentage annuel (ex. 42.5 pour +42,5 %/an), 0 si indéterminé.
 */
export function annualizedReturn(flows: CashFlow[]): number {
  if (flows.length < 2) return 0;
  const t0 = flows[0].t;
  const npv = (r: number) =>
    flows.reduce(
      (sum, f) => sum + f.amount / Math.pow(1 + r, (f.t - t0) / YEAR_MS),
      0
    );

  let lo = -0.9999; // perte quasi totale
  let hi = 100; // +10 000 %/an, borne haute large
  let fLo = npv(lo);
  let fHi = npv(hi);
  if (!Number.isFinite(fLo) || !Number.isFinite(fHi) || fLo * fHi > 0) {
    return 0; // pas de changement de signe → TRI hors bornes
  }
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid);
    if (Math.abs(fMid) < 1e-7) return mid * 100;
    if (fLo * fMid < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return ((lo + hi) / 2) * 100;
}

/**
 * Plus forte baisse historique de l'actif depuis un sommet (max drawdown),
 * sur les prix de la période. Retourne un pourcentage positif (ex. 83.2 = −83,2 %).
 */
export function maxDrawdown(prices: PricePoint[]): number {
  let peak = 0;
  let maxDD = 0;
  for (const { price } of prices) {
    if (price > peak) peak = price;
    if (peak > 0) {
      const dd = (peak - price) / peak;
      if (dd > maxDD) maxDD = dd;
    }
  }
  return maxDD * 100;
}

/**
 * Volatilité annualisée de l'actif (écart-type des rendements journaliers × √365).
 * Retourne un pourcentage. Mesure le risque, pas la performance.
 */
export function annualizedVolatility(prices: PricePoint[]): number {
  if (prices.length < 3) return 0;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1].price;
    if (prev > 0) returns.push(prices[i].price / prev - 1);
  }
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(365) * 100;
}
