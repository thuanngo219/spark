import type { MetadataRoute } from "next";

// WebKit supports dark launch colors; Next's manifest type does not yet list them.
type SparkManifest = MetadataRoute.Manifest & {
  color_scheme_dark: { background_color: string; theme_color: string };
};

export default function manifest(): SparkManifest {
  return {
    name: "Spark — Make todo easy & fun",
    short_name: "Spark",
    description: "Việc nhỏ, ngày sáng rõ.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F7F8FA",
    theme_color: "#F7F8FA",
    color_scheme_dark: { background_color: "#121622", theme_color: "#121622" },
    lang: "vi",
    icons: [
      { src: "/icons/spark-pwa-v2-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/spark-pwa-v2-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/spark-maskable-v2-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
