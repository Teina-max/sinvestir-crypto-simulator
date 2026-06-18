import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // La route d'intégration peut être embarquée en iframe depuis les
        // domaines S'investir (et seulement eux). Les autres pages restent
        // protégées par le défaut du navigateur.
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://*.sinvestir.fr https://sinvestir.fr;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
