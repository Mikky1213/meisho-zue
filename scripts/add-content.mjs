import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const args = process.argv.slice(2)

const rawEntryId = args[0]
const contentType = args[1]

function getOption(name) {
  const index = args.indexOf(name)

  if (index === -1) {
    return ''
  }

  const value = args[index + 1]

  if (!value || value.startsWith('--')) {
    return ''
  }

  return value
}

if (!rawEntryId || !contentType) {
  console.error(`
使い方:

現代語訳:
npm.cmd run add-content -- 4498 translation --file "C:\\temp\\translation.txt"

関連文献:
npm.cmd run add-content -- 4498 document --title "資料名" --file "C:\\temp\\document.txt" --source "出典名"

比較:
npm.cmd run add-content -- 4498 comparison --title "比較項目" --file "C:\\temp\\comparison.txt" --source "出典名"
`)
  process.exit(1)
}

const entryId = Number(rawEntryId)

if (!Number.isInteger(entryId) || entryId <= 0) {
  console.error(`不正な Entry ID です: ${rawEntryId}`)
  process.exit(1)
}

const allowedTypes = [
  'translation',
  'document',
  'comparison',
]

if (!allowedTypes.includes(contentType)) {
  console.error(
    `種類は translation / document / comparison のいずれかです。`
  )
  process.exit(1)
}

const title = getOption('--title')
const textOption = getOption('--text')
const fileOption = getOption('--file')
const source = getOption('--source')
const url = getOption('--url')

let text = textOption

if (fileOption) {
  const filePath = path.resolve(fileOption)

  if (!fs.existsSync(filePath)) {
    console.error(
      `本文ファイルが見つかりません: ${filePath}`
    )
    process.exit(1)
  }

  text = fs.readFileSync(
    filePath,
    'utf8'
  )
}

text = text
  .replace(/^\uFEFF/, '')
  .replace(/\r\n/g, '\n')
  .trim()

if (!text) {
  console.error(
    '本文がありません。--text または --file を指定してください。'
  )
  process.exit(1)
}

if (
  (contentType === 'document' ||
    contentType === 'comparison') &&
  !title
) {
  console.error(
    `${contentType} では --title が必要です。`
  )
  process.exit(1)
}

const articlePath = path.join(
  projectRoot,
  'src',
  'data',
  'meisho',
  `${entryId}.ts`
)

if (!fs.existsSync(articlePath)) {
  console.error(
    `記事ファイルがありません: src/data/meisho/${entryId}.ts`
  )
  console.error(
    `先に npm.cmd run add-meisho -- ${entryId} を実行してください。`
  )
  process.exit(1)
}

let content = fs.readFileSync(
  articlePath,
  'utf8'
)

const newline =
  content.includes('\r\n')
    ? '\r\n'
    : '\n'

const propertyName =
  contentType === 'document'
    ? 'documents'
    : contentType

function findArrayEnd(
  target,
  startIndex
) {
  let depth = 0
  let quote = null
  let escaped = false

  for (
    let i = startIndex;
    i < target.length;
    i++
  ) {
    const char = target[i]

    if (quote) {
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
      char === "'" ||
      char === '"' ||
      char === '`'
    ) {
      quote = char
      continue
    }

    if (char === '[') {
      depth++
      continue
    }

    if (char === ']') {
      depth--

      if (depth === 0) {
        return i
      }
    }
  }

  return -1
}

const arrayRegex =
  new RegExp(
    `${propertyName}\\s*:\\s*\\[`
  )

const arrayMatch =
  arrayRegex.exec(content)

if (!arrayMatch) {
  console.error(
    `${propertyName} 配列が見つかりません。`
  )
  process.exit(1)
}

const arrayStart =
  arrayMatch.index +
  arrayMatch[0].lastIndexOf('[')

const arrayEnd =
  findArrayEnd(
    content,
    arrayStart
  )

if (arrayEnd === -1) {
  console.error(
    `${propertyName} 配列の終了位置を特定できません。`
  )
  process.exit(1)
}

const lines = [
  '    {',
]

if (title) {
  lines.push(
    `      title: ${JSON.stringify(title)},`
  )
}

lines.push(
  `      text: ${JSON.stringify(text)},`
)

if (source) {
  lines.push(
    `      source: ${JSON.stringify(source)},`
  )
}

if (url) {
  lines.push(
    `      url: ${JSON.stringify(url)},`
  )
}

lines.push('    },')

const newBlock =
  lines.join(newline)

const existingContent =
  content
    .slice(
      arrayStart + 1,
      arrayEnd
    )
    .trim()

const insertion =
  existingContent
    ? newline +
      newBlock +
      '  '
    : newline +
      newBlock +
      newline +
      '  '

content =
  content.slice(
    0,
    arrayEnd
  ) +
  insertion +
  content.slice(
    arrayEnd
  )

fs.writeFileSync(
  articlePath,
  content,
  'utf8'
)

console.log('')
console.log('------------------------------')
console.log('記事データを追加しました。')
console.log('------------------------------')
console.log(`Entry ID : ${entryId}`)
console.log(`種類     : ${contentType}`)

if (title) {
  console.log(`タイトル : ${title}`)
}

if (source) {
  console.log(`出典     : ${source}`)
}

console.log(
  `記事     : http://localhost:3000/meisho/${entryId}`
)
console.log('')