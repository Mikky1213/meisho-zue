import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./site.css";

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
        <header className="site-header">
          <div className="site-header-inner">
            <Link
              href="/"
              className="site-brand"
            >
              <div className="site-brand-title">
                名所図会 今昔
              </div>

              <div className="site-brand-subtitle">
                MEISHO ZUE ARCHIVE
              </div>
            </Link>

            <nav
              aria-label="メインナビゲーション"
              className="site-nav"
            >
              <Link href="/">
                ホーム
              </Link>

              <Link href="/works">
                作品一覧
              </Link>

              <Link href="/regions">
                地域
              </Link>

              <Link href="/meisho">
                名所一覧
              </Link>

              <Link href="/about">
                このサイトについて
              </Link>
            </nav>
          </div>
        </header>

        <div className="site-content">
          {children}
        </div>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <div>
              <div className="site-footer-title">
                名所図会 今昔
              </div>

              <div className="site-footer-copy">
                名所図会の原文と現在の風景をたどるアーカイブ
              </div>
            </div>

            <nav
              aria-label="フッターナビゲーション"
              className="site-footer-nav"
            >
              <Link href="/">
                ホーム
              </Link>

              <Link href="/works">
                作品一覧
              </Link>

              <Link href="/regions">
                地域
              </Link>

              <Link href="/meisho">
                名所一覧
              </Link>

              <Link href="/about">
                このサイトについて
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
