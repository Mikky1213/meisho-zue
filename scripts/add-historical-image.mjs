import {
  appendRecordArrayItem,
  buildObject,
  ensureFile,
  ensureUrl,
  fail,
  hasExactUrl,
  historicalMediaPath,
  parseCliArgs,
  printSuccess,
  readUtf8,
  requireInteger,
  requireText,
  writeUtf8,
} from './lib/content-utils.mjs'

function main() {
  const {
    positional,
    flags,
  } = parseCliArgs()

  const entryId =
    requireInteger(
      positional[0],
      'entry ID'
    )

  const url =
    ensureUrl(
      positional[1],
      '歴史画像URL'
    )

  const caption =
    requireText(
      flags.caption,
      '--caption'
    )

  const filePath =
    historicalMediaPath()

  ensureFile(
    filePath,
    'historicalMedia.ts'
  )

  let text =
    readUtf8(filePath)

  if (hasExactUrl(text, url)) {
    throw new Error(
      '同じ歴史画像URLがすでに登録されています'
    )
  }

  const objectText =
    buildObject([
      ['url', url],
      ['caption', caption],
      ['alt',
        typeof flags.alt === 'string'
          ? flags.alt
          : undefined],
      ['source',
        typeof flags.source === 'string'
          ? flags.source
          : undefined],
      ['sourceUrl',
        typeof flags['source-url'] === 'string'
          ? ensureUrl(
              flags['source-url'],
              '--source-url'
            )
          : undefined],
      ['page',
        typeof flags.page === 'string'
          ? flags.page
          : undefined],
      ['note',
        typeof flags.note === 'string'
          ? flags.note
          : undefined],
    ])

  text =
    appendRecordArrayItem({
      text,
      exportName:
        'historicalMedia',
      numericKey: entryId,
      objectText,
    })

  writeUtf8(
    filePath,
    text
  )

  printSuccess(
    `歴史画像を追加: ${entryId}`
  )
}

try {
  main()
} catch (error) {
  fail(error)
}
