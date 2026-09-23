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
 *
 * 例:
 *
 * 4498: [
 *   {
 *     url: 'https://ik.imagekit.io/meisho/historical/4498/example.jpg?tr=w-1600,f-webp',
 *     caption: '『江戸名所図会』鬼子母神堂',
 *     source: '『江戸名所図会』',
 *     sourceUrl: 'https://...',
 *     page: '巻之四',
 *     note: '必要なら補足',
 *   },
 * ],
 */
export const historicalMedia: Record<
  number,
  HistoricalImage[]
> = {}
