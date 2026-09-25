import { meisho4498 } from './meisho/4498'
import { meisho7292 } from './meisho/7292'
import { meisho4499 } from './meisho/4499'
import { meisho4500 } from './meisho/4500'
import { meisho4501 } from './meisho/4501'
import { meisho4494 } from './meisho/4494'

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

export type CurrentPlace = {
  currentName: string
  address: string
  description: string

  photos: PhotoItem[]

  documents?: CurrentDocument[]

  comparison?: ComparisonItem[]

  translation?: TranslationItem[]
}

export const currentPlaces: Record<number, CurrentPlace> = {
  4494: meisho4494,
  4498: meisho4498,
  7292: meisho7292,
  4499: meisho4499,
  4500: meisho4500,
  4501: meisho4501,
}
