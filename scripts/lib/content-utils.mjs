import fs from 'node:fs'
import path from 'node:path'

export const projectRoot = process.cwd()

export function loadEnvLocal() {
  const envPath = path.join(
    projectRoot,
    '.env.local'
  )

  if (!fs.existsSync(envPath)) {
    return
  }

  const text = fs.readFileSync(
    envPath,
    'utf8'
  )

  for (const rawLine of text.split(
    /\r?\n/
  )) {
    const line = rawLine.trim()

    if (
      !line ||
      line.startsWith('#')
    ) {
      continue
    }

    const index = line.indexOf('=')

    if (index === -1) {
      continue
    }

    const key = line
      .slice(0, index)
      .trim()

    let value = line
      .slice(index + 1)
      .trim()

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (
      process.env[key] === undefined
    ) {
      process.env[key] = value
    }
  }
}

export function parseCliArgs(
  argv = process.argv.slice(2)
) {
  const positional = []
  const flags = {}

  for (
    let index = 0;
    index < argv.length;
    index += 1
  ) {
    const token = argv[index]

    if (!token.startsWith('--')) {
      positional.push(token)
      continue
    }

    const equalIndex =
      token.indexOf('=')

    if (equalIndex !== -1) {
      const key = token.slice(
        2,
        equalIndex
      )
      const value = token.slice(
        equalIndex + 1
      )

      flags[key] = value
      continue
    }

    const key = token.slice(2)
    const next = argv[index + 1]

    if (
      next !== undefined &&
      !next.startsWith('--')
    ) {
      flags[key] = next
      index += 1
    } else {
      flags[key] = true
    }
  }

  return {
    positional,
    flags,
  }
}

export function requireInteger(
  value,
  label
) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed)) {
    throw new Error(
      `${label} は整数で指定してください: ${value}`
    )
  }

  return parsed
}

export function requireText(
  value,
  label
) {
  if (
    typeof value !== 'string' ||
    value.trim() === ''
  ) {
    throw new Error(
      `${label} は必須です`
    )
  }

  return value.trim()
}

export function readUtf8(filePath) {
  return fs.readFileSync(
    filePath,
    'utf8'
  )
}

export function writeUtf8(
  filePath,
  text
) {
  fs.mkdirSync(
    path.dirname(filePath),
    {
      recursive: true,
    }
  )

  fs.writeFileSync(
    filePath,
    text,
    'utf8'
  )
}

export function readTextInput({
  flags,
  required = true,
}) {
  if (
    typeof flags.file === 'string'
  ) {
    const filePath = path.resolve(
      projectRoot,
      flags.file
    )

    if (!fs.existsSync(filePath)) {
      throw new Error(
        `入力ファイルが見つかりません: ${filePath}`
      )
    }

    return readUtf8(filePath)
  }

  if (
    typeof flags.text === 'string'
  ) {
    return flags.text
  }

  if (!required) {
    return ''
  }

  throw new Error(
    '--file または --text を指定してください'
  )
}

export function tsString(value) {
  return JSON.stringify(
    value ?? '',
    null,
    0
  )
}

function scanClosingBracket(
  text,
  openIndex,
  openChar,
  closeChar
) {
  let depth = 0
  let quote = null
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (
    let index = openIndex;
    index < text.length;
    index += 1
  ) {
    const char = text[index]
    const next =
      text[index + 1] ?? ''

    if (lineComment) {
      if (char === '\n') {
        lineComment = false
      }

      continue
    }

    if (blockComment) {
      if (
        char === '*' &&
        next === '/'
      ) {
        blockComment = false
        index += 1
      }

      continue
    }

    if (quote !== null) {
      if (escaped) {
        escaped = false
        continue
      }

      if (char === '\\') {
        escaped = true
        continue
      }

      if (char === quote) {
        quote = null
      }

      continue
    }

    if (
      char === '/' &&
      next === '/'
    ) {
      lineComment = true
      index += 1
      continue
    }

    if (
      char === '/' &&
      next === '*'
    ) {
      blockComment = true
      index += 1
      continue
    }

    if (
      char === "'" ||
      char === '"' ||
      char === '`'
    ) {
      quote = char
      continue
    }

    if (char === openChar) {
      depth += 1
      continue
    }

    if (char === closeChar) {
      depth -= 1

      if (depth === 0) {
        return index
      }
    }
  }

  return -1
}

export function findArraySpan(
  text,
  property
) {
  const pattern = new RegExp(
    `\\b${property}\\s*:\\s*\\[`
  )

  const match = pattern.exec(text)

  if (!match) {
    throw new Error(
      `${property}: [...] が見つかりません`
    )
  }

  const openIndex =
    text.indexOf(
      '[',
      match.index
    )

  const closeIndex =
    scanClosingBracket(
      text,
      openIndex,
      '[',
      ']'
    )

  if (closeIndex === -1) {
    throw new Error(
      `${property} 配列の終端 ] が見つかりません`
    )
  }

  return {
    openIndex,
    closeIndex,
  }
}

