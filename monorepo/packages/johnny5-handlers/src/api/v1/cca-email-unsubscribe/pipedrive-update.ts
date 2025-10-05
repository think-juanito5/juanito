import { datalakeQuery } from '@dbc-tech/datalake'
import { component, getString, jobCloudEventSchema } from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5'
import { setJsonContentHeader } from '@dbc-tech/johnny5'
import { dapr } from '@dbc-tech/johnny5'
import type { V2PersonResponse, V2SearchPerson } from '@dbc-tech/pipedrive'
import { customFields } from '@dbc-tech/pipedrive'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { datalakeDb } from '../../plugins/db.datalake.plugin'
import { jobContext } from '../../plugins/job-context.plugin'

export const pipedrive_update = new Elysia()
  .use(jobContext({ name: 'cca-unsubscribe' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .use(datalakeDb)
  .post(
    '/pipedrive-update',
    async ({ body, ctx, datalakeDb }) => {
      const { logger, next, status, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to process CCA Unsubscribe - Pipedrive Update for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      const clientDL = await datalakeDb.connect()
      const dlQuery = datalakeQuery(clientDL)

      try {
        const { meta } = job

        if (!meta) {
          throw new Error(
            `Meta is undefined for File Id:${fileId}, Job Id:${jobId}`,
          )
        }
        const email = getString(meta, 'unsubscribeEmail', false)

        if (!email) {
          throw new Error(
            `Email not found in meta for File Id:${fileId}, Job Id:${jobId}`,
          )
        }

        await logger.info(`Searching for user subscriptions by email: ${email}`)
        const personSearch: V2SearchPerson = {
          field: 'email',
          term: email,
        }
        const pdServiceV1 = ctx.pipedriveV1()
        const pdServiceV2 = ctx.pipedriveV2()
        const personData: V2PersonResponse =
          await pdServiceV2.searchPerson(personSearch)

        if (!personData.data?.items?.length) {
          await logger.warn(`No Pipedrive person found for email: ${email}`)
        } else {
          await logger.info(
            `Found ${personData.data.items.length} Pipedrive Person records for email: ${email}`,
          )

          let pdEnableMktgId = 0
          const pdEnableMktg = await dlQuery.pipedriveDdLists.getPipedriveId(
            'EnableMarketing',
            'NO',
          )
          if (pdEnableMktg && pdEnableMktg[0]) {
            pdEnableMktgId = pdEnableMktg[0].pipedriveId!
          }

          for (const personItem of personData.data.items) {
            await logger.debug(
              `Found Pipedrive person: ${JSON.stringify(personItem)}`,
            )

            const personId = personItem.item.id

            // update Pipedrive person to unsubscribe
            await pdServiceV2.updatePerson(personId, {
              marketing_status: 'unsubscribed',
            })
            await logger.info(
              `Updated Pipedrive person ${personId} to unsubscribed`,
            )

            const personParam: Record<string, string> = {
              person_id: personId.toString(),
            }

            // get linked deals
            const dealData = await pdServiceV2.getDeals(personParam)

            if (dealData.data && dealData.data.length > 0) {
              await logger.info(
                `Found ${dealData.data.length} deals linked to person ${personId}`,
              )
              for (const deal of dealData.data) {
                await logger.debug(`Processing deal: ${JSON.stringify(deal)}`)

                const dealId = deal.id
                // update Enable Marketing for the deal
                await pdServiceV1.updateDeal(dealId, {
                  [customFields.enableMarketing]: pdEnableMktgId,
                })

                // Here you can add any additional processing logic for each deal
              }
            } else {
              await logger.info(`No deals found linked to person ${personId}`)
            }
          }
        }

        await next({
          pubsub: component.longQueues,
          queueName: 'johnny5-cca-email-unsubscribe',
          path: 'v1.cca-email-unsubscribe.actionstep-update',
        })

        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error processing unsubscribe pipedrive update for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )

        await status(
          'error-processing',
          `Error processing unsubscribe pipedrive update: ${JSON.stringify(errJson)}`,
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
