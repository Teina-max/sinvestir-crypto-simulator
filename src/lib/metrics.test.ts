import { describe, expect, test } from "bun:test";
import {
  annualizedReturn,
  annualizedVolatility,
  maxDrawdown,
  type CashFlow,
} from "./metrics";
import type { PricePoint } from "./dca";

const DAY = 86_400_000;
const YEAR = 365.25 * DAY;

describe("annualizedReturn (TRI)", () => {
  test("doublement en 1 an → ~100 %/an", () => {
    const flows: CashFlow[] = [
      { t: 0, amount: -100 },
      { t: YEAR, amount: 200 },
    ];
    expect(annualizedReturn(flows)).toBeCloseTo(100, 1);
  });

  test("pas de gain → ~0 %/an", () => {
    const flows: CashFlow[] = [
      { t: 0, amount: -100 },
      { t: YEAR, amount: 100 },
    ];
    expect(annualizedReturn(flows)).toBeCloseTo(0, 1);
  });

  test("un seul flux → 0 (indéterminé)", () => {
    expect(annualizedReturn([{ t: 0, amount: -100 }])).toBe(0);
  });

  test("DCA : 2 versements puis valorisation supérieure → TRI positif", () => {
    const flows: CashFlow[] = [
      { t: 0, amount: -100 },
      { t: YEAR, amount: -100 },
      { t: 2 * YEAR, amount: 260 },
    ];
    expect(annualizedReturn(flows)).toBeGreaterThan(0);
  });
});

describe("maxDrawdown", () => {
  test("chute de 100 à 50 → 50 %", () => {
    const prices: PricePoint[] = [
      { t: 0, price: 100 },
      { t: 1, price: 50 },
      { t: 2, price: 80 },
      { t: 3, price: 200 },
      { t: 4, price: 120 },
    ];
    expect(maxDrawdown(prices)).toBeCloseTo(50, 5);
  });

  test("prix croissant → drawdown nul", () => {
    const prices: PricePoint[] = [
      { t: 0, price: 10 },
      { t: 1, price: 20 },
      { t: 2, price: 30 },
    ];
    expect(maxDrawdown(prices)).toBe(0);
  });
});

describe("annualizedVolatility", () => {
  test("prix constant → volatilité nulle", () => {
    const prices: PricePoint[] = Array.from({ length: 10 }, (_, i) => ({
      t: i * DAY,
      price: 100,
    }));
    expect(annualizedVolatility(prices)).toBe(0);
  });

  test("prix volatil → volatilité strictement positive", () => {
    const prices: PricePoint[] = [
      { t: 0, price: 100 },
      { t: DAY, price: 130 },
      { t: 2 * DAY, price: 90 },
      { t: 3 * DAY, price: 140 },
      { t: 4 * DAY, price: 95 },
    ];
    expect(annualizedVolatility(prices)).toBeGreaterThan(0);
  });
});
