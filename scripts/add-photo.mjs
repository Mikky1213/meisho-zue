import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')

// --------------------------------------------------
// 引数
// --------------------------------------------------

const args = process.argv.slice(2)

const rawEntryId = args[0]
const photoUrl = args[1]

if (!rawEntryId || !photoUrl) {
  console.error('')
  console.error('Entry ID と写真URLを指定してください。')
  console.error('')
  console.error(
    '例:'
  )
  console.error(
    'npm.cmd run add-photo -- 4498 "https://ik.imagekit.io/meisho/4498/photo.jpg" --caption "鬼子母神堂" --credit "管理人撮影"'
  )
  console.error('')

  process.exit(1)
}

const entryId = Number(rawEntryId)

if (
  !Number.isInteger(entryId) ||
  entryId <= 0
) {
  console.error(
    `不正な Entry ID です: ${rawEntryId}`
  )

  process.exit(1)
}

try {
  const parsedUrl = new URL(photoUrl)

  if (
    parsedUrl.protocol !== 'https:' &&
    parsedUrl.protocol !== 'http:'
  ) {
    throw new Error()
  }
} catch {
  console.error(
    `写真URLが不正です: ${photoUrl}`
  )

  process.exit(1)
}

// --------------------------------------------------
// オプション取得
// --------------------------------------------------

function getOption(name) {
  const index = args.indexOf(name)

  if (index === -1) {
    return ''
  }

  const value = args[index + 1]

  if (
    !value ||
    value.startsWith('--')
  ) {
    return ''
  }

  return value
}

const caption =
  getOption('--caption')

const alt =
  getOption('--alt')

const takenAt =
  getOption('--taken-at')

const direction =
  getOption('--direction')

const credit =
  getOption('--credit')

const sourceUrl =
  getOption('--source-url')

// --------------------------------------------------
// 対象ファイル
// --------------------------------------------------

const articlePath = path.join(
  projectRoot,
  'src',
  'data',
  'meisho',
  `${entryId}.ts`
)

if (!fs.existsSync(articlePath)) {
  console.error('')
  console.error(
    `記事ファイルがありません: src/data/meisho/${entryId}.ts`
  )
  console.error('')
  console.error(
    `先に次を実行してください:`
  )
  console.error(
    `npm.cmd run add-meisho -- ${entryId}`
  )
  console.error('')

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

// --------------------------------------------------
// 同じURLの重複登録防止
// --------------------------------------------------

if (content.includes(photoUrl)) {
  console.error('')
  console.error(
    'この写真URLはすでに登録されています。'
  )
  console.error('')
  console.error(photoUrl)
  console.error('')

  process.exit(1)
}

// --------------------------------------------------
// photos 配列を探す
// --------------------------------------------------

const photosMatch =
  /photos\s*:\s*\[/.exec(content)

if (!photosMatch) {
  console.error('')
  console.error(
    `photos 配列が見つかりません: src/data/meisho/${entryId}.ts`
  )
  console.error('')

  process.exit(1)
}

const arrayStart =
  photosMatch.index +
  photosMatch[0].lastIndexOf('[')

// --------------------------------------------------
// ] の位置を探す
// 文字列中の [ ] は無視
// --------------------------------------------------

function findArrayEnd(
  text,
  startIndex
) {
  let depth = 0

  let quote = null
  let escaped = false

  for (
    let i = startIndex;
    i < text.length;
    i++
  ) {
    const char = text[i]

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

const arrayEnd =
  findArrayEnd(
    content,
    arrayStart
  )

if (arrayEnd === -1) {
  console.error(
    'photos 配列の終了位置を特定できません。'
  )

  process.exit(1)
}

// --------------------------------------------------
// 写真オブジェクト生成
// --------------------------------------------------

const lines = [
  '    {',
  `      url: ${JSON.stringify(photoUrl)},`,
]

if (caption) {
  lines.push(
    `      caption: ${JSON.stringify(caption)},`
  )
}

if (alt) {
  lines.push(
    `      alt: ${JSON.stringify(alt)},`
  )
}

if (takenAt) {
  lines.push(
    `      takenAt: ${JSON.stringify(takenAt)},`
  )
}

if (direction) {
  lines.push(
    `      direction: ${JSON.stringify(direction)},`
  )
}

if (credit) {
  lines.push(
    `      credit: ${JSON.stringify(credit)},`
  )
}

if (sourceUrl) {
  lines.push(
    `      sourceUrl: ${JSON.stringify(sourceUrl)},`
  )
}

lines.push('    },')

const photoBlock =
  lines.join(newline)

// --------------------------------------------------
// 空配列か既存写真ありか判定
// --------------------------------------------------

const existingContent =
  content
    .slice(
      arrayStart + 1,
      arrayEnd
    )
    .trim()

let insertion

if (!existingContent) {
  insertion =
    newline +
    photoBlock +
    newline +
    '  '
} else {
  insertion =
    newline +
    photoBlock +
    '  '
}

// --------------------------------------------------
// 挿入
// --------------------------------------------------

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

// --------------------------------------------------
// 完了
// --------------------------------------------------

console.log('')
console.log('------------------------------')
console.log('写真を登録しました。')
console.log('------------------------------')

console.log(
  `Entry ID : ${entryId}`
)

console.log(
  `URL      : ${photoUrl}`
)

if (caption) {
  console.log(
    `説明     : ${caption}`
  )
}

if (takenAt) {
  console.log(
    `撮影日   : ${takenAt}`
  )
}

if (direction) {
  console.log(
    `撮影方向 : ${direction}`
  )
}

if (credit) {
  console.log(
    `撮影者   : ${credit}`
  )
}

console.log('')
console.log(
  `記事     : http://localhost:3000/meisho/${entryId}`
)
console.log('')