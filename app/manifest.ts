import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '名所図会 今昔',
    short_name: '名所図会 今昔',
    description:
      '名所図会の原文と現在の風景をたどるアーカイブ',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f5ee',
    theme_color: '#f8f5ee',
    lang: 'ja',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
