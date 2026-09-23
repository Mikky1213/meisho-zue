import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '../../../src/lib/supabase'
import { currentPlaces } from '../../../src/data/currentPlaces'
import { historicalMedia } from '../../../src/data/historicalMedia'
import MediaGallery from '../../../src/components/MediaGallery'
import { getRegionForEntry } from '../../../src/data/regions'
import JsonLd from '../../../src/components/JsonLd'
import { absoluteUrl } from '../../../src/lib/site'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params
  const entryId = Number(id)

  if (!Number.isInteger(entryId)) {
    return {
      title: '名所',
    }
  }

  const {
    data: entry,
    error: entryError,
  } = await supabase
    .from('entries')
    .select(`
      id,
      work_id,
      heading,
      reading
    `)
    .eq('id', entryId)
    .single()

  if (entryError || !entry) {
    return {
      title: '名所',
    }
  }

  const {
    data: work,
  } = await supabase
    .from('works')
    .select(`
      id,
      title
    `)
    .eq('id', entry.work_id)
    .single()

  const currentPlace =
    currentPlaces[entryId]

  const workTitle =
    work?.title ?? '名所図会'

  const description =
    currentPlace?.description
      ? `${workTitle}「${entry.heading}」。${currentPlace.description}`
      : `${workTitle}に記された「${entry.heading}」の原文と現在の姿を紹介します。`

  const firstPhoto =
    currentPlace?.photos?.[0]

  const firstHistoricalImage =
    historicalMedia[entryId]?.[0]

  const socialImage =
    firstPhoto ?? firstHistoricalImage

  return {
    title: entry.heading,
    description,

    alternates: {
      canonical: `/meisho/${entryId}`,
    },

    openGraph: {
      type: 'article',
      locale: 'ja_JP',
      url: `/meisho/${entryId}`,
      siteName: '名所図会 今昔',
      title: entry.heading,
      description,
      images: socialImage
        ? [
            {
              url: socialImage.url,
              alt:
                socialImage.alt ||
                socialImage.caption ||
                entry.heading,
            },
          ]
        : undefined,
    },

    twitter: {
      card: socialImage
        ? 'summary_large_image'
        : 'summary',
      title: entry.heading,
      description,
      images: socialImage
        ? [socialImage.url]
        : undefined,
    },
  }
}

