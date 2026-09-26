import type { Metadata } from 'next'
import Link from 'next/link'
import { meisho7294 } from '../../../src/data/meisho/7294'
import MediaGallery from '../../../src/components/MediaGallery'
import JsonLd from '../../../src/components/JsonLd'
import { absoluteUrl } from '../../../src/lib/site'

const source = meisho7294.sourceEntry!
const workTitle = '江戸名所図会'
const volumeLabel = '巻之四'

export const metadata: Metadata = {
  title: source.heading,
  description: `『江戸名所図会』「${source.heading}」。${meisho7294.description}`,
  alternates: { canonical: '/meisho/7294' },
  openGraph: {
    type: 'article',
    locale: 'ja_JP',
    url: '/meisho/7294',
    siteName: '名所図会 今昔',
    title: source.heading,
    description: meisho7294.description,
    images: meisho7294.photos[0]
      ? [{
          url: meisho7294.photos[0].url,
          alt: meisho7294.photos[0].alt || meisho7294.photos[0].caption || source.heading,
        }]
      : undefined,
  },
}

export default function SeiryuinPage() {
  const mapQuery = meisho7294.address || meisho7294.currentName
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`

  const galleryItems = meisho7294.photos.map((photo) => ({
    url: photo.url,
    alt: photo.alt || photo.caption || meisho7294.currentName,
    caption: photo.caption,
    meta: [
      photo.takenAt ? `撮影日：${photo.takenAt}` : '',
      photo.direction ? `撮影方向：${photo.direction}` : '',
      photo.credit ? `撮影・提供：${photo.credit}` : '',
    ].filter(Boolean),
    sourceUrl: photo.sourceUrl,
  }))

  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: source.heading,
    description: meisho7294.description,
    url: absoluteUrl('/meisho/7294'),
    inLanguage: 'ja',
    isPartOf: { '@type': 'CreativeWork', name: workTitle },
    about: {
      '@type': 'Place',
      name: meisho7294.currentName,
      address: meisho7294.address,
    },
    image: meisho7294.photos.map((photo) => photo.url),
  }]

  const sectionTitle = (title: string, lineColor: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.08em' }}>
        {title}
      </h2>
      <div style={{ flex: 1, height: '1px', background: lineColor }} />
    </div>
  )

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
      <JsonLd data={jsonLd} />

      <nav aria-label="パンくず" className="archive-breadcrumb">
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">›</span>
        <Link href="/works">作品一覧</Link>
        <span aria-hidden="true">›</span>
        <Link href={`/works/${source.workId}`}>{workTitle}</Link>
        <span aria-hidden="true">›</span>
        <Link href={`/works/${source.workId}/volumes/${source.volumeId}`}>{volumeLabel}</Link>
        <span aria-hidden="true">›</span>
        <span>{source.heading}</span>
      </nav>

      <header style={{ paddingBottom: '32px', marginBottom: '48px', borderBottom: '1px solid #d8d2c7' }}>
        <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#777' }}>
          {workTitle} ／ {volumeLabel}
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
        <h1 style={{ margin: 0, fontSize: '2.5rem', lineHeight: 1.35, fontWeight: 600, letterSpacing: '0.05em' }}>
          {source.heading}
        </h1>
        {source.reading && (
          <div style={{ marginTop: '8px', color: '#888', fontSize: '0.95rem' }}>
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
          fontSize: '0.88rem',
        }}
      >
        <a href="#original">原文</a><span>／</span>
        <a href="#translation">現代語訳</a><span>／</span>
        <a href="#current">現在の姿</a><span>／</span>
        <a href="#documents">関連文献</a><span>／</span>
        <a href="#comparison">名所図会との比較</a>
      </nav>

      <section id="original">
        {sectionTitle('原文', '#cfc7b9')}
        <div className="historical-text-frame" style={{ border: '1px solid #9c927f', padding: '5px', background: '#f8f5ed' }}>
          <div
            className="historical-text-body"
            style={{
              border: '1px solid #c8bda9',
              padding: '34px 38px',
              background: '#fbf8f0',
              fontFamily: '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
              fontSize: '1.02rem',
              lineHeight: 2.05,
              whiteSpace: 'pre-wrap',
            }}
          >
            {source.rawText}
          </div>
        </div>
      </section>

      <section id="translation" style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid #d6d0df' }}>
        {sectionTitle('現代語訳', '#d6d0df')}
        <div style={{ padding: '32px 36px', border: '1px solid #d6d0df', borderRadius: '10px', background: '#f7f5fa' }}>
          {meisho7294.translation?.map((item, index) => (
            <article key={index}>
              {item.title && <h3 style={{ margin: '0 0 12px', fontSize: '1.12rem' }}>{item.title}</h3>}
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 2 }}>{item.text}</div>
            </article>
          ))}
        </div>
      </section>

      <section id="current" style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid #c8d4d0' }}>
        {sectionTitle('現在の姿', '#c8d4d0')}
        <div style={{ padding: '32px', border: '1px solid #b8cbc5', borderRadius: '10px', background: '#f1f7f5' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1.3rem' }}>{meisho7294.currentName}</h3>
          <div style={{ marginBottom: '18px', color: '#596964', fontSize: '0.93rem' }}>
            <strong style={{ marginRight: '10px' }}>所在地</strong>
            <a href={googleMapsSearchUrl} target="_blank" rel="noreferrer">{meisho7294.address}</a>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 2 }}>{meisho7294.description}</div>
        </div>

        <div style={{ marginTop: '28px' }}>
          <iframe
            title={`${meisho7294.currentName} 地図`}
            src={googleMapsEmbedUrl}
            width="100%"
            height="360"
            style={{ border: 0, borderRadius: '10px' }}
            loading="lazy"
          />
        </div>

        {galleryItems.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <MediaGallery items={galleryItems} />
          </div>
        )}
      </section>

      <section id="documents" style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid #ded8ce' }}>
        {sectionTitle('関連文献・資料', '#ded8ce')}
        {meisho7294.documents?.map((doc, index) => (
          <article
            key={index}
            style={{
              padding: '28px 30px',
              marginTop: index === 0 ? 0 : '20px',
              border: '1px solid #ddd7cd',
              borderRadius: '10px',
              background: '#fffdf9',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '1.12rem' }}>{doc.title}</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 2 }}>{doc.text}</div>
            {doc.source && <div style={{ marginTop: '16px', color: '#81796e', fontSize: '0.82rem' }}>出典：{doc.source}</div>}
          </article>
        ))}
      </section>

      <section id="comparison" style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid #d7d1c7' }}>
        {sectionTitle('名所図会との比較', '#d7d1c7')}
        <div style={{ display: 'grid', gap: '18px' }}>
          {meisho7294.comparison?.map((item, index) => (
            <article key={index} style={{ padding: '26px 28px', border: '1px solid #ddd7cd', borderRadius: '10px', background: '#fff' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '1.12rem' }}>{item.title}</h3>
              <div style={{ lineHeight: 2 }}>{item.text}</div>
              {item.source && (
                <div style={{ marginTop: '14px', color: '#81796e', fontSize: '0.82rem' }}>
                  出典：{item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.source}</a> : item.source}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
