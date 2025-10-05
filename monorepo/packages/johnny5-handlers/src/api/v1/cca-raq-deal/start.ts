import { datalakeQuery } from '@dbc-tech/datalake'
import { component, jobCloudEventSchema } from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5'
import { setJsonContentHeader } from '@dbc-tech/johnny5'
import { dapr } from '@dbc-tech/johnny5'
import { CcaRaqModel, DealCreateModel } from '@dbc-tech/johnny5-mongodb'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { dbTimestampMelbourne } from '../../../utils/date-utils'
import { datalakeDb } from '../../plugins/db.datalake.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const start = new Elysia()
  .use(jobContext({ name: 'cca-raq-deal' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .use(datalakeDb)
  .post(
    '',
    async ({ body, ctx, datalakeDb }) => {
      const { logger, next, status, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to process RAQ for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      const clientDL = await datalakeDb.connect()
      const dlQuery = datalakeQuery(clientDL)

      try {
        const raqData = await CcaRaqModel.findOne({ jobId: jobId })
        if (!raqData) {
          throw new Error(
            `CcaRaq not found for File Id:${fileId}, Job Id:${jobId}`,
          )
        }

        await logger.debug(
          `Getting DataSource ID for Source:${raqData.source}, Sub:${raqData.sub}, File Id:${fileId}, Job Id:${jobId}`,
        )
        // get sourceID from SourceSystem
        const dataSourceRes = await dlQuery.dataSource.findBySource(
          raqData.source,
          raqData.sub,
        )

        const sourceID = dataSourceRes[0].source_id

        await logger.debug(
          `Creating Datainput in datalake for File Id:${fileId}, Job Id:${jobId}`,
        )
        const inputResponse = await datalakeQuery(
          clientDL,
        ).dataInput.insertData({
          sourceId: sourceID,
          data: raqData,
          status: 'N',
          isTest: false,
          created: dbTimestampMelbourne(),
          updated: dbTimestampMelbourne(),
        })

        if (!inputResponse) {
          throw new Error(
            `Error creating DataInput for File Id:${fileId}, Job Id:${jobId}`,
          )
        }

        await logger.debug(
          `Creating DealCreate in MongoDB for File Id:${fileId}, Job Id:${jobId}`,
        )
        const dealData = {
          tenant: job.tenant,
          fileId: fileId,
          jobId: jobId,
          status: 'created',
          datainputId: inputResponse,
          createdOn: dbTimestampMelbourne(),
        }

        const newDealCreate = new DealCreateModel(dealData)
        await newDealCreate.save()

        await status('in-progress')
        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-cca-raq-deal',
          path: 'v1.cca-raq-deal.process-lead',
        })

        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error processing raq deal for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )

        await status(
          'error-processing',
          `Error processing RAQ deal: ${JSON.stringify(errJson)}`,
        )

        return dapr.drop
      } finally {
        clientDL.release()
      }
    },
    {
      body: jobCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
