import Link from 'next/link'
import { supabase } from '../../src/lib/supabase'
import { currentPlaces } from '../../src/data/currentPlaces'

export default async function MeishoListPage() {
  const entryIds = Object.keys(currentPlaces)
    .map(Number)
    .filter(Number.isInteger)

  if (entryIds.length === 0) {
    return (
      <main
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '64px 24px',
        }}
      >
        <h1>名所一覧</h1>
        <p>まだ記事がありません。</p>
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
      <main style={{ padding: '40px' }}>
        <h1>一覧取得エラー</h1>
        <pre>{entriesError?.message}</pre>
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
      title
    `)
    .in('id', workIds)

  if (worksError) {
    return (
      <main style={{ padding: '40px' }}>
        <h1>作品情報取得エラー</h1>
        <pre>{worksError.message}</pre>
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
      <main style={{ padding: '40px' }}>
        <h1>巻情報取得エラー</h1>
        <pre>{volumesError.message}</pre>
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
        volumeMap.get(a.volume_id)

      const bVolume =
        volumeMap.get(b.volume_id)

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
  // グループ化
  // ------------------------------

  const grouped = new Map<
    number,
    Map<number, typeof sortedEntries>
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
        maxWidth: '1050px',
        margin: '0 auto',
        padding: '64px 24px 96px',
        lineHeight: 1.8,
        color: '#292722',
      }}
    >
      {/* ヘッダー */}
      <header
        style={{
          marginBottom: '48px',
          borderBottom:
            '1px solid #d8d3c8',
          paddingBottom: '32px',
        }}
      >
        <p
          style={{
            margin: '0 0 8px',
            fontSize: '0.85rem',
            letterSpacing: '0.18em',
            color: '#777',
          }}
        >
          MEISHO ZUE ARCHIVE
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: '2.4rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          名所をたどる
        </h1>

        <p
          style={{
            marginTop: '16px',
            marginBottom: 0,
            maxWidth: '700px',
            color: '#666',
          }}
        >
          江戸時代の名所図会に描かれた土地を、
          原文と現在の姿からたどります。
        </p>
      </header>

      {/* 件数 */}
      <div
        style={{
          marginBottom: '48px',
          fontSize: '0.9rem',
          color: '#777',
        }}
      >
        公開中 {entries.length}件
      </div>

      {/* 作品別 */}
      {[...grouped.entries()].map(
        ([workId, volumeGroups]) => {
          const work =
            workMap.get(workId)

          const workEntryCount =
            [...volumeGroups.values()]
              .reduce(
                (total, groupEntries) =>
                  total +
                  groupEntries.length,
                0
              )

          return (
            <section
              key={workId}
              style={{
                marginBottom: '72px',
              }}
            >
              {/* 作品名 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '16px',
                  marginBottom: '32px',
                  paddingBottom: '16px',
                  borderBottom:
                    '2px solid #b9ae9b',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.8rem',
                    fontWeight: 600,
                    letterSpacing:
                      '0.06em',
                  }}
                >
                  {work?.title ??
                    `作品 ${workId}`}
                </h2>

                <span
                  style={{
                    paddingBottom: '3px',
                    color: '#888',
                    fontSize: '0.85rem',
                  }}
                >
                  {workEntryCount}件
                </span>
              </div>

              {/* 巻別 */}
              {[...volumeGroups.entries()]
                .sort(([aId], [bId]) => {
                  const a =
                    volumeMap.get(aId)

                  const b =
                    volumeMap.get(bId)

                  return (
                    (a?.volume_no ??
                      Number.MAX_SAFE_INTEGER) -
                    (b?.volume_no ??
                      Number.MAX_SAFE_INTEGER)
                  )
                })
                .map(
                  ([
                    volumeId,
                    volumeEntries,
                  ]) => {
                    const volume =
                      volumeMap.get(volumeId)

                    return (
                      <section
                        key={volumeId}
                        style={{
                          marginBottom:
                            '48px',
                        }}
                      >
                        {/* 巻名 */}
                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap: '12px',
                            marginBottom:
                              '20px',
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
                                '0.06em',
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
                              color: '#999',
                              fontSize:
                                '0.8rem',
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

                              return (
                                <Link
                                  key={
                                    entry.id
                                  }
                                  href={`/meisho/${entry.id}`}
                                  style={{
                                    display:
                                      'block',
                                    textDecoration:
                                      'none',
                                    color:
                                      'inherit',
                                  }}
                                >
                                  <article
                                    style={{
                                      height:
                                        '100%',
                                      boxSizing:
                                        'border-box',
                                      padding:
                                        '24px',
                                      border:
                                        '1px solid #ddd8ce',
                                      borderRadius:
                                        '10px',
                                      background:
                                        '#fff',
                                    }}
                                  >
                                    {/* 順番 */}
                                    <div
                                      style={{
                                        marginBottom:
                                          '14px',
                                        fontSize:
                                          '0.75rem',
                                        color:
                                          '#aaa',
                                        letterSpacing:
                                          '0.05em',
                                      }}
                                    >
                                      {entry.entry_order !=
                                      null
                                        ? `第${entry.entry_order}項`
                                        : ''}
                                    </div>

                                    {/* 名所名 */}
                                    <h4
                                      style={{
                                        margin:
                                          '0 0 4px',
                                        fontSize:
                                          '1.35rem',
                                        fontWeight:
                                          600,
                                      }}
                                    >
                                      {
                                        entry.heading
                                      }
                                    </h4>

                                    {entry.reading && (
                                      <div
                                        style={{
                                          marginBottom:
                                            '18px',
                                          fontSize:
                                            '0.85rem',
                                          color:
                                            '#888',
                                        }}
                                      >
                                        {
                                          entry.reading
                                        }
                                      </div>
                                    )}

                                    {/* 現在名称 */}
                                    {currentPlace?.currentName &&
                                      currentPlace.currentName !==
                                        entry.heading && (
                                        <div
                                          style={{
                                            paddingTop:
                                              '14px',
                                            borderTop:
                                              '1px solid #eeeae2',
                                            fontSize:
                                              '0.92rem',
                                          }}
                                        >
                                          <span
                                            style={{
                                              color:
                                                '#888',
                                              marginRight:
                                                '8px',
                                            }}
                                          >
                                            現在
                                          </span>

                                          {
                                            currentPlace.currentName
                                          }
                                        </div>
                                      )}

                                    <div
                                      style={{
                                        marginTop:
                                          '22px',
                                        fontSize:
                                          '0.85rem',
                                        color:
                                          '#666',
                                      }}
                                    >
                                      記事を見る
                                      →
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
    </main>
  )
}