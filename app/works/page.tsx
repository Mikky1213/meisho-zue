import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '../../src/lib/supabase'
import { currentPlaces } from '../../src/data/currentPlaces'

export const metadata: Metadata = {
  title: '作品一覧',
  description:
    '「名所図会 今昔」で公開中の名所図会・地誌を作品ごとに一覧します。',
  alternates: {
    canonical: '/works',
  },
}

export default async function WorksPage() {
  const entryIds = Object.keys(currentPlaces)
    .map(Number)
    .filter(Number.isInteger)

  if (entryIds.length === 0) {
    return (
      <main className="archive-page">
        <h1 className="archive-page-title">
          作品一覧
        </h1>

        <p>公開中の作品はまだありません。</p>
      </main>
    )
  }

  const {
    data: entries,
    error: entriesError,
  } = await supabase
    .from('entries')
    .select(`
      id,
      work_id,
      volume_id
    `)
    .in('id', entryIds)

  if (entriesError || !entries) {
    return (
      <main className="archive-page">
        <h1>作品一覧取得エラー</h1>
        <pre>{entriesError?.message}</pre>
      </main>
    )
  }

  const workIds = [
    ...new Set(
      entries.map((entry) => entry.work_id)
    ),
  ]

  const {
    data: works,
    error: worksError,
  } = await supabase
    .from('works')
    .select(`
      id,
      title,
      title_kana,
      author,
      editor,
      illustrator,
      published_year,
      region
    `)
    .in('id', workIds)

  if (worksError || !works) {
    return (
      <main className="archive-page">
        <h1>作品情報取得エラー</h1>
        <pre>{worksError?.message}</pre>
      </main>
    )
  }

  const counts = new Map<number, number>()

  for (const entry of entries) {
    counts.set(
      entry.work_id,
      (counts.get(entry.work_id) ?? 0) + 1
    )
  }

  const sortedWorks = [...works].sort(
    (a, b) => a.id - b.id
  )

  return (
    <main className="archive-page">
      <nav
        aria-label="パンくず"
        className="archive-breadcrumb"
      >
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">›</span>
        <span>作品一覧</span>
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
          WORKS
        </div>

        <h1 className="archive-page-title">
          作品一覧
        </h1>

        <p
          style={{
            maxWidth: '720px',
            margin: '16px 0 0',
            color: '#686159',
            lineHeight: 1.9,
          }}
        >
          公開中の名所を、典拠となる名所図会・地誌ごとにたどります。
        </p>
      </header>

      <div className="archive-card-grid">
        {sortedWorks.map((work) => (
          <Link
            key={work.id}
            href={`/works/${work.id}`}
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
              WORK {work.id}
            </div>

            <h2
              style={{
                margin: 0,
                fontFamily:
                  '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
                fontSize: '1.45rem',
                lineHeight: 1.5,
              }}
            >
              {work.title}
            </h2>

            {work.title_kana && (
              <div
                style={{
                  marginTop: '4px',
                  color: '#90887d',
                  fontSize: '0.8rem',
                }}
              >
                {work.title_kana}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gap: '4px',
                marginTop: '18px',
                color: '#6f685f',
                fontSize: '0.84rem',
              }}
            >
              {work.author && (
                <div>著：{work.author}</div>
              )}

              {work.editor && (
                <div>編：{work.editor}</div>
              )}

              {work.illustrator && (
                <div>画：{work.illustrator}</div>
              )}

              {work.published_year && (
                <div>{work.published_year}</div>
              )}

              {work.region && (
                <div>地域：{work.region}</div>
              )}
            </div>

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
              公開名所 {counts.get(work.id) ?? 0}件 →
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
