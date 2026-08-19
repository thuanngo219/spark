import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://spark.thuanngo.com"),
  title: "Spark — Việc nhỏ, ngày sáng rõ",
  description: "Ứng dụng task và note cá nhân nhanh, gọn và yên tĩnh.",
  applicationName: "Spark",
  icons: {
    icon: [
      { url: "/icons/spark-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/spark-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/spark-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Spark",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Spark — Việc nhỏ, ngày sáng rõ",
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
  themeColor: "#11184B",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
