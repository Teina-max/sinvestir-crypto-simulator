import { CryptoSimulator } from "@/components/simulator/crypto-simulator";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="relative flex-1">
        {/* halo lumineux signature de la suite S'investir */}
        <div
          aria-hidden
          className="brand-glow pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[520px] max-w-[900px]"
        />

        <section className="mx-auto w-full max-w-[1280px] px-4 pt-14 pb-6 text-center sm:px-6 sm:pt-20">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
            Simulateur · Cryptomonnaies
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Et si vous aviez investi&nbsp;?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Mesurez la performance qu&apos;aurait eue un investissement en
            cryptomonnaie — en une fois ou de façon programmée (DCA) — sur des
            données de marché historiques réelles.
          </p>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-4 pb-20 sm:px-6">
          <CryptoSimulator />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
