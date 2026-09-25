import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '../../../src/lib/supabase'
import { currentPlaces } from '../../../src/data/currentPlaces'
import {
  getDbPublishedEntryIds,
  mergePublishedEntries,
  type PublishedEntry,
} from '../../../src/lib/publishedEntries'
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
    return { title: '作品' }
  }

  const { data: work } = await supabase
    .from('works')
    .select('id, title')
    .eq('id', id)
    .single()

  return work
    ? {
        title: work.title,
        description: `${work.title}の公開中の巻・名所を一覧します。`,
        alternates: { canonical: `/works/${id}` },
      }
    : { title: '作品' }
}

export default async function WorkPage({ params }: Props) {
  const { workId } = await params
  const id = Number(workId)

  if (!Number.isInteger(id)) {
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

  const dbIds = getDbPublishedEntryIds()

  let dbEntries: PublishedEntry[] = []

  if (dbIds.length > 0) {
    const { data, error } = await supabase
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
      .in('id', dbIds)

    if (error) {
      return (
        <main className="archive-page">
          <h1>名所取得エラー</h1>
          <pre>{error.message}</pre>
        </main>
      )
    }

    dbEntries = (data ?? []) as PublishedEntry[]
  }

  const entries = mergePublishedEntries(dbEntries)
    .filter((entry) => entry.work_id === id)

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

  const { data: volumes } = await supabase
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

  const volumeMap = new Map(
    (volumes ?? []).map((volume) => [volume.id, volume])
  )

  const sortedEntries = [...entries].sort((a, b) => {
    const aVolumeNo =
      a.volume_id !== null
        ? volumeMap.get(a.volume_id)?.volume_no ??
          Number.MAX_SAFE_INTEGER
        : Number.MAX_SAFE_INTEGER

    const bVolumeNo =
      b.volume_id !== null
        ? volumeMap.get(b.volume_id)?.volume_no ??
          Number.MAX_SAFE_INTEGER
        : Number.MAX_SAFE_INTEGER

    if (aVolumeNo !== bVolumeNo) {
      return aVolumeNo - bVolumeNo
    }

    return (
      (a.entry_order ?? Number.MAX_SAFE_INTEGER) -
      (b.entry_order ?? Number.MAX_SAFE_INTEGER)
    )
  })

  const grouped = new Map<number | null, PublishedEntry[]>()

  for (const entry of sortedEntries) {
    if (!grouped.has(entry.volume_id)) {
      grouped.set(entry.volume_id, [])
    }

    grouped.get(entry.volume_id)!.push(entry)
  }

  const workJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: work.title,
    url: absoluteUrl(`/works/${work.id}`),
    inLanguage: 'ja',
  }

  const volumeGroups = [...grouped.entries()].sort(
    ([aId], [bId]) => {
      const a =
        aId !== null ? volumeMap.get(aId) : undefined
      const b =
        bId !== null ? volumeMap.get(bId) : undefined

      return (
        (a?.volume_no ?? Number.MAX_SAFE_INTEGER) -
        (b?.volume_no ?? Number.MAX_SAFE_INTEGER)
      )
    }
  )

  return (
    <main className="archive-page">
      <JsonLd data={workJsonLd} />

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

        <h1 className="archive-page-title">{work.title}</h1>

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

      {volumeGroups.map(([volumeId, volumeEntries]) => {
        const volume =
          volumeId !== null
            ? volumeMap.get(volumeId)
            : undefined

        return (
          <section
            key={volumeId ?? 'no-volume'}
            style={{ marginBottom: '56px' }}
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
                    }}
                  >
                    {volume.volume_label ??
                      `巻 ${volume.volume_no ?? volume.id}`}
                  </h2>
                </Link>
              ) : (
                <h2>巻未設定</h2>
              )}

              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: '#ddd7cc',
                }}
              />
            </div>

            <div className="archive-card-grid">
              {volumeEntries.map((entry) => {
                const current = currentPlaces[entry.id]
                const photo = current?.photos?.[0]

                return (
                  <Link
                    key={entry.id}
                    href={`/meisho/${entry.id}`}
                    className="archive-card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {photo && (
                      <div
                        style={{
                          aspectRatio: '16 / 9',
                          overflow: 'hidden',
                          background: '#eee9e0',
                        }}
                      >
                        <img
                          src={photo.url}
                          alt={
                            photo.alt ||
                            photo.caption ||
                            current?.currentName ||
                            entry.heading
                          }
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </div>
                    )}

                    <div style={{ padding: '22px 23px' }}>
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
                          fontSize: '1.25rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {entry.heading}
                      </h3>

                      {current?.currentName &&
                        current.currentName !== entry.heading && (
                          <div
                            style={{
                              marginTop: '15px',
                              color: '#65716d',
                              fontSize: '0.85rem',
                            }}
                          >
                            現在：{current.currentName}
                          </div>
                        )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </main>
  )
}
