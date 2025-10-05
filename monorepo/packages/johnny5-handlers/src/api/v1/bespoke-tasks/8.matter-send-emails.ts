import {
  bespokeTasksManifestSchema,
  dapr,
  getValue,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { type DbJob, JobModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { type EmailData } from '@sendgrid/helpers/classes/email-address'
import sgMail, { type MailDataRequired } from '@sendgrid/mail'
import { Elysia } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'
import { bespokeError } from './common'

export const matter_send_emails = new Elysia()
  .use(jobContext({ name: 'v1.bespoke-tasks.matter-send-emails' }))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/matter-send-emails',
    async ({ body, ctx }) => {
      const { logger, status, file, job } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to send Emails for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

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

      if (manifest.emails.length > 0) {
        sgMail.setApiKey(process.env['SENDGRID_API_KEY']!)

        for (const e of manifest.emails) {
          const from: EmailData = {
            email: process.env['SENDGRID_FROM_EMAIL']!,
          }
          const to: EmailData[] = e.to.split(',')

          const msg: MailDataRequired = {
            from,
            personalizations: [
              {
                to,
                subject: e.subject,
              },
            ],
            text: e.body,
          }
          try {
            await logger.info(`Starting to send email request to Sendgrid`)
            const response = await sgMail.send(msg)
            await logger.info(`Successfully sent email request to Sendgrid`, {
              statusCode: response[0].statusCode,
            })
          } catch (error) {
            await bespokeError(error, 'Error sending emails', job, logger)
            return dapr.drop
          }
        }
      }

      const updateJob: Partial<DbJob> = {
        completedOn: new Date(),
      }
      await logger.debug(`Updating Job: ${jobId}`, updateJob)
      await JobModel.findByIdAndUpdate(jobId, updateJob)

      await status('completed')

      await logger.info(
        `Finished populating Matter for File Id:${fileId}, Job Id:${jobId}, Matter Id:${file.actionStepMatterId}`,
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
