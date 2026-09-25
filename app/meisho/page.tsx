import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '../../src/lib/supabase'
import { currentPlaces } from '../../src/data/currentPlaces'
import {
  getDbPublishedEntryIds,
  mergePublishedEntries,
  type PublishedEntry,
} from '../../src/lib/publishedEntries'

export const metadata: Metadata = {
  title: '名所一覧',
  description:
    '名所図会に記された場所を、作品・巻ごとに一覧でたどります。原文、現代の姿、関連史料、現地写真を掲載しています。',
  alternates: {
    canonical: '/meisho',
  },
}

type Props = {
  searchParams: Promise<{
    q?: string
    work?: string
    volume?: string
  }>
}

export default async function MeishoListPage({
  searchParams,
}: Props) {
  const params = await searchParams

  const query =
    typeof params.q === 'string'
      ? params.q.trim()
      : ''

  const selectedWorkId =
    typeof params.work === 'string' && params.work !== ''
      ? Number(params.work)
      : null

  const selectedVolumeId =
    typeof params.volume === 'string' && params.volume !== ''
      ? Number(params.volume)
      : null

  const dbIds = getDbPublishedEntryIds()

  let dbEntries: PublishedEntry[] = []
  let entriesError: { message: string } | null = null

  if (dbIds.length > 0) {
    const result = await supabase
      .from('entries')
      .select(`
        id,
        work_id,
        volume_id,
        entry_order,
        heading,
        reading
      `)
      .in('id', dbIds)

    dbEntries = (result.data ?? []) as PublishedEntry[]
    entriesError = result.error
  }

  if (entriesError) {
    return (
      <main className="archive-page">
        <h1>一覧取得エラー</h1>
        <pre>{entriesError.message}</pre>
      </main>
    )
  }

  const entries = mergePublishedEntries(dbEntries)

  const workIds = [
    ...new Set(entries.map((entry) => entry.work_id)),
  ]

  const volumeIds = [
    ...new Set(
      entries
        .map((entry) => entry.volume_id)
        .filter(
          (id): id is number => typeof id === 'number'
        )
    ),
  ]

  const [worksResult, volumesResult] = await Promise.all([
    supabase
      .from('works')
      .select(`
        id,
        title,
        author,
        editor,
        illustrator,
        published_year,
        region
      `)
      .in('id', workIds),
    supabase
      .from('volumes')
      .select(`
        id,
        work_id,
        volume_no,
        volume_label
      `)
      .in('id', volumeIds),
  ])

  if (worksResult.error || volumesResult.error) {
    return (
      <main className="archive-page">
        <h1>作品・巻情報取得エラー</h1>
        <pre>
          {worksResult.error?.message ??
            volumesResult.error?.message}
        </pre>
      </main>
    )
  }

  const works = worksResult.data ?? []
  const volumes = volumesResult.data ?? []

  const workMap = new Map(
    works.map((work) => [work.id, work])
  )

  const volumeMap = new Map(
    volumes.map((volume) => [volume.id, volume])
  )

  const sortedEntries = [...entries].sort((a, b) => {
    if (a.work_id !== b.work_id) {
      return a.work_id - b.work_id
    }

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

    const orderCompare =
      (a.entry_order ?? Number.MAX_SAFE_INTEGER) -
      (b.entry_order ?? Number.MAX_SAFE_INTEGER)

    return orderCompare !== 0
      ? orderCompare
      : a.id - b.id
  })

  const normalizedQuery =
    query.toLocaleLowerCase('ja-JP')

  const filteredEntries = sortedEntries.filter((entry) => {
    if (
      selectedWorkId !== null &&
      Number.isInteger(selectedWorkId) &&
      entry.work_id !== selectedWorkId
    ) {
      return false
    }

    if (
      selectedVolumeId !== null &&
      Number.isInteger(selectedVolumeId) &&
      entry.volume_id !== selectedVolumeId
    ) {
      return false
    }

    if (!normalizedQuery) {
      return true
    }

    const current = currentPlaces[entry.id]

    return [
      entry.heading,
      entry.reading ?? '',
      current?.currentName ?? '',
      current?.address ?? '',
      current?.description ?? '',
    ]
      .join(' ')
      .toLocaleLowerCase('ja-JP')
      .includes(normalizedQuery)
  })

  const grouped = new Map<
    number,
    Map<number | null, PublishedEntry[]>
  >()

  for (const entry of filteredEntries) {
    if (!grouped.has(entry.work_id)) {
      grouped.set(entry.work_id, new Map())
    }

    const workGroup = grouped.get(entry.work_id)!

    if (!workGroup.has(entry.volume_id)) {
      workGroup.set(entry.volume_id, [])
    }

    workGroup.get(entry.volume_id)!.push(entry)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        color: '#292722',
        background:
          'linear-gradient(to bottom, #faf8f3 0px, #ffffff 420px)',
      }}
    >
      <div
        style={{
          maxWidth: '1050px',
          margin: '0 auto',
          padding: '64px 24px 104px',
          lineHeight: 1.8,
        }}
      >
        <header
          style={{
            marginBottom: '42px',
            paddingBottom: '32px',
            borderBottom: '1px solid #d8d3c8',
          }}
        >
          <p
            style={{
              margin: '0 0 8px',
              fontSize: '0.82rem',
              letterSpacing: '0.18em',
              color: '#837b70',
            }}
          >
            MEISHO ZUE ARCHIVE
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily:
                '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
              fontSize: 'clamp(2.1rem, 6vw, 3.2rem)',
              fontWeight: 500,
              letterSpacing: '0.06em',
            }}
          >
            名所をたどる
          </h1>
        </header>

        <form
          action="/meisho"
          method="get"
          style={{
            marginBottom: '34px',
            padding: '22px',
            border: '1px solid #ddd7cc',
            borderRadius: '10px',
            background: '#fff',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '12px',
            }}
          >
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="名所名・現在名・所在地など"
              style={{ padding: '11px 13px' }}
            />

            <select
              name="work"
              defaultValue={
                selectedWorkId !== null
                  ? String(selectedWorkId)
                  : ''
              }
              style={{ padding: '11px 12px' }}
            >
              <option value="">すべての作品</option>
              {[...workMap.values()]
                .sort((a, b) => a.id - b.id)
                .map((work) => (
                  <option key={work.id} value={work.id}>
                    {work.title}
                  </option>
                ))}
            </select>

            <select
              name="volume"
              defaultValue={
                selectedVolumeId !== null
                  ? String(selectedVolumeId)
                  : ''
              }
              style={{ padding: '11px 12px' }}
            >
              <option value="">すべての巻</option>
              {[...volumeMap.values()]
                .sort(
                  (a, b) =>
                    (a.volume_no ?? Number.MAX_SAFE_INTEGER) -
                    (b.volume_no ?? Number.MAX_SAFE_INTEGER)
                )
                .map((volume) => (
                  <option key={volume.id} value={volume.id}>
                    {volume.volume_label ??
                      `巻 ${volume.volume_no ?? volume.id}`}
                  </option>
                ))}
            </select>

            <button type="submit">絞り込む</button>
          </div>
        </form>

        <div
          style={{
            marginBottom: '30px',
            color: '#777068',
            fontSize: '0.9rem',
          }}
        >
          公開中 {filteredEntries.length}件
        </div>

        {[...grouped.entries()].map(
          ([workId, volumeGroups]) => {
            const work = workMap.get(workId)

            return (
              <section
                key={workId}
                style={{ marginBottom: '64px' }}
              >
                <h2
                  style={{
                    fontSize: '1.6rem',
                    marginBottom: '28px',
                  }}
                >
                  {work?.title ?? '作品'}
                </h2>

                {[...volumeGroups.entries()].map(
                  ([volumeId, volumeEntries]) => {
                    const volume =
                      volumeId !== null
                        ? volumeMap.get(volumeId)
                        : undefined

                    return (
                      <section
                        key={volumeId ?? 'none'}
                        style={{ marginBottom: '44px' }}
                      >
                        <h3
                          style={{
                            marginBottom: '18px',
                            fontSize: '1.2rem',
                          }}
                        >
                          {volume?.volume_label ?? '巻未設定'}
                        </h3>

                        <div className="archive-card-grid">
                          {volumeEntries.map((entry) => {
                            const current =
                              currentPlaces[entry.id]
                            const photo =
                              current?.photos?.[0]

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
                                    current.currentName !==
                                      entry.heading && (
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
                  }
                )}
              </section>
            )
          }
        )}
      </div>
    </main>
  )
}
