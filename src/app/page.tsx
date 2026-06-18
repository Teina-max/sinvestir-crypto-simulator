import { CryptoSimulator } from "@/components/simulator/crypto-simulator";
import { AppShell } from "@/components/site/app-shell";

export default function Home() {
  return (
    <div className="relative">
      {/* halo lumineux bleu signature de la suite S'investir */}
      <div
        aria-hidden
        className="brand-glow pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[480px] max-w-[1000px]"
      />
      <AppShell>
        <CryptoSimulator />
      </AppShell>
    </div>
  );
}
