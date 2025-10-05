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
import { SdsErrorMessages } from '../../../johnny5/btr/constants'
import { ActionstepFileNoteService } from '../../../johnny5/btr/sds/actionstep-filenotes-service'
import { BtrSdsManifestBuilder } from '../../../johnny5/btr/sds/manifest-builder'
import {
  SdsAppError,
  handleSdsAppError,
} from '../../../johnny5/btr/utils/error-utils'
import { jobContext } from '../../plugins/job-context.plugin'

export const manifest_create = new Elysia()
  .use(jobContext({ name: 'v1.btr-sds-matter.manifest-create' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/manifest-create',
    async ({ body, ctx }) => {
      const { logger, status, next, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      const matterId = job.matterIds?.[0]?.number
      const actionstep = ctx.actionstep()
      await logger.info(
        `SDS #Starting to create Manifest for File Id:${fileId}, Job Id:${jobId} with Matter Id:${matterId}`,
      )
      await logger.debug('SDS #Event payload', body)

      try {
        if (!matterId) {
          throw new SdsAppError(
            SdsErrorMessages.MATTER_ID_UNKNOWN.userMessage,
            'MATTER_ID_UNKNOWN',
          )
        }

        const builder = new BtrSdsManifestBuilder(ctx.logger, ctx.correlationId)
        const manifest = await builder.build(jobId)
        const issues = builder.getIssues()
        await logger.debug(
          `SDS #Creating Manifest for File Id:${fileId}, Job Id:${jobId}`,
          { manifest },
        )
        await logger.debug(
          `SDS #Getting Manifest Issues for File Id:${fileId}, Job Id:${jobId}`,
          { issues },
        )

        if (!Value.Check(matterManifestSchema, manifest)) {
          const iterator = Value.Errors(matterManifestSchema, manifest)
          const errors = [...iterator]
          await logger.error('Invalid manifest', errors[0])

          throw new SdsAppError(
            SdsErrorMessages.MANIFEST_INVALID.userMessage,
            'MANIFEST_INVALID',
            { manifest: JSON.stringify(errors[0]) },
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
          `SDS #Created Manifest for File Id:${fileId}, Job Id:${jobId}`,
        )

        await status('manifest-created')
        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-btr-sds-matter',
          path: 'v1.btr-sds-matter.populate-participants',
        })

        await logger.info(
          `Finished creating Manifest for File Id:${fileId}, Job Id:${jobId}`,
        )

        return dapr.success
      } catch (error: unknown) {
        const { filenoteMessage } = await handleSdsAppError(
          'Error creating Manifest',
          error,
          fileId,
          jobId,
          logger,
        )

        await status('error-processing', filenoteMessage)

        if (matterId) {
          const service = new ActionstepFileNoteService(
            matterId,
            job,
            actionstep,
            logger,
          )
          await service.createSubmissionDetailsWithError(filenoteMessage)
        }

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
