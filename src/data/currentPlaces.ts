import { meisho4390 } from './meisho/4390'
import { meisho4391 } from './meisho/4391'
import { meisho4392 } from './meisho/4392'
import { meisho4393 } from './meisho/4393'
import { meisho4394 } from './meisho/4394'
import { meisho4395 } from './meisho/4395'
import { meisho4396 } from './meisho/4396'
import { meisho4397 } from './meisho/4397'
import { meisho4398 } from './meisho/4398'
import { meisho4399 } from './meisho/4399'
import { meisho4400 } from './meisho/4400'
import { meisho4401 } from './meisho/4401'
import { meisho4402 } from './meisho/4402'
import { meisho4403 } from './meisho/4403'
import { meisho4404 } from './meisho/4404'
import { meisho4405 } from './meisho/4405'
import { meisho4406 } from './meisho/4406'
import { meisho4407 } from './meisho/4407'
import { meisho4408 } from './meisho/4408'
import { meisho4409 } from './meisho/4409'
import { meisho4410 } from './meisho/4410'
import { meisho4411 } from './meisho/4411'
import { meisho4413 } from './meisho/4413'
import { meisho4414 } from './meisho/4414'
import { meisho4415 } from './meisho/4415'
import { meisho4416 } from './meisho/4416'
import { meisho4417 } from './meisho/4417'
import { meisho4495 } from './meisho/4495'
import { meisho4496 } from './meisho/4496'
import { meisho4497 } from './meisho/4497'
import { meisho4498 } from './meisho/4498'
import { meisho7292 } from './meisho/7292'
import { meisho4499 } from './meisho/4499'
import { meisho4500 } from './meisho/4500'
import { meisho4501 } from './meisho/4501'
import { meisho4502 } from './meisho/4502'
import { meisho4503 } from './meisho/4503Registered'
import { meisho4505 } from './meisho/4505'
import {
  meisho4504,
  meisho4506,
  meisho4507,
  meisho4508,
  meisho4509,
  meisho4510,
} from './meisho/4504to4510Translated'
import { meisho4511 } from './meisho/4511'
import { meisho4512 } from './meisho/4512'
import { meisho4513 } from './meisho/4513'
import { meisho4514 } from './meisho/4514'
import { meisho4515 } from './meisho/4515'
import { meisho4516 } from './meisho/4516'
import { meisho4517 } from './meisho/4517'
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

  relatedSourceComparison?: ComparisonItem[]

  translation?: TranslationItem[]

  relatedSourcesPending?: boolean

  currentPhotoNotApplicable?: boolean

  historicalImageNotApplicable?: boolean

  sourceEntry?: SourceEntryLink
}

export const currentPlaces: Record<number, CurrentPlace> = {
  4390: meisho4390,
  4391: meisho4391,
  4392: meisho4392,
  4393: meisho4393,
  4394: meisho4394,
  4395: meisho4395,
  4396: meisho4396,
  4397: meisho4397,
  4398: meisho4398,
  4399: meisho4399,
  4400: meisho4400,
  4401: meisho4401,
  4402: meisho4402,
  4403: meisho4403,
  4404: meisho4404,
  4405: meisho4405,
  4406: meisho4406,
  4407: meisho4407,
  4408: meisho4408,
  4409: meisho4409,
  4410: meisho4410,
  4411: meisho4411,
  4413: meisho4413,
  4414: meisho4414,
  4415: meisho4415,
  4416: meisho4416,
  4417: meisho4417,
  4495: meisho4495,
  4496: meisho4496,
  4497: meisho4497,
  4498: meisho4498,
  7292: meisho7292,
  4499: meisho4499,
  4500: meisho4500,
  4501: meisho4501,
  4502: meisho4502,
  4503: meisho4503,
  4504: meisho4504,
  4505: meisho4505,
  4506: meisho4506,
  4507: meisho4507,
  4508: meisho4508,
  4509: meisho4509,
  4510: meisho4510,
  4511: meisho4511,
  4512: meisho4512,
  4513: meisho4513,
  4514: meisho4514,
  4515: meisho4515,
  4516: meisho4516,
  4517: meisho4517,
  7293: meisho7293,
  7294: meisho7294,
}
