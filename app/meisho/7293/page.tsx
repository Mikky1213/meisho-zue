import type { Metadata } from 'next'
import Link from 'next/link'
import { meisho7293 } from '../../../src/data/meisho/7293'
import MediaGallery from '../../../src/components/MediaGallery'
import JsonLd from '../../../src/components/JsonLd'
import { absoluteUrl } from '../../../src/lib/site'

const source = meisho7293.sourceEntry!
const workTitle = '江戸名所図会'
const volumeLabel = '巻之四'

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
  twitter: {
    card:
      meisho7293.photos.length > 0
        ? 'summary_large_image'
        : 'summary',
    title: source.heading,
    description: meisho7293.description,
    images:
      meisho7293.photos[0]
        ? [meisho7293.photos[0].url]
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

  const currentGalleryItems =
    meisho7293.photos.map((photo) => ({
      url: photo.url,
      alt:
        photo.alt ||
        photo.caption ||
        meisho7293.currentName,
      caption: photo.caption,
      meta: [
        photo.takenAt
          ? `撮影日：${photo.takenAt}`
          : '',
        photo.direction
          ? `撮影方向：${photo.direction}`
          : '',
        photo.credit
          ? `撮影・提供：${photo.credit}`
          : '',
      ].filter(Boolean),
      sourceUrl: photo.sourceUrl,
    }))

  const pageJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: source.heading,
      description: meisho7293.description,
      url: absoluteUrl('/meisho/7293'),
      mainEntityOfPage:
        absoluteUrl('/meisho/7293'),
      inLanguage: 'ja',
      isPartOf: {
        '@type': 'CreativeWork',
        name: workTitle,
      },
      about: {
        '@type': 'Place',
        name: meisho7293.currentName,
        address: meisho7293.address,
      },
      image:
        meisho7293.photos.length > 0
          ? meisho7293.photos.map(
              (photo) => photo.url
            )
          : undefined,
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
          name: '作品一覧',
          item: absoluteUrl('/works'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: workTitle,
          item: absoluteUrl(
            `/works/${source.workId}`
          ),
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: volumeLabel,
          item: absoluteUrl(
            `/works/${source.workId}/volumes/${source.volumeId}`
          ),
        },
        {
          '@type': 'ListItem',
          position: 5,
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
        <Link href="/works">作品一覧</Link>
        <span aria-hidden="true">›</span>
        <Link href={`/works/${source.workId}`}>
          {workTitle}
        </Link>
        <span aria-hidden="true">›</span>
        <Link
          href={`/works/${source.workId}/volumes/${source.volumeId}`}
        >
          {volumeLabel}
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
            marginBottom: '20px',
            fontSize: '0.9rem',
            color: '#777',
            letterSpacing: '0.04em',
          }}
        >
          <Link
            href={`/works/${source.workId}`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {workTitle}
          </Link>
          <span
            style={{
              margin: '0 10px',
              color: '#aaa',
            }}
          >
            ／
          </span>
          <Link
            href={`/works/${source.workId}/volumes/${source.volumeId}`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {volumeLabel}
          </Link>
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
              letterSpacing: '0.04em',
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
        <a
          href="#original"
          style={{
            color: '#575149',
            textDecoration: 'none',
            fontSize: '0.88rem',
          }}
        >
          原文
        </a>
        <span
          aria-hidden="true"
          style={{ color: '#b2aaa0' }}
        >
          ／
        </span>
        <a
          href="#translation"
          style={{
            color: '#575149',
            textDecoration: 'none',
            fontSize: '0.88rem',
          }}
        >
          現代語訳
        </a>
        <span
          aria-hidden="true"
          style={{ color: '#b2aaa0' }}
        >
          ／
        </span>
        <a
          href="#current"
          style={{
            color: '#575149',
            textDecoration: 'none',
            fontSize: '0.88rem',
          }}
        >
          現在の姿
        </a>
        <span
          aria-hidden="true"
          style={{ color: '#b2aaa0' }}
        >
          ／
        </span>
        <a
          href="#comparison"
          style={{
            color: '#575149',
            textDecoration: 'none',
            fontSize: '0.88rem',
          }}
        >
          名所図会との比較
        </a>
      </nav>

      <section id="original">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            原文
          </h2>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: '#cfc7b9',
            }}
          />
        </div>

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
                '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "Noto Serif JP", serif',
              fontSize: '1.02rem',
              lineHeight: 2.05,
              letterSpacing: '0.02em',
              whiteSpace: 'pre-wrap',
            }}
          >
            {source.rawText}
          </div>
        </div>
      </section>

      <section
        id="translation"
        style={{
          marginTop: '64px',
          paddingTop: '40px',
          borderTop: '1px solid #d6d0df',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '28px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            現代語訳
          </h2>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: '#d6d0df',
            }}
          />
        </div>

        <div
          style={{
            padding: '32px 36px',
            border: '1px solid #d6d0df',
            borderRadius: '10px',
            background: '#f7f5fa',
          }}
        >
          {meisho7293.translation?.map(
            (item, index) => (
              <article
                key={`${item.title ?? 'translation'}-${index}`}
                style={{
                  marginTop:
                    index === 0
                      ? 0
                      : '32px',
                }}
              >
                {item.title && (
                  <h3
                    style={{
                      margin: '0 0 12px',
                      fontSize: '1.12rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {item.title}
                  </h3>
                )}
                <div
                  style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 2,
                  }}
                >
                  {item.text}
                </div>
              </article>
            )
          )}
        </div>
      </section>

      <section
        id="current"
        style={{
          marginTop: '64px',
          paddingTop: '40px',
          borderTop: '1px solid #c8d4d0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '28px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            現在の姿
          </h2>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: '#c8d4d0',
            }}
          />
        </div>

        <div
          style={{
            padding: '32px',
            border: '1px solid #b8cbc5',
            borderRadius: '10px',
            background: '#f1f7f5',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px',
              fontSize: '1.3rem',
              lineHeight: 1.5,
            }}
          >
            {meisho7293.currentName}
          </h3>

          <div
            style={{
              marginBottom: '18px',
              color: '#596964',
              fontSize: '0.93rem',
            }}
          >
            <strong
              style={{ marginRight: '10px' }}
            >
              所在地
            </strong>
            <a
              href={googleMapsSearchUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#445b54',
                textUnderlineOffset: '3px',
              }}
            >
              {meisho7293.address}
            </a>
          </div>

          <p
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {meisho7293.description}
          </p>

          <div style={{ marginTop: '24px' }}>
            <iframe
              title={`${meisho7293.currentName}の地図`}
              src={googleMapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{
                display: 'block',
                width: '100%',
                height: '320px',
                border: 0,
                borderRadius: '8px',
                background: '#e7ece9',
              }}
            />
            <div
              style={{
                marginTop: '9px',
                textAlign: 'right',
                fontSize: '0.82rem',
              }}
            >
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#566761',
                  textUnderlineOffset: '3px',
                }}
              >
                Google マップで開く →
              </a>
            </div>
          </div>

          {currentGalleryItems.length > 0 && (
            <div
              style={{
                marginTop: '32px',
                paddingTop: '28px',
                borderTop: '1px solid #cbd8d4',
              }}
            >
              <h3
                style={{
                  margin: '0 0 20px',
                  fontSize: '1.15rem',
                }}
              >
                現地写真
              </h3>
              <MediaGallery
                items={currentGalleryItems}
              />
            </div>
          )}

          {meisho7293.documents &&
            meisho7293.documents.length > 0 && (
              <div
                style={{
                  marginTop: '32px',
                  paddingTop: '28px',
                  borderTop: '1px solid #cbd8d4',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 20px',
                    fontSize: '1.15rem',
                  }}
                >
                  関連文献・資料
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gap: '18px',
                  }}
                >
                  {meisho7293.documents.map(
                    (document, index) => (
                      <article
                        key={`${document.title}-${index}`}
                        style={{
                          padding: '22px 24px',
                          border: '1px solid #d5dedb',
                          borderRadius: '8px',
                          background: '#ffffff',
                        }}
                      >
                        <h4
                          style={{
                            margin: '0 0 12px',
                            fontSize: '1.05rem',
                          }}
                        >
                          {document.title}
                        </h4>
                        <div
                          style={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.9,
                          }}
                        >
                          {document.text}
                        </div>
                        {document.source && (
                          <div
                            style={{
                              marginTop: '14px',
                              paddingTop: '10px',
                              borderTop: '1px solid #eee',
                              color: '#777',
                              fontSize: '0.85rem',
                            }}
                          >
                            出典：{document.source}
                          </div>
                        )}
                      </article>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </section>

      <section
        id="comparison"
        style={{
          marginTop: '64px',
          paddingTop: '40px',
          borderTop: '1px solid #d8d2c7',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '28px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            名所図会との比較
          </h2>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: '#d8d2c7',
            }}
          />
        </div>

        <div
          style={{
            padding: '32px',
            border: '1px solid #d8d2c7',
            borderRadius: '10px',
            background: '#f7f4ee',
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: '20px',
            }}
          >
            {meisho7293.comparison?.map(
              (comparison, index) => (
                <article
                  key={`${comparison.title}-${index}`}
                  style={{
                    padding: '22px 24px',
                    border: '1px solid #ded8ce',
                    borderRadius: '8px',
                    background: '#fffdf8',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 12px',
                      fontSize: '1.1rem',
                    }}
                  >
                    {comparison.title}
                  </h3>
                  <div
                    style={{
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {comparison.text}
                  </div>
                  {comparison.source && (
                    <div
                      style={{
                        marginTop: '14px',
                        paddingTop: '10px',
                        borderTop: '1px solid #ece7dd',
                        color: '#777',
                        fontSize: '0.85rem',
                      }}
                    >
                      出典：{comparison.source}
                    </div>
                  )}
                  {comparison.url && (
                    <div style={{ marginTop: '10px' }}>
                      <a
                        href={comparison.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        資料を見る
                      </a>
                    </div>
                  )}
                </article>
              )
            )}
          </div>
        </div>
      </section>

      <nav
        aria-label="記事一覧へ戻る"
        style={{
          marginTop: '64px',
          paddingTop: '32px',
          borderTop: '1px solid #d8d2c7',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <Link
          href="/regions/zoshigaya"
          style={{
            color: '#65716d',
            textDecoration: 'none',
          }}
        >
          ← 雑司ヶ谷の名所一覧
        </Link>
        <Link
          href="/meisho"
          style={{
            color: '#65716d',
            textDecoration: 'none',
          }}
        >
          名所一覧へ →
        </Link>
      </nav>
    </main>
  )
}
