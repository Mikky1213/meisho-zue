import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')

// --------------------------------------------------
// .env.local 読み込み
// --------------------------------------------------

function loadEnvLocal() {
  const envPath = path.join(
    projectRoot,
    '.env.local'
  )

  if (!fs.existsSync(envPath)) {
    throw new Error(
      `.env.local が見つかりません: ${envPath}`
    )
  }

  const text = fs.readFileSync(
    envPath,
    'utf8'
  )

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (
      !line ||
      line.startsWith('#')
    ) {
      continue
    }

    const separatorIndex =
      line.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = line
      .slice(0, separatorIndex)
      .trim()

    let value = line
      .slice(separatorIndex + 1)
      .trim()

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvLocal()

// --------------------------------------------------
// Entry ID
// --------------------------------------------------

const rawEntryId = process.argv[2]

if (!rawEntryId) {
  console.error(
    'Entry ID を指定してください。'
  )

  console.error(
    '例: npm.cmd run add-meisho -- 4498'
  )

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

// --------------------------------------------------
// Supabase
// --------------------------------------------------

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseKey =
  process.env
    .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL が設定されていません。'
  )
}

if (!supabaseKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY が設定されていません。'
  )
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

// --------------------------------------------------
// Entry取得
// --------------------------------------------------

const {
  data: entry,
  error: entryError,
} = await supabase
  .from('entries')
  .select(`
    id,
    heading,
    reading,
    work_id,
    volume_id,
    entry_order
  `)
  .eq('id', entryId)
  .single()

if (entryError || !entry) {
  console.error(
    `Entry ID ${entryId} が見つかりません。`
  )

  if (entryError) {
    console.error(entryError.message)
  }

  process.exit(1)
}

// --------------------------------------------------
// ファイル情報
// --------------------------------------------------

const variableName =
  `meisho${entryId}`

const meishoDirectory =
  path.join(
    projectRoot,
    'src',
    'data',
    'meisho'
  )

const articlePath =
  path.join(
    meishoDirectory,
    `${entryId}.ts`
  )

const registryPath =
  path.join(
    projectRoot,
    'src',
    'data',
    'currentPlaces.ts'
  )

fs.mkdirSync(
  meishoDirectory,
  {
    recursive: true,
  }
)

// --------------------------------------------------
// 記事ファイル生成
// --------------------------------------------------

const articleContent = `import type { CurrentPlace } from '../currentPlaces'

export const ${variableName}: CurrentPlace = {
  currentName: ${JSON.stringify(entry.heading)},

  address: '',

  description: '',

  translation: [],

  documents: [],

  photos: [],

  comparison: [],
}
`

if (
  fs.existsSync(articlePath)
) {
  console.log(
    `既存ファイルは変更しません: src/data/meisho/${entryId}.ts`
  )
} else {
  fs.writeFileSync(
    articlePath,
    articleContent,
    'utf8'
  )

  console.log(
    `作成: src/data/meisho/${entryId}.ts`
  )
}

// --------------------------------------------------
// currentPlaces.ts 更新
// --------------------------------------------------

if (!fs.existsSync(registryPath)) {
  throw new Error(
    `currentPlaces.ts が見つかりません: ${registryPath}`
  )
}

let registryContent =
  fs.readFileSync(
    registryPath,
    'utf8'
  )

const importLine =
  `import { ${variableName} } from './meisho/${entryId}'`

// import追加
if (
  !registryContent.includes(
    importLine
  )
) {
  const importMatch =
    registryContent.match(
      /(?:^import .+\r?\n)+/
    )

  if (!importMatch) {
    throw new Error(
      'currentPlaces.ts の import 部分を特定できません。'
    )
  }

  const insertPosition =
    importMatch[0].length

  registryContent =
    registryContent.slice(
      0,
      insertPosition
    ) +
    `${importLine}\n` +
    registryContent.slice(
      insertPosition
    )

  console.log(
    `登録: import ${variableName}`
  )
} else {
  console.log(
    `import 登録済み: ${variableName}`
  )
}

// Map登録
const mapEntry =
  `${entryId}: ${variableName},`

if (
  !registryContent.includes(
    mapEntry
  )
) {
  const mapMarker =
    'export const currentPlaces: Record<number, CurrentPlace> = {'

  const mapStart =
    registryContent.indexOf(
      mapMarker
    )

  if (mapStart === -1) {
    throw new Error(
      'currentPlaces の定義を特定できません。'
    )
  }

  const mapEnd =
    registryContent.indexOf(
      '\n}',
      mapStart
    )

  if (mapEnd === -1) {
    throw new Error(
      'currentPlaces の終了位置を特定できません。'
    )
  }

  registryContent =
    registryContent.slice(
      0,
      mapEnd
    ) +
    `\n  ${mapEntry}` +
    registryContent.slice(
      mapEnd
    )

  console.log(
    `登録: ${mapEntry}`
  )
} else {
  console.log(
    `currentPlaces 登録済み: ${entryId}`
  )
}

// 書き込み
fs.writeFileSync(
  registryPath,
  registryContent,
  'utf8'
)

// --------------------------------------------------
// 完了
// --------------------------------------------------

console.log('')
console.log('------------------------------')
console.log('名所記事の準備が完了しました。')
console.log('------------------------------')
console.log(`Entry ID : ${entry.id}`)
console.log(`名所名   : ${entry.heading}`)

if (entry.reading) {
  console.log(
    `読み     : ${entry.reading}`
  )
}

console.log(
  `記事     : http://localhost:3000/meisho/${entry.id}`
)

console.log('')
console.log(
  `編集先   : src/data/meisho/${entry.id}.ts`
)