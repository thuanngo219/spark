import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://spark.thuanngo.com"),
  title: "Spark — Make todo easy & fun",
  description: "Ứng dụng task và note cá nhân nhanh, gọn và yên tĩnh.",
  applicationName: "Spark",
  icons: {
    icon: [
      { url: "/spark-mark.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/icons/spark-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/spark-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/spark-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/icons/spark-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/spark-apple-180.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Spark",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Spark — Make todo easy & fun",
    description: "Biết hôm nay cần làm gì. Ghi lại điều đáng nhớ.",
    url: "https://spark.thuanngo.com",
    siteName: "Spark",
    locale: "vi_VN",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111742",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
