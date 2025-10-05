import { parseArgs } from 'util'
import { Value } from '@sinclair/typebox/value'
import { CliConfigSchema } from './cli.schema'
import { sb } from './sb/sb'

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    cmd: {
      type: 'string',
    },
    configFile: {
      type: 'string',
    },
    subscription: {
      type: 'string',
    },
    markdown: {
      type: 'boolean',
    },
    teamsAlert: {
      type: 'boolean',
    },
  },
  strict: true,
  allowPositionals: true,
})

if (!values.configFile) throw new Error('configFile is required')

const file = Bun.file(values.configFile)
const contents = await file.json()
const config = Value.Parse(CliConfigSchema, contents)

if (values.cmd === 'sb') {
  const { subscription: subscriptionId, markdown, teamsAlert } = values
  if (!subscriptionId) throw new Error('subscription is required')

  await sb(
    {
      subscriptionId,
      markdown: markdown ?? false,
      teamsAlert: teamsAlert ?? false,
    },
    config,
  )
  process.exit(0) // needed because it hangs after enumerating PagedAsyncIterableIterator in the Azure SDK
}
