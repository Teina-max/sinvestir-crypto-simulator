import type { Metadata } from "next";
import { CryptoSimulator } from "@/components/simulator/crypto-simulator";

export const metadata: Metadata = {
  title: "Simulateur Crypto — S'investir (intégration)",
  robots: { index: false },
};

/**
 * Version nue du simulateur, destinée à être embarquée en iframe depuis
 * sinvestir.fr (cf. en-têtes frame-ancestors dans next.config). Pas de header
 * ni footer : juste l'outil, autonome.
 */
export default function EmbedPage() {
  return (
    <main className="min-h-screen p-3 sm:p-5">
      <CryptoSimulator embedded />
    </main>
  );
}
