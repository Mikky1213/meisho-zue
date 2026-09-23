import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import JsonLd from "../src/components/JsonLd";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "../src/lib/site";
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

const googleVerification =
  process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  applicationName: SITE_NAME,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },

  robots: {
    index: true,
    follow: true,
  },

  verification: googleVerification
    ? {
        google:
          googleVerification,
      }
    : undefined,
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  const websiteJsonLd = {
    "@context":
      "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      SITE_DESCRIPTION,
    inLanguage: "ja",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type":
          "EntryPoint",
        urlTemplate:
          `${absoluteUrl("/meisho")}?q={search_term_string}`,
      },
      "query-input":
        "required name=search_term_string",
    },
  };

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
        <JsonLd
          data={websiteJsonLd}
        />

        <a
          href="#main-content"
          className="skip-link"
        >
          本文へ移動
        </a>

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

        <div
          id="main-content"
          className="site-content"
          tabIndex={-1}
        >
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
