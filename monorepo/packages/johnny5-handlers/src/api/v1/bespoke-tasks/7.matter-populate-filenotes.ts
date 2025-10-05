import type { FileNotePostInner } from '@dbc-tech/actionstep'
import {
  bespokeTasksManifestSchema,
  dapr,
  getValue,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { component, daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { Elysia, t } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'
import { bespokeError } from './common'

export const matter_populate_filenotes = new Elysia()
  .use(jobContext({ name: 'v1.bespoke-tasks.matter-populate-filenotes' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/matter-populate-filenotes',
    async ({ body, ctx }) => {
      const { logger, next, file, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to populate Matter (Filenotes) for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      if (!file.actionStepMatterId) {
        await logger.error(
          `File Id:${fileId} does not have an ActionStep Matter Id`,
        )
        return dapr.drop
      }

      const manifest = getValue(
        job.meta,
        'manifest',
        bespokeTasksManifestSchema,
        true,
      )
      if (!manifest) {
        await logger.error(
          `Manifest not found for File Id:${fileId}, Job Id:${jobId}, Matter Id:${file.actionStepMatterId}`,
        )
        return dapr.drop
      }

      if (manifest.filenotes.length > 0) {
        const as = ctx.actionstep()
        const existingFilenote = getValue(
          job.meta,
          'filenote',
          t.String(),
          false,
        )

        const postBody: FileNotePostInner[] = manifest.filenotes.map(
          (note) => ({
            text: note.note,
            links: {
              action: `${file.actionStepMatterId}`,
            },
          }),
        )
        if (existingFilenote) {
          postBody.push({
            text: `Issues encountered during bespoke tasks processing:\n${existingFilenote}`,
            links: {
              action: `${file.actionStepMatterId}`,
            },
          })
        }
        try {
          await as.createFileNotes({ filenotes: postBody })
        } catch (error) {
          await bespokeError(error, 'Error creating filenotes', job, logger)
          return dapr.drop
        }
      }

      await next({
        pubsub: component.longQueues,
        queueName: 'johnny5-bespoke-tasks',
        path: 'v1.bespoke-tasks.matter-send-emails',
      })

      await logger.info(
        `Finished populating Matter (FileNotes) for File Id:${fileId}, Job Id:${jobId}, Matter Id:${file.actionStepMatterId}`,
      )

      return dapr.success
    },
    {
      body: jobCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