export function appendArrayObject({
  text,
  property,
  objectText,
}) {
  const {
    openIndex,
    closeIndex,
  } = findArraySpan(
    text,
    property
  )

  const body = text
    .slice(
      openIndex + 1,
      closeIndex
    )
    .trim()

  const insertion =
    body === ''
      ? `\n${objectText}\n  `
      : `,\n${objectText}\n  `

  return (
    text.slice(0, closeIndex) +
    insertion +
    text.slice(closeIndex)
  )
}

export function findRecordObjectBody(
  text,
  exportName
) {
  const marker =
    `export const ${exportName}`

  const markerIndex =
    text.indexOf(marker)

  if (markerIndex === -1) {
    throw new Error(
      `${marker} が見つかりません`
    )
  }

  const equalsIndex =
    text.indexOf(
      '=',
      markerIndex
    )

  const openIndex =
    text.indexOf(
      '{',
      equalsIndex
    )

  if (openIndex === -1) {
    throw new Error(
      `${exportName} の { が見つかりません`
    )
  }

  const closeIndex =
    scanClosingBracket(
      text,
      openIndex,
      '{',
      '}'
    )

  if (closeIndex === -1) {
    throw new Error(
      `${exportName} の } が見つかりません`
    )
  }

  return {
    openIndex,
    closeIndex,
  }
}

export function appendRecordArrayItem({
  text,
  exportName,
  numericKey,
  objectText,
}) {
  const record =
    findRecordObjectBody(
      text,
      exportName
    )

  const body = text.slice(
    record.openIndex + 1,
    record.closeIndex
  )

  const keyPattern =
    new RegExp(
      `(^|\\n)\\s*${numericKey}\\s*:\\s*\\[`,
      'm'
    )

  const keyMatch =
    keyPattern.exec(body)

  if (keyMatch) {
    const absoluteStart =
      record.openIndex +
      1 +
      keyMatch.index

    const openIndex =
      text.indexOf(
        '[',
        absoluteStart
      )

    const closeIndex =
      scanClosingBracket(
        text,
        openIndex,
        '[',
        ']'
      )

    if (closeIndex === -1) {
      throw new Error(
        `${numericKey}: [...] の終端が見つかりません`
      )
    }

    const arrayBody = text
      .slice(
        openIndex + 1,
        closeIndex
      )
      .trim()

    const insertion =
      arrayBody === ''
        ? `\n${objectText}\n  `
        : `,\n${objectText}\n  `

    return (
      text.slice(0, closeIndex) +
      insertion +
      text.slice(closeIndex)
    )
  }

  const recordBody = text
    .slice(
      record.openIndex + 1,
      record.closeIndex
    )
    .trim()

  const newEntry =
    `  ${numericKey}: [\n${objectText}\n  ]`

  const insertion =
    recordBody === ''
      ? `\n${newEntry},\n`
      : `\n${newEntry},\n`

  return (
    text.slice(
      0,
      record.closeIndex
    ) +
    insertion +
    text.slice(
      record.closeIndex
    )
  )
}

export function articlePath(
  entryId
) {
  return path.join(
    projectRoot,
    'src',
    'data',
    'meisho',
    `${entryId}.ts`
  )
}

export function currentPlacesPath() {
  return path.join(
    projectRoot,
    'src',
    'data',
    'currentPlaces.ts'
  )
}

export function historicalMediaPath() {
  return path.join(
    projectRoot,
    'src',
    'data',
    'historicalMedia.ts'
  )
}

export function ensureFile(
  filePath,
  label = 'ファイル'
) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `${label}が見つかりません: ${filePath}`
    )
  }
}

export function ensureUrl(
  value,
  label = 'URL'
) {
  const text =
    requireText(value, label)

  let parsed

  try {
    parsed = new URL(text)
  } catch {
    throw new Error(
      `${label} の形式が不正です: ${text}`
    )
  }

  if (
    parsed.protocol !== 'http:' &&
    parsed.protocol !== 'https:'
  ) {
    throw new Error(
      `${label} は http/https URL にしてください`
    )
  }

  return text
}

export function hasExactUrl(
  text,
  url
) {
  return (
    text.includes(
      tsString(url)
    ) ||
    text.includes(`'${url}'`) ||
    text.includes(`"${url}"`)
  )
}

export function buildObject(
  entries,
  indent = 4
) {
  const pad = ' '.repeat(indent)
  const childPad =
    ' '.repeat(indent + 2)

  const lines = [
    `${pad}{`,
  ]

  for (
    let index = 0;
    index < entries.length;
    index += 1
  ) {
    const [key, value] =
      entries[index]

    if (value === undefined) {
      continue
    }

    lines.push(
      `${childPad}${key}: ${tsString(value)},`
    )
  }

  lines.push(
    `${pad}}`
  )

  return lines.join('\n')
}

export function printSuccess(
  message
) {
  console.log(`✓ ${message}`)
}

export function printWarning(
  message
) {
  console.warn(`⚠ ${message}`)
}

export function fail(error) {
  const message =
    error instanceof Error
      ? error.message
      : String(error)

  console.error(
    `✗ ${message}`
  )

  process.exitCode = 1
}
