import type { MetadataRoute } from 'next'
import { currentPlaces } from '../src/data/currentPlaces'

const baseUrl = 'https://meisho-zue.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const meishoPages = Object.keys(currentPlaces)
    .map(Number)
    .filter(Number.isInteger)
    .map((id) => ({
      url: `${baseUrl}/meisho/${id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  return [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1,
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
    ...meishoPages,
  ]
}
