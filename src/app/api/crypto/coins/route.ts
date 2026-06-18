import { NextResponse } from "next/server";
import { fetchCoins } from "@/lib/market-data";

// Liste des cryptos sélectionnables (top 250 par capitalisation).
export async function GET() {
  try {
    const coins = await fetchCoins();
    return NextResponse.json(
      { coins },
      { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } }
    );
  } catch (err) {
    console.error("[api/crypto/coins]", err);
    return NextResponse.json(
      { error: "Impossible de charger la liste des cryptomonnaies." },
      { status: 502 }
    );
  }
}
