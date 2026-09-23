export const SITE_NAME =
  '名所図会 今昔'

export const SITE_DESCRIPTION =
  '江戸時代の名所図会に記された土地を、原文・現代の姿・関連史料・現地写真からたどるアーカイブです。'

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim()

export const SITE_URL = (
  configuredSiteUrl ||
  'https://meisho-zue.vercel.app'
).replace(/\/+$/, '')

export function absoluteUrl(
  pathname = '/'
) {
  if (
    pathname.startsWith(
      'http://'
    ) ||
    pathname.startsWith(
      'https://'
    )
  ) {
    return pathname
  }

  const normalized =
    pathname.startsWith('/')
      ? pathname
      : `/${pathname}`

  return `${SITE_URL}${normalized}`
}
