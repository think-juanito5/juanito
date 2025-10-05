import { CcaRaqModel, QuoteModel } from '@dbc-tech/johnny5-mongodb'
import { J5Config } from '@dbc-tech/johnny5/constants'
import {
  capitalise,
  convertBlobFilenameToR2,
  getIntentFromBst,
} from '@dbc-tech/johnny5/utils'
import { type EmailData } from '@sendgrid/helpers/classes/email-address'
import sgMail, { type MailDataRequired } from '@sendgrid/mail'
import { S3Client } from 'bun'
import { serializeError } from 'serialize-error'
import { getFormType } from '../../utils/cca-quote-utils'
import { getCcaConfig } from '../../utils/config-parser-utils'
import { ZapierService } from '../../utils/zapier-service'
import { handlerStatus, taskHandler } from '../plugins/task-handler-plugin'

export const v1_quote_completed = taskHandler({
  path: '/quote-completed',
  handler: async ({ ctx }) => {
    const { logger, file, task, environment, johnny5Config } = ctx

    const quote = await QuoteModel.findOne({
      fileId: file.id,
    })
    if (!quote) {
      const msg = `No quote found for fileId: ${file.id}, taskId: ${task.id}`
      await logger.warn(msg)
      return handlerStatus.fail(msg)
    }

    const raq = await CcaRaqModel.findOne({
      fileId: file.id,
    })
    if (!raq) {
      const msg = `No RAQ found for quote: ${quote.id}, fileId: ${file.id}, taskId: ${task.id}`
      await logger.warn(msg)
      return handlerStatus.fail(msg)
    }

    let contractUrl: string | undefined = undefined
    if (quote.contractBlobFile) {
      const client = new S3Client({
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        bucket: process.env.CLOUDFLARE_R2_BUCKET,
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      })

      const r2BlobName = convertBlobFilenameToR2(quote.contractBlobFile)

      const blob = client.file(r2BlobName)
      if (!(await blob.exists())) {
        const msg = `Contract blob file does not exist for quote: ${quote.id}, fileId: ${file.id}, taskId: ${task.id}`
        await logger.warn(msg)
        return handlerStatus.fail(msg)
      }

      contractUrl = blob.presign({
        expiresIn: 60 * 60 * 24, // 1 day
      })

      await logger.info(
        `Generated presigned URL for contract file for quote: ${quote.id}, fileId: ${file.id}, taskId: ${task.id}`,
        { contractBlobFile: quote.contractBlobFile, contractUrl },
      )
    }

    const payload = {
      fileId: file.id,
      dealId: file.pipedriveDealId,
      firstName: raq.firstName,
      lastName: raq.lastName,
      contractUrl,
      email: raq.email,
      phone: raq.phone,
      bst: raq.bst,
      state: raq.state,
      plan: quote.selectedPlan ? capitalise(quote.selectedPlan) : undefined,
    }

    const ccaQuoteCfg = await getCcaConfig(
      johnny5Config,
      J5Config.cca.quoteCompleted.emailRecipients,
      J5Config.cca.quoteCompleted.templateId,
    )
    const { emailRecipients, templateId } = ccaQuoteCfg
    await logger.info(`Email recipients/templateId for quote completed`, {
      emailRecipients,
      templateId,
    })

    if (!templateId) {
      const msg = `J5 Config: ${J5Config.cca.quoteCompleted.templateId} is not set, skipping email sending`
      await logger.warn(msg)
      return handlerStatus.fail(msg)
    }

    try {
      const from: EmailData = {
        email: process.env.SENDGRID_FROM_EMAIL!,
      }
      const to: EmailData[] = emailRecipients.map((email) => ({
        email,
      }))

      const intent = getIntentFromBst(raq.bst)
      const msg: MailDataRequired = {
        from,
        personalizations: [
          {
            to,
            dynamicTemplateData: {
              ...payload,
              created_utc: new Date().toISOString(),
              subject: `[Quote Completed] New submission from CCA Website (${environment}) - ${raq.state} - ${intent}`,
            },
          },
        ],
        templateId,
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
      await logger.info(`Starting to send email request to Sendgrid`)
      const response = await sgMail.send(msg)
      await logger.info(`Successfully sent email request to Sendgrid`, {
        statusCode: response[0].statusCode,
      })
      await logger.debug(`Sendgrid response`, response.toString())
      await logger.debug(`Sending payload to Zapier...`, { payload })

      const zapier = new ZapierService({
        baseUrl: process.env.ZAPIER_BASE_URL || 'https://hooks.zapier.com',
        clientId: 'QuoteCompleted',
        correlationId: file.id,
        logger,
      })

      const formType = getFormType(raq.state, intent, quote.contractBlobFile)
      await logger.info(`Determined form type for quote`, {
        formType,
        state: raq.state,
        intent,
        contractBlobFile: quote.contractBlobFile,
      })

      if (!formType) {
        const msg = `Failed to determine form type for quote: ${quote.id}, fileId: ${file.id}, taskId: ${task.id}`
        await logger.warn(msg)
        return handlerStatus.fail(msg)
      }
      const zapierPayload = {
        dealID: file.pipedriveDealId || 0,
        Formtype: formType,
        Email: raq.email,
        Firstname: raq.firstName,
        Lastname: raq.lastName,
        Phone: raq.phone,
      }
      await logger.info(`Sending payload to Zapier`, zapierPayload)
      const res2 = await zapier.ccaQuoteThankyou(zapierPayload)
      await logger.info(`Zapier response:`, { res2 })
    } catch (error) {
      const errJson = serializeError(error)
      const msg = `Failed to send email for quote: ${quote.id}, fileId: ${file.id}, taskId: ${task.id}`
      await logger.error(msg, errJson)
      return handlerStatus.fail(msg)
    }

    return handlerStatus.success()
  },
})
