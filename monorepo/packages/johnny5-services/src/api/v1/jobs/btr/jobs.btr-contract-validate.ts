import { ParsedDataSource } from '@dbc-tech/johnny5-btr'
import {
  ContractDataValidationModel,
  DataSourceValidator,
  type DbJob,
  JobModel,
  JobQuery,
  MongoDbContractDataSource,
  mapContractDataValidation,
} from '@dbc-tech/johnny5-mongodb'
import { component, createJohnny5CloudEvent } from '@dbc-tech/johnny5/dapr'
import {
  type JobCloudEvent,
  contractDataValidationCreateSchema,
  contractDataValidationSchema,
  dataItemSchema,
  idStringSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { CoalescingDataSource, getIntent } from '@dbc-tech/johnny5/utils'
import { Elysia, t } from 'elysia'
import { CorrectionDataItemsDataSource } from '../../../../utils/correction-data-source'
import { publish } from '../../../../utils/dapr'
import { jobContext } from '../../../plugins/job-context.plugin'

export const btr_contract_validate = new Elysia({
  prefix: '/:id/btr-contract-validate',
})
  .use(jobContext())
  .post(
    '',
    async ({
      params: { id },
      body,
      status,
      set,
      ctx: { jwt, name: source, correlationId, logger },
    }) => {
      await logger.info(`Processing Contract Validation for Job Id:${id}`)
      await logger.debug(`Payload`, body)

      const job = await JobModel.findOne({
        _id: id,
        tenant: jwt.tenant,
      })
      if (!job) return status(404, 'Job not found')

      const existingValidation = await ContractDataValidationModel.findOne(
        {
          jobId: id,
        },
        null,
      )
      if (existingValidation) {
        await logger.warn(
          `Contract Validation for Job Id:${id} already processed`,
        )
        return status(409, 'Contract Validation already processed')
      }

      const data = {
        ...body,
        fileId: job.fileId.toString(),
        jobId: id,
        tenant: job.tenant,
      }

      const isRejected = body.isRejected
      if (!isRejected) {
        const intent = getIntent(job.serviceType)
        const validator = new DataSourceValidator(
          new ParsedDataSource(
            new CoalescingDataSource(
              new MongoDbContractDataSource(
                job.tenant,
                job.id,
                job.serviceType,
                logger,
              ),
              new CorrectionDataItemsDataSource(
                job.tenant,
                intent,
                body.correctionDataItems ?? [],
                logger,
              ),
            ),
            logger,
          ),
          logger,
        )

        const validateResult = await validator.validate(job.id)
        if (validateResult.err) {
          await logger.error('Error validating data', validateResult.val)
          return status(400, validateResult.val)
        }
      }

      const validationModel = new ContractDataValidationModel(data)
      await validationModel.save()

      const payload: Partial<DbJob> = {
        status: isRejected ? 'hitl-rejected' : 'hitl-validated',
      }
      const response = await JobQuery.updateAndPublishChangedEvent(
        job.id,
        payload,
        source,
        correlationId,
        logger,
      )
      if (response.err) {
        await logger.error(response.val)
        return status(404, response.val)
      }

      if (!isRejected) {
        const cloudEvent = createJohnny5CloudEvent({
          id: correlationId,
          source,
          type: 'v1.btr-contract-drop.manifest-create',
        })
        const message: JobCloudEvent = {
          data,
          ...cloudEvent,
        }
        await logger.debug(`Publishing message`, message)

        await publish<JobCloudEvent>(
          component.longQueues,
          'johnny5-btr-contract-drop',
          message,
        )
      }

      await logger.info(
        `Finished processing Contract Validation for Job Id:${id}`,
      )

      set.status = 'No Content'
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      body: contractDataValidationCreateSchema,
      response: {
        204: t.Void(),
        400: t.Array(dataItemSchema),
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        summary: 'Submit Contract Validation request with Corrections data',
        tags: ['Johnny5', 'Jobs', 'Contract Validation'],
      },
    },
  )
  .get(
    '',
    async ({ params: { id }, status, ctx: { jwt } }) => {
      const contractValidation = await ContractDataValidationModel.findOne({
        jobId: id,
        tenant: jwt.tenant,
      })
        .lean()
        .exec()
      if (!contractValidation)
        return status(404, 'Contract Validation data not found')

      return mapContractDataValidation(contractValidation)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: contractDataValidationSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get Contract Validation with Corrections data',
        tags: ['Johnny5', 'Jobs', 'Contract Validation'],
      },
    },
  )