export default async function MeishoPage({
  params,
}: Props) {
  const { id } = await params
  const entryId = Number(id)

  if (!Number.isInteger(entryId)) {
    notFound()
  }

  // ------------------------------
  // 名所本体
  // ------------------------------

  const {
    data: entry,
    error: entryError,
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
    .eq('id', entryId)
    .single()

  if (entryError || !entry) {
    notFound()
  }

  const currentPlace =
    currentPlaces[entryId]

  const region =
    getRegionForEntry(entryId)

  const historicalImages =
    historicalMedia[entryId] ?? []

  const historicalGalleryItems =
    historicalImages.map((image) => ({
      url: image.url,
      alt:
        image.alt ||
        image.caption,
      caption: image.caption,
      meta: [
        image.source
          ? `出典：${image.source}`
          : '',
        image.page
          ? `掲載箇所：${image.page}`
          : '',
        image.note ?? '',
      ].filter(Boolean),
      sourceUrl: image.sourceUrl,
    }))

  const currentGalleryItems =
    (currentPlace?.photos ?? []).map(
      (photo) => ({
        url: photo.url,
        alt:
          photo.alt ||
          photo.caption ||
          currentPlace?.currentName ||
          entry.heading,
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
      })
    )

  const visualComparisonItems = [
    historicalGalleryItems[0]
      ? {
          ...historicalGalleryItems[0],
          caption:
            `往時：${
              historicalGalleryItems[0]
                .caption ||
              entry.heading
            }`,
        }
      : null,
    currentGalleryItems[0]
      ? {
          ...currentGalleryItems[0],
          caption:
            `現在：${
              currentGalleryItems[0]
                .caption ||
              currentPlace?.currentName ||
              entry.heading
            }`,
        }
      : null,
  ].filter(
    (
      item
    ): item is NonNullable<
      typeof item
    > => item !== null
  )

  const mapQuery =
    currentPlace?.address ||
    currentPlace?.currentName ||
    ''

  const googleMapsSearchUrl =
    mapQuery
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
      : null

  const googleMapsEmbedUrl =
    mapQuery
      ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
      : null

  // ------------------------------
  // 作品情報
  // ------------------------------

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
    .eq('id', entry.work_id)
    .single()

  if (workError || !work) {
    return (
      <main style={{ padding: '40px' }}>
        <h1>作品情報取得エラー</h1>
        <pre>{workError?.message}</pre>
      </main>
    )
  }

  // ------------------------------
  // 巻情報
  // ------------------------------

  const {
    data: volume,
    error: volumeError,
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
    .eq('id', entry.volume_id)
    .single()

  if (volumeError || !volume) {
    return (
      <main style={{ padding: '40px' }}>
        <h1>巻情報取得エラー</h1>
        <pre>{volumeError?.message}</pre>
      </main>
    )
  }

  const articleDescription =
    currentPlace?.description
      ? `${work.title}「${entry.heading}」。${currentPlace.description}`
      : `${work.title}に記された「${entry.heading}」の原文と現在の姿を紹介します。`

  const articleImages = [
    ...(currentPlace?.photos ?? []).map(
      (photo) => photo.url
    ),
    ...historicalImages.map(
      (image) => image.url
    ),
  ]

  const breadcrumbItems = [
    {
      name: 'ホーム',
      url: absoluteUrl('/'),
    },
    {
      name: '作品一覧',
      url: absoluteUrl('/works'),
    },
    {
      name: work.title,
      url: absoluteUrl(
        `/works/${work.id}`
      ),
    },
    {
      name:
        volume.volume_label ??
        `巻 ${volume.volume_no ?? volume.id}`,
      url: absoluteUrl(
        `/works/${work.id}/volumes/${volume.id}`
      ),
    },
    {
      name: entry.heading,
      url: absoluteUrl(
        `/meisho/${entry.id}`
      ),
    },
  ]

  const pageJsonLd = [
    {
      '@context':
        'https://schema.org',
      '@type': 'Article',
      headline: entry.heading,
      description:
        articleDescription,
      url: absoluteUrl(
        `/meisho/${entry.id}`
      ),
      mainEntityOfPage:
        absoluteUrl(
          `/meisho/${entry.id}`
        ),
      inLanguage: 'ja',
      isPartOf: {
        '@type':
          'CreativeWork',
        name: work.title,
      },
      about:
        currentPlace
          ? {
              '@type': 'Place',
              name:
                currentPlace.currentName ||
                entry.heading,
              address:
                currentPlace.address ||
                undefined,
            }
          : {
              '@type': 'Place',
              name: entry.heading,
            },
      image:
        articleImages.length > 0
          ? articleImages
          : undefined,
    },
    {
      '@context':
        'https://schema.org',
      '@type':
        'BreadcrumbList',
      itemListElement:
        breadcrumbItems.map(
          (item, index) => ({
            '@type':
              'ListItem',
            position:
              index + 1,
            name:
              item.name,
            item:
              item.url,
          })
        ),
    },
  ]

  // ------------------------------
  // 原文
  // ------------------------------

  const {
    data: items,
    error: itemsError,
  } = await supabase
    .from('place_items')
    .select(`
      id,
      place_id,
      entry_id,
      parent_item_id,
      item_order,
      depth,
      item_type,
      heading,
      raw_text
    `)
    .eq('entry_id', entryId)
    .neq('item_type', 'full_text')
    .order('item_order')

  if (itemsError) {
    return (
      <main style={{ padding: '40px' }}>
        <h1>原文取得エラー</h1>
        <pre>{itemsError.message}</pre>
      </main>
    )
  }

  // ------------------------------
  // 同じ地域の名所
  // ------------------------------

  let relatedRegionEntries: {
    id: number
    heading: string
    reading: string | null
  }[] = []

  if (region) {
    const relatedIds =
      region.entryIds.filter(
        (relatedId) =>
          relatedId !== entryId &&
          Boolean(
            currentPlaces[
              relatedId
            ]
          )
      )

    if (relatedIds.length > 0) {
      const {
        data: relatedEntries,
      } = await supabase
        .from('entries')
        .select(`
          id,
          heading,
          reading,
          entry_order
        `)
        .in('id', relatedIds)
        .order('entry_order')

      relatedRegionEntries =
        (relatedEntries ?? []).map(
          (relatedEntry) => ({
            id:
              relatedEntry.id,
            heading:
              relatedEntry.heading,
            reading:
              relatedEntry.reading,
          })
        )
    }
  }

  // ------------------------------
  // 前後の名所
  // ------------------------------

  const registeredEntryIds = Object.keys(currentPlaces)
    .map(Number)
    .filter(Number.isInteger)

  let previousEntry: {
    id: number
    heading: string
    workTitle: string
    volumeLabel: string
  } | null = null

  let nextEntry: {
    id: number
    heading: string
    workTitle: string
    volumeLabel: string
  } | null = null

  if (registeredEntryIds.length > 1) {
    const {
      data: navigationEntries,
    } = await supabase
      .from('entries')
      .select(`
        id,
        work_id,
        volume_id,
        entry_order,
        heading
      `)
      .in('id', registeredEntryIds)

    if (
      navigationEntries &&
      navigationEntries.length > 0
    ) {
      const volumeIds = [
        ...new Set(
          navigationEntries
            .map((item) => item.volume_id)
            .filter(
              (volumeId): volumeId is number =>
                volumeId !== null
            )
        ),
      ]

      const navigationWorkIds = [
        ...new Set(
          navigationEntries.map(
            (item) => item.work_id
          )
        ),
      ]

      const {
        data: navigationVolumes,
      } = await supabase
        .from('volumes')
        .select(`
          id,
          volume_no,
          volume_label
        `)
        .in('id', volumeIds)

      const {
        data: navigationWorks,
      } = await supabase
        .from('works')
        .select(`
          id,
          title
        `)
        .in('id', navigationWorkIds)

      const volumeNoMap = new Map(
        (navigationVolumes ?? []).map(
          (item) => [
            item.id,
            item.volume_no ??
              Number.MAX_SAFE_INTEGER,
          ]
        )
      )

      const volumeLabelMap = new Map(
        (navigationVolumes ?? []).map(
          (item) => [
            item.id,
            item.volume_label ??
              '巻未設定',
          ]
        )
      )

      const workTitleMap = new Map(
        (navigationWorks ?? []).map(
          (item) => [
            item.id,
            item.title,
          ]
        )
      )

      const getVolumeNo = (
        volumeId: number | null
      ) => {
        if (volumeId === null) {
          return Number.MAX_SAFE_INTEGER
        }

        return (
          volumeNoMap.get(volumeId) ??
          Number.MAX_SAFE_INTEGER
        )
      }

      const sortedEntries = [
        ...navigationEntries,
      ].sort((a, b) => {
        const workCompare =
          a.work_id - b.work_id

        if (workCompare !== 0) {
          return workCompare
        }

        const volumeCompare =
          getVolumeNo(a.volume_id) -
          getVolumeNo(b.volume_id)

        if (volumeCompare !== 0) {
          return volumeCompare
        }

        const orderCompare =
          (a.entry_order ??
            Number.MAX_SAFE_INTEGER) -
          (b.entry_order ??
            Number.MAX_SAFE_INTEGER)

        if (orderCompare !== 0) {
          return orderCompare
        }

        return a.id - b.id
      })

      const currentIndex =
        sortedEntries.findIndex(
          (item) => item.id === entryId
        )

      if (currentIndex > 0) {
        const previous =
          sortedEntries[
            currentIndex - 1
          ]

        previousEntry = {
          id: previous.id,
          heading: previous.heading,
          workTitle:
            workTitleMap.get(
              previous.work_id
            ) ?? '作品',
          volumeLabel:
            previous.volume_id !== null
              ? volumeLabelMap.get(
                  previous.volume_id
                ) ?? '巻未設定'
              : '巻未設定',
        }
      }

      if (
        currentIndex !== -1 &&
        currentIndex <
          sortedEntries.length - 1
      ) {
        const next =
          sortedEntries[
            currentIndex + 1
          ]

        nextEntry = {
          id: next.id,
          heading: next.heading,
          workTitle:
            workTitleMap.get(
              next.work_id
            ) ?? '作品',
          volumeLabel:
            next.volume_id !== null
              ? volumeLabelMap.get(
                  next.volume_id
                ) ?? '巻未設定'
              : '巻未設定',
        }
      }
    }
  }

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
      <JsonLd
        data={pageJsonLd}
      />

      {/* パンくず */}
      <nav
        aria-label="パンくず"
        className="archive-breadcrumb"
      >
        <Link href="/">
          ホーム
        </Link>

        <span aria-hidden="true">›</span>

        <Link href="/works">
          作品一覧
        </Link>

        <span aria-hidden="true">›</span>

        <Link href={`/works/${work.id}`}>
          {work.title}
        </Link>

        <span aria-hidden="true">›</span>

        <Link
          href={`/works/${work.id}/volumes/${volume.id}`}
        >
          {volume.volume_label}
        </Link>

        <span aria-hidden="true">›</span>

        <span>{entry.heading}</span>
      </nav>

      {/* 記事ヘッダー */}
      <header
        style={{
          paddingBottom: '32px',
          marginBottom: '48px',
          borderBottom:
            '1px solid #d8d2c7',
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
            href={`/works/${work.id}`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {work.title}
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
            href={`/works/${work.id}/volumes/${volume.id}`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {volume.volume_label}
          </Link>
        </div>

        {region && (
          <div
            style={{
              marginBottom: '14px',
            }}
          >
            <Link
              href={`/regions/${region.slug}`}
              style={{
                display: 'inline-block',
                padding: '5px 10px',
                border:
                  '1px solid #d3ccc0',
                borderRadius: '999px',
                background: '#faf8f3',
                color: '#6c645a',
                fontSize: '0.76rem',
                textDecoration: 'none',
              }}
            >
              地域：{region.title}
            </Link>
          </div>
        )}

        <h1
          style={{
            margin: 0,
            fontSize: '2.5rem',
            lineHeight: 1.35,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          {entry.heading}
        </h1>

        {entry.reading && (
          <div
            style={{
              marginTop: '8px',
              color: '#888',
              fontSize: '0.95rem',
              letterSpacing: '0.04em',
            }}
          >
            {entry.reading}
          </div>
        )}
      </header>

      {/* ページ内目次 */}
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

        {currentPlace?.translation &&
          currentPlace.translation.length > 0 && (
            <>
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
            </>
          )}

        <span
          aria-hidden="true"
          style={{ color: '#b2aaa0' }}
        >
          ／
        </span>

        {historicalImages.length > 0 && (
          <>
            <span
              aria-hidden="true"
              style={{ color: '#b2aaa0' }}
            >
              ／
            </span>

            <a
              href="#historical-images"
              style={{
                color: '#575149',
                textDecoration: 'none',
                fontSize: '0.88rem',
              }}
            >
              歴史画像
            </a>
          </>
        )}

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

        {historicalImages.length > 0 &&
          currentGalleryItems.length > 0 && (
            <>
              <span
                aria-hidden="true"
                style={{ color: '#b2aaa0' }}
              >
                ／
              </span>

              <a
                href="#visual-comparison"
                style={{
                  color: '#575149',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                }}
              >
                画像で比較
              </a>
            </>
          )}

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

      {/* 原文 */}
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
            border:
              '1px solid #9c927f',
            padding: '5px',
            background: '#f8f5ed',
          }}
        >
          <div
            className="historical-text-body"
            style={{
              border:
                '1px solid #c8bda9',
              padding: '34px 38px',
              background: '#fbf8f0',
              fontFamily:
                '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "Noto Serif JP", serif',
              fontSize: '1.02rem',
              lineHeight: 2.05,
              letterSpacing: '0.02em',
            }}
          >
            {items?.map((item) => {
              if (
                item.item_type ===
                'description'
              ) {
                return (
                  <div
                    key={item.id}
                    className="historical-text-block"
                    style={{
                      marginTop:
                        '28px',
                      marginBottom:
                        '28px',
                      whiteSpace:
                        'pre-wrap',
                    }}
                  >
                    {item.heading && (
                      <h3
                        style={{
                          margin:
                            '0 0 12px',
                          fontSize:
                            '1.15rem',
                          fontWeight:
                            600,
                          letterSpacing:
                            '0.08em',
                          fontFamily:
                            'inherit',
                        }}
                      >
                        {
                          item.heading
                        }
                      </h3>
                    )}

                    <div>
                      {item.raw_text}
                    </div>
                  </div>
                )
              }

              if (
                item.depth === 1 &&
                item.heading &&
                item.raw_text.trim() ===
                  item.heading.trim()
              ) {
                return (
                  <h3
                    key={item.id}
                    className="historical-text-subheading"
                    style={{
                      marginTop:
                        '42px',
                      marginBottom:
                        '20px',
                      paddingBottom:
                        '8px',
                      borderBottom:
                        '1px solid #cfc5b4',
                      fontSize:
                        '1.18rem',
                      fontWeight: 600,
                      letterSpacing:
                        '0.08em',
                      fontFamily:
                        'inherit',
                    }}
                  >
                    {item.heading}
                  </h3>
                )
              }

              if (item.depth === 2) {
                const heading =
                  item.heading?.trim()

                let body =
                  item.raw_text

                if (
                  heading &&
                  body.startsWith(
                    heading
                  )
                ) {
                  body = body.slice(
                    heading.length
                  )
                }

                return (
                  <div
                    key={item.id}
                    className="historical-text-depth2"
                    style={{
                      marginLeft:
                        '24px',
                      marginTop:
                        '18px',
                      marginBottom:
                        '18px',
                      paddingLeft:
                        '18px',
                      borderLeft:
                        '1px solid #b8ad99',
                    }}
                  >
                    {heading && (
                      <strong>
                        {heading}
                      </strong>
                    )}

                    <span
                      style={{
                        whiteSpace:
                          'pre-wrap',
                      }}
                    >
                      {body}
                    </span>
                  </div>
                )
              }

              const heading =
                item.heading?.trim()

              let body =
                item.raw_text

              if (
                heading &&
                body.startsWith(heading)
              ) {
                body = body.slice(
                  heading.length
                )
              }

              return (
                <div
                  key={item.id}
                  className="historical-text-block"
                  style={{
                    marginTop: '26px',
                    marginBottom:
                      '26px',
                  }}
                >
                  {heading && (
                    <strong>
                      {heading}
                    </strong>
                  )}

                  <span
                    style={{
                      whiteSpace:
                        'pre-wrap',
                    }}
                  >
                    {body}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      {/* 現代語訳 */}
      {currentPlace?.translation &&
        currentPlace.translation.length > 0 && (
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
              {currentPlace.translation.map((item, index) => (
                <article
                  key={`${item.title ?? 'translation'}-${index}`}
                  style={{
                    marginTop: index === 0 ? 0 : '32px',
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
              ))}
            </div>
          </section>
        )}
      {/* 歴史画像 */}
      {historicalImages.length > 0 && (
        <section
          id="historical-images"
          style={{
            marginTop: '64px',
            paddingTop: '40px',
            borderTop:
              '1px solid #d7cdbb',
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
              歴史画像
            </h2>

            <div
              style={{
                flex: 1,
                height: '1px',
                background: '#d7cdbb',
              }}
            />
          </div>

          <div
            style={{
              padding: '30px',
              border:
                '1px solid #d7cdbb',
              borderRadius: '10px',
              background: '#faf6ed',
            }}
          >
            <MediaGallery
              items={
                historicalGalleryItems
              }
            />
          </div>
        </section>
      )}

      {/* 現在の姿 */}
      <section
        id="current"
        style={{
          marginTop: '64px',
          paddingTop: '40px',
          borderTop:
            '1px solid #c8d4d0',
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

        {currentPlace ? (
          <div
            style={{
              padding: '32px',
              border:
                '1px solid #b8cbc5',
              borderRadius: '10px',
              background: '#f1f7f5',
            }}
          >
            {/* 基本情報 */}
            <div>
              <h3
                style={{
                  margin: '0 0 12px',
                  fontSize: '1.3rem',
                  lineHeight: 1.5,
                }}
              >
                {
                  currentPlace.currentName
                }
              </h3>

              {currentPlace.address && (
                <div
                  style={{
                    marginBottom:
                      '18px',
                    color: '#596964',
                    fontSize:
                      '0.93rem',
                  }}
                >
                  <strong
                    style={{
                      marginRight:
                        '10px',
                    }}
                  >
                    所在地
                  </strong>

                  {googleMapsSearchUrl ? (
                    <a
                      href={googleMapsSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#445b54',
                        textUnderlineOffset: '3px',
                      }}
                    >
                      {currentPlace.address}
                    </a>
                  ) : (
                    currentPlace.address
                  )}
                </div>
              )}

              {currentPlace.description && (
                <p
                  style={{
                    margin: 0,
                    whiteSpace:
                      'pre-wrap',
                  }}
                >
                  {
                    currentPlace.description
                  }
                </p>
              )}

              {currentPlace.address &&
                googleMapsEmbedUrl && (
                  <div
                    style={{
                      marginTop: '24px',
                    }}
                  >
                    <iframe
                      title={`${currentPlace.currentName}の地図`}
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

                    {googleMapsSearchUrl && (
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
                    )}
                  </div>
                )}
            </div>

            {/* 写真 */}
            {currentGalleryItems.length >
              0 && (
              <div
                style={{
                  marginTop: '32px',
                  paddingTop: '28px',
                  borderTop:
                    '1px solid #cbd8d4',
                }}
              >
                <h3
                  style={{
                    margin:
                      '0 0 20px',
                    fontSize:
                      '1.15rem',
                  }}
                >
                  現地写真
                </h3>

                <MediaGallery
                  items={
                    currentGalleryItems
                  }
                />
              </div>
            )}

            {/* 関連文献 */}
            {currentPlace.documents &&
              currentPlace.documents
                .length > 0 && (
                <div
                  style={{
                    marginTop:
                      '32px',
                    paddingTop:
                      '28px',
                    borderTop:
                      '1px solid #cbd8d4',
                  }}
                >
                  <h3
                    style={{
                      margin:
                        '0 0 20px',
                      fontSize:
                        '1.15rem',
                    }}
                  >
                    関連文献・資料
                  </h3>

                  <div
                    style={{
                      display:
                        'grid',
                      gap: '18px',
                    }}
                  >
                    {currentPlace.documents.map(
                      (
                        document,
                        index
                      ) => (
                        <article
                          key={`${document.title}-${index}`}
                          style={{
                            padding:
                              '22px 24px',
                            border:
                              '1px solid #d5dedb',
                            borderRadius:
                              '8px',
                            background:
                              '#ffffff',
                          }}
                        >
                          <h4
                            style={{
                              margin:
                                '0 0 12px',
                              fontSize:
                                '1.05rem',
                            }}
                          >
                            {
                              document.title
                            }
                          </h4>

                          <div
                            style={{
                              whiteSpace:
                                'pre-wrap',
                              lineHeight:
                                1.9,
                            }}
                          >
                            {
                              document.text
                            }
                          </div>

                          {document.source && (
                            <div
                              style={{
                                marginTop:
                                  '14px',
                                paddingTop:
                                  '10px',
                                borderTop:
                                  '1px solid #eee',
                                color:
                                  '#777',
                                fontSize:
                                  '0.85rem',
                              }}
                            >
                              出典：
                              {
                                document.source
                              }
                            </div>
                          )}

                          {document.url && (
                            <div
                              style={{
                                marginTop:
                                  '10px',
                              }}
                            >
                              <a
                                href={
                                  document.url
                                }
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
              )}
          </div>
        ) : (
          <div
            style={{
              padding: '28px 32px',
              border:
                '1px solid #b8cbc5',
              borderRadius: '10px',
              background: '#f1f7f5',
            }}
          >
            現在の情報は未登録です。
          </div>
        )}
      </section>

      {/* 画像で比較 */}
      {historicalImages.length > 0 &&
        currentGalleryItems.length > 0 && (
          <section
            id="visual-comparison"
            style={{
              marginTop: '64px',
              paddingTop: '40px',
              borderTop:
                '1px solid #d8d2c7',
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
                画像で今昔を比較
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
                margin:
                  '0 0 22px',
                color: '#6d665d',
                fontSize: '0.9rem',
              }}
            >
              登録されている歴史画像と現地写真の先頭画像を並べています。
              画像をクリックすると拡大できます。
            </p>

            <MediaGallery
              items={
                visualComparisonItems
              }
            />
          </section>
        )}

      {/* 名所図会との比較 */}
      <section
        id="comparison"
        style={{
          marginTop: '64px',
          paddingTop: '40px',
          borderTop:
            '1px solid #d8d2c7',
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

        {currentPlace?.comparison &&
        currentPlace.comparison.length >
          0 ? (
          <div
            style={{
              padding: '32px',
              border:
                '1px solid #d8d2c7',
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
              {currentPlace.comparison.map(
                (
                  comparison,
                  index
                ) => (
                  <article
                    key={`${comparison.title}-${index}`}
                    style={{
                      padding:
                        '22px 24px',
                      border:
                        '1px solid #ded8ce',
                      borderRadius:
                        '8px',
                      background:
                        '#fffdf8',
                    }}
                  >
                    <h3
                      style={{
                        margin:
                          '0 0 12px',
                        fontSize:
                          '1.1rem',
                      }}
                    >
                      {
                        comparison.title
                      }
                    </h3>

                    <div
                      style={{
                        whiteSpace:
                          'pre-wrap',
                      }}
                    >
                      {
                        comparison.text
                      }
                    </div>

                    {comparison.source && (
                      <div
                        style={{
                          marginTop:
                            '14px',
                          paddingTop:
                            '10px',
                          borderTop:
                            '1px solid #ece7dd',
                          color: '#777',
                          fontSize:
                            '0.85rem',
                        }}
                      >
                        出典：
                        {
                          comparison.source
                        }
                      </div>
                    )}

                    {comparison.url && (
                      <div
                        style={{
                          marginTop:
                            '10px',
                        }}
                      >
                        <a
                          href={
                            comparison.url
                          }
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
        ) : (
          <div
            style={{
              padding: '28px 32px',
              border:
                '1px solid #d8d2c7',
              borderRadius: '10px',
              background: '#f7f4ee',
              color: '#777',
            }}
          >
            比較情報はまだ登録されていません。
          </div>
        )}
      </section>

      {/* 同じ地域の名所 */}
      {region &&
        relatedRegionEntries.length > 0 && (
          <section
            style={{
              marginTop: '64px',
              paddingTop: '40px',
              borderTop:
                '1px solid #d8d2c7',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: '16px',
                marginBottom: '22px',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.35rem',
                  letterSpacing:
                    '0.06em',
                }}
              >
                同じ地域の名所
              </h2>

              <Link
                href={`/regions/${region.slug}`}
                style={{
                  color: '#65716d',
                  fontSize: '0.82rem',
                  textDecoration:
                    'none',
                }}
              >
                {region.title}一覧 →
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              {relatedRegionEntries.map(
                (
                  relatedEntry
                ) => (
                  <Link
                    key={
                      relatedEntry.id
                    }
                    href={`/meisho/${relatedEntry.id}`}
                    style={{
                      padding:
                        '16px 18px',
                      border:
                        '1px solid #ded8ce',
                      borderRadius:
                        '8px',
                      background:
                        '#fffdf8',
                      color:
                        '#292722',
                      textDecoration:
                        'none',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    >
                      {
                        relatedEntry.heading
                      }
                    </div>

                    {relatedEntry.reading && (
                      <div
                        style={{
                          marginTop:
                            '4px',
                          color:
                            '#918981',
                          fontSize:
                            '0.76rem',
                        }}
                      >
                        {
                          relatedEntry.reading
                        }
                      </div>
                    )}
                  </Link>
                )
              )}
            </div>
          </section>
        )}

      {/* 前後の名所 */}
      {(previousEntry || nextEntry) && (
        <nav
          aria-label="前後の名所"
          style={{
            marginTop: '64px',
            paddingTop: '32px',
            borderTop: '1px solid #d8d2c7',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            {previousEntry ? (
              <Link
                href={`/meisho/${previousEntry.id}`}
                style={{
                  flex: '1 1 280px',
                  padding: '20px 22px',
                  border: '1px solid #d8d2c7',
                  borderRadius: '8px',
                  color: '#292722',
                  textDecoration: 'none',
                  background: '#fffdf8',
                }}
              >
                <div
                  style={{
                    marginBottom: '6px',
                    color: '#888',
                    fontSize: '0.82rem',
                  }}
                >
                  ← 前の名所
                </div>

                <div
                  style={{
                    marginBottom: '5px',
                    color: '#8d857a',
                    fontSize: '0.78rem',
                  }}
                >
                  {previousEntry.workTitle}
                  {' ／ '}
                  {previousEntry.volumeLabel}
                </div>

                <strong
                  style={{
                    fontSize: '1.05rem',
                  }}
                >
                  {previousEntry.heading}
                </strong>
              </Link>
            ) : (
              <div
                style={{
                  flex: '1 1 280px',
                }}
              />
            )}

            {nextEntry ? (
              <Link
                href={`/meisho/${nextEntry.id}`}
                style={{
                  flex: '1 1 280px',
                  padding: '20px 22px',
                  border: '1px solid #d8d2c7',
                  borderRadius: '8px',
                  color: '#292722',
                  textDecoration: 'none',
                  background: '#fffdf8',
                  textAlign: 'right',
                }}
              >
                <div
                  style={{
                    marginBottom: '6px',
                    color: '#888',
                    fontSize: '0.82rem',
                  }}
                >
                  次の名所 →
                </div>

                <div
                  style={{
                    marginBottom: '5px',
                    color: '#8d857a',
                    fontSize: '0.78rem',
                  }}
                >
                  {nextEntry.workTitle}
                  {' ／ '}
                  {nextEntry.volumeLabel}
                </div>

                <strong
                  style={{
                    fontSize: '1.05rem',
                  }}
                >
                  {nextEntry.heading}
                </strong>
              </Link>
            ) : (
              <div
                style={{
                  flex: '1 1 280px',
                }}
              />
            )}
          </div>
        </nav>
      )}
    </main>
  )
}
