import { type DbJob, setValue } from '@dbc-tech/johnny5-mongodb'
import { getValue } from '@dbc-tech/johnny5/utils/meta-utils'
import type { Logger } from '@dbc-tech/logger'
import { t } from 'elysia'
import type { HydratedDocument } from 'mongoose'
import { serializeError } from 'serialize-error'

export const bespokeError = async (
  error: unknown,
  message: string,
  job: HydratedDocument<DbJob>,
  logger: Logger,
) => {
  const errJson = serializeError(error)
  // Save the error to the job meta
  const existingFilenote = getValue(job.meta, 'filenote', t.String(), false)
  const newFileNote =
    (existingFilenote ? `${existingFilenote}\n\n` : '') +
    `${message}: ${JSON.stringify(errJson)}`
  await setValue(job.id, 'filenote', newFileNote)

  await logger.error(
    `${message} for File Id:${job.fileId}, Job Id:${job.id}`,
    errJson,
  )
}
