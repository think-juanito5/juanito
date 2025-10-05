import type {
  DataCollectionRecordPostInner,
  DataCollectionRecordValuePutPostInner,
  PagedDataCollectionRecords,
} from '@dbc-tech/actionstep'
import {
  bespokeTasksManifestSchema,
  component,
  dapr,
  getValue,
  setJsonContentHeader,
} from '@dbc-tech/johnny5'
import { daprResponseSchema } from '@dbc-tech/johnny5/dapr'
import { jobCloudEventSchema } from '@dbc-tech/johnny5/typebox'
import { Elysia } from 'elysia'
import { jobContext } from '../../plugins/job-context.plugin'
import { bespokeError } from './common'

export const matter_populate_data_fields = new Elysia()
  .use(
    jobContext({
      name: 'v1.bespoke-tasks.matter-populate-data-fields',
    }),
  )
  .onRequest(({ request }) => setJsonContentHeader(request))
  .post(
    '/matter-populate-data-fields',
    async ({ body, ctx }) => {
      const { logger, next, job, file } = ctx
      const { data } = body
      const { fileId, jobId } = data
      await logger.info(
        `Starting to populate Matter (Data Collections) for File Id:${fileId}, Job Id:${jobId}`,
      )
      await logger.debug('Event payload', body)

      if (!file.actionStepMatterId) {
        await logger.error(
          `File Id:${fileId} does not have an ActionStep Matter Id`,
        )
        return dapr.drop
      }

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

      const as = ctx.actionstep()
      let newRecords
      const putBody: DataCollectionRecordValuePutPostInner[] = []

      if (manifest.datafields.create.length > 0) {
        // before we create the datacollectionrecords, there may be multiple fields
        // requiring the same datacollectionrecord, so we need to remove duplicates
        const dataCollectionsToCreate: Set<number> =
          manifest.datafields.create.reduce((acc, dc) => {
            acc.add(+dc.links.dataCollection)
            return acc
          }, new Set<number>())

        const postBody: DataCollectionRecordPostInner[] = []
        for (const dc of dataCollectionsToCreate) {
          postBody.push({
            links: {
              action: `${file.actionStepMatterId}`,
              dataCollection: `${dc}`,
            },
          })
        }

        // create the datacollectionrecords that need to be created
        let records: PagedDataCollectionRecords
        try {
          records = await as.createDataCollectionRecords({
            datacollectionrecords: postBody,
          })
        } catch (error) {
          await bespokeError(
            error,
            'Error creating datacollectionrecords',
            job,
            logger,
          )
          return dapr.drop
        }

        // rearrange the result for easy lookup
        newRecords = records.datacollectionrecords.reduce(
          (acc, r) => {
            acc[r.links.dataCollection] = r.id
            return acc
          },
          {} as Record<string, number>,
        )

        // create the put body for the values whose records where just created
        for (const record of manifest.datafields.create) {
          putBody.push({
            id: `${record.links.dataCollectionField}--${newRecords[record.links.dataCollection]}`,
            stringValue: record.stringValue,
            links: {
              action: record.links.action,
              dataCollection: record.links.dataCollection,
              dataCollectionField: record.links.dataCollectionField,
              dataCollectionRecord: `${newRecords[record.links.dataCollection]}`,
            },
          })
        }
      }

      // add in the values where the records already existed
      putBody.push(...manifest.datafields.update)

      // need to build the put id
      const ids = putBody.map((record) => {
        return `${record.links.dataCollectionField}--${record.links.dataCollectionRecord}`
      })

      if (putBody.length > 0) {
        // put to actionstep
        await logger.debug(
          `Updating datacollectionrecordvalues for File Id:${fileId}, Job Id:${jobId}, Matter Id:${file.actionStepMatterId}`,
          ids.join(','),
          putBody,
        )
        try {
          await as.updateDataCollectionRecordValues(ids.join(','), {
            datacollectionrecordvalues: putBody,
          })
        } catch (error) {
          await bespokeError(
            error,
            'Error updating datacollectionrecordvalues',
            job,
            logger,
          )
          return dapr.drop
        }
      }

      await next({
        pubsub: component.longQueues,
        queueName: 'johnny5-bespoke-tasks',
        path: 'v1.bespoke-tasks.matter-upload-files',
      })

      await logger.info(
        `Finished populating Matter (Data Collections) for File Id:${fileId}, Job Id:${jobId}, Matter Id:${file.actionStepMatterId}`,
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
