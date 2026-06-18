# Simulateur Crypto — S'investir

Transposition du [simulateur crypto](https://sinvestir.fr/simulateur-crypto-monnaie/) aux standards visuels de la suite [simulateurs.sinvestir.fr](https://simulateurs.sinvestir.fr/), sous forme d'un composant **autonome, intégrable et embarquable**.

On reprend la **logique fonctionnelle** (backtest d'un investissement crypto, en une fois ou en DCA, sur données de marché historiques réelles) et on l'habille à l'**identité visuelle S'investir** (dark-first navy, accents dorés, vert/rouge gains-pertes, typographies Plus Jakarta Sans / Lexend).

- **Démo en ligne** : https://sinvestir-crypto-simulator.vercel.app
- **Aperçu intégré (embed)** : https://sinvestir-crypto-simulator.vercel.app/embed

---

## Démarrer

```bash
bun install
bun dev          # http://localhost:3000
bun test         # tests du moteur de calcul (Bun test runner)
bun run build    # build de production
```

Aucune variable d'environnement requise pour la démo. Une seule est reconnue, optionnelle :

| Variable | Rôle |
|---|---|
| `COINGECKO_API_KEY` | Clé CoinGecko (plan demo/payant). Sans clé, l'API publique est utilisée. |

---

## Structure

```
src/
├─ app/
│  ├─ page.tsx                 # Simulateur dans l'app-shell S'investir (sidebar + contenu)
│  ├─ embed/page.tsx           # Version nue pour embarquement iframe
│  ├─ icon.svg                 # Favicon (blason S'investir)
│  └─ api/crypto/
│     ├─ coins/route.ts        # Proxy liste des cryptos
│     └─ history/route.ts      # Proxy historique de prix (par ticker)
├─ components/
│  ├─ simulator/               # Le simulateur et ses sous-parties
│  │  ├─ crypto-simulator.tsx  #   orchestrateur (état, fetch, calcul, partage)
│  │  ├─ section-title.tsx     #   titre centré à traits décoratifs
│  │  ├─ simulator-form.tsx    #   saisie en style « underline »
│  │  ├─ simulator-results.tsx #   « Vos résultats » : KPI, risque, récap, comparaison
│  │  ├─ result-card.tsx       #   carte de résultat réutilisable
│  │  ├─ progress-bar.tsx      #   barre de progression bicolore
│  │  ├─ coin-combobox.tsx     #   sélecteur de crypto avec recherche
│  │  ├─ simulator-charts.tsx  #   onglets Évolution / Gains-pertes
│  │  ├─ performance-chart.tsx #   valeur vs investi (+ ligne Livret A)
│  │  └─ pnl-chart.tsx         #   plus/moins-value (vert/rouge)
│  ├─ site/                    # App-shell, logo, badge animé
│  └─ ui/                      # Primitives shadcn/ui
└─ lib/
   ├─ dca.ts                   # Moteur de calcul DCA/lump-sum (pur, testé)
   ├─ metrics.ts               # TRI annualisé, max drawdown, volatilité (pur, testé)
   ├─ benchmark.ts             # Comparaison à un placement à taux fixe (Livret A, inflation)
   ├─ series.ts                # Downsample des séries pour le rendu
   ├─ market-data.ts           # Accès serveur aux données de marché
   ├─ format.ts                # Formatage localisé fr-FR
   └─ *.test.ts                # 24 tests unitaires (moteur + métriques)
```

---

## Fonctionnalités

- **Backtest DCA / achat unique** sur données historiques réelles, recalcul en temps réel.
- **Indicateurs de risque** : performance annualisée (TRI pondéré par les flux), volatilité annualisée, max drawdown — pour ne pas montrer que le gain.
- **Comparaison à un placement sans risque** (Livret A 3 %/an, inflation 2 %/an), à versements identiques, dans les chiffres et sur le graphique.
- **Deux graphiques** : évolution (valeur vs investi + ligne Livret A) et plus/moins-value (vert/rouge).
- **Partage par URL** : « Partager mes résultats » encode la simulation dans le lien (restauré au chargement). « Enregistrer » persiste en local.
- **Fidélité DA S'investir** : app-shell (sidebar), titre à traits, badge à bordure animée, inputs underline, barre bicolore, palette/typo relevées sur leur DOM.
- **Responsive** desktop/mobile + route **`/embed`** embarquable.

---

## Partis pris techniques

### Stack : Next.js + Tailwind v4 + shadcn/ui + Recharts, déployé sur Vercel

Choix aligné sur la **stack interne annoncée** (Next.js, Supabase, Vercel, n8n) et sur les missions réelles à venir (outils internes, agents IA, intégrations). Le simulateur est ainsi **directement intégrable** à votre infrastructure.

> À noter : la suite `simulateurs.sinvestir.fr` actuelle tourne en **Nuxt 3 / Vue** (Nuxt UI v3 + Tailwind v4 + Supabase), alors que la stack interne citée est Next.js. J'ai donc recréé la DA en Next.js — les **tokens de design** (couleurs, typo, radius, glow) ont été relevés sur le DOM live de votre suite pour rester fidèle au plus près, tout en restant dans votre stack cible. C'est aussi un point de discussion (cf. suggestions).

### Données de marché : un proxy serveur, deux sources

Tous les appels tiers passent par des **route handlers serveur** (`/api/crypto/*`) plutôt que par le navigateur : la clé éventuelle reste cachée, le cache HTTP mutualisé lisse les quotas, et on évite tout problème de CORS / rate-limit côté client.

Le choix des sources résulte d'une **validation contre les API réelles** (et non de suppositions) :

| Besoin | Source retenue | Pourquoi |
|---|---|---|
| Liste des cryptos (nom, ticker, logo, rang) | **CoinGecko** `/coins/markets` | Top 100 par capitalisation, hors stablecoins. |
| Historique de prix journalier multi-années en EUR | **Yahoo Finance** (`<TICKER>-EUR`, `range=10y`) | Seule source gratuite **sans clé** et **non géo-bloquée US** offrant un historique journalier pluriannuel en EUR. |

Pistes écartées, et pourquoi (transparence) :
- **CoinGecko `market_chart`** : l'API publique plafonne l'historique à **365 jours** (réservé aux plans payants). Le code reconnaît `COINGECKO_API_KEY` : avec un plan adéquat, on bascule sans friction sur CoinGecko de bout en bout.
- **CryptoCompare** : exige désormais une clé (401).
- **Binance** : `api.binance.com` est **géo-bloqué depuis les IP US** → cassé sur Vercel.

Le simulateur d'origine (widget **Fritzy** tiers) s'appuie lui-même sur un proxy CoinGecko ; ici les données restent dans **votre** périmètre serveur.

### Moteur de calcul isolé et testé

La logique (`lib/dca.ts`) est une **fonction pure** sans I/O : génération des dates d'achat selon la fréquence (`once` / `daily` / `weekly` / `monthly`), conversion de chaque versement en quantité au prix historique du jour, puis KPI (investi, quantité acquise, prix moyen, capital final, plus/moins-value, performance ROI) + série temporelle pour le graphique. Couverte par **12 tests** (`bun test`).

### Pensé pour l'intégration dès le départ

- `<CryptoSimulator />` est **autonome** : il récupère ses propres données et n'a aucune dépendance au reste du site → réutilisable tel quel.
- La route **`/embed`** rend l'outil nu (sans header/footer), prête à être embarquée en iframe. Les en-têtes `Content-Security-Policy: frame-ancestors` (cf. `next.config.ts`) **n'autorisent l'embed que depuis les domaines `*.sinvestir.fr`**.
- Peu de dépendances (Next, React, Recharts, primitives Radix via shadcn).

---

## Intégrer l'outil

**Dans la suite Next.js** : importer le composant.
```tsx
import { CryptoSimulator } from "@/components/simulator/crypto-simulator";
<CryptoSimulator />
```

**En iframe depuis `sinvestir.fr`** (aperçu intégré) :
```html
<iframe src="https://sinvestir-crypto-simulator.vercel.app/embed" style="width:100%;border:0;height:900px" loading="lazy"></iframe>
```

**Authentification & persistance par utilisateur** : volontairement **non implémentées** (cf. consignes : « inutile de réaliser réellement ces intégrations »). Le simulateur fonctionne sans compte — comme l'outil Fritzy d'origine — et reste **agnostique** : pour le brancher à votre suite, « Enregistrer / Partager » s'adosseraient à **votre Supabase Cloud + session existants** (table `simulations` liée à l'utilisateur, RLS), sans rien changer au cœur de calcul. La sidebar de la démo est une réplique visuelle de votre app-shell ; ses liens pointent vers `simulateurs.sinvestir.fr`.

---

## Limites (démo assumée)

- Sélection limitée au **top 100** des cryptos (hors stablecoins) ; certains actifs de longue traîne sans paire Yahoo `-EUR` renvoient un message clair plutôt qu'un plantage.
- Partage par **URL** + sauvegarde **localStorage** (la suite réelle persiste via Supabase + comptes — hors périmètre de ce test).
- La sidebar (profil, navigation) est une **réplique visuelle** de l'app-shell S'investir, non fonctionnelle (le simulateur est l'élément livrable, conçu pour s'insérer dans leur shell réel).
- Les benchmarks (Livret A 3 %, inflation 2 %) utilisent des **taux fixes illustratifs**.
