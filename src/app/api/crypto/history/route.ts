import { NextRequest, NextResponse } from "next/server";
import { fetchHistory } from "@/lib/market-data";

// Historique de prix journalier (EUR) d'une crypto, par ticker (ex. ?symbol=BTC).
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  // Borne l'entrée à un ticker plausible (anti-bruit / anti-abus du proxy).
  if (!symbol || !/^[A-Za-z0-9]{1,12}$/.test(symbol)) {
    return NextResponse.json({ error: "Ticker invalide." }, { status: 400 });
  }
  try {
    const prices = await fetchHistory(symbol);
    return NextResponse.json(
      { prices },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch (err) {
    console.error("[api/crypto/history]", err);
    return NextResponse.json(
      {
        error:
          "Historique indisponible pour cette cryptomonnaie en démo. Essayez un actif majeur (BTC, ETH, SOL…).",
      },
      { status: 502 }
    );
  }
}
