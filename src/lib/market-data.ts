/**
 * Accès serveur aux données de marché. Deux sources publiques, choisies pour
 * fonctionner sans clé et depuis un serverless US (Vercel) :
 *
 *  - Liste des cryptos : CoinGecko /coins/markets (nom, ticker, logo, rang).
 *  - Historique de prix : Yahoo Finance (paires <TICKER>-EUR), seul fournisseur
 *    gratuit testé offrant un historique journalier pluriannuel en EUR.
 *    (CoinGecko keyless plafonne à 365 j ; CryptoCompare et Binance sont
 *    respectivement sous clé et géo-bloqués US — cf. README.)
 *
 * Tout passe par le serveur : la clé éventuelle reste cachée, le cache mutualisé
 * lisse les quotas, et le navigateur n'a aucun appel tiers (anti-CORS).
 */

const CG_BASE = "https://api.coingecko.com/api/v3";
const YF_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  rank: number | null;
}

// Stablecoins : exclus de la liste (un backtest sur un actif indexé n'a pas de sens).
const STABLECOINS = new Set([
  "usdt", "usdc", "dai", "busd", "tusd", "usde", "fdusd", "usds", "pyusd",
  "gusd", "usdp", "usdd", "frax", "lusd", "eurt", "eurs", "eurc",
]);

function cgHeaders(): HeadersInit {
  const key = process.env.COINGECKO_API_KEY;
  return key
    ? { accept: "application/json", "x-cg-demo-api-key": key }
    : { accept: "application/json" };
}

/** Top 100 cryptos par capitalisation (hors stablecoins), pour la recherche. */
export async function fetchCoins(): Promise<Coin[]> {
  const url = `${CG_BASE}/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
  const res = await fetch(url, {
    headers: cgHeaders(),
    next: { revalidate: 60 * 60 * 6 }, // 6 h
  });
  if (!res.ok) throw new Error(`CoinGecko markets ${res.status}`);
  const data = (await res.json()) as Array<{
    id: string;
    symbol: string;
    name: string;
    image: string;
    market_cap_rank: number | null;
  }>;
  return data
    .filter((c) => !STABLECOINS.has(c.symbol.toLowerCase()))
    .map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      image: c.image,
      rank: c.market_cap_rank,
    }));
}

interface YahooChart {
  chart: {
    result?: Array<{
      timestamp?: number[];
      indicators: { quote: Array<{ close?: (number | null)[] }> };
    }>;
    error?: { description?: string } | null;
  };
}

/**
 * Historique journalier en EUR depuis ~10 ans pour un ticker (ex. "BTC").
 * `range=10y` garantit la granularité journalière (range=max bascule en hebdo).
 */
export async function fetchHistory(
  symbol: string
): Promise<{ t: number; price: number }[]> {
  const pair = `${symbol.toUpperCase()}-EUR`;
  const url = `${YF_BASE}/${encodeURIComponent(pair)}?interval=1d&range=10y`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 60 * 60 }, // 1 h
  });
  if (!res.ok) throw new Error(`Yahoo ${pair} ${res.status}`);

  const data = (await res.json()) as YahooChart;
  const result = data.chart.result?.[0];
  const timestamps = result?.timestamp;
  const closes = result?.indicators.quote[0]?.close;
  if (!timestamps || !closes) {
    throw new Error(`Yahoo ${pair} sans données`);
  }

  const points: { t: number; price: number }[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const price = closes[i];
    // Yahoo renvoie parfois null/0/aberrations sur les paires peu liquides.
    if (price != null && Number.isFinite(price) && price > 0) {
      points.push({ t: timestamps[i] * 1000, price });
    }
  }
  if (points.length === 0) throw new Error(`Yahoo ${pair} série vide`);
  return points;
}
