export type HistoricalImage = {
  url: string
  caption: string
  alt?: string
  source?: string
  sourceUrl?: string
  page?: string
  note?: string
}

/**
 * 歴史画像は Supabase Storage には置かず、
 * ImageKit 等に置いた画像URLを記事IDごとに登録する。
 */
const kishimojinHomyojiImageUrl =
  'https://ik.imagekit.io/meisho/4498/digidepo_959918_0103.jpg'

export const historicalMedia: Record<
  number,
  HistoricalImage[]
> = {
  4498: [
    {
      url: kishimojinHomyojiImageUrl,
      caption: '『江戸名所図会』鬼子母神堂',
      alt: '『江戸名所図会』鬼子母神堂',
      source: '『江戸名所図会』',
      page: '巻之四',
    },
  ],

  7292: [
    {
      url: kishimojinHomyojiImageUrl,
      caption: '『江戸名所図会』威光山法明寺',
      alt: '『江戸名所図会』威光山法明寺',
      source: '『江戸名所図会』',
      page: '巻之四',
    },
  ],
}
