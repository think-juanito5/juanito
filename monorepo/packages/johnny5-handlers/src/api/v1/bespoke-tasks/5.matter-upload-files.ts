import {
  bespokeTasksManifestSchema,
  dapr,
  getValue,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { component, daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { Elysia } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'
import { bespokeError } from './common'

export const matter_upload_files = new Elysia()
  .use(jobContext({ name: 'v1.bespoke-tasks.matter-upload-files' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/matter-upload-files',
    async ({ body, ctx }) => {
      const { logger, next, file, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to upload Matter (Files) for File Id:${fileId}, Job Id:${jobId}`,
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
      if (manifest.files.length > 0) {
        const as = ctx.actionstep()
        const tf = ctx.typeForm()

        for (const toUpload of manifest.files) {
          if (toUpload.url && !toUpload.isMissing) {
            try {
              const extn = '.' + toUpload.url.split('.').pop()
              const uploadedFile = await as.uploadDocument(
                await tf.downloadFileFromPath(
                  toUpload.url.replace('https://api.typeform.com/', ''),
                ), //download the files from typeform
                toUpload.rename + extn,
                process.env[`${job.tenant}_ACTIONSTEP_FILE_UPLOAD_URL`]!,
              )
              await as.linkDocumentToMatter({
                actiondocuments: {
                  file: uploadedFile.files.id + `;${toUpload.rename}${extn}`,
                  displayName: toUpload.rename + extn,
                  links: {
                    action: `${file.actionStepMatterId}`,
                    folder: `${toUpload.folder}`,
                  },
                },
              })
            } catch (error) {
              await bespokeError(error, 'Error uploading files', job, logger)
              return dapr.retry
            }
          }
        }
      }

      await next({
        pubsub: component.longQueues,
        queueName: 'johnny5-bespoke-tasks',
        path: 'v1.bespoke-tasks.matter-create-tasks',
      })

      await logger.info(
        `Finished populating Matter (Files) for File Id:${fileId}, Job Id:${jobId}, Matter Id:${file.actionStepMatterId}`,
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
