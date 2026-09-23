import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '../../../src/lib/supabase'
import { currentPlaces } from '../../../src/data/currentPlaces'

type Props = {
  params: Promise<{
    id: string
  }>
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
  // 前後の名所
  // ------------------------------

  const registeredEntryIds = Object.keys(currentPlaces)
    .map(Number)
    .filter(Number.isInteger)

  let previousEntry: {
    id: number
    heading: string
  } | null = null

  let nextEntry: {
    id: number
    heading: string
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

      const {
        data: navigationVolumes,
      } = await supabase
        .from('volumes')
        .select(`
          id,
          volume_no
        `)
        .in('id', volumeIds)

      const volumeNoMap = new Map(
        (navigationVolumes ?? []).map(
          (item) => [
            item.id,
            item.volume_no ??
              Number.MAX_SAFE_INTEGER,
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
        previousEntry = {
          id: sortedEntries[
            currentIndex - 1
          ].id,
          heading:
            sortedEntries[
              currentIndex - 1
            ].heading,
        }
      }

      if (
        currentIndex !== -1 &&
        currentIndex <
          sortedEntries.length - 1
      ) {
        nextEntry = {
          id: sortedEntries[
            currentIndex + 1
          ].id,
          heading:
            sortedEntries[
              currentIndex + 1
            ].heading,
        }
      }
    }
  }

  return (
      <main
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '40px 24px 96px',
        lineHeight: 1.95,
        color: '#292722',
      }}
    >
      {/* 一覧へ戻る */}
      <div
        style={{
          marginBottom: '32px',
        }}
      >
        <Link
          href="/meisho"
          style={{
            color: '#777',
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          ← 名所一覧
        </Link>
      </div>

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
          <span>{work.title}</span>

          <span
            style={{
              margin: '0 10px',
              color: '#aaa',
            }}
          >
            ／
          </span>

          <span>
            {volume.volume_label}
          </span>
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

      {/* 原文 */}
      <section>
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
          style={{
            border:
              '1px solid #9c927f',
            padding: '5px',
            background: '#f8f5ed',
          }}
        >
          <div
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
      {/* 現在の姿 */}
      <section
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

                  {
                    currentPlace.address
                  }
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
            </div>

            {/* 写真 */}
            {currentPlace.photos.length >
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

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {currentPlace.photos.map(
                    (
                      photo,
                      index
                    ) => (
                      <figure
                        key={`${photo.url}-${index}`}
                        style={{
                          margin: 0,
                        }}
                      >
                        <img
                          src={
                            photo.url
                          }
                          alt={
                            photo.alt ||
                            photo.caption ||
                            `${currentPlace.currentName} ${index + 1}`
                          }
                          style={{
                            width:
                              '100%',
                            height:
                              'auto',
                            display:
                              'block',
                            borderRadius:
                              '6px',
                          }}
                        />

                        {(photo.caption ||
                          photo.takenAt ||
                          photo.direction ||
                          photo.credit ||
                          photo.sourceUrl) && (
                          <figcaption
                            style={{
                              marginTop:
                                '10px',
                              color:
                                '#66716d',
                              fontSize:
                                '0.85rem',
                              lineHeight:
                                1.7,
                            }}
                          >
                            {photo.caption && (
                              <div>
                                {
                                  photo.caption
                                }
                              </div>
                            )}

                            {photo.takenAt && (
                              <div>
                                撮影日：
                                {
                                  photo.takenAt
                                }
                              </div>
                            )}

                            {photo.direction && (
                              <div>
                                撮影方向：
                                {
                                  photo.direction
                                }
                              </div>
                            )}

                            {photo.credit && (
                              <div>
                                撮影・提供：
                                {
                                  photo.credit
                                }
                              </div>
                            )}

                            {photo.sourceUrl && (
                              <div>
                                <a
                                  href={
                                    photo.sourceUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  写真出典
                                </a>
                              </div>
                            )}
                          </figcaption>
                        )}
                      </figure>
                    )
                  )}
                </div>
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

      {/* 名所図会との比較 */}
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
