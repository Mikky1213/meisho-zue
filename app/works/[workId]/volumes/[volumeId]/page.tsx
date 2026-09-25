import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '../../../../../src/lib/supabase'
import { currentPlaces } from '../../../../../src/data/currentPlaces'
import {
  getDbPublishedEntryIds,
  mergePublishedEntries,
  type PublishedEntry,
} from '../../../../../src/lib/publishedEntries'
import JsonLd from '../../../../../src/components/JsonLd'
import { absoluteUrl } from '../../../../../src/lib/site'

type Props = {
  params: Promise<{
    workId: string
    volumeId: string
  }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { workId, volumeId } = await params
  const parsedWorkId = Number(workId)
  const parsedVolumeId = Number(volumeId)

  if (
    !Number.isInteger(parsedWorkId) ||
    !Number.isInteger(parsedVolumeId)
  ) {
    return { title: '巻' }
  }

  const [{ data: work }, { data: volume }] =
    await Promise.all([
      supabase
        .from('works')
        .select('id, title')
        .eq('id', parsedWorkId)
        .single(),
      supabase
        .from('volumes')
        .select('id, work_id, volume_label, volume_no')
        .eq('id', parsedVolumeId)
        .single(),
    ])

  if (
    !work ||
    !volume ||
    volume.work_id !== parsedWorkId
  ) {
    return { title: '巻' }
  }

  const volumeTitle =
    volume.volume_label ??
    `巻 ${volume.volume_no ?? volume.id}`

  return {
    title: `${work.title} ${volumeTitle}`,
    description:
      `${work.title} ${volumeTitle}の公開中の名所を一覧します。`,
    alternates: {
      canonical:
        `/works/${parsedWorkId}/volumes/${parsedVolumeId}`,
    },
  }
}

export default async function VolumePage({
  params,
}: Props) {
  const { workId, volumeId } = await params
  const parsedWorkId = Number(workId)
  const parsedVolumeId = Number(volumeId)

  if (
    !Number.isInteger(parsedWorkId) ||
    !Number.isInteger(parsedVolumeId)
  ) {
    notFound()
  }

  const [workResult, volumeResult] =
    await Promise.all([
      supabase
        .from('works')
        .select(`
          id,
          title,
          author,
          illustrator,
          published_year
        `)
        .eq('id', parsedWorkId)
        .single(),
      supabase
        .from('volumes')
        .select(`
          id,
          work_id,
          volume_no,
          volume_label,
          book_no,
          book_label
        `)
        .eq('id', parsedVolumeId)
        .single(),
    ])

  const work = workResult.data
  const volume = volumeResult.data

  if (
    workResult.error ||
    volumeResult.error ||
    !work ||
    !volume ||
    volume.work_id !== parsedWorkId
  ) {
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
      .eq('work_id', parsedWorkId)
      .eq('volume_id', parsedVolumeId)
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
    .filter(
      (entry) =>
        entry.work_id === parsedWorkId &&
        entry.volume_id === parsedVolumeId
    )
    .sort(
      (a, b) =>
        (a.entry_order ?? Number.MAX_SAFE_INTEGER) -
        (b.entry_order ?? Number.MAX_SAFE_INTEGER)
    )

  if (entries.length === 0) {
    notFound()
  }

  const volumeTitle =
    volume.volume_label ??
    `巻 ${volume.volume_no ?? volume.id}`

  const volumeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${work.title} ${volumeTitle}`,
    url: absoluteUrl(
      `/works/${work.id}/volumes/${volume.id}`
    ),
    inLanguage: 'ja',
  }

  return (
    <main className="archive-page">
      <JsonLd data={volumeJsonLd} />

      <nav
        aria-label="パンくず"
        className="archive-breadcrumb"
      >
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">›</span>
        <Link href="/works">作品一覧</Link>
        <span aria-hidden="true">›</span>
        <Link href={`/works/${work.id}`}>
          {work.title}
        </Link>
        <span aria-hidden="true">›</span>
        <span>{volumeTitle}</span>
      </nav>

      <header
        style={{
          paddingBottom: '30px',
          marginBottom: '40px',
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
          VOLUME
        </div>

        <div
          style={{
            marginBottom: '8px',
            color: '#756d63',
            fontSize: '0.9rem',
          }}
        >
          {work.title}
        </div>

        <h1 className="archive-page-title">
          {volumeTitle}
        </h1>
      </header>

      <div
        style={{
          marginBottom: '28px',
          color: '#777068',
          fontSize: '0.9rem',
        }}
      >
        公開中 {entries.length}件
      </div>

      <div className="archive-card-grid">
        {entries.map((entry) => {
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

                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.3rem',
                    lineHeight: 1.5,
                  }}
                >
                  {entry.heading}
                </h2>

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

                {current?.currentName &&
                  current.currentName !== entry.heading && (
                    <div
                      style={{
                        marginTop: '15px',
                        paddingTop: '12px',
                        borderTop: '1px solid #eeeae2',
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
    </main>
  )
}
