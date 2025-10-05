import { testing } from '@dbc-tech/johnny5'
import {
  CcaRaqModel,
  type DbCcaRaq,
  type DbFile,
  type DbJob,
  type DbQuote,
  type DbTask,
  FileModel,
  JobModel,
  QuoteModel,
  TaskModel,
  mapQuote,
} from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type JobTestMode,
  ccaRaqWebhookSchema,
  idStringSchema,
  quoteSchema,
  updateQuoteContractBlobSchema,
  updateQuoteSelectPlanSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import {
  getIntentFromBst,
  getServiceType,
  hashString,
} from '@dbc-tech/johnny5/utils'
import { Elysia, t } from 'elysia'
import mongoose, { type HydratedDocument } from 'mongoose'
import { serializeError } from 'serialize-error'
import { Err, Ok } from 'ts-results-es'
import { defaultEmailSubscribers } from '../../utils/email-utils'
import { defaultTeamsSubscribers } from '../../utils/teams-utils'
import { appContext } from '../plugins/app-context.plugin'

export const quotes = new Elysia()
  .use(
    appContext({
      authorize: async ({ tenant, sub, source }) =>
        tenant === 'CCA' && !!sub && !!source,
    }),
  )
  .post(
    '',
    async ({ body, ctx, status }) => {
      const {
        logger,
        jwt: { tenant, source, sub },
        start,
        jobStatus,
        johnny5Config,
        pricing,
      } = ctx
      const { bst, phone, propertyType, state, webhook_id, cid } = body

      await logger.info(
        `Starting to process Quote request for CCA RAQ: ${webhook_id ?? cid ?? phone}`,
      )
      await logger.debug(`Request payload`, body)

      if (webhook_id) {
        const existingRaq = await CcaRaqModel.findOne({ webhook_id, tenant })
        if (existingRaq) {
          const existingQuote = await QuoteModel.findOne({
            fileId: existingRaq.fileId,
            tenant,
          })
          if (!existingQuote) {
            const message = `A RAQ with the webhook_id ${webhook_id} already exists but no associated Quote was found`
            await logger.error(message)
            return status(409, message)
          }

          await logger.info(
            `Returning existing Quote:${existingQuote.id} for CCA RAQ: ${webhook_id ?? cid ?? phone}`,
          )

          const mappedQuote = mapQuote(
            existingQuote.toObject(),
            existingRaq.toObject(),
          )
          await logger.debug(`Mapped Quote`, mappedQuote)

          await logger.info(
            `Finished processing Quote request for CCA RAQ: ${webhook_id ?? cid ?? phone}`,
          )

          return mappedQuote
        }
      }

      const racvPartner = !!body.membershipNo // For compatibility with FAST, we determine if the request is from RACV by checking if membershipNo is present

      if (!['B', 'S'].includes(bst))
        return status(
          400,
          `Invalid bst: ${bst}. Quote service currently supports only B(uy) and S(ell) intent`,
        )

      const hash = hashString(JSON.stringify(body))

      const intent = getIntentFromBst(bst)
      const serviceType = getServiceType(intent)

      const ccaPricing = pricing()
      const prices = await ccaPricing.getPrices({
        bst: bst === 'B' ? 'Purchasing' : 'Selling',
        state,
        propertyType,
        version: 'current',
      })
      const price = prices.length ? prices[0] : undefined

      const teamsSubscribers = await defaultTeamsSubscribers(
        johnny5Config,
        logger,
      )
      const emailSubscribers = await defaultEmailSubscribers(johnny5Config)

      const testMode: JobTestMode | undefined =
        phone === testing.ignoreDealMobileNumber ? 'ignore-deal' : undefined

      const session = await mongoose.startSession()
      let result: {
        raq: HydratedDocument<DbCcaRaq>
        job: HydratedDocument<DbJob>
        file: HydratedDocument<DbFile>
        quote: HydratedDocument<DbQuote>
      }
      try {
        result = await session.withTransaction(async () => {
          const file = new FileModel<DbFile>({
            tenant,
            serviceType,
            sourceReason: `Submit Quote request`,
            createdOn: new Date(),
          })
          await file.save({ session })

          const job = new JobModel<DbJob>({
            tenant,
            clientId: webhook_id,
            status: 'created',
            fileId: file._id,
            serviceType: file.serviceType!,
            type: 'raq-deal',
            createdOn: new Date(),
            emailSubscribers,
            teamsSubscribers,
            testMode,
          })
          await job.save({ session })

          const raq = new CcaRaqModel<DbCcaRaq>({
            ...body,
            sub: sub!,
            source: source!,
            fileId: file._id,
            jobId: job._id,
            tenant,
            createdOn: new Date(),
            hash,
          })
          await raq.save({ session })

          const model: DbQuote = {
            tenant,
            fileId: file._id,
            state,
            bst,
            propertyType,
            searchesFee: price?.dbc_searchesfee ?? undefined,
            searchesFeeMin: price?.dbc_searches_fee_min ?? undefined,
            searchesFeeMax: price?.dbc_searches_fee_max ?? undefined,
            reviewFee: price?.dbc_review_fee ?? undefined,
            draftingFee: price?.dbc_drafting_fee ?? undefined,
            fixedFee: price?.dbc_conveyancing_fee ?? undefined,
            sdsFee: price?.dbc_sds_fee ?? undefined,
            hideSearchesFees: price?.dbc_show_on_website
              ? !price.dbc_show_on_website
              : undefined,
            pricingUnavailable: prices.length === 0,
            partner: racvPartner ? 'racv' : undefined,
            createdOn: new Date(),
          }
          const quote = new QuoteModel<DbQuote>(model)
          await quote.save({ session })

          return { job, file, quote, raq }
        })
      } catch (error) {
        const jsonError = serializeError(error)
        await logger.error(
          'An unexpected error occurred while processing the quote request.',
          jsonError,
        )
        return status(500, jsonError.message ?? 'Unknown error')
      } finally {
        await session.endSession()
      }

      const { job, file, quote, raq } = result
      await jobStatus(job.id, file.id, 'created')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-cca-raq-deal',
          path: 'v1.cca-raq-deal',
        },
        { jobId: job.id, fileId: file.id, tenant },
      )

      const mappedQuote = mapQuote(quote.toObject(), raq.toObject())
      await logger.debug(`Mapped Quote`, mappedQuote)

      await logger.info(
        `Finished processing Quote request for CCA RAQ: ${webhook_id ?? cid ?? phone}`,
      )

      return mappedQuote
    },
    {
      body: ccaRaqWebhookSchema,
      headers: authHeaderSchema,
      response: {
        200: quoteSchema,
        400: t.String(),
        401: unauthorizedSchema,
        409: t.String(),
        500: t.String(),
      },
      detail: {
        summary: 'Request a Quote',
        tags: ['Johnny5', 'Quote'],
      },
    },
  )
  .get(
    ':id',
    async ({ params: { id }, ctx: { jwt }, status }) => {
      const quote = QuoteModel.findOne({
        _id: id,
        tenant: jwt.tenant,
      })
      const quoteResult = await quote.lean().exec()
      if (!quoteResult) {
        return status(404, `Quote with id ${id} not found`)
      }

      const raq = CcaRaqModel.findOne({
        fileId: quoteResult.fileId,
        tenant: jwt.tenant,
      })
      const raqResult = await raq.lean().exec()
      if (!raqResult) {
        return status(404, `RAQ with File id ${quoteResult.fileId} not found`)
      }
      return mapQuote(quoteResult, raqResult)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: quoteSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get a Quote by id',
        tags: ['Johnny5', 'Quote'],
      },
    },
  )
  .put(
    ':id/contract-blob',
    async ({
      params: { id },
      body: { blobName: contractBlobFile },
      ctx: { jwt },
      status,
      set,
    }) => {
      const quote = await QuoteModel.findOneAndUpdate(
        { _id: id, tenant: jwt.tenant },
        {
          contractBlobFile,
        },
      ).exec()

      if (!quote) {
        return status(404, `Quote with id ${id} not found`)
      }

      set.status = 204
      return
    },
    {
      body: updateQuoteContractBlobSchema,
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Update contract blob of a Quote by id',
        tags: ['Johnny5', 'Quote'],
      },
    },
  )
  .put(
    ':id/select-plan',
    async ({ params: { id }, body: { plan }, ctx: { jwt }, status, set }) => {
      const quote = await QuoteModel.findOneAndUpdate(
        { _id: id, tenant: jwt.tenant },
        {
          selectedPlan: plan,
        },
      ).exec()

      if (!quote) {
        return status(404, `Quote with id ${id} not found`)
      }

      set.status = 204
      return
    },
    {
      body: updateQuoteSelectPlanSchema,
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Select a plan for a Quote by id',
        tags: ['Johnny5', 'Quote'],
      },
    },
  )
  .post(
    ':id/complete',
    async ({
      params: { id },
      ctx: { jwt, johnny5Config, logger, taskStatus, start },
      status,
      set,
    }) => {
      const session = await mongoose.startSession()
      const result = await session.withTransaction(async () => {
        const quote = await QuoteModel.findOneAndUpdate(
          { _id: id, tenant: jwt.tenant },
          {
            completedOn: new Date(),
          },
          {
            session,
          },
        ).exec()

        if (!quote) {
          return Err(`Quote with id ${id} not found`)
        }

        const teamsSubscribers = await defaultTeamsSubscribers(
          johnny5Config,
          logger,
        )

        const task = new TaskModel<DbTask>({
          tenant: jwt.tenant,
          fileId: quote.fileId,
          type: 'quote-completed',
          status: 'started',
          createdOn: new Date(),
          emailSubscribers: [],
          teamsSubscribers: teamsSubscribers,
        })
        await task.save({ session })

        return Ok({ task, quote })
      })

      await session.endSession()

      if (!result.ok) return status(404, result.val)

      const {
        task: { id: taskId, fileId },
      } = result.val

      await taskStatus(taskId, fileId.toString(), 'started')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-tasks',
          path: 'v1.quote-completed',
        },
        { taskId, fileId: fileId.toString(), tenant: jwt.tenant },
      )

      set.status = 204
      return
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Complete a Quote by id',
        tags: ['Johnny5', 'Quote'],
      },
    },
  )
