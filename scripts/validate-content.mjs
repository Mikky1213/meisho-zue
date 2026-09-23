import fs from 'node:fs'
import path from 'node:path'
import {
  currentPlacesPath,
  historicalMediaPath,
  printWarning,
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

function read(filePath) {
  return fs.readFileSync(
    filePath,
    'utf8'
  )
}

function extractUrls(text) {
  const urls = []

  const regex =
    /https?:\/\/[^\s"'`\\)]+/g

  for (
    const match of
      text.matchAll(regex)
  ) {
    urls.push(match[0])
  }

  return urls
}

function extractPropertyString(
  text,
  property
) {
  const regex = new RegExp(
    `\\b${property}\\s*:\\s*(['"])(.*?)\\1`,
    's'
  )

  return regex.exec(text)?.[2]
}

function main() {
  const registryPath =
    currentPlacesPath()

  const meishoDir =
    path.join(
      projectRoot,
      'src',
      'data',
      'meisho'
    )

  if (!fs.existsSync(registryPath)) {
    error(
      'src/data/currentPlaces.ts がありません'
    )
  }

  if (!fs.existsSync(meishoDir)) {
    error(
      'src/data/meisho がありません'
    )
  }

  if (errors.length > 0) {
    finish()
    return
  }

  const registry =
    read(registryPath)

  const imports = new Map()

  const importRegex =
    /^import\s+\{\s*meisho(\d+)\s*\}\s+from\s+['"]\.\/meisho\/(\d+)['"]/gm

  for (
    const match of
      registry.matchAll(importRegex)
  ) {
    imports.set(
      Number(match[1]),
      Number(match[2])
    )

    if (
      match[1] !== match[2]
    ) {
      error(
        `currentPlaces import ID不一致: meisho${match[1]} -> ${match[2]}`
      )
    }
  }

  const mapEntries =
    new Map()

  const mapRegex =
    /^\s*(\d+)\s*:\s*meisho(\d+)\s*,?/gm

  for (
    const match of
      registry.matchAll(mapRegex)
  ) {
    mapEntries.set(
      Number(match[1]),
      Number(match[2])
    )

    if (
      match[1] !== match[2]
    ) {
      error(
        `currentPlaces map ID不一致: ${match[1]} -> meisho${match[2]}`
      )
    }
  }

  for (
    const [id] of mapEntries
  ) {
    if (!imports.has(id)) {
      error(
        `currentPlaces: ${id} はmapにあるがimportがありません`
      )
    }

    const filePath =
      path.join(
        meishoDir,
        `${id}.ts`
      )

    if (!fs.existsSync(filePath)) {
      error(
        `記事ファイルがありません: src/data/meisho/${id}.ts`
      )
    }
  }

  for (
    const [id] of imports
  ) {
    if (!mapEntries.has(id)) {
      warning(
        `currentPlaces: meisho${id} はimport済みだがmap未登録`
      )
    }
  }

  const files =
    fs.readdirSync(meishoDir)
      .filter(
        (name) =>
          /^\d+\.ts$/.test(name)
      )

  const allUrls =
    new Map()

  for (const name of files) {
    const id =
      Number(
        name.replace(
          /\.ts$/,
          ''
        )
      )

    const filePath =
      path.join(
        meishoDir,
        name
      )

    const text =
      read(filePath)

    if (!mapEntries.has(id)) {
      warning(
        `未公開記事ファイル: src/data/meisho/${name}`
      )
    }

    const exportPattern =
      new RegExp(
        `export\\s+const\\s+meisho${id}\\b`
      )

    if (!exportPattern.test(text)) {
      error(
        `${name}: export const meisho${id} が見つかりません`
      )
    }

    const currentName =
      extractPropertyString(
        text,
        'currentName'
      )

    const address =
      extractPropertyString(
        text,
        'address'
      )

    const description =
      extractPropertyString(
        text,
        'description'
      )

    if (!currentName?.trim()) {
      warning(
        `${name}: currentName が空です`
      )
    }

    if (!address?.trim()) {
      warning(
        `${name}: address が空です`
      )
    }

    if (!description?.trim()) {
      warning(
        `${name}: description が空です`
      )
    }

    for (
      const property of [
        'translation',
        'documents',
        'photos',
        'comparison',
      ]
    ) {
      const regex =
        new RegExp(
          `\\b${property}\\s*:\\s*\\[`
        )

      if (!regex.test(text)) {
        error(
          `${name}: ${property}: [] がありません`
        )
      }
    }

    for (
      const url of
        extractUrls(text)
    ) {
      if (!allUrls.has(url)) {
        allUrls.set(url, [])
      }

      allUrls
        .get(url)
        .push(
          `src/data/meisho/${name}`
        )
    }
  }

  const historicalPath =
    historicalMediaPath()

  if (!fs.existsSync(historicalPath)) {
    warning(
      'src/data/historicalMedia.ts がありません'
    )
  } else {
    const text =
      read(historicalPath)

    for (
      const url of
        extractUrls(text)
    ) {
      if (!allUrls.has(url)) {
        allUrls.set(url, [])
      }

      allUrls
        .get(url)
        .push(
          'src/data/historicalMedia.ts'
        )
    }

    const keyRegex =
      /^\s*(\d+)\s*:\s*\[/gm

    for (
      const match of
        text.matchAll(keyRegex)
    ) {
      const id =
        Number(match[1])

      if (!mapEntries.has(id)) {
        warning(
          `historicalMedia: ${id} は currentPlaces で未公開です`
        )
      }
    }
  }

  for (
    const [url, locations] of
      allUrls
  ) {
    if (
      locations.length > 1
    ) {
      const unique =
        [...new Set(locations)]

      if (
        unique.length > 1 ||
        locations.length > 1
      ) {
        warning(
          `重複URL: ${url}\n    ${locations.join('\n    ')}`
        )
      }
    }
  }

  console.log(
    `検査対象: 公開 ${mapEntries.size}件 / 記事ファイル ${files.length}件`
  )

  finish()
}

function finish() {
  if (warnings.length > 0) {
    console.log('')
    console.log(
      `Warnings: ${warnings.length}`
    )

    for (const message of warnings) {
      printWarning(message)
    }
  }

  if (errors.length > 0) {
    console.log('')
    console.error(
      `Errors: ${errors.length}`
    )

    for (const message of errors) {
      console.error(
        `✗ ${message}`
      )
    }

    process.exitCode = 1
    return
  }

  console.log('')
  console.log(
    '✓ content validation passed'
  )
}

main()
