import type { CurrentPlace } from '../currentPlaces'
import { meisho4503 as baseMeisho4503 } from './4503'
import { tokyoMeishoZue4503 } from './4503TokyoMeishoZue'

export const meisho4503: CurrentPlace = {
  ...baseMeisho4503,
  documents: [
    ...(baseMeisho4503.documents ?? []),
    ...tokyoMeishoZue4503,
  ],
}
