import type { Metadata } from 'next'
import Link from 'next/link'
import { meisho7293 } from '../../../src/data/meisho/7293'
import JsonLd from '../../../src/components/JsonLd'
import { absoluteUrl } from '../../../src/lib/site'

const source = meisho7293.sourceEntry!

export const metadata: Metadata = {
  title: source.heading,
  description: `『江戸名所図会』「${source.heading}」。${meisho7293.description}`,
  alternates: {
    canonical: '/meisho/7293',
  },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    url: '/meisho/7293',
    siteName: '名所図会 今昔',
    title: source.heading,
    description: meisho7293.description,
    images: meisho7293.photos[0]
      ? [
          {
            url: meisho7293.photos[0].url,
            alt:
              meisho7293.photos[0].alt ||
              meisho7293.photos[0].caption ||
              source.heading,
          },
        ]
      : undefined,
  },
}

export default function SeidoKishimojinPage() {
  const mapQuery =
    meisho7293.address ||
    meisho7293.currentName

  const googleMapsSearchUrl =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`

  const googleMapsEmbedUrl =
    `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`

  const pageJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: source.heading,
      description: meisho7293.description,
      url: absoluteUrl('/meisho/7293'),
      mainEntityOfPage: absoluteUrl('/meisho/7293'),
      inLanguage: 'ja',
      isPartOf: {
        '@type': 'CreativeWork',
        name: '江戸名所図会',
      },
      about: {
        '@type': 'Place',
        name: meisho7293.currentName,
        address: meisho7293.address,
      },
      image: meisho7293.photos.map(
        (photo) => photo.url
      ),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'ホーム',
          item: absoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '雑司ヶ谷',
          item: absoluteUrl('/regions/zoshigaya'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: source.heading,
          item: absoluteUrl('/meisho/7293'),
        },
      ],
    },
  ]

  return (
    <main
      className="meisho-article"
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '40px 24px 96px',
        lineHeight: 1.95,
        color: '#292722',
      }}
    >
      <JsonLd data={pageJsonLd} />

      <nav
        aria-label="パンくず"
        className="archive-breadcrumb"
      >
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">›</span>
        <Link href="/regions/zoshigaya">
          雑司ヶ谷
        </Link>
        <span aria-hidden="true">›</span>
        <span>{source.heading}</span>
      </nav>

      <header
        style={{
          paddingBottom: '32px',
          marginBottom: '48px',
          borderBottom: '1px solid #d8d2c7',
        }}
      >
        <div
          style={{
            marginBottom: '14px',
            color: '#777',
            fontSize: '0.9rem',
          }}
        >
          江戸名所図会 ／ 巻之四 ／ 第{source.entryOrder}項
        </div>

        <div style={{ marginBottom: '14px' }}>
          <Link
            href="/regions/zoshigaya"
            style={{
              display: 'inline-block',
              padding: '5px 10px',
              border: '1px solid #d3ccc0',
              borderRadius: '999px',
              background: '#faf8f3',
              color: '#6c645a',
              fontSize: '0.76rem',
              textDecoration: 'none',
            }}
          >
            地域：雑司ヶ谷
          </Link>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: '2.5rem',
            lineHeight: 1.35,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          {source.heading}
        </h1>

        {source.reading && (
          <div
            style={{
              marginTop: '8px',
              color: '#888',
              fontSize: '0.95rem',
            }}
          >
            {source.reading}
          </div>
        )}
      </header>

      <nav
        aria-label="ページ内目次"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '48px',
          padding: '16px 18px',
          border: '1px solid #ddd7cd',
          borderRadius: '8px',
          background: '#faf8f3',
        }}
      >
        <a href="#original">原文</a>
        <span>／</span>
        <a href="#translation">現代語訳</a>
        <span>／</span>
        <a href="#current">現在の姿</a>
        <span>／</span>
        <a href="#comparison">名所図会との比較</a>
      </nav>

      <section id="original" style={{ marginBottom: '56px' }}>
        <h2>原文</h2>
        <div
          className="historical-text-frame"
          style={{
            border: '1px solid #9c927f',
            padding: '5px',
            background: '#f8f5ed',
          }}
        >
          <div
            className="historical-text-body"
            style={{
              border: '1px solid #c8bda9',
              padding: '34px 38px',
              background: '#fbf8f0',
              fontFamily:
                '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
              fontSize: '1.02rem',
              lineHeight: 2.05,
              whiteSpace: 'pre-wrap',
            }}
          >
            {source.rawText}
          </div>
        </div>
      </section>

      <section id="translation" style={{ marginBottom: '56px' }}>
        <h2>現代語訳</h2>
        {meisho7293.translation?.map(
          (item, index) => (
            <div
              key={`${item.title ?? 'translation'}-${index}`}
              style={{
                whiteSpace: 'pre-wrap',
                marginBottom: '22px',
              }}
            >
              {item.text}
            </div>
          )
        )}
      </section>

      <section id="current" style={{ marginBottom: '56px' }}>
        <h2>現在の姿</h2>
        <h3>{meisho7293.currentName}</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {meisho7293.description}
        </p>
        <p>
          <strong>所在地：</strong>
          {meisho7293.address}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '22px',
            marginTop: '30px',
          }}
        >
          {meisho7293.photos.map((photo) => (
            <figure key={photo.url} style={{ margin: 0 }}>
              <img
                src={photo.url}
                alt={
                  photo.alt ||
                  photo.caption ||
                  meisho7293.currentName
                }
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                }}
              />
              {photo.caption && (
                <figcaption
                  style={{
                    marginTop: '8px',
                    color: '#6e675f',
                    fontSize: '0.88rem',
                  }}
                >
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <div style={{ marginTop: '30px' }}>
          <p>
            <a
              href={googleMapsSearchUrl}
              target="_blank"
              rel="noreferrer"
            >
              Google マップで開く
            </a>
          </p>
          <iframe
            title={`${meisho7293.currentName}の地図`}
            src={googleMapsEmbedUrl}
            loading="lazy"
            style={{
              width: '100%',
              height: '360px',
              border: 0,
            }}
          />
        </div>
      </section>

      <section id="comparison" style={{ marginBottom: '56px' }}>
        <h2>名所図会との比較</h2>
        {meisho7293.comparison?.map(
          (item, index) => (
            <article
              key={`${item.title}-${index}`}
              style={{
                padding: '22px 0',
                borderBottom: '1px solid #e3ddd3',
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                {item.title}
              </h3>
              <p>{item.text}</p>
              {(item.source || item.url) && (
                <div
                  style={{
                    color: '#746d64',
                    fontSize: '0.84rem',
                  }}
                >
                  {item.source && (
                    <span>出典：{item.source}</span>
                  )}
                  {item.url && (
                    <>
                      {' '}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        参照先
                      </a>
                    </>
                  )}
                </div>
              )}
            </article>
          )
        )}
      </section>

      <div
        style={{
          marginTop: '64px',
          paddingTop: '28px',
          borderTop: '1px solid #d8d2c7',
        }}
      >
        <Link href="/regions/zoshigaya">
          ← 雑司ヶ谷の名所一覧へ戻る
        </Link>
      </div>
    </main>
  )
}
