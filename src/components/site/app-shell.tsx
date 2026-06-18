import {
  BookMarked,
  ChevronLeft,
  GitCompareArrows,
  Gift,
  LayoutGrid,
  LineChart,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "./brand-logo";

const APP = "https://simulateurs.sinvestir.fr";
const SITE = "https://sinvestir.fr";

const NAV = [
  { icon: LayoutGrid, label: "Tableau de bord", href: APP, active: false },
  { icon: LineChart, label: "Les simulateurs", href: APP, active: true },
  { icon: GitCompareArrows, label: "Les comparateurs", href: APP, active: false },
  { icon: BookMarked, label: "Mes simulations", href: APP, active: false },
  { icon: Gift, label: "Formation offerte", href: SITE, active: false },
];

/** Réplique de l'app-shell de la suite S'investir : sidebar + zone de contenu. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1480px] gap-6 px-3 py-4 sm:px-5 sm:py-5">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <DesktopHeader />
        <main className="flex-1 pt-2 lg:pt-6">{children}</main>
        <ShellFooter />
      </div>
    </div>
  );
}

function MobileHeader() {
  return (
    <header className="mb-4 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 lg:hidden">
      <BrandLogo />
      <a
        href={APP}
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-[#0049c6] px-3 py-1.5 text-xs font-medium text-white"
      >
        Créer un compte
      </a>
    </header>
  );
}

function DesktopHeader() {
  return (
    <header className="hidden items-center justify-between border-b border-white/[0.06] pb-5 lg:flex">
      <BrandLogo />
      <a
        href="https://sinvestir.fr"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Découvrir S&apos;investir
      </a>
    </header>
  );
}

function ShellFooter() {
  return (
    <footer className="mt-10 border-t border-white/[0.06] pt-5 text-xs text-muted-foreground">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <span>© 2026 S&apos;investir — Simulateur crypto (démo). Données de marché : CoinGecko &amp; Yahoo Finance.</span>
        <div className="flex items-center gap-4">
          <a href="https://sinvestir.fr" className="hover:text-foreground">
            Mentions légales
          </a>
          <a href="https://sinvestir.fr" className="hover:text-foreground">
            Confidentialité
          </a>
        </div>
      </div>
    </footer>
  );
}

function Sidebar() {
  return (
    <aside className="relative hidden w-[280px] shrink-0 lg:block">
      <div className="sticky top-5 flex h-[calc(100vh-2.5rem)] flex-col rounded-3xl border border-white/[0.07] bg-white/[0.02] p-4 backdrop-blur-sm">
        {/* profil */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
          <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-[#0049c6] to-[#04265f] text-sm font-semibold text-white">
            SI
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              Espace démo
            </p>
            <p className="truncate text-xs text-muted-foreground">
              demo@sinvestir.fr
            </p>
          </div>
        </div>

        {/* navigation */}
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map(({ icon: Icon, label, href, active }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-current={active ? "page" : undefined}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors " +
                (active
                  ? "bg-white/[0.06] font-medium text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground")
              }
            >
              <Icon className="size-[18px]" />
              {label}
            </a>
          ))}
        </nav>

        {/* bas de sidebar */}
        <div className="mt-auto flex flex-col gap-1 pt-4">
          <a
            href={APP}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.03] hover:text-foreground"
          >
            <Settings className="size-[18px]" /> Gérer mon compte
          </a>
          <a
            href={SITE}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.03] hover:text-foreground"
          >
            <Sparkles className="size-[18px]" /> Faire une suggestion
          </a>
          <a
            href={APP}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#0049c6] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0049c6]/90"
          >
            <LogOut className="size-4" /> Déconnexion
          </a>
        </div>

        {/* poignée de repli décorative */}
        <span className="absolute -right-3 top-24 grid size-6 place-items-center rounded-full border border-white/10 bg-[#0a1020] text-muted-foreground">
          <ChevronLeft className="size-3.5" />
        </span>
      </div>
    </aside>
  );
}
