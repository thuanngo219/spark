import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spark — Make todo easy & fun",
    short_name: "Spark",
    description: "Việc nhỏ, ngày sáng rõ.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F5F7FA",
    theme_color: "#111742",
    lang: "vi",
    icons: [
      { src: "/icons/spark-pwa-negative-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/spark-pwa-negative-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/spark-maskable-negative-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
