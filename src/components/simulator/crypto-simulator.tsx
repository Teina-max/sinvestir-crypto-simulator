"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Check, CircleAlert, Share2 } from "lucide-react";
import type { Coin } from "@/lib/market-data";
import { simulate, type Frequency, type PricePoint } from "@/lib/dca";
import { Button } from "@/components/ui/button";
import { EyebrowBadge } from "@/components/site/eyebrow-badge";
import { SectionTitle } from "./section-title";
import { SimulatorForm } from "./simulator-form";
import { SimulatorResults } from "./simulator-results";
import { SimulatorCharts } from "./simulator-charts";

const todayISO = () => new Date().toISOString().slice(0, 10);

interface CryptoSimulatorProps {
  /** Mode embarqué (iframe) : pas de titre de section ni de marges externes. */
  embedded?: boolean;
}

/**
 * Simulateur crypto au format de la suite S'investir : titre à traits, encart
 * pédagogique, saisie (underline) à gauche, « Vos résultats » à droite, et
 * graphiques en bas. Composant autonome (récupère ses données) et embarquable.
 */
export function CryptoSimulator({ embedded }: CryptoSimulatorProps) {
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
  const [feedback, setFeedback] = useState<"saved" | "copied" | null>(null);

  // Au montage : restaure une simulation partagée via l'URL (?c=…&m=…&f=…).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const c = p.get("c");
    const m = Number(p.get("m"));
    const f = p.get("f");
    const df = p.get("from");
    const dt = p.get("to");
    /* eslint-disable react-hooks/set-state-in-effect */
    if (c) setCoinId(c);
    if (Number.isFinite(m) && m > 0) setAmount(m);
    if (f && ["once", "daily", "weekly", "monthly"].includes(f)) {
      setFrequency(f as Frequency);
    }
    if (df) setFrom(df);
    if (dt) setTo(dt);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

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

  // Historique de prix : keyé sur le ticker (Yahoo), après chargement des coins.
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
    if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return null;
    return simulate({ prices, amount, frequency, from: fromMs, to: toMs });
  }, [prices, amount, frequency, from, to]);

  const selected = coins.find((c) => c.id === coinId);
  const loading = pricesLoading || coinsLoading;

  const buildShareUrl = () => {
    const p = new URLSearchParams({
      c: coinId,
      m: String(amount),
      f: frequency,
      from,
      to,
    });
    return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
  };

  const handleShare = async () => {
    const url = buildShareUrl();
    window.history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* presse-papier indisponible : l'URL reste dans la barre d'adresse */
    }
    setFeedback("copied");
    window.setTimeout(() => setFeedback(null), 2200);
  };

  const handleSave = () => {
    try {
      localStorage.setItem("sinv-crypto-sim", buildShareUrl());
    } catch {
      /* localStorage indisponible (mode privé) */
    }
    setFeedback("saved");
    window.setTimeout(() => setFeedback(null), 2200);
  };

  return (
    <div className="space-y-7">
      {!embedded && (
        <header className="flex flex-col items-center gap-4 text-center">
          <EyebrowBadge>Les simulateurs S&apos;investir</EyebrowBadge>
          <SectionTitle>Simulateur Crypto</SectionTitle>
          <p className="text-base font-medium text-[#4d9fff] sm:text-lg">
            Et si vous aviez investi en cryptomonnaie&nbsp;?
          </p>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Mesurez la performance qu&apos;aurait eue un investissement — en une
            fois ou de façon programmée (DCA) — sur des données de marché
            historiques réelles, et visualisez le risque associé.
          </p>
        </header>
      )}

      {/* encart pédagogique */}
      <div className="flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <CircleAlert className="size-5 shrink-0 text-[#1098f7]" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Cet outil a une vocation pédagogique et illustrative, sur la base de
          données de marché passées. Les performances passées ne préjugent pas
          des performances futures&nbsp;: les crypto-actifs comportent un risque
          de perte en capital partielle ou totale.
        </p>
      </div>

      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
        {/* saisie */}
        <div className="min-w-0 lg:col-span-5">
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
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={handleSave}
              className="bg-[#0049c6] font-light hover:bg-[#0049c6]/90"
            >
              {feedback === "saved" ? (
                <>
                  <Check className="size-4" /> Enregistrée
                </>
              ) : (
                <>
                  <Bookmark className="size-4" /> Enregistrer la simulation
                </>
              )}
            </Button>
            <Button
              onClick={handleShare}
              className="bg-white font-light text-[#0a1020] hover:bg-white/90"
            >
              {feedback === "copied" ? (
                <>
                  <Check className="size-4" /> Lien copié
                </>
              ) : (
                <>
                  <Share2 className="size-4" /> Partager mes résultats
                </>
              )}
            </Button>
          </div>
        </div>

        {/* résultats */}
        <div className="min-w-0 lg:col-span-7">
          <SimulatorResults
            result={result}
            symbol={selected?.symbol ?? ""}
            coinName={selected?.name ?? "cette cryptomonnaie"}
            amount={amount}
            frequency={frequency}
            from={from}
            loading={loading}
            error={error}
          />
        </div>
      </div>

      {/* graphiques */}
      <SimulatorCharts result={loading ? null : result} loading={loading && !error} />
    </div>
  );
}
