import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '../../src/lib/supabase'
import { currentPlaces } from '../../src/data/currentPlaces'

export const metadata: Metadata = {
  title: '名所一覧',
  description:
    '名所図会に記された場所を、作品・巻ごとに一覧でたどります。原文、現代の姿、関連史料、現地写真を掲載しています。',
  alternates: {
    canonical: '/meisho',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/meisho',
    siteName: '名所図会 今昔',
    title: '名所一覧',
    description:
      '名所図会に記された場所を、作品・巻ごとに一覧でたどります。',
  },
  twitter: {
    card: 'summary_large_image',
    title: '名所一覧 | 名所図会 今昔',
    description:
      '名所図会に記された場所を、作品・巻ごとに一覧でたどります。',
  },
}

export default async function MeishoListPage() {
  const entryIds = Object.keys(currentPlaces)
    .map(Number)
    .filter(Number.isInteger)

  if (entryIds.length === 0) {
    return (
      <main
        style={{
          maxWidth: '1050px',
          margin: '0 auto',
          padding: '64px 24px 96px',
          color: '#292722',
        }}
      >
        <header
          style={{
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

        <div
          style={{
            marginTop: '40px',
            padding: '28px 30px',
            border: '1px solid #ddd7cd',
            borderRadius: '10px',
            background: '#fffdf9',
            color: '#777',
          }}
        >
          まだ公開中の記事はありません。
        </div>
      </main>
    )
  }

  // ------------------------------
  // 公開中の記事
  // ------------------------------

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
    .in('id', entryIds)

  if (entriesError || !entries) {
    return (
      <main
        style={{
          maxWidth: '1050px',
          margin: '0 auto',
          padding: '64px 24px 96px',
        }}
      >
        <h1>一覧取得エラー</h1>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
          }}
        >
          {entriesError?.message}
        </pre>
      </main>
    )
  }

  // ------------------------------
  // 作品・巻
  // ------------------------------

  const workIds = [
    ...new Set(
      entries
        .map((entry) => entry.work_id)
        .filter(
          (id): id is number =>
            typeof id === 'number'
        )
    ),
  ]

  const volumeIds = [
    ...new Set(
      entries
        .map((entry) => entry.volume_id)
        .filter(
          (id): id is number =>
            typeof id === 'number'
        )
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
      author,
      editor,
      illustrator,
      published_year,
      region
    `)
    .in('id', workIds)

  if (worksError) {
    return (
      <main
        style={{
          maxWidth: '1050px',
          margin: '0 auto',
          padding: '64px 24px 96px',
        }}
      >
        <h1>作品情報取得エラー</h1>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
          }}
        >
          {worksError.message}
        </pre>
      </main>
    )
  }

  const {
    data: volumes,
    error: volumesError,
  } = await supabase
    .from('volumes')
    .select(`
      id,
      work_id,
      volume_no,
      volume_label
    `)
    .in('id', volumeIds)

  if (volumesError) {
    return (
      <main
        style={{
          maxWidth: '1050px',
          margin: '0 auto',
          padding: '64px 24px 96px',
        }}
      >
        <h1>巻情報取得エラー</h1>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
          }}
        >
          {volumesError.message}
        </pre>
      </main>
    )
  }

  // ------------------------------
  // 検索用Map
  // ------------------------------

  const workMap = new Map(
    (works ?? []).map((work) => [
      work.id,
      work,
    ])
  )

  const volumeMap = new Map(
    (volumes ?? []).map((volume) => [
      volume.id,
      volume,
    ])
  )

  // ------------------------------
  // 作品 → 巻 → 名所 の順に並べる
  // ------------------------------

  const sortedEntries = [...entries].sort(
    (a, b) => {
      const workCompare =
        a.work_id - b.work_id

      if (workCompare !== 0) {
        return workCompare
      }

      const aVolume =
        typeof a.volume_id === 'number'
          ? volumeMap.get(a.volume_id)
          : undefined

      const bVolume =
        typeof b.volume_id === 'number'
          ? volumeMap.get(b.volume_id)
          : undefined

      const aVolumeNo =
        aVolume?.volume_no ??
        Number.MAX_SAFE_INTEGER

      const bVolumeNo =
        bVolume?.volume_no ??
        Number.MAX_SAFE_INTEGER

      if (aVolumeNo !== bVolumeNo) {
        return aVolumeNo - bVolumeNo
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
    }
  )

  // ------------------------------
  // 作品 → 巻 → 名所 にグループ化
  // ------------------------------

  const grouped = new Map<
    number,
    Map<number | null, typeof sortedEntries>
  >()

  for (const entry of sortedEntries) {
    if (!grouped.has(entry.work_id)) {
      grouped.set(
        entry.work_id,
        new Map()
      )
    }

    const workGroup =
      grouped.get(entry.work_id)!

    if (!workGroup.has(entry.volume_id)) {
      workGroup.set(
        entry.volume_id,
        []
      )
    }

    workGroup
      .get(entry.volume_id)!
      .push(entry)
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
        {/* ページヘッダー */}

        <header
          style={{
            marginBottom: '42px',
            paddingBottom: '32px',
            borderBottom:
              '1px solid #d8d3c8',
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
              fontSize:
                'clamp(2.1rem, 6vw, 3.2rem)',
              lineHeight: 1.3,
              fontWeight: 500,
              letterSpacing: '0.06em',
            }}
          >
            名所をたどる
          </h1>

          <p
            style={{
              margin: '18px 0 0',
              maxWidth: '720px',
              color: '#686159',
              fontSize: '0.98rem',
              lineHeight: 1.95,
            }}
          >
            名所図会に記された場所を、
            作品・巻の順に一覧で掲載しています。
            原文から現在の姿、関連史料、現地写真へとたどることができます。
          </p>
        </header>

        {/* 概要 */}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '54px',
          }}
        >
          <div
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd7cc',
              borderRadius: '999px',
              background: '#fff',
              color: '#696158',
              fontSize: '0.84rem',
            }}
          >
            公開名所
            <strong
              style={{
                marginLeft: '7px',
                color: '#292722',
              }}
            >
              {entries.length}
            </strong>
            件
          </div>

          <div
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd7cc',
              borderRadius: '999px',
              background: '#fff',
              color: '#696158',
              fontSize: '0.84rem',
            }}
          >
            公開作品
            <strong
              style={{
                marginLeft: '7px',
                color: '#292722',
              }}
            >
              {grouped.size}
            </strong>
            作品
          </div>
        </div>

        {/* 作品別 */}

        {[...grouped.entries()].map(
          ([workId, volumeGroups]) => {
            const work =
              workMap.get(workId)

            const workEntryCount =
              [...volumeGroups.values()]
                .reduce(
                  (
                    total,
                    groupEntries
                  ) =>
                    total +
                    groupEntries.length,
                  0
                )

            return (
              <section
                key={workId}
                style={{
                  marginBottom: '84px',
                }}
              >
                {/* 作品情報 */}

                <div
                  style={{
                    marginBottom: '36px',
                    padding:
                      '28px 30px 26px',
                    border:
                      '1px solid #d7d0c4',
                    borderRadius: '10px',
                    background: '#f6f2e9',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'flex-end',
                      justifyContent:
                        'space-between',
                      gap: '18px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          marginBottom: '5px',
                          color: '#928877',
                          fontSize: '0.75rem',
                          letterSpacing:
                            '0.12em',
                        }}
                      >
                        WORK
                      </div>

                      <h2
                        style={{
                          margin: 0,
                          fontFamily:
                            '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
                          fontSize:
                            'clamp(1.6rem, 5vw, 2.15rem)',
                          lineHeight: 1.4,
                          fontWeight: 600,
                          letterSpacing:
                            '0.06em',
                        }}
                      >
                        {work?.title ??
                          `作品 ${workId}`}
                      </h2>
                    </div>

                    <div
                      style={{
                        color: '#7c7469',
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {workEntryCount}件公開
                    </div>
                  </div>

                  {work && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px 20px',
                        marginTop: '16px',
                        paddingTop: '15px',
                        borderTop:
                          '1px solid #ded7cb',
                        color: '#746c62',
                        fontSize: '0.83rem',
                      }}
                    >
                      {work.author && (
                        <span>
                          著：{work.author}
                        </span>
                      )}

                      {work.editor && (
                        <span>
                          編：{work.editor}
                        </span>
                      )}

                      {work.illustrator && (
                        <span>
                          画：{work.illustrator}
                        </span>
                      )}

                      {work.published_year && (
                        <span>
                          {work.published_year}
                        </span>
                      )}

                      {work.region && (
                        <span>
                          地域：{work.region}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 巻別 */}

                {[...volumeGroups.entries()]
                  .sort(
                    ([aId], [bId]) => {
                      const a =
                        typeof aId ===
                        'number'
                          ? volumeMap.get(
                              aId
                            )
                          : undefined

                      const b =
                        typeof bId ===
                        'number'
                          ? volumeMap.get(
                              bId
                            )
                          : undefined

                      return (
                        (a?.volume_no ??
                          Number.MAX_SAFE_INTEGER) -
                        (b?.volume_no ??
                          Number.MAX_SAFE_INTEGER)
                      )
                    }
                  )
                  .map(
                    ([
                      volumeId,
                      volumeEntries,
                    ]) => {
                      const volume =
                        typeof volumeId ===
                        'number'
                          ? volumeMap.get(
                              volumeId
                            )
                          : undefined

                      return (
                        <section
                          key={
                            volumeId ??
                            'no-volume'
                          }
                          style={{
                            marginBottom:
                              '52px',
                          }}
                        >
                          {/* 巻名 */}

                          <div
                            style={{
                              display: 'flex',
                              alignItems:
                                'center',
                              gap: '14px',
                              marginBottom:
                                '22px',
                            }}
                          >
                            <h3
                              style={{
                                margin: 0,
                                fontSize:
                                  '1.25rem',
                                fontWeight:
                                  600,
                                letterSpacing:
                                  '0.07em',
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {volume?.volume_label ??
                                '巻未設定'}
                            </h3>

                            <div
                              style={{
                                flex: 1,
                                height: '1px',
                                background:
                                  '#ddd7cc',
                              }}
                            />

                            <span
                              style={{
                                color:
                                  '#999188',
                                fontSize:
                                  '0.8rem',
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {
                                volumeEntries.length
                              }
                              件
                            </span>
                          </div>

                          {/* 名所カード */}

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                'repeat(auto-fit, minmax(280px, 1fr))',
                              gap: '20px',
                            }}
                          >
                            {volumeEntries.map(
                              (entry) => {
                                const currentPlace =
                                  currentPlaces[
                                    entry.id
                                  ]

                                const photo =
                                  currentPlace
                                    ?.photos?.[0]

                                return (
                                  <Link
                                    key={
                                      entry.id
                                    }
                                    href={`/meisho/${entry.id}`}
                                    style={{
                                      display:
                                        'block',
                                      height:
                                        '100%',
                                      color:
                                        'inherit',
                                      textDecoration:
                                        'none',
                                    }}
                                  >
                                    <article
                                      style={{
                                        display:
                                          'flex',
                                        flexDirection:
                                          'column',
                                        height:
                                          '100%',
                                        boxSizing:
                                          'border-box',
                                        overflow:
                                          'hidden',
                                        border:
                                          '1px solid #ddd8ce',
                                        borderRadius:
                                          '10px',
                                        background:
                                          '#fff',
                                      }}
                                    >
                                      {photo && (
                                        <div
                                          style={{
                                            aspectRatio:
                                              '16 / 9',
                                            overflow:
                                              'hidden',
                                            background:
                                              '#eee9e0',
                                          }}
                                        >
                                          <img
                                            src={
                                              photo.url
                                            }
                                            alt={
                                              photo.alt ||
                                              photo.caption ||
                                              currentPlace?.currentName ||
                                              entry.heading
                                            }
                                            loading="lazy"
                                            style={{
                                              display:
                                                'block',
                                              width:
                                                '100%',
                                              height:
                                                '100%',
                                              objectFit:
                                                'cover',
                                            }}
                                          />
                                        </div>
                                      )}

                                      <div
                                        style={{
                                          display:
                                            'flex',
                                          flexDirection:
                                            'column',
                                          flex: 1,
                                          padding:
                                            '23px 24px 22px',
                                        }}
                                      >
                                        <div
                                          style={{
                                            marginBottom:
                                              '12px',
                                            color:
                                              '#aaa198',
                                            fontSize:
                                              '0.73rem',
                                            letterSpacing:
                                              '0.06em',
                                          }}
                                        >
                                          {entry.entry_order !=
                                          null
                                            ? `第${entry.entry_order}項`
                                            : '名所'}
                                        </div>

                                        <h4
                                          style={{
                                            margin:
                                              '0 0 5px',
                                            fontFamily:
                                              '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
                                            fontSize:
                                              '1.35rem',
                                            lineHeight:
                                              1.5,
                                            fontWeight:
                                              600,
                                            letterSpacing:
                                              '0.03em',
                                          }}
                                        >
                                          {
                                            entry.heading
                                          }
                                        </h4>

                                        {entry.reading && (
                                          <div
                                            style={{
                                              color:
                                                '#918981',
                                              fontSize:
                                                '0.82rem',
                                            }}
                                          >
                                            {
                                              entry.reading
                                            }
                                          </div>
                                        )}

                                        {currentPlace?.currentName &&
                                          currentPlace.currentName !==
                                            entry.heading && (
                                            <div
                                              style={{
                                                marginTop:
                                                  '17px',
                                                paddingTop:
                                                  '14px',
                                                borderTop:
                                                  '1px solid #eeeae2',
                                                fontSize:
                                                  '0.9rem',
                                                lineHeight:
                                                  1.65,
                                              }}
                                            >
                                              <span
                                                style={{
                                                  marginRight:
                                                    '8px',
                                                  color:
                                                    '#8e867c',
                                                  fontSize:
                                                    '0.78rem',
                                                }}
                                              >
                                                現在
                                              </span>

                                              {
                                                currentPlace.currentName
                                              }
                                            </div>
                                          )}

                                        {currentPlace?.description && (
                                          <p
                                            style={{
                                              margin:
                                                '14px 0 0',
                                              color:
                                                '#6c655d',
                                              fontSize:
                                                '0.86rem',
                                              lineHeight:
                                                1.75,
                                            }}
                                          >
                                            {
                                              currentPlace.description
                                            }
                                          </p>
                                        )}

                                        <div
                                          style={{
                                            marginTop:
                                              'auto',
                                            paddingTop:
                                              '22px',
                                            color:
                                              '#565f5b',
                                            fontSize:
                                              '0.84rem',
                                            fontWeight:
                                              600,
                                          }}
                                        >
                                          記事を見る
                                          →
                                        </div>
                                      </div>
                                    </article>
                                  </Link>
                                )
                              }
                            )}
                          </div>
                        </section>
                      )
                    }
                  )}
              </section>
            )
          }
        )}

        <div
          style={{
            paddingTop: '10px',
            textAlign: 'center',
          }}
        >
          <Link
            href="/"
            style={{
              color: '#6c655d',
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            ← トップページへ戻る
          </Link>
        </div>
      </div>
    </main>
  )
}
