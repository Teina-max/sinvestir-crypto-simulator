import { describe, expect, test } from "bun:test";
import { buyDates, simulate, type PricePoint } from "./dca";

const DAY = 86_400_000;

/** Série de prix journalière constante, `days` points à partir de t=0. */
function flatPrices(days: number, price: number): PricePoint[] {
  return Array.from({ length: days }, (_, i) => ({ t: i * DAY, price }));
}

describe("buyDates", () => {
  test("once → un seul achat à la date de début", () => {
    expect(buyDates(0, 100 * DAY, "once")).toEqual([0]);
  });

  test("daily → un achat par jour, bornes incluses", () => {
    expect(buyDates(0, 6 * DAY, "daily")).toHaveLength(7);
  });

  test("weekly → un achat tous les 7 jours", () => {
    expect(buyDates(0, 21 * DAY, "weekly")).toEqual([
      0,
      7 * DAY,
      14 * DAY,
      21 * DAY,
    ]);
  });

  test("monthly → un achat par mois calendaire", () => {
    const from = Date.UTC(2020, 0, 1);
    const to = Date.UTC(2020, 2, 1);
    expect(buyDates(from, to, "monthly")).toHaveLength(3);
  });

  test("plage inversée → aucun achat", () => {
    expect(buyDates(100 * DAY, 0, "weekly")).toEqual([]);
  });
});

describe("simulate — achat unique (lump sum)", () => {
  test("double de prix → +100 % de performance", () => {
    const r = simulate({
      prices: [
        { t: 0, price: 100 },
        { t: DAY, price: 200 },
      ],
      amount: 100,
      frequency: "once",
      from: 0,
      to: DAY,
    });
    expect(r.periods).toBe(1);
    expect(r.invested).toBe(100);
    expect(r.quantity).toBeCloseTo(1, 8);
    expect(r.finalValue).toBeCloseTo(200, 6);
    expect(r.performance).toBeCloseTo(100, 6);
  });

  test("chute de prix → performance négative", () => {
    const r = simulate({
      prices: [
        { t: 0, price: 100 },
        { t: DAY, price: 40 },
      ],
      amount: 100,
      frequency: "once",
      from: 0,
      to: DAY,
    });
    expect(r.pnl).toBeCloseTo(-60, 6);
    expect(r.performance).toBeCloseTo(-60, 6);
  });
});

describe("simulate — DCA", () => {
  test("prix constant → performance nulle, investi = montant × périodes", () => {
    const r = simulate({
      prices: flatPrices(22, 100),
      amount: 10,
      frequency: "weekly",
      from: 0,
      to: 21 * DAY,
    });
    expect(r.periods).toBe(4); // j0, j7, j14, j21
    expect(r.invested).toBe(40);
    expect(r.quantity).toBeCloseTo(0.4, 8);
    expect(r.performance).toBeCloseTo(0, 6);
  });

  test("prix moyen d'achat = investi / quantité", () => {
    const r = simulate({
      prices: [
        { t: 0, price: 100 },
        { t: 7 * DAY, price: 300 },
      ],
      amount: 30,
      frequency: "weekly",
      from: 0,
      to: 7 * DAY,
    });
    // achats : 30€@100 (0,3) + 30€@300 (0,1) = 0,4 unités pour 60€
    expect(r.quantity).toBeCloseTo(0.4, 8);
    expect(r.averagePrice).toBeCloseTo(150, 6);
  });
});

describe("simulate — cas limites", () => {
  test("montant nul → résultat zéro", () => {
    const r = simulate({
      prices: flatPrices(5, 100),
      amount: 0,
      frequency: "once",
      from: 0,
      to: 4 * DAY,
    });
    expect(r.invested).toBe(0);
    expect(r.performance).toBe(0);
  });

  test("historique vide → résultat zéro sans crash", () => {
    const r = simulate({
      prices: [],
      amount: 100,
      frequency: "daily",
      from: 0,
      to: DAY,
    });
    expect(r.series).toEqual([]);
    expect(r.finalValue).toBe(0);
  });

  test("période hors données → bornée à l'historique disponible", () => {
    const r = simulate({
      prices: flatPrices(10, 50),
      amount: 100,
      frequency: "once",
      from: -1000 * DAY, // avant le premier point
      to: 100 * DAY, // après le dernier
    });
    // achat unique au premier point disponible (prix 50)
    expect(r.quantity).toBeCloseTo(2, 8);
    expect(r.finalValue).toBeCloseTo(100, 6);
  });

  test("montant NaN → résultat zéro (garde Number.isFinite)", () => {
    const r = simulate({
      prices: flatPrices(5, 100),
      amount: Number.NaN,
      frequency: "once",
      from: 0,
      to: 4 * DAY,
    });
    expect(r.invested).toBe(0);
    expect(Number.isNaN(r.invested)).toBe(false);
  });
});

describe("simulate — cohérence KPI / série (régression P0)", () => {
  test("historique clairsemé : l'investi des KPI = celui du dernier point de la série", () => {
    // Prix au jour 0 et au jour 40 ; analyse jusqu'au jour 35 (dans un trou).
    const prices: PricePoint[] = [
      { t: 0, price: 100 },
      { t: 40 * DAY, price: 100 },
    ];
    const r = simulate({
      prices,
      amount: 10,
      frequency: "daily",
      from: 0,
      to: 35 * DAY,
    });
    const lastPoint = r.series[r.series.length - 1];
    // KPI et graphique ne doivent jamais diverger.
    expect(lastPoint.invested).toBe(r.invested);
    expect(r.periods).toBe(r.series.length === 0 ? 0 : r.periods);
    // Aucun achat « hors graphique » : ici un seul point observé → un seul achat.
    expect(r.periods).toBe(1);
    expect(r.invested).toBe(10);
  });

  test("prix à 0 : compté ni dans periods ni dans invested", () => {
    const prices: PricePoint[] = [
      { t: 0, price: 0 },
      { t: DAY, price: 100 },
    ];
    const r = simulate({
      prices,
      amount: 10,
      frequency: "daily",
      from: 0,
      to: DAY,
    });
    // 2 dates d'achat, mais celle au prix 0 n'est pas exécutée.
    expect(r.periods).toBe(1);
    expect(r.invested).toBe(10);
  });
});

describe("simulate — métriques de risque", () => {
  test("doublement lump sum sur ~1 an → rendement annualisé ~100 %", () => {
    const prices: PricePoint[] = [
      { t: 0, price: 100 },
      { t: Math.round(365.25 * DAY), price: 200 },
    ];
    const r = simulate({
      prices,
      amount: 100,
      frequency: "once",
      from: 0,
      to: Math.round(365.25 * DAY),
    });
    expect(r.annualizedReturn).toBeGreaterThan(95);
    expect(r.annualizedReturn).toBeLessThan(105);
    expect(r.effectiveTo).toBe(Math.round(365.25 * DAY));
  });
});
