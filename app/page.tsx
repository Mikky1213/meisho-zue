import Link from 'next/link'
import { supabase } from '../src/lib/supabase'
import { currentPlaces } from '../src/data/currentPlaces'

const heroImageUrl =
  'https://ik.imagekit.io/meisho/site/edo-meisho-zue.png?tr=w-2000,f-webp,q-85'

export default async function Home() {
  const registeredEntryIds = Object.keys(currentPlaces)
    .map(Number)
    .filter(Number.isInteger)

  let entries: {
    id: number
    work_id: number
    volume_id: number | null
    entry_order: number | null
    heading: string
    reading: string | null
  }[] = []

  let entriesError: {
    message: string
  } | null = null

  if (registeredEntryIds.length > 0) {
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
      .in('id', registeredEntryIds)

    entries = result.data ?? []
    entriesError = result.error
  }

  const workIds = [
    ...new Set(
      entries.map((entry) => entry.work_id)
    ),
  ]

  const volumeIds = [
    ...new Set(
      entries
        .map((entry) => entry.volume_id)
        .filter(
          (id): id is number => id !== null
        )
    ),
  ]

  let works: {
    id: number
    title: string
    author: string | null
    illustrator: string | null
    published_year: string | null
    region: string | null
  }[] = []

  if (workIds.length > 0) {
    const result = await supabase
      .from('works')
      .select(`
        id,
        title,
        author,
        illustrator,
        published_year,
        region
      `)
      .in('id', workIds)

    works = result.data ?? []
  }

  let volumes: {
    id: number
    work_id: number
    volume_no: number | null
    volume_label: string | null
  }[] = []

  if (volumeIds.length > 0) {
    const result = await supabase
      .from('volumes')
      .select(`
        id,
        work_id,
        volume_no,
        volume_label
      `)
      .in('id', volumeIds)

    volumes = result.data ?? []
  }

  const volumeMap = new Map(
    volumes.map((volume) => [
      volume.id,
      volume,
    ])
  )

  const sortedWorks = [...works].sort(
    (a, b) => a.id - b.id
  )

  const sortedEntries = [...entries].sort(
    (a, b) => {
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

      const aOrder =
        a.entry_order ??
        Number.MAX_SAFE_INTEGER

      const bOrder =
        b.entry_order ??
        Number.MAX_SAFE_INTEGER

      if (aOrder !== bOrder) {
        return aOrder - bOrder
      }

      return a.id - b.id
    }
  )

  return (
    <main
      style={{
        minHeight: '100vh',
        color: '#292722',
        background: '#fff',
      }}
    >
      {/* SEO用H1 */}
      <h1
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        名所図会 今昔
      </h1>

      {/* ==============================
          メインビジュアル
      ============================== */}

      <section
        style={{
          width: '100%',
          background: '#eee5d3',
        }}
      >
        <Link
          href="/meisho"
          aria-label="名所一覧を見る"
          style={{
            display: 'block',
            width: '100%',
            textDecoration: 'none',
          }}
        >
          <img
            src={heroImageUrl}
            alt="名所図会 今昔。名所図会の原文と現在の風景をたどる"
            fetchPriority="high"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              margin: 0,
            }}
          />
        </Link>
      </section>

      {/* ==============================
          サイト説明
      ============================== */}

      <section
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '64px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              marginBottom: '18px',
              color: '#897d6b',
              fontSize: '0.82rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
            }}
          >
            MEISHO ZUE ARCHIVE
          </div>

          <h2
            style={{
              margin: 0,
              fontFamily:
                '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
              fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
              fontWeight: 500,
              lineHeight: 1.5,
              letterSpacing: '0.07em',
            }}
          >
            名所図会に描かれた場所を、
            <br />
            現代の風景からたどる
          </h2>

          <div
            style={{
              width: '70px',
              height: '1px',
              margin: '26px auto',
              background: '#a69a87',
            }}
          />

          <p
            style={{
              margin: 0,
              color: '#625d55',
              fontSize: '1rem',
              lineHeight: 2,
            }}
          >
            江戸時代の名所図会に記された土地を訪ね、
            原文・現代語訳・関連史料・現地写真を通して、
            かつての名所と現在の姿を比較します。
          </p>

          <div
            style={{
              marginTop: '32px',
            }}
          >
            <Link
              href="/meisho"
              style={{
                display: 'inline-block',
                padding: '14px 30px',
                borderRadius: '5px',
                background: '#333b37',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '0.95rem',
                letterSpacing: '0.06em',
              }}
            >
              名所一覧を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* ==============================
          数字
      ============================== */}

      <section
        style={{
          borderTop: '1px solid #ded8ce',
          borderBottom: '1px solid #ded8ce',
          background: '#f8f6f1',
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            padding: '28px 24px',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '80px',
          }}
        >
          <div
            style={{
              textAlign: 'center',
            }}
          >
            <div
              style={{
                color: '#888177',
                fontSize: '0.8rem',
                marginBottom: '3px',
                letterSpacing: '0.08em',
              }}
            >
              公開名所
            </div>

            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 600,
              }}
            >
              {sortedEntries.length}
              <span
                style={{
                  marginLeft: '5px',
                  fontSize: '0.9rem',
                  fontWeight: 400,
                }}
              >
                件
              </span>
            </div>
          </div>

          <div
            style={{
              textAlign: 'center',
            }}
          >
            <div
              style={{
                color: '#888177',
                fontSize: '0.8rem',
                marginBottom: '3px',
                letterSpacing: '0.08em',
              }}
            >
              公開作品
            </div>

            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 600,
              }}
            >
              {sortedWorks.length}
              <span
                style={{
                  marginLeft: '5px',
                  fontSize: '0.9rem',
                  fontWeight: 400,
                }}
              >
                作品
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================
          このサイトについて
      ============================== */}

      <section
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '80px 24px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.55rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            名所図会を、現地から読む
          </h2>

          <div
            style={{
              flex: 1,
              height: '1px',
              background: '#d8d2c7',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px',
          }}
        >
          {[
            {
              number: '01',
              title: '原文',
              text:
                '名所図会に記された本文を、項目構造をできるだけ保ちながら掲載します。',
            },
            {
              number: '02',
              title: '現在の姿',
              text:
                '現在の所在地や現地写真を記録し、江戸時代の記述と現代の風景を結びます。',
            },
            {
              number: '03',
              title: '関連史料',
              text:
                '他の地誌や史料も参照し、同じ場所について異なる時代の記録を比較します。',
            },
            {
              number: '04',
              title: '今昔比較',
              text:
                '残ったもの、変わったもの、失われたものを史料と現地の両方から整理します。',
            },
          ].map((item) => (
            <article
              key={item.number}
              style={{
                padding: '26px',
                border: '1px solid #ddd7cd',
                borderRadius: '8px',
                background: '#fffdf9',
              }}
            >
              <div
                style={{
                  marginBottom: '18px',
                  color: '#9b907f',
                  fontSize: '0.78rem',
                  letterSpacing: '0.15em',
                }}
              >
                {item.number}
              </div>

              <h3
                style={{
                  margin: '0 0 12px',
                  fontSize: '1.15rem',
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: '#68625a',
                  lineHeight: 1.85,
                  fontSize: '0.92rem',
                }}
              >
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ==============================
          公開中の作品
      ============================== */}

      <section
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '72px 24px 96px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '34px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.55rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            公開中の名所図会
          </h2>

          <div
            style={{
              flex: 1,
              height: '1px',
              background: '#d8d2c7',
            }}
          />
        </div>

        {entriesError ? (
          <div
            style={{
              padding: '24px',
              border: '1px solid #d8bcbc',
              borderRadius: '8px',
              background: '#fff7f7',
              color: '#765555',
            }}
          >
            <strong>
              データの取得に失敗しました。
            </strong>

            <div
              style={{
                marginTop: '8px',
                fontSize: '0.85rem',
              }}
            >
              {entriesError.message}
            </div>
          </div>
        ) : sortedWorks.length === 0 ? (
          <div
            style={{
              padding: '32px',
              border: '1px solid #ddd7cd',
              borderRadius: '8px',
              background: '#fffdf9',
              color: '#777',
            }}
          >
            公開中の名所はまだありません。
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '28px',
            }}
          >
            {sortedWorks.map((work) => {
              const workEntries =
                sortedEntries.filter(
                  (entry) =>
                    entry.work_id === work.id
                )

              return (
                <article
                  key={work.id}
                  style={{
                    border: '1px solid #d6d0c5',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#fff',
                  }}
                >
                  <div
                    style={{
                      padding: '28px 30px',
                      background: '#f6f2ea',
                      borderBottom:
                        '1px solid #ded7cb',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent:
                          'space-between',
                        gap: '16px',
                        alignItems: 'flex-end',
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontFamily:
                              '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
                            fontSize: '1.65rem',
                            fontWeight: 600,
                            letterSpacing:
                              '0.05em',
                          }}
                        >
                          {work.title}
                        </h3>

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '7px 18px',
                            marginTop: '12px',
                            color: '#766f65',
                            fontSize: '0.85rem',
                          }}
                        >
                          {work.author && (
                            <span>
                              著：{work.author}
                            </span>
                          )}

                          {work.illustrator && (
                            <span>
                              画：
                              {work.illustrator}
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
                      </div>

                      <div
                        style={{
                          color: '#81796e',
                          fontSize: '0.86rem',
                        }}
                      >
                        {workEntries.length}件公開
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(240px, 1fr))',
                    }}
                  >
                    {workEntries.map(
                      (entry) => {
                        const volume =
                          entry.volume_id !== null
                            ? volumeMap.get(
                                entry.volume_id
                              )
                            : undefined

                        const currentPlace =
                          currentPlaces[entry.id]

                        return (
                          <Link
                            key={entry.id}
                            href={`/meisho/${entry.id}`}
                            style={{
                              display: 'block',
                              padding: '24px 26px',
                              borderRight:
                                '1px solid #eee9e1',
                              borderBottom:
                                '1px solid #eee9e1',
                              color: '#292722',
                              textDecoration: 'none',
                            }}
                          >
                            {volume?.volume_label && (
                              <div
                                style={{
                                  marginBottom: '8px',
                                  color: '#938a7e',
                                  fontSize: '0.78rem',
                                }}
                              >
                                {volume.volume_label}
                              </div>
                            )}

                            <div
                              style={{
                                fontSize: '1.08rem',
                                fontWeight: 600,
                                lineHeight: 1.55,
                              }}
                            >
                              {entry.heading}
                            </div>

                            {entry.reading && (
                              <div
                                style={{
                                  marginTop: '5px',
                                  color: '#999188',
                                  fontSize: '0.78rem',
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
                                    marginTop: '14px',
                                    color: '#65716d',
                                    fontSize: '0.82rem',
                                  }}
                                >
                                  現在：
                                  {
                                    currentPlace.currentName
                                  }
                                </div>
                              )}
                          </Link>
                        )
                      }
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div
          style={{
            marginTop: '38px',
            textAlign: 'center',
          }}
        >
          <Link
            href="/meisho"
            style={{
              display: 'inline-block',
              padding: '13px 26px',
              border: '1px solid #9c9386',
              borderRadius: '6px',
              color: '#48433d',
              textDecoration: 'none',
              background: '#fff',
            }}
          >
            すべての名所を見る →
          </Link>
        </div>
      </section>

      {/* ==============================
          フッター
      ============================== */}

      <footer
        style={{
          borderTop: '1px solid #ddd7cd',
          background: '#f5f2ec',
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            padding: '30px 24px',
            color: '#817a70',
            fontSize: '0.82rem',
          }}
        >
          名所図会 今昔
        </div>
      </footer>
    </main>
  )
}