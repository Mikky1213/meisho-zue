import {
  addContent,
} from './lib/content-mutator.mjs'
import {
  fail,
  parseCliArgs,
  requireInteger,
} from './lib/content-utils.mjs'

try {
  const {
    positional,
    flags,
  } = parseCliArgs()

  addContent({
    entryId: requireInteger(
      positional[0],
      'entry ID'
    ),
    type: 'document',
    flags,
  })
} catch (error) {
  fail(error)
}
