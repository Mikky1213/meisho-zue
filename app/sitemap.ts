import type { MetadataRoute } from 'next'
import { supabase } from '../src/lib/supabase'
import { currentPlaces } from '../src/data/currentPlaces'

const baseUrl = 'https://meisho-zue.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entryIds = Object.keys(currentPlaces)
    .map(Number)
    .filter(Number.isInteger)

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/works`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/meisho`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  if (entryIds.length === 0) {
    return staticPages
  }

  const { data: entries } = await supabase
    .from('entries')
    .select(`
      id,
      work_id,
      volume_id
    `)
    .in('id', entryIds)

  if (!entries) {
    return staticPages
  }

  const meishoPages: MetadataRoute.Sitemap =
    entries.map((entry) => ({
      url: `${baseUrl}/meisho/${entry.id}`,
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

  const workIds = [
    ...new Set(
      entries.map((entry) => entry.work_id)
    ),
  ]

  const workPages: MetadataRoute.Sitemap =
    workIds.map((workId) => ({
      url: `${baseUrl}/works/${workId}`,
      changeFrequency: 'monthly',
      priority: 0.75,
    }))

  const volumeKeys = new Map<
    string,
    {
      workId: number
      volumeId: number
    }
  >()

  for (const entry of entries) {
    if (typeof entry.volume_id !== 'number') {
      continue
    }

    const key =
      `${entry.work_id}:${entry.volume_id}`

    volumeKeys.set(key, {
      workId: entry.work_id,
      volumeId: entry.volume_id,
    })
  }

  const volumePages: MetadataRoute.Sitemap =
    [...volumeKeys.values()].map(
      ({ workId, volumeId }) => ({
        url:
          `${baseUrl}/works/${workId}/volumes/${volumeId}`,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    )

  return [
    ...staticPages,
    ...workPages,
    ...volumePages,
    ...meishoPages,
  ]
}
