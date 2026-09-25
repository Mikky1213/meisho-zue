import { currentPlaces } from '../data/currentPlaces'

export type PublishedEntry = {
  id: number
  work_id: number
  volume_id: number | null
  entry_order: number | null
  heading: string
  reading: string | null
}

export function getDbPublishedEntryIds() {
  return Object.entries(currentPlaces)
    .filter(([, place]) => !place.sourceEntry)
    .map(([id]) => Number(id))
    .filter(Number.isInteger)
}

export function getLinkedPublishedEntries(): PublishedEntry[] {
  return Object.entries(currentPlaces)
    .flatMap(([id, place]) => {
      const source = place.sourceEntry

      if (!source) {
        return []
      }

      return [
        {
          id: Number(id),
          work_id: source.workId,
          volume_id: source.volumeId,
          entry_order: source.entryOrder,
          heading: source.heading,
          reading: source.reading ?? null,
        },
      ]
    })
    .filter((entry) => Number.isInteger(entry.id))
}

export function mergePublishedEntries(
  dbEntries: PublishedEntry[]
): PublishedEntry[] {
  const map = new Map<number, PublishedEntry>()

  for (const entry of dbEntries) {
    map.set(entry.id, entry)
  }

  for (const entry of getLinkedPublishedEntries()) {
    map.set(entry.id, entry)
  }

  return [...map.values()]
}
