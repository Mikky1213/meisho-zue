import {
  appendArrayObject,
  articlePath,
  buildObject,
  ensureFile,
  ensureUrl,
  fail,
  parseCliArgs,
  printSuccess,
  readTextInput,
  readUtf8,
  requireInteger,
  requireText,
  writeUtf8,
} from './lib/content-utils.mjs'

const typeMap = {
  translation: 'translation',
  document: 'documents',
  comparison: 'comparison',
}

export function addContent({
  entryId,
  type,
  flags,
}) {
  const property =
    typeMap[type]

  if (!property) {
    throw new Error(
      `type は translation / document / comparison のいずれかです: ${type}`
    )
  }

  const filePath =
    articlePath(entryId)

  ensureFile(
    filePath,
    '記事ファイル'
  )

  const body =
    readTextInput({
      flags,
    }).trim()

  if (!body) {
    throw new Error(
      '本文が空です'
    )
  }

  let objectText

  if (type === 'translation') {
    objectText =
      buildObject([
        ['title',
          typeof flags.title === 'string'
            ? flags.title
            : undefined],
        ['text', body],
      ])
  }

  if (type === 'document') {
    objectText =
      buildObject([
        [
          'title',
          requireText(
            flags.title,
            '--title'
          ),
        ],
        ['text', body],
        ['source',
          typeof flags.source === 'string'
            ? flags.source
            : undefined],
        ['url',
          typeof flags.url === 'string'
            ? ensureUrl(
                flags.url,
                '--url'
              )
            : undefined],
      ])
  }

  if (type === 'comparison') {
    objectText =
      buildObject([
        [
          'title',
          requireText(
            flags.title,
            '--title'
          ),
        ],
        ['text', body],
        ['source',
          typeof flags.source === 'string'
            ? flags.source
            : undefined],
        ['url',
          typeof flags.url === 'string'
            ? ensureUrl(
                flags.url,
                '--url'
              )
            : undefined],
      ])
  }

  let text =
    readUtf8(filePath)

  text =
    appendArrayObject({
      text,
      property,
      objectText,
    })

  writeUtf8(
    filePath,
    text
  )

  printSuccess(
    `${type} を追加: ${entryId}`
  )
}

export function runCli() {
  const {
    positional,
    flags,
  } = parseCliArgs()

  const entryId =
    requireInteger(
      positional[0],
      'entry ID'
    )

  const type =
    requireText(
      positional[1],
      'type'
    )

  addContent({
    entryId,
    type,
    flags,
  })
}

if (
  import.meta.url ===
  `file://${process.argv[1].replaceAll('\\', '/')}`
) {
  try {
    runCli()
  } catch (error) {
    fail(error)
  }
}
