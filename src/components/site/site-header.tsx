import { Button } from "@/components/ui/button";
import { BrandLogo } from "./brand-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-[54px] w-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <a href="https://sinvestir.fr" className="shrink-0" aria-label="Accueil S'investir">
          <BrandLogo />
        </a>
        <nav className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
            <a href="https://simulateurs.sinvestir.fr">Se connecter</a>
          </Button>
          <Button size="sm" asChild>
            <a href="https://simulateurs.sinvestir.fr">Créer un compte</a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
