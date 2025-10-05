import {
  dapr,
  daprResponseSchema,
  jobCloudEventSchema,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { opsbiQuery } from '@dbc-tech/opsbi'
import { sub } from 'date-fns'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { opsbi } from '../../plugins/db.opsbi.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const start = new Elysia()
  .use(jobContext({ name: 'v1.stale-matter-cleanup' }))
  .use(opsbi)
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '',
    async ({ body, ctx, opsbi }) => {
      const { data } = body
      const { fileId, jobId } = data
      const { logger, services, status } = ctx

      await logger.info(
        `Starting next stage of Stale Matter Cleanup for File Id:${fileId}, Job Id:${jobId}`,
      )

      let matterIds: number[] = []
      const days = +process.env.STALE_MATTER_DAYS! || 14
      const staleMatterDate = sub(new Date(), {
        days,
      }).toISOString()

      logger.debug(`Query for stale matters`, { days, staleMatterDate })

      const client = await opsbi.connect()
      logger.debug(`Connected to opsbi`)
      try {
        const query = opsbiQuery(client)
        const result =
          await query.matters.staleOnlineConversions(staleMatterDate)
        matterIds = result.map((m) => m.action_id)
      } catch (e) {
        logger.error(
          `Error fetching Stale Matters from opsbi database: ${JSON.stringify(e)}`,
        )
        return dapr.retry
      } finally {
        client.release()
      }

      logger.info(
        `Found ${matterIds.length} Stale Matters created before ${staleMatterDate}`,
      )

      if (matterIds.length === 0) {
        logger.info(`No Stale Matters to process`)
        return dapr.success
      }

      const cca = services()
      try {
        const batchJob = await cca.batchMatterClose(fileId, {
          matterIds: matterIds,
          closureReason: `Automated closure by system for stale matters contract drafting matters older than ${days} days`,
        })
        logger.info(
          `Started batch closure of ${matterIds.length} matters in JobId ${batchJob.id}`,
        )

        await logger.info(
          `Finished Stale Matter Cleanup for File Id:${fileId}, Job Id:${jobId}`,
        )
        await status('completed')
        return dapr.success
      } catch (e) {
        const err = serializeError(e)
        logger.error(`Error processing Stale Matter ${matterIds}: ${err}`)
        await status('error-processing', JSON.stringify(err))
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
