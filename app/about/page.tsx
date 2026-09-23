import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'このサイトについて',
  description:
    '「名所図会 今昔」の目的、掲載内容、史料と現地情報の扱いについて紹介します。',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return (
    <main
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '64px 24px 104px',
        color: '#292722',
        lineHeight: 1.95,
      }}
    >
      <nav
        aria-label="パンくず"
        style={{
          display: 'flex',
          gap: '7px',
          marginBottom: '28px',
          color: '#817a70',
          fontSize: '0.84rem',
        }}
      >
        <Link
          href="/"
          style={{
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          ホーム
        </Link>

        <span aria-hidden="true">›</span>
        <span>このサイトについて</span>
      </nav>

      <header
        style={{
          paddingBottom: '30px',
          marginBottom: '44px',
          borderBottom: '1px solid #d8d2c7',
        }}
      >
        <div
          style={{
            marginBottom: '8px',
            color: '#837b70',
            fontSize: '0.82rem',
            letterSpacing: '0.18em',
          }}
        >
          ABOUT
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily:
              '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 500,
            letterSpacing: '0.06em',
          }}
        >
          このサイトについて
        </h1>
      </header>

      <section
        style={{
          marginBottom: '52px',
        }}
      >
        <h2
          style={{
            fontSize: '1.4rem',
            letterSpacing: '0.05em',
          }}
        >
          名所図会を、現在の場所から読み直す
        </h2>

        <p>
          「名所図会 今昔」は、江戸時代を中心とする名所図会・地誌に記された場所を、
          原文と現在の風景の両方からたどるためのアーカイブです。
        </p>

        <p>
          史料に書かれた名所が現在のどこにあたるのかを確かめ、
          現地写真や関連史料を加えながら、
          残ったもの・変わったもの・失われたものを記録していきます。
        </p>
      </section>

      <section
        style={{
          marginBottom: '52px',
        }}
      >
        <h2
          style={{
            fontSize: '1.4rem',
            letterSpacing: '0.05em',
          }}
        >
          掲載する内容
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            ['原文', '名所図会・地誌の本文を、項目構造をできるだけ保ちながら掲載します。'],
            ['現代語訳', '必要に応じて、原文を読むための補助となる現代語訳を掲載します。'],
            ['現在の姿', '現在の名称・所在地・現地写真・地図をまとめます。'],
            ['関連史料', '同じ場所を記した別の地誌や史料をあわせて掲載します。'],
            ['今昔比較', '史料どうし、また史料と現地の状況を比較して整理します。'],
          ].map(([title, text]) => (
            <article
              key={title}
              style={{
                padding: '22px',
                border: '1px solid #ddd7cd',
                borderRadius: '8px',
                background: '#fffdf9',
              }}
            >
              <h3
                style={{
                  margin: '0 0 9px',
                  fontSize: '1.05rem',
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: '#686159',
                  fontSize: '0.9rem',
                }}
              >
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          marginBottom: '52px',
        }}
      >
        <h2
          style={{
            fontSize: '1.4rem',
            letterSpacing: '0.05em',
          }}
        >
          対象資料
        </h2>

        <p>
          まず『江戸名所図会』から公開を進め、
          その後は地域や時代の異なる名所図会・地誌へ対象を広げていきます。
        </p>
      </section>

      <div
        style={{
          paddingTop: '28px',
          borderTop: '1px solid #d8d2c7',
        }}
      >
        <Link
          href="/meisho"
          style={{
            color: '#56615c',
            textUnderlineOffset: '3px',
          }}
        >
          名所一覧を見る →
        </Link>
      </div>
    </main>
  )
}
