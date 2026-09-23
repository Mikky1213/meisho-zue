import type { Metadata } from 'next'
import Link from 'next/link'
import { regions } from '../../src/data/regions'

export const metadata: Metadata = {
  title: '地域一覧',
  description:
    '「名所図会 今昔」で公開・整備している地域を一覧します。',
  alternates: {
    canonical: '/regions',
  },
}

export default function RegionsPage() {
  return (
    <main className="archive-page">
      <nav
        aria-label="パンくず"
        className="archive-breadcrumb"
      >
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">›</span>
        <span>地域一覧</span>
      </nav>

      <header
        style={{
          paddingBottom: '30px',
          marginBottom: '38px',
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
          REGIONS
        </div>

        <h1 className="archive-page-title">
          地域からたどる
        </h1>

        <p
          style={{
            maxWidth: '720px',
            margin: '16px 0 0',
            color: '#686159',
            lineHeight: 1.9,
          }}
        >
          名所図会に記された名所を、
          現在の地域ごとにまとめてたどります。
        </p>
      </header>

      <div className="archive-card-grid">
        {regions.map((region) => (
          <Link
            key={region.slug}
            href={`/regions/${region.slug}`}
            className="archive-card"
          >
            <div
              style={{
                marginBottom: '7px',
                color: '#9a9184',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
              }}
            >
              REGION
            </div>

            <h2
              style={{
                margin: 0,
                fontFamily:
                  '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
                fontSize: '1.55rem',
                lineHeight: 1.45,
              }}
            >
              {region.title}
            </h2>

            {region.reading && (
              <div
                style={{
                  marginTop: '4px',
                  color: '#90887d',
                  fontSize: '0.8rem',
                }}
              >
                {region.reading}
              </div>
            )}

            {region.subtitle && (
              <div
                style={{
                  marginTop: '16px',
                  color: '#655f57',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                }}
              >
                {region.subtitle}
              </div>
            )}

            <p
              style={{
                margin: '12px 0 0',
                color: '#756e64',
                fontSize: '0.86rem',
                lineHeight: 1.8,
              }}
            >
              {region.description}
            </p>

            <div
              style={{
                marginTop: '22px',
                paddingTop: '14px',
                borderTop: '1px solid #eee9e1',
                color: '#59645f',
                fontSize: '0.84rem',
                fontWeight: 600,
              }}
            >
              登録名所 {region.entryIds.length}件 →
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
