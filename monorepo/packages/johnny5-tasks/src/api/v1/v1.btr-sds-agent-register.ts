import { type BtrSdsAgentEmail, getValue } from '@dbc-tech/johnny5'
import {
  type BtrConveyancer,
  BtrConveyancerModel,
} from '@dbc-tech/johnny5-mongodb'
import { J5Config } from '@dbc-tech/johnny5/constants'
import { btrSdsAgentWebhookSchema } from '@dbc-tech/johnny5/typebox'
import { type EmailData } from '@sendgrid/helpers/classes/email-address'
import sgMail, { type MailDataRequired } from '@sendgrid/mail'
import { t } from 'elysia'
import { serializeError } from 'serialize-error'
import { handlerStatus, taskHandler } from '../plugins/task-handler-plugin'

export const v1_btr_sds_agent_register = taskHandler({
  path: '/btr-sds-agent-register',
  handler: async ({ ctx }) => {
    const { logger, task, environment, johnny5Config } = ctx

    const { meta, testMode } = task
    const webhook = getValue(meta, 'webhookPayload', btrSdsAgentWebhookSchema)

    await logger.info(
      `Starting to process BTR SDS Agent Register ${webhook.webhook_id}`,
    )
    await logger.debug(`Webhook payload`, webhook)

    const templateId = await johnny5Config.getString(
      J5Config.btr.sellerDisclosure.agents.emailTemplateId,
    )
    if (!templateId) {
      await logger.error(
        `AZ Setting: ${J5Config.btr.sellerDisclosure.agents.emailTemplateId} is not set, skipping email sending`,
      )
      return handlerStatus.ignore(
        `AZ Setting: ${J5Config.btr.sellerDisclosure.agents.emailTemplateId} is not set, skipping email sending`,
      )
    }

    const { postcodes, conveyancer_email, conveyancer_area } = webhook

    let testEmailRecipients: string[] = []
    if (testMode) {
      await logger.info(`Test mode is enabled for BTR Agent Form`)

      testEmailRecipients =
        (await johnny5Config.getValue(
          J5Config.btr.sellerDisclosure.agents.testEmailRecipients,
          t.Array(t.String()),
          false,
        )) ?? []

      if (testEmailRecipients.length === 0) {
        await logger.error(
          `AZ Setting: ${J5Config.btr.sellerDisclosure.agents.testEmailRecipients} is not set, skipping email sending`,
        )
        return handlerStatus.ignore(
          `AZ Setting: ${J5Config.btr.sellerDisclosure.agents.testEmailRecipients} is not set, skipping email sending`,
        )
      }
    }

    let conveyancerData: BtrConveyancer | null = null
    if (conveyancer_area && conveyancer_email) {
      await logger.info(
        `Conveyancer email provided: ${conveyancer_email}, using it for email sending`,
      )
      conveyancerData = await BtrConveyancerModel.findOne({
        area: conveyancer_area,
      })
      if (conveyancerData && conveyancerData?.email !== conveyancer_email) {
        await logger.warn(
          `Conveyancer email mismatch: expected ${conveyancerData?.email}, got ${conveyancer_email}`,
        )
        conveyancerData.email = conveyancer_email
      }
    }
    if (!conveyancerData) {
      conveyancerData = await BtrConveyancerModel.findOne({ area: 'Q00' })
      if (!conveyancerData) {
        return handlerStatus.fail(
          `No conveyancer data with area 'Q00'. Please ensure that the default conveyancer is set up.`,
        )
      }
    }

    const emailRecipients: string[] = testMode
      ? testEmailRecipients
      : conveyancerData.email
        ? [conveyancerData.email]
        : []

    if (emailRecipients.length === 0) {
      await logger.error(
        `No email recipients found for conveyancer: ${conveyancerData.name}`,
      )
      return handlerStatus.ignore(
        `No email recipients found for conveyancer: ${conveyancerData.name}`,
      )
    }

    // Additional fixed recipients (only for prod, not used with testMode)
    const ccEmailRecipients =
      (await johnny5Config.getValue(
        J5Config.btr.sellerDisclosure.agents.ccEmailRecipients,
        t.Array(t.String()),
        false,
      )) ?? []

    try {
      const from: EmailData = {
        email: process.env.SENDGRID_FROM_EMAIL!,
      }
      await logger.info(
        `Preparing to send email for BTR SDS Agent Register ${webhook.webhook_id}`,
      )
      await logger.debug(`Conveyancer email: ${conveyancerData.email}`)

      const to: EmailData[] = emailRecipients.map((email) => ({
        email,
      }))
      const cc: EmailData[] | undefined = testMode
        ? undefined
        : ccEmailRecipients.map((email) => ({
            email,
          }))

      const dynamicTemplateData: BtrSdsAgentEmail = {
        agent: webhook.agent,
        agency_name: webhook.agency_name,
        agency_service_area: webhook.agency_service_area,
        agent_profile_url: webhook.agent_profile_url,
        customer_landing_url: webhook.customer_landing_url,
        customer_form_url: webhook.customer_form_url,
        created_on: webhook.created_on,
        subject: `You’ve Got a New Agent Lead! (${environment})`,
        postcode: postcodes.join(', '),
        area: conveyancerData.area,
        region: conveyancerData.region,
        conveyancerName: conveyancerData.name,
      }

      const msg: MailDataRequired = {
        from,
        personalizations: [
          {
            to,
            cc,
            dynamicTemplateData,
          },
        ],
        templateId,
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
      await logger.info(`Starting to send email request to Sendgrid`, msg)
      const response = await sgMail.send(msg)
      await logger.info(`Successfully sent email request to Sendgrid`, {
        statusCode: response[0].statusCode,
      })
      await logger.debug(`Sendgrid response`, response.toString())
    } catch (error) {
      const errJson = serializeError(error)
      await logger.error(
        `Failed to send email for BTR SDS Agent Register ${webhook.webhook_id} with error`,
        errJson,
      )
      return handlerStatus.fail(
        `Failed to send email for BTR SDS Agent Register ${webhook.webhook_id}`,
      )
    }

    await logger.info(
      `Finished processing BTR SDS Agent Register ${webhook.webhook_id}`,
    )

    return handlerStatus.success()
  },
})
