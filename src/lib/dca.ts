/**
 * Moteur de calcul du simulateur crypto (transposition de la logique Fritzy).
 *
 * Deux modes, pilotés par la fréquence :
 *  - "once"  : achat unique (lump sum) à la date de début.
 *  - daily/weekly/monthly : investissement récurrent (DCA) du même montant à
 *    chaque période entre `from` et `to`.
 *
 * À chaque achat, le montant (€) est converti en quantité de crypto au prix
 * historique du jour. Le moteur est pur (aucun effet de bord, aucune I/O) afin
 * d'être testable indépendamment de la source de données.
 */

export type Frequency = "once" | "daily" | "weekly" | "monthly";

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "once", label: "En une seule fois" },
  { value: "daily", label: "Quotidien" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
];

/** Point de prix historique (timestamp en ms, prix en EUR). */
export interface PricePoint {
  t: number;
  price: number;
}

export interface SimulationInput {
  /** Historique de prix journalier, trié par `t` croissant. */
  prices: PricePoint[];
  /** Montant investi par période (ou total en mode "once"), en EUR. */
  amount: number;
  frequency: Frequency;
  /** Bornes de la période d'analyse, en ms. */
  from: number;
  to: number;
}

/** Un point de la série temporelle (pour le graphique). */
export interface SimulationPoint {
  t: number;
  /** Capital investi cumulé à cette date (EUR). */
  invested: number;
  /** Quantité de crypto détenue à cette date. */
  quantity: number;
  /** Prix de la crypto à cette date (EUR). */
  price: number;
  /** Valeur du portefeuille à cette date (quantity × price). */
  value: number;
  /** Plus/moins-value latente (value − invested). */
  pnl: number;
}

export interface SimulationResult {
  /** Capital total investi (EUR). */
  invested: number;
  /** Nombre d'achats réalisés. */
  periods: number;
  /** Quantité totale de crypto acquise. */
  quantity: number;
  /** Prix moyen d'acquisition (invested / quantity). */
  averagePrice: number;
  /** Valeur finale du portefeuille à la date de fin. */
  finalValue: number;
  /** Plus/moins-value totale (finalValue − invested). */
  pnl: number;
  /** Performance en % (ROI simple, non annualisé). */
  performance: number;
  /** Série temporelle pour le graphique. */
  series: SimulationPoint[];
  frequency: Frequency;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Prix au timestamp `t` : dernier point connu à cette date ou avant.
 * Recherche dichotomique sur une série triée croissante. Si `t` précède le
 * premier point connu, retourne le premier prix disponible.
 */
function priceAt(prices: PricePoint[], t: number): number {
  if (prices.length === 0) return 0;
  if (t <= prices[0].t) return prices[0].price;
  let lo = 0;
  let hi = prices.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (prices[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return prices[lo].price;
}

/** Ajoute `n` mois à un timestamp en UTC (gère les débordements de fin de mois). */
function addMonths(t: number, n: number): number {
  const d = new Date(t);
  const day = d.getUTCDate();
  const target = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1, 0, 0, 0, 0)
  );
  // Borne le jour au dernier jour du mois cible (ex. 31 janv + 1 mois → 28/29 févr).
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.getTime();
}

/** Génère les dates d'achat (timestamps) selon la fréquence, dans [from, to]. */
export function buyDates(from: number, to: number, frequency: Frequency): number[] {
  if (to < from) return [];
  if (frequency === "once") return [from];

  const dates: number[] = [];
  if (frequency === "monthly") {
    for (let t = from, i = 0; t <= to; i++, t = addMonths(from, i)) {
      dates.push(t);
    }
    return dates;
  }

  const step = frequency === "daily" ? DAY_MS : 7 * DAY_MS;
  for (let t = from; t <= to; t += step) dates.push(t);
  return dates;
}

/**
 * Lance la simulation et retourne les KPI + la série temporelle.
 * Renvoie un résultat « zéro » si les données sont insuffisantes.
 */
export function simulate(input: SimulationInput): SimulationResult {
  const { prices, amount, frequency } = input;
  const empty: SimulationResult = {
    invested: 0,
    periods: 0,
    quantity: 0,
    averagePrice: 0,
    finalValue: 0,
    pnl: 0,
    performance: 0,
    series: [],
    frequency,
  };
  if (prices.length === 0 || amount <= 0) return empty;

  // Borne la période à l'historique réellement disponible.
  const from = Math.max(input.from, prices[0].t);
  const to = Math.min(input.to, prices[prices.length - 1].t);
  if (to < from) return empty;

  const buys = buyDates(from, to, frequency);
  if (buys.length === 0) return empty;

  // Achats triés : à chaque date, on convertit `amount` € en quantité.
  const buyEvents = buys.map((t) => ({ t, price: priceAt(prices, t) }));

  // Série temporelle alignée sur les points de prix de la période.
  const window = prices.filter((p) => p.t >= from && p.t <= to);
  const series: SimulationPoint[] = [];
  let invested = 0;
  let quantity = 0;
  let bi = 0;
  for (const point of window) {
    // Exécute tous les achats dont la date est atteinte à ce point.
    while (bi < buyEvents.length && buyEvents[bi].t <= point.t) {
      const buy = buyEvents[bi];
      if (buy.price > 0) {
        quantity += amount / buy.price;
        invested += amount;
      }
      bi++;
    }
    const value = quantity * point.price;
    series.push({
      t: point.t,
      invested,
      quantity,
      price: point.price,
      value,
      pnl: value - invested,
    });
  }

  // Solde des achats éventuellement postérieurs au dernier point de la fenêtre.
  while (bi < buyEvents.length) {
    const buy = buyEvents[bi];
    if (buy.price > 0) {
      quantity += amount / buy.price;
      invested += amount;
    }
    bi++;
  }

  const finalPrice = window.length > 0 ? window[window.length - 1].price : 0;
  const finalValue = quantity * finalPrice;
  const pnl = finalValue - invested;

  return {
    invested,
    periods: buyEvents.length,
    quantity,
    averagePrice: quantity > 0 ? invested / quantity : 0,
    finalValue,
    pnl,
    performance: invested > 0 ? (pnl / invested) * 100 : 0,
    series,
    frequency,
  };
}
