import type { PagedParticipants } from '@dbc-tech/actionstep'
import { getString, jobCloudEventSchema } from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5'
import { setJsonContentHeader } from '@dbc-tech/johnny5'
import { dapr } from '@dbc-tech/johnny5'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { jobContext } from '../../plugins/job-context.plugin'

export const actionstep_update = new Elysia()
  .use(jobContext({ name: 'cca-unsubscribe' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/actionstep-update',
    async ({ body, ctx }) => {
      const { logger, status, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to process CCA Unsubscribe - Actionstep Update for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      try {
        const { meta } = job

        // get email from file
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

        const actionstep = ctx.actionstep()

        const query = { ['email']: email }
        const response = await actionstep.getParticipants(query)
        const participantsRes = response as PagedParticipants

        // search participants by email
        if (!participantsRes?.participants?.length) {
          await logger.warn(
            `No participants found with email: ${email} for File Id:${fileId}, Job Id:${jobId}`,
          )
        } else {
          await logger.info(
            `Found ${participantsRes.participants.length} participants with email: ${email}`,
          )
          await logger.debug(
            `Participants data: ${JSON.stringify(participantsRes.participants)}`,
          )

          for (const participant of participantsRes.participants) {
            await logger.info(
              `Processing participant ID: ${participant.id}, Email: ${participant.email || email}`,
            )
            const participantId = participant.id
            const ClientParticipantTypeName = 'Client_Primary_Contact'

            // search matters by participant ID
            const mattersRes = await actionstep.getActionParticipants({
              filter: `participant = ${participantId} and participantType.name='${ClientParticipantTypeName}'`,
            })

            if (!mattersRes?.actionparticipants) {
              await logger.warn(
                `No matters found for participant ID: ${participantId} with email: ${email} for File Id:${fileId}, Job Id:${jobId}`,
              )
              continue
            }

            await logger.info(
              `Found matter(s): ${mattersRes.meta.paging.actionparticipants.recordCount} for participant ID: ${participantId}`,
            )

            for (const actionParticipant of mattersRes.actionparticipants) {
              if (!actionParticipant.links || !actionParticipant.links.action) {
                await logger.warn(
                  `No action link found for action participant ID: ${actionParticipant.id} (participant ID: ${participantId})`,
                )
                continue
              }
              await logger.info(
                `Action participant ID: ${actionParticipant.id}, Action: ${actionParticipant.links.action}`,
              )

              const matterId = actionParticipant.links.action
              // Add any matter-specific logic here if needed
              await actionstep.updateDataCollectionRecordValuev2(
                +matterId,
                'engage',
                'EnableMarketing',
                'No',
              )

              // create a filenote
              await actionstep.createFileNote({
                filenotes: {
                  text: `Client has unsubscribed from CCA marketing.`,
                  links: {
                    action: `${matterId}`,
                  },
                },
              })
            }
          }
        }

        await status('completed')

        return dapr.success
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Error processing unsubscribe actionstep update for File Id:${fileId}, Job Id:${jobId}`,
          errJson,
        )

        await status(
          'error-processing',
          `Error processing unsubscribe actionstep update: ${JSON.stringify(errJson)}`,
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
