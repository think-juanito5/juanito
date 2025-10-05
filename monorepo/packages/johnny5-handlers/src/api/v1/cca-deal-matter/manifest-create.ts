import {
  component,
  dapr,
  daprResponseSchema,
  jobCloudEventSchema,
  matterManifestSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { type MatterCreate, MatterCreateModel } from '@dbc-tech/johnny5-mongodb'
import { Value } from '@sinclair/typebox/value'
import { Elysia } from 'elysia'
import { ObjectId } from 'mongodb'
import { serializeError } from 'serialize-error'
import { CcaManifestBuilder } from '../../../johnny5/cca/manifest-builder'
import { filenotePipedriveSvc } from '../../plugins/filenotes-pipedrive.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const manifest_create = new Elysia()
  .use(jobContext({ name: 'v1.cca-deal-matter.manifest-create' }))
  .use(filenotePipedriveSvc)
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/manifest-create',
    async ({ body, ctx, filenotePipedrive }) => {
      const { logger, status, next, job, file } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const dealId = file.pipedriveDealId!
      const pipedriveV1 = ctx.pipedriveV1()
      const pipedriveV2 = ctx.pipedriveV2()

      await logger.info(
        `Starting to create Manifest (manifest-create) for File Id:${fileId}, Job Id:${jobId} dealId:${dealId}`,
      )
      await logger.debug('Event payload', body)

      try {
        const builder = new CcaManifestBuilder(
          ctx.actionstep(),
          pipedriveV1,
          pipedriveV2,
          ctx.logger,
          ctx.correlationId,
        )
        const manifest = await builder.build(jobId)
        const issues = builder.getIssues()
        await logger.debug(
          `Creating Manifest for File Id:${fileId}, Job Id:${jobId}`,
          { manifest },
        )
        await logger.debug(
          `Getting Manifest Issues for File Id:${fileId}, Job Id:${jobId}`,
          { issues },
        )

        if (!Value.Check(matterManifestSchema, manifest)) {
          const iterator = Value.Errors(matterManifestSchema, manifest)
          const errors = [...iterator]
          await logger.error('Invalid manifest', errors[0])

          await filenotePipedrive
            .deal(dealId)
            .notify('matter-creation-error')
            .exec()

          await status(
            'error-processing',
            `Error creating manifest: ${JSON.stringify(errors[0])}`,
          )

          return dapr.drop
        }

        const matterId = job.matterIds?.[0]?.number
        if (!matterId) {
          throw new Error(
            `Matter Id unknown from Job for File Id:${fileId}, Job Id:${jobId}`,
          )
        }

        const matterData: Partial<MatterCreate> = {
          tenant: job.tenant,
          fileId: new ObjectId(fileId),
          jobId: job._id,
          manifest,
          issues,
          matterId,
        }

        const newMatterData = new MatterCreateModel(matterData)
        await newMatterData.save()

        await logger.info(
          `Created Manifest for File Id:${fileId}, Job Id:${jobId}`,
        )

        await status('manifest-created')
        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-cca-deal-matter',
          path: 'v1.cca-deal-matter.populate-participants',
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

        await filenotePipedrive
          .deal(dealId)
          .notify('matter-creation-error')
          .exec()

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
