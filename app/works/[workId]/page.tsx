import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '../../../src/lib/supabase'
import { currentPlaces } from '../../../src/data/currentPlaces'
import JsonLd from '../../../src/components/JsonLd'
import { absoluteUrl } from '../../../src/lib/site'

type Props = {
  params: Promise<{
    workId: string
  }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { workId } = await params
  const id = Number(workId)

  if (!Number.isInteger(id)) {
    return {
      title: '作品',
    }
  }

  const { data: work } = await supabase
    .from('works')
    .select('id, title, author, published_year')
    .eq('id', id)
    .single()

  if (!work) {
    return {
      title: '作品',
    }
  }

  return {
    title: work.title,
    description:
      `${work.title}の公開中の巻・名所を一覧します。`,
    alternates: {
      canonical: `/works/${id}`,
    },
  }
}

export default async function WorkPage({
  params,
}: Props) {
  const { workId } = await params
  const id = Number(workId)

  if (!Number.isInteger(id)) {
    notFound()
  }

  const entryIds = Object.keys(currentPlaces)
    .map(Number)
    .filter(Number.isInteger)

  if (entryIds.length === 0) {
    notFound()
  }

  const {
    data: work,
    error: workError,
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
    .eq('id', id)
    .single()

  if (workError || !work) {
    notFound()
  }

  const {
    data: entries,
    error: entriesError,
  } = await supabase
    .from('entries')
    .select(`
      id,
      work_id,
      volume_id,
      entry_order,
      heading,
      reading
    `)
    .eq('work_id', id)
    .in('id', entryIds)

  if (entriesError || !entries) {
    return (
      <main className="archive-page">
        <h1>名所取得エラー</h1>
        <pre>{entriesError?.message}</pre>
      </main>
    )
  }

  if (entries.length === 0) {
    notFound()
  }

  const volumeIds = [
    ...new Set(
      entries
        .map((entry) => entry.volume_id)
        .filter(
          (volumeId): volumeId is number =>
            typeof volumeId === 'number'
        )
    ),
  ]

  const {
    data: volumes,
    error: volumesError,
  } = await supabase
    .from('volumes')
    .select(`
      id,
      work_id,
      volume_no,
      volume_label,
      book_no,
      book_label
    `)
    .in('id', volumeIds)

  if (volumesError) {
    return (
      <main className="archive-page">
        <h1>巻情報取得エラー</h1>
        <pre>{volumesError.message}</pre>
      </main>
    )
  }

  const volumeMap = new Map(
    (volumes ?? []).map((volume) => [
      volume.id,
      volume,
    ])
  )

  const sortedEntries = [...entries].sort(
    (a, b) => {
      const aVolumeNo =
        typeof a.volume_id === 'number'
          ? volumeMap.get(a.volume_id)?.volume_no ??
            Number.MAX_SAFE_INTEGER
          : Number.MAX_SAFE_INTEGER

      const bVolumeNo =
        typeof b.volume_id === 'number'
          ? volumeMap.get(b.volume_id)?.volume_no ??
            Number.MAX_SAFE_INTEGER
          : Number.MAX_SAFE_INTEGER

      if (aVolumeNo !== bVolumeNo) {
        return aVolumeNo - bVolumeNo
      }

      return (
        (a.entry_order ??
          Number.MAX_SAFE_INTEGER) -
        (b.entry_order ??
          Number.MAX_SAFE_INTEGER)
      )
    }
  )

  const grouped = new Map<
    number | null,
    typeof sortedEntries
  >()

  for (const entry of sortedEntries) {
    if (!grouped.has(entry.volume_id)) {
      grouped.set(entry.volume_id, [])
    }

    grouped
      .get(entry.volume_id)!
      .push(entry)
  }

  const workJsonLd = [
    {
      '@context':
        'https://schema.org',
      '@type':
        'CollectionPage',
      name: work.title,
      url: absoluteUrl(
        `/works/${work.id}`
      ),
      inLanguage: 'ja',
      about: {
        '@type':
          'CreativeWork',
        name:
          work.title,
        creator:
          work.author
            ? {
                '@type':
                  'Person',
                name:
                  work.author,
              }
            : undefined,
      },
    },
    {
      '@context':
        'https://schema.org',
      '@type':
        'BreadcrumbList',
      itemListElement: [
        {
          '@type':
            'ListItem',
          position: 1,
          name: 'ホーム',
          item:
            absoluteUrl('/'),
        },
        {
          '@type':
            'ListItem',
          position: 2,
          name: '作品一覧',
          item:
            absoluteUrl('/works'),
        },
        {
          '@type':
            'ListItem',
          position: 3,
          name:
            work.title,
          item:
            absoluteUrl(
              `/works/${work.id}`
            ),
        },
      ],
    },
  ]

  const volumeGroups = [
    ...grouped.entries(),
  ].sort(([aId], [bId]) => {
    const a =
      typeof aId === 'number'
        ? volumeMap.get(aId)
        : undefined

    const b =
      typeof bId === 'number'
        ? volumeMap.get(bId)
        : undefined

    return (
      (a?.volume_no ??
        Number.MAX_SAFE_INTEGER) -
      (b?.volume_no ??
        Number.MAX_SAFE_INTEGER)
    )
  })

  return (
    <main className="archive-page">
      <JsonLd
        data={workJsonLd}
      />

      <nav
        aria-label="パンくず"
        className="archive-breadcrumb"
      >
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">›</span>
        <Link href="/works">作品一覧</Link>
        <span aria-hidden="true">›</span>
        <span>{work.title}</span>
      </nav>

      <header
        style={{
          paddingBottom: '30px',
          marginBottom: '42px',
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
          WORK
        </div>

        <h1 className="archive-page-title">
          {work.title}
        </h1>

        {work.title_kana && (
          <div
            style={{
              marginTop: '7px',
              color: '#91897e',
              fontSize: '0.9rem',
            }}
          >
            {work.title_kana}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '7px 20px',
            marginTop: '18px',
            color: '#6f685f',
            fontSize: '0.88rem',
          }}
        >
          {work.author && (
            <span>著：{work.author}</span>
          )}

          {work.editor && (
            <span>編：{work.editor}</span>
          )}

          {work.illustrator && (
            <span>画：{work.illustrator}</span>
          )}

          {work.published_year && (
            <span>{work.published_year}</span>
          )}

          {work.region && (
            <span>地域：{work.region}</span>
          )}
        </div>
      </header>

      <div
        style={{
          marginBottom: '40px',
          color: '#777068',
          fontSize: '0.9rem',
        }}
      >
        公開中 {entries.length}件
      </div>

      {volumeGroups.map(
        ([volumeId, volumeEntries]) => {
          const volume =
            typeof volumeId === 'number'
              ? volumeMap.get(volumeId)
              : undefined

          return (
            <section
              key={volumeId ?? 'no-volume'}
              style={{
                marginBottom: '56px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  marginBottom: '20px',
                }}
              >
                {volume ? (
                  <Link
                    href={`/works/${id}/volumes/${volume.id}`}
                    style={{
                      color: '#292722',
                      textDecoration: 'none',
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: '1.35rem',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {volume.volume_label ??
                        `巻 ${volume.volume_no ?? volume.id}`}
                    </h2>
                  </Link>
                ) : (
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.35rem',
                    }}
                  >
                    巻未設定
                  </h2>
                )}

                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    background: '#ddd7cc',
                  }}
                />

                <span
                  style={{
                    color: '#999188',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {volumeEntries.length}件
                </span>
              </div>

              <div className="archive-card-grid">
                {volumeEntries.map((entry) => {
                  const currentPlace =
                    currentPlaces[entry.id]

                  return (
                    <Link
                      key={entry.id}
                      href={`/meisho/${entry.id}`}
                      className="archive-card"
                    >
                      <div
                        style={{
                          marginBottom: '10px',
                          color: '#aaa198',
                          fontSize: '0.74rem',
                        }}
                      >
                        {entry.entry_order != null
                          ? `第${entry.entry_order}項`
                          : '名所'}
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          fontFamily:
                            '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
                          fontSize: '1.25rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {entry.heading}
                      </h3>

                      {entry.reading && (
                        <div
                          style={{
                            marginTop: '4px',
                            color: '#918981',
                            fontSize: '0.8rem',
                          }}
                        >
                          {entry.reading}
                        </div>
                      )}

                      {currentPlace?.currentName &&
                        currentPlace.currentName !==
                          entry.heading && (
                          <div
                            style={{
                              marginTop: '15px',
                              paddingTop: '12px',
                              borderTop:
                                '1px solid #eeeae2',
                              color: '#65716d',
                              fontSize: '0.85rem',
                            }}
                          >
                            現在：
                            {currentPlace.currentName}
                          </div>
                        )}
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        }
      )}
    </main>
  )
}
