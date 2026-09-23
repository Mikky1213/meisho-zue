import type { Metadata } from "next";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}