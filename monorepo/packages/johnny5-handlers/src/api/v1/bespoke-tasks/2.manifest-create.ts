import {
  bespokeTasksManifestSchema,
  component,
  dapr,
  daprResponseSchema,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { setValue } from '@dbc-tech/johnny5-mongodb'
import { getValue } from '@dbc-tech/johnny5/utils/meta-utils'
import { typeFormWebhookSchema } from '@dbc-tech/typeform'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { BespokeTasksManifestBuilder } from '../../../johnny5/bespoke-tasks-manifest-builder'
import { ValidateOrThrow } from '../../../utils/typebox-utils'
import { jobContext } from '../../plugins/job-context.plugin'
import { bespokeError } from './common'

export const manifest_create = new Elysia()
  .use(jobContext({ name: 'v1.bespoke-tasks.manifest-create' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/manifest-create',
    async ({ body, ctx }) => {
      const { logger, status, next, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to create Bespoke Tasks Manifest for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      let additionalInfo
      try {
        additionalInfo = getValue(
          job.meta,
          'additionalInfo',
          typeFormWebhookSchema,
          true,
        )
      } catch (error) {
        await bespokeError(
          error,
          'Error retrieving additionalInfo from job meta',
          job,
          logger,
        )
        return dapr.drop
      }

      try {
        const builder = new BespokeTasksManifestBuilder(
          jobId,
          additionalInfo.form_response,
          ctx.actionstep(),
          ctx.dataverse(),
          ctx.logger,
          ctx.correlationId,
        )

        const manifest = await builder.build()
        const issues = builder.getIssues()
        await logger.debug(
          `Created Manifest for File Id:${fileId}, Job Id:${jobId}`,
          { manifest },
        )
        await logger.debug(
          `Getting Manifest Issues for File Id:${fileId}, Job Id:${jobId}`,
          { issues },
        )

        try {
          ValidateOrThrow(bespokeTasksManifestSchema, manifest)
        } catch (error) {
          const errJson = serializeError(error)
          await status(
            'error-processing',
            `Error creating manifest: ${errJson}`,
          )

          return dapr.drop
        }

        // Save the manifest to the job meta
        await setValue(jobId, 'manifest', JSON.stringify(manifest))

        await logger.info(
          `Created Manifest for File Id:${fileId}, Job Id:${jobId}`,
        )

        await status('manifest-created')
        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-bespoke-tasks',
          path: 'v1.bespoke-tasks.matter-complete-tasks',
        })

        await logger.info(
          `Finished creating Manifest for File Id:${fileId}, Job Id:${jobId}`,
        )

        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error creating Manifest for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )

        await status(
          'error-processing',
          `Error creating Manifest: ${JSON.stringify(errJson)}`,
        )

        return dapr.drop
      }
    },
    {
      body: jobCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
