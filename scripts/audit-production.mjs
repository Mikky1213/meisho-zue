import fs from 'node:fs'
import path from 'node:path'
import {
  projectRoot,
} from './lib/content-utils.mjs'

function loadEnvLocal() {
  const envPath =
    path.join(
      projectRoot,
      '.env.local'
    )

  if (!fs.existsSync(envPath)) {
    return
  }

  const text =
    fs.readFileSync(
      envPath,
      'utf8'
    )

  for (
    const rawLine of
      text.split(/\r?\n/)
  ) {
    const line =
      rawLine.trim()

    if (
      !line ||
      line.startsWith('#')
    ) {
      continue
    }

    const index =
      line.indexOf('=')

    if (index === -1) {
      continue
    }

    const key =
      line.slice(
        0,
        index
      ).trim()

    let value =
      line.slice(
        index + 1
      ).trim()

    value =
      value.replace(
        /^['"]|['"]$/g,
        ''
      )

    if (
      process.env[key] ===
      undefined
    ) {
      process.env[key] =
        value
    }
  }
}

loadEnvLocal()

const baseUrl = (
  process.env
    .NEXT_PUBLIC_SITE_URL ||
  'https://meisho-zue.vercel.app'
).replace(/\/+$/, '')

const routes = [
  '/',
  '/works',
  '/regions',
  '/regions/zoshigaya',
  '/meisho',
  '/meisho/4498',
  '/about',
  '/sitemap.xml',
  '/robots.txt',
  '/manifest.webmanifest',
]

let errors = 0
let warnings = 0

async function request(
  route
) {
  const url =
    `${baseUrl}${route}`

  try {
    const response =
      await fetch(
        url,
        {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'user-agent':
              'Mozilla/5.0 MeishoZueProductionAudit/1.0',
          },
        }
      )

    return {
      url,
      status:
        response.status,
      ok:
        response.ok,
      text:
        response.headers
          .get(
            'content-type'
          )
          ?.includes(
            'text/html'
          )
          ? await response.text()
          : '',
    }
  } catch (error) {
    return {
      url,
      status: null,
      ok: false,
      text: '',
      error:
        error instanceof Error
          ? error.message
          : String(error),
    }
  }
}

for (const route of routes) {
  const result =
    await request(route)

  if (!result.ok) {
    errors += 1
    console.error(
      `✗ ${result.status ?? 'ERR'} ${result.url}`
    )
    continue
  }

  console.log(
    `✓ ${result.status} ${result.url}`
  )

  if (
    route === '/' &&
    !result.text.includes(
      '名所図会'
    )
  ) {
    warnings += 1
    console.warn(
      '⚠ トップページHTMLに「名所図会」が見つかりません'
    )
  }

  if (
    route ===
      '/meisho/4498' &&
    !result.text.includes(
      '鬼子母神堂'
    )
  ) {
    warnings += 1
    console.warn(
      '⚠ /meisho/4498 に「鬼子母神堂」が見つかりません'
    )
  }
}

console.log('')
console.log(
  `Production audit: ${errors} errors / ${warnings} warnings`
)

if (errors > 0) {
  process.exitCode = 1
}
