import fs from 'node:fs'
import path from 'node:path'
import {
  projectRoot,
} from './lib/content-utils.mjs'

const roots = [
  path.join(
    projectRoot,
    'app'
  ),
  path.join(
    projectRoot,
    'src',
    'data'
  ),
]

const allowedExtensions =
  new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.json',
  ])

function collectFiles(
  directory
) {
  const output = []

  if (
    !fs.existsSync(directory)
  ) {
    return output
  }

  for (
    const item of
      fs.readdirSync(
        directory,
        {
          withFileTypes: true,
        }
      )
  ) {
    const full =
      path.join(
        directory,
        item.name
      )

    if (item.isDirectory()) {
      output.push(
        ...collectFiles(full)
      )
      continue
    }

    if (
      allowedExtensions.has(
        path.extname(
          item.name
        )
      )
    ) {
      output.push(full)
    }
  }

  return output
}

const urlMap = new Map()

for (const root of roots) {
  for (
    const file of
      collectFiles(root)
  ) {
    const text =
      fs.readFileSync(
        file,
        'utf8'
      )

    const regex =
      /https?:\/\/[^\s"'`<>)\\]+/g

    for (
      const match of
        text.matchAll(regex)
    ) {
      const raw =
        match[0]
          .replace(
            /[;,]+$/,
            ''
          )

      if (
        raw.includes(
          '${'
        ) ||
        raw.includes(
          '{search_term_string}'
        )
      ) {
        continue
      }

      if (!urlMap.has(raw)) {
        urlMap.set(
          raw,
          []
        )
      }

      urlMap
        .get(raw)
        .push(
          path.relative(
            projectRoot,
            file
          )
        )
    }
  }
}

const urls =
  [...urlMap.keys()]
    .sort()

console.log(
  `URL audit: ${urls.length} URLs`
)

let errors = 0
let warnings = 0

async function check(
  url
) {
  const controller =
    new AbortController()

  const timer =
    setTimeout(
      () =>
        controller.abort(),
      12000
    )

  try {
    let response =
      await fetch(
        url,
        {
          method: 'HEAD',
          redirect: 'follow',
          signal:
            controller.signal,
          headers: {
            'user-agent':
              'Mozilla/5.0 MeishoZueLinkCheck/1.0',
          },
        }
      )

    if (
      response.status ===
        403 ||
      response.status ===
        405
    ) {
      response =
        await fetch(
          url,
          {
            method: 'GET',
            redirect: 'follow',
            signal:
              controller.signal,
            headers: {
              'user-agent':
                'Mozilla/5.0 MeishoZueLinkCheck/1.0',
              range:
                'bytes=0-0',
            },
          }
        )
    }

    return {
      status:
        response.status,
      ok:
        response.ok,
    }
  } catch (error) {
    return {
      status: null,
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    }
  } finally {
    clearTimeout(timer)
  }
}

for (const url of urls) {
  const result =
    await check(url)

  const locations =
    urlMap.get(url)
      .join(', ')

  if (result.ok) {
    console.log(
      `✓ ${result.status} ${url}`
    )
    continue
  }

  const isImageKit =
    url.startsWith(
      'https://ik.imagekit.io/'
    )

  if (
    isImageKit &&
    (
      result.status === 404 ||
      result.status === 410
    )
  ) {
    errors += 1
    console.error(
      `✗ ${result.status} ${url}`
    )
    console.error(
      `  ${locations}`
    )
    continue
  }

  warnings += 1
  console.warn(
    `⚠ ${result.status ?? 'ERR'} ${url}`
  )
  console.warn(
    `  ${locations}`
  )
}

console.log('')
console.log(
  `URL audit finished: ${errors} errors / ${warnings} warnings`
)

if (errors > 0) {
  process.exitCode = 1
}
