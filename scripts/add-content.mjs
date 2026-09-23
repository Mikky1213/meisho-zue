import {
  runCli,
} from './lib/content-mutator.mjs'
import {
  fail,
} from './lib/content-utils.mjs'

try {
  runCli()
} catch (error) {
  fail(error)
}
