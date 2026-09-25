export type RegionDefinition = {
  slug: string
  title: string
  reading?: string
  subtitle?: string
  description: string
  entryIds: number[]
}

export const regions: RegionDefinition[] = [
  {
    slug: 'zoshigaya',
    title: '雑司ヶ谷',
    reading: 'ぞうしがや',
    subtitle: '『江戸名所図会』巻之四を中心にたどる',
    description:
      '「名所図会 今昔」で最初の重点地域として整備している雑司ヶ谷周辺の名所をまとめます。各記事の原文・現在情報・写真・関連史料・比較・歴史画像の登録状況も確認できます。',
    entryIds: [
      7293,
      4498,
      7292,
      4499,
      4500,
      4501,
    ],
  },
]

export function getRegionBySlug(
  slug: string
) {
  return regions.find(
    (region) =>
      region.slug === slug
  )
}

export function getRegionForEntry(
  entryId: number
) {
  return regions.find(
    (region) =>
      region.entryIds.includes(
        entryId
      )
  )
}
