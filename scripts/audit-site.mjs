import fs from 'node:fs'
import path from 'node:path'
import {
  projectRoot,
} from './lib/content-utils.mjs'

const errors = []
const warnings = []

function error(message) {
  errors.push(message)
}

function warning(message) {
  warnings.push(message)
}

function exists(relativePath) {
  return fs.existsSync(
    path.join(
      projectRoot,
      relativePath
    )
  )
}

function read(relativePath) {
  return fs.readFileSync(
    path.join(
      projectRoot,
      relativePath
    ),
    'utf8'
  )
}

const requiredFiles = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/robots.ts',
  'app/sitemap.ts',
  'app/manifest.ts',
  'app/icon.svg',
  'app/opengraph-image.tsx',
  'app/not-found.tsx',
  'app/about/page.tsx',
  'app/works/page.tsx',
  'app/regions/page.tsx',
  'app/meisho/page.tsx',
  'app/meisho/[id]/page.tsx',
  'src/lib/site.ts',
  'src/components/JsonLd.tsx',
  'src/data/currentPlaces.ts',
  'src/data/regions.ts',
  'src/data/historicalMedia.ts',
]

for (
  const relativePath of
    requiredFiles
) {
  if (!exists(relativePath)) {
    error(
      `必須ファイルがありません: ${relativePath}`
    )
  }
}

if (exists('app/layout.tsx')) {
  const layout =
    read('app/layout.tsx')

  if (
    layout.includes(
      'Create Next App'
    )
  ) {
    error(
      'layout.tsx に Create Next App が残っています'
    )
  }

  if (
    layout.includes(
      'lang="en"'
    )
  ) {
    error(
      'html lang が en のままです'
    )
  }

  if (
    !layout.includes(
      'GOOGLE_SITE_VERIFICATION'
    )
  ) {
    warning(
      'Google Search Console verificationの環境変数対応が見つかりません'
    )
  }

  if (
    !layout.includes(
      'JsonLd'
    )
  ) {
    error(
      'WebSite JSON-LD が見つかりません'
    )
  }
}

if (
  exists(
    'app/meisho/[id]/page.tsx'
  )
) {
  const article =
    read(
      'app/meisho/[id]/page.tsx'
    )

  for (
    const required of [
      'generateMetadata',
      'JsonLd',
      'BreadcrumbList',
      'canonical',
      'openGraph',
      'twitter',
    ]
  ) {
    if (
      !article.includes(
        required
      )
    ) {
      error(
        `個別記事に ${required} がありません`
      )
    }
  }
}

if (exists('app/sitemap.ts')) {
  const sitemap =
    read('app/sitemap.ts')

  if (
    !sitemap.includes(
      'SITE_URL'
    )
  ) {
    warning(
      'sitemap.ts が SITE_URL を使っていません'
    )
  }
}

if (exists('app/robots.ts')) {
  const robots =
    read('app/robots.ts')

  if (
    !robots.includes(
      'sitemap'
    )
  ) {
    error(
      'robots.ts に sitemap 指定がありません'
    )
  }
}

if (exists('src/lib/site.ts')) {
  const site =
    read('src/lib/site.ts')

  if (
    !site.includes(
      'NEXT_PUBLIC_SITE_URL'
    )
  ) {
    error(
      'サイトURL一元化が設定されていません'
    )
  }
}

console.log(
  `Site audit: ${errors.length} errors / ${warnings.length} warnings`
)

for (const message of warnings) {
  console.warn(
    `⚠ ${message}`
  )
}

for (const message of errors) {
  console.error(
    `✗ ${message}`
  )
}

if (errors.length > 0) {
  process.exitCode = 1
} else {
  console.log(
    '✓ site audit passed'
  )
}
