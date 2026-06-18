"use client";

import { useEffect, useMemo, useState } from "react";
import type { Coin } from "@/lib/market-data";
import { simulate, type Frequency, type PricePoint } from "@/lib/dca";
import { cn } from "@/lib/utils";
import { SimulatorForm } from "./simulator-form";
import { SimulatorResults } from "./simulator-results";

const todayISO = () => new Date().toISOString().slice(0, 10);

interface CryptoSimulatorProps {
  /** Mode embarqué (iframe) : pas de marges externes, juste l'outil. */
  embedded?: boolean;
  className?: string;
}

/**
 * Composant autonome du simulateur crypto. Récupère ses propres données
 * (cryptos + historique via les routes /api/crypto), gère son état, et n'a
 * aucune dépendance au reste du site → directement réutilisable / embarquable.
 */
export function CryptoSimulator({ embedded, className }: CryptoSimulatorProps) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [coinsLoading, setCoinsLoading] = useState(true);
  const [coinId, setCoinId] = useState("bitcoin");
  const [amount, setAmount] = useState(25);
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [from, setFrom] = useState("2018-01-01");
  const [to, setTo] = useState(todayISO);
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Liste des cryptos (une fois).
  useEffect(() => {
    let active = true;
    fetch("/api/crypto/coins")
      .then((r) => r.json())
      .then((d) => {
        if (active && d.coins) setCoins(d.coins);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCoinsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Historique de prix : keyé sur le ticker (Yahoo), donc on attend que la
  // liste des cryptos soit chargée pour résoudre l'id → symbol.
  useEffect(() => {
    const coin = coins.find((c) => c.id === coinId);
    if (!coin) return;
    let active = true;

    const load = async () => {
      setPricesLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/crypto/history?symbol=${encodeURIComponent(coin.symbol)}`
        );
        const data = await res.json();
        if (!active) return;
        if (data.prices) setPrices(data.prices);
        else setError(data.error ?? "Erreur de chargement des données.");
      } catch {
        if (active) setError("Erreur réseau lors du chargement des prix.");
      } finally {
        if (active) setPricesLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [coinId, coins]);

  const result = useMemo(() => {
    const fromMs = Date.parse(from);
    const toMs = Date.parse(to);
    if (Number.isNaN(fromMs) || Number.isNaN(toMs) || amount <= 0) return null;
    return simulate({ prices, amount, frequency, from: fromMs, to: toMs });
  }, [prices, amount, frequency, from, to]);

  const selected = coins.find((c) => c.id === coinId);

  return (
    <div
      className={cn(
        "grid gap-6 lg:grid-cols-12",
        embedded && "lg:gap-5",
        className
      )}
    >
      {/* Panneau de saisie */}
      <div className="min-w-0 lg:col-span-5 xl:col-span-4">
        <div className="rounded-2xl border border-white/5 bg-card/60 p-5 sm:p-6">
          <h2 className="mb-1 text-base font-semibold">Votre simulation</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Sur données de marché historiques réelles.
          </p>
          <SimulatorForm
            coins={coins}
            coinsLoading={coinsLoading}
            coinId={coinId}
            amount={amount}
            frequency={frequency}
            from={from}
            to={to}
            onCoinChange={setCoinId}
            onAmountChange={setAmount}
            onFrequencyChange={setFrequency}
            onFromChange={setFrom}
            onToChange={setTo}
          />
        </div>
      </div>

      {/* Résultats */}
      <div className="min-w-0 lg:col-span-7 xl:col-span-8">
        <SimulatorResults
          result={result}
          symbol={selected?.symbol ?? ""}
          coinName={selected?.name ?? "cette cryptomonnaie"}
          amount={amount}
          frequency={frequency}
          from={from}
          to={to}
          loading={pricesLoading || coinsLoading}
          error={error}
        />
      </div>
    </div>
  );
}
