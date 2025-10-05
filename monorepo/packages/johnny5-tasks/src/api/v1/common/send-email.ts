import { dapr, setJsonContentHeader } from '@dbc-tech/johnny5'
import { type EmailLog, EmailLogModel } from '@dbc-tech/johnny5-mongodb'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { taskEmailCloudEventSchema } from '@dbc-tech/johnny5/typebox/email-message.schema.ts'
import sgMail from '@sendgrid/mail'
import { Elysia } from 'elysia'
import { ObjectId } from 'mongodb'
import { serializeError } from 'serialize-error'
import { taskContext } from '../../plugins/task-context.plugin'

export const send_email = new Elysia()
  .use(taskContext({}))
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/send-email',
    async ({ body, ctx }) => {
      const { logger } = ctx
      const { data } = body
      const { tenant, fileId, taskId, recipients, subject, message } = data
      await logger.info(
        `Starting to send email for File Id:${fileId}, Task Id:${taskId}`,
      )
      await logger.debug('Event payload', body)

      try {
        // send email
        sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
        const fromEmail = {
          email: process.env.SENDGRID_FROM_EMAIL!,
          name: 'Johnny5',
        }

        const email = recipients[0].email
        const messageId = `<${taskId}${email}>`

        const msg = {
          to: recipients,
          from: fromEmail,
          subject,
          text: message,
          headers: { 'Message-ID': messageId, 'In-Reply-To': messageId },
        }

        const response = await sgMail.send(msg)

        // save to mongo db
        const emailLogModel = new EmailLogModel<EmailLog>({
          tenant,
          fileId: new ObjectId(fileId),
          taskId: new ObjectId(taskId),
          recipients,
          subject,
          message,
          sender: fromEmail,
          email_id: response[0].headers['x-message-id'],
          email_status: response[0].statusCode.toString(),
          createdOn: new Date(),
        })

        await emailLogModel.save()
      } catch (error) {
        const errJson = serializeError(error)
        await logger.error(
          `Failed to send email for File Id:${fileId}, Task Id:${taskId}`,
          errJson,
        )
        return dapr.drop
      }

      await logger.info(
        `Finished sending email for File Id:${fileId}, Task Id:${taskId}`,
      )
      return dapr.success
    },
    {
      body: taskEmailCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    },
  )
