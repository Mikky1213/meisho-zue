import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://meisho-zue.vercel.app"),

  title: {
    default: "名所図会 今昔",
    template: "%s | 名所図会 今昔",
  },

  description:
    "江戸時代の名所図会に記された土地を、原文・現代の姿・関連史料・現地写真からたどるアーカイブです。",

  applicationName: "名所図会 今昔",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: "名所図会 今昔",
    title: "名所図会 今昔",
    description:
      "江戸時代の名所図会に記された土地を、原文・現代の姿・関連史料・現地写真からたどるアーカイブです。",
  },

  twitter: {
    card: "summary_large_image",
    title: "名所図会 今昔",
    description:
      "江戸時代の名所図会に記された土地を、原文・現代の姿・関連史料・現地写真からたどるアーカイブです。",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          margin: 0,
          background: "#fff",
          color: "#292722",
        }}
      >
        <header
          style={{
            position: "relative",
            zIndex: 20,
            borderBottom: "1px solid #ddd7cd",
            background: "rgba(250,248,243,0.96)",
          }}
        >
          <div
            style={{
              maxWidth: "1080px",
              margin: "0 auto",
              padding: "15px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px 24px",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#292722",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  fontFamily:
                    '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                }}
              >
                名所図会 今昔
              </div>

              <div
                style={{
                  marginTop: "2px",
                  color: "#8b8275",
                  fontSize: "0.65rem",
                  letterSpacing: "0.14em",
                }}
              >
                MEISHO ZUE ARCHIVE
              </div>
            </Link>

            <nav
              aria-label="メインナビゲーション"
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px 22px",
              }}
            >
              <Link
                href="/"
                style={{
                  color: "#575149",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                ホーム
              </Link>

              <Link
                href="/meisho"
                style={{
                  color: "#575149",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                名所一覧
              </Link>

              <Link
                href="/about"
                style={{
                  color: "#575149",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                このサイトについて
              </Link>
            </nav>
          </div>
        </header>

        <div
          style={{
            flex: 1,
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
