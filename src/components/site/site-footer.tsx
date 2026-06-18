export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/5">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Les performances passées ne préjugent pas des performances futures. Les
          crypto-actifs comportent un risque de perte en capital partielle ou
          totale. Cette simulation est fournie à titre informatif et pédagogique,
          sur la base de données de marché historiques, et ne constitue pas un
          conseil en investissement.
        </p>
        <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© 2026 S&apos;investir — Simulateur crypto (démo)</span>
          <div className="flex items-center gap-4">
            <a href="https://sinvestir.fr" className="hover:text-foreground">
              Mentions légales
            </a>
            <a href="https://sinvestir.fr" className="hover:text-foreground">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
