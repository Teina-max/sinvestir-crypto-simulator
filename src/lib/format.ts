/** Formatage localisé fr-FR pour l'affichage des résultats. */

const eur0 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const eur2 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Montant en euros. `compact` arrondit à l'unité (axes de graphique). */
export function formatEUR(n: number, compact = false): string {
  return (compact ? eur0 : eur2).format(n);
}

/** Prix : 2 décimales sous 1 000 €, plus de précision pour les micro-caps. */
export function formatPrice(n: number): string {
  if (n > 0 && n < 1) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumSignificantDigits: 4,
    }).format(n);
  }
  return eur2.format(n);
}

/** Pourcentage signé : "+217,74 %" / "−12,40 %". */
export function formatPercent(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`;
}

/** Pourcentage en magnitude (sans signe), 1 décimale : "75,4 %". */
export function formatPercentAbs(n: number): string {
  return `${Math.abs(n).toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} %`;
}

/** Quantité de crypto, 8 décimales avec signe (ex. "+23,11405370"). */
export function formatCrypto(n: number): string {
  return `+${n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  })}`;
}

/** Date courte localisée pour les axes et libellés. */
export function formatDate(t: number): string {
  return new Date(t).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Mois + année, pour les ticks d'axe temporel. */
export function formatMonthYear(t: number): string {
  return new Date(t).toLocaleDateString("fr-FR", {
    month: "short",
    year: "2-digit",
  });
}
