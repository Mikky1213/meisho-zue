import { meisho4496 } from './meisho/4496'
import { meisho4497 } from './meisho/4497'
import { meisho4498 } from './meisho/4498'
import { meisho7292 } from './meisho/7292'
import { meisho4499 } from './meisho/4499'
import { meisho4500 } from './meisho/4500'
import { meisho4501 } from './meisho/4501'
import { meisho7293 } from './meisho/7293'
import { meisho7294 } from './meisho/7294'

export type CurrentDocument = {
  title: string
  text: string
  source?: string
  url?: string
}

export type ComparisonItem = {
  title: string
  text: string
  source?: string
  url?: string
}

export type PhotoItem = {
  url: string
  caption?: string
  alt?: string
  takenAt?: string
  direction?: string
  credit?: string
  sourceUrl?: string
}

export type TranslationItem = {
  title?: string
  text: string
}

export type SourceEntryLink = {
  workId: number
  volumeId: number
  entryOrder: number
  heading: string
  reading?: string
  rawText?: string
}

export type CurrentPlace = {
  currentName: string
  address: string
  description: string

  photos: PhotoItem[]

  documents?: CurrentDocument[]

  comparison?: ComparisonItem[]

  translation?: TranslationItem[]

  sourceEntry?: SourceEntryLink
}

export const currentPlaces: Record<number, CurrentPlace> = {
  4496: meisho4496,
  4497: meisho4497,
  4498: meisho4498,
  7292: meisho7292,
  4499: meisho4499,
  4500: meisho4500,
  4501: meisho4501,
  7293: meisho7293,
  7294: meisho7294,
}
