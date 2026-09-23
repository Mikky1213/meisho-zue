import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '../../../src/lib/supabase'
import { currentPlaces } from '../../../src/data/currentPlaces'
import { historicalMedia } from '../../../src/data/historicalMedia'
import {
  getRegionBySlug,
  regions,
} from '../../../src/data/regions'

type Props = {
  params: Promise<{
    slug: string
  }>
}

type StatusItem = {
  label: string
  ready: boolean
}

export function generateStaticParams() {
  return regions.map((region) => ({
    slug: region.slug,
  }))
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params
  const region =
    getRegionBySlug(slug)

  if (!region) {
    return {
      title: '地域',
    }
  }

  return {
    title: region.title,
    description:
      region.description,
    alternates: {
      canonical:
        `/regions/${region.slug}`,
    },
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      url:
        `/regions/${region.slug}`,
      siteName: '名所図会 今昔',
      title:
        `${region.title}の名所`,
      description:
        region.description,
    },
  }
}

export default async function RegionPage({
  params,
}: Props) {
  const { slug } = await params
  const region =
    getRegionBySlug(slug)

  if (!region) {
    notFound()
  }

  const publishedIds =
    region.entryIds.filter(
      (entryId) =>
        Boolean(
          currentPlaces[entryId]
        )
    )

  if (publishedIds.length === 0) {
    return (
      <main className="archive-page">
        <nav
          aria-label="パンくず"
          className="archive-breadcrumb"
        >
          <Link href="/">ホーム</Link>
          <span aria-hidden="true">›</span>
          <Link href="/regions">
            地域一覧
          </Link>
          <span aria-hidden="true">›</span>
          <span>{region.title}</span>
        </nav>

        <h1 className="archive-page-title">
          {region.title}
        </h1>

        <p>
          この地域の公開記事はまだありません。
        </p>
      </main>
    )
  }

  const [
    entriesResult,
    itemsResult,
  ] = await Promise.all([
    supabase
      .from('entries')
      .select(`
        id,
        work_id,
        volume_id,
        entry_order,
        heading,
        reading
      `)
      .in('id', publishedIds),
    supabase
      .from('place_items')
      .select(`
        id,
        entry_id,
        item_type
      `)
      .in('entry_id', publishedIds)
      .neq('item_type', 'full_text'),
  ])

  if (
    entriesResult.error ||
    !entriesResult.data
  ) {
    return (
      <main className="archive-page">
        <h1>地域情報取得エラー</h1>
        <pre>
          {entriesResult.error?.message}
        </pre>
      </main>
    )
  }

  const entries =
    entriesResult.data

  const originalEntryIds =
    new Set(
      (itemsResult.data ?? [])
        .map(
          (item) =>
            item.entry_id
        )
        .filter(
          (
            entryId
          ): entryId is number =>
            typeof entryId ===
            'number'
        )
    )

  const workIds = [
    ...new Set(
      entries.map(
        (entry) =>
          entry.work_id
      )
    ),
  ]

  const volumeIds = [
    ...new Set(
      entries
        .map(
          (entry) =>
            entry.volume_id
        )
        .filter(
          (
            volumeId
          ): volumeId is number =>
            typeof volumeId ===
            'number'
        )
    ),
  ]

  const [
    worksResult,
    volumesResult,
  ] = await Promise.all([
    supabase
      .from('works')
      .select(`
        id,
        title
      `)
      .in('id', workIds),
    supabase
      .from('volumes')
      .select(`
        id,
        volume_no,
        volume_label
      `)
      .in('id', volumeIds),
  ])

  const workMap =
    new Map(
      (worksResult.data ?? []).map(
        (work) => [
          work.id,
          work,
        ]
      )
    )

  const volumeMap =
    new Map(
      (volumesResult.data ?? []).map(
        (volume) => [
          volume.id,
          volume,
        ]
      )
    )

  const sortedEntries =
    [...entries].sort(
      (a, b) => {
        const aVolumeNo =
          typeof a.volume_id ===
          'number'
            ? volumeMap.get(
                a.volume_id
              )?.volume_no ??
              Number.MAX_SAFE_INTEGER
            : Number.MAX_SAFE_INTEGER

        const bVolumeNo =
          typeof b.volume_id ===
          'number'
            ? volumeMap.get(
                b.volume_id
              )?.volume_no ??
              Number.MAX_SAFE_INTEGER
            : Number.MAX_SAFE_INTEGER

        if (
          aVolumeNo !==
          bVolumeNo
        ) {
          return (
            aVolumeNo -
            bVolumeNo
          )
        }

        return (
          (a.entry_order ??
            Number.MAX_SAFE_INTEGER) -
          (b.entry_order ??
            Number.MAX_SAFE_INTEGER)
        )
      }
    )

  const statusForEntry = (
    entryId: number
  ): StatusItem[] => {
    const current =
      currentPlaces[entryId]

    const hasCurrentInfo =
      Boolean(
        current?.address?.trim()
      ) &&
      Boolean(
        current?.description?.trim()
      )

    return [
      {
        label: '原文',
        ready:
          originalEntryIds.has(
            entryId
          ),
      },
      {
        label: '現代語訳',
        ready:
          (current?.translation
            ?.length ?? 0) > 0,
      },
      {
        label: '現在情報',
        ready: hasCurrentInfo,
      },
      {
        label: '現地写真',
        ready:
          (current?.photos
            ?.length ?? 0) > 0,
      },
      {
        label: '関連史料',
        ready:
          (current?.documents
            ?.length ?? 0) > 0,
      },
      {
        label: '比較',
        ready:
          (current?.comparison
            ?.length ?? 0) > 0,
      },
      {
        label: '歴史画像',
        ready:
          (historicalMedia[
            entryId
          ]?.length ?? 0) > 0,
      },
    ]
  }

  const totalChecks =
    sortedEntries.length * 7

  const readyChecks =
    sortedEntries.reduce(
      (total, entry) =>
        total +
        statusForEntry(
          entry.id
        ).filter(
          (status) =>
            status.ready
        ).length,
      0
    )

  const completionPercent =
    totalChecks > 0
      ? Math.round(
          (readyChecks /
            totalChecks) *
            100
        )
      : 0

  return (
    <main className="archive-page">
      <nav
        aria-label="パンくず"
        className="archive-breadcrumb"
      >
        <Link href="/">ホーム</Link>
        <span aria-hidden="true">›</span>
        <Link href="/regions">
          地域一覧
        </Link>
        <span aria-hidden="true">›</span>
        <span>{region.title}</span>
      </nav>

      <header
        style={{
          paddingBottom: '30px',
          marginBottom: '34px',
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
          REGION
        </div>

        <h1 className="archive-page-title">
          {region.title}
        </h1>

        {region.reading && (
          <div
            style={{
              marginTop: '7px',
              color: '#91897e',
              fontSize: '0.9rem',
            }}
          >
            {region.reading}
          </div>
        )}

        {region.subtitle && (
          <div
            style={{
              marginTop: '18px',
              color: '#5f5951',
              fontSize: '1rem',
              lineHeight: 1.8,
            }}
          >
            {region.subtitle}
          </div>
        )}

        <p
          style={{
            maxWidth: '760px',
            margin: '14px 0 0',
            color: '#6e675f',
            fontSize: '0.92rem',
            lineHeight: 1.9,
          }}
        >
          {region.description}
        </p>
      </header>

      <section
        className="region-progress-summary"
        aria-label="地域の登録状況"
      >
        <div>
          <div className="region-progress-label">
            公開名所
          </div>

          <div className="region-progress-number">
            {sortedEntries.length}
            <span>件</span>
          </div>
        </div>

        <div>
          <div className="region-progress-label">
            登録済み項目
          </div>

          <div className="region-progress-number">
            {readyChecks}
            <span>
              / {totalChecks}
            </span>
          </div>
        </div>

        <div>
          <div className="region-progress-label">
            登録率
          </div>

          <div className="region-progress-number">
            {completionPercent}
            <span>%</span>
          </div>
        </div>
      </section>

      <section
        style={{
          marginTop: '50px',
        }}
      >
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
              fontSize: '1.45rem',
              letterSpacing: '0.06em',
            }}
          >
            名所と登録状況
          </h2>

          <div
            style={{
              flex: 1,
              height: '1px',
              background: '#d8d2c7',
            }}
          />
        </div>

        <p
          style={{
            margin: '0 0 24px',
            color: '#7a736a',
            fontSize: '0.86rem',
            lineHeight: 1.8,
          }}
        >
          「登録済み」は、現在サイトに入力されている情報の有無を示します。
          内容の研究上の完成度を評価するものではありません。
        </p>

        <div className="region-entry-list">
          {sortedEntries.map(
            (entry) => {
              const current =
                currentPlaces[
                  entry.id
                ]

              const statuses =
                statusForEntry(
                  entry.id
                )

              const readyCount =
                statuses.filter(
                  (status) =>
                    status.ready
                ).length

              const work =
                workMap.get(
                  entry.work_id
                )

              const volume =
                typeof entry.volume_id ===
                'number'
                  ? volumeMap.get(
                      entry.volume_id
                    )
                  : undefined

              const photo =
                current?.photos?.[0]

              return (
                <article
                  key={entry.id}
                  className="region-entry-card"
                >
                  {photo && (
                    <Link
                      href={`/meisho/${entry.id}`}
                      className="region-entry-photo-link"
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
                        className="region-entry-photo"
                      />
                    </Link>
                  )}

                  <div className="region-entry-body">
                    <div className="region-entry-meta">
                      {work?.title ??
                        '作品'}
                      {' ／ '}
                      {volume?.volume_label ??
                        '巻未設定'}
                      {entry.entry_order !=
                        null
                        ? ` ／ 第${entry.entry_order}項`
                        : ''}
                    </div>

                    <div className="region-entry-title-row">
                      <div>
                        <h3 className="region-entry-title">
                          <Link
                            href={`/meisho/${entry.id}`}
                          >
                            {entry.heading}
                          </Link>
                        </h3>

                        {entry.reading && (
                          <div className="region-entry-reading">
                            {entry.reading}
                          </div>
                        )}
                      </div>

                      <div className="region-entry-score">
                        {readyCount}
                        <span>/7</span>
                      </div>
                    </div>

                    {current?.currentName &&
                      current.currentName !==
                        entry.heading && (
                        <div className="region-current-name">
                          現在：
                          {current.currentName}
                        </div>
                      )}

                    <div className="region-status-grid">
                      {statuses.map(
                        (status) => (
                          <span
                            key={
                              status.label
                            }
                            className={
                              status.ready
                                ? 'region-status region-status-ready'
                                : 'region-status region-status-missing'
                            }
                          >
                            <span
                              aria-hidden="true"
                            >
                              {status.ready
                                ? '●'
                                : '○'}
                            </span>
                            {status.label}
                          </span>
                        )
                      )}
                    </div>

                    <div className="region-entry-actions">
                      <Link
                        href={`/meisho/${entry.id}`}
                      >
                        記事を見る →
                      </Link>

                      {work && (
                        <Link
                          href={`/works/${work.id}`}
                        >
                          作品ページ
                        </Link>
                      )}

                      {work &&
                        volume && (
                          <Link
                            href={`/works/${work.id}/volumes/${volume.id}`}
                          >
                            巻ページ
                          </Link>
                        )}
                    </div>
                  </div>
                </article>
              )
            }
          )}
        </div>
      </section>
    </main>
  )
}
