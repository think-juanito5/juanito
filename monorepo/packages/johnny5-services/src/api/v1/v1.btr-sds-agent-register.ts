import {
  type DbFile,
  type DbTask,
  FileModel,
  TaskModel,
} from '@dbc-tech/johnny5-mongodb'
import { component } from '@dbc-tech/johnny5/dapr'
import {
  type BtrSdsAgentWebhook,
  type Meta,
  type TaskTestMode,
  btrSdsAgentWebhookSchema,
  idStringSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'

import { Elysia, status, t } from 'elysia'
import mongoose from 'mongoose'
import { Err, Ok } from 'ts-results-es'
import { defaultTeamsSubscribers } from '../../utils/teams-utils'
import { appContext } from '../plugins/app-context.plugin'

type TransactionError = {
  code: 409
  message: string
}

export const btr_sds_agent_register = new Elysia()
  .use(appContext({ allowedTenants: ['BTR'] }))
  .post(
    '/btr-sds-agent-register',
    async ({ body, ctx }) => {
      const {
        logger,
        jwt: { tenant },
        start,
        taskStatus,
        johnny5Config,
        environment,
      } = ctx
      await logger.info(`Starting BTR SDS Agent Registration Creation`)
      await logger.debug(`Request payload`, body)
      const clientId = body.webhook_id

      const session = await mongoose.startSession()
      const result = await session.withTransaction(async () => {
        const existingTask = await TaskModel.findOne(
          { clientId, tenant, type: 'sds-agent-register' },
          {},
          { session },
        )
        if (existingTask) {
          await logger.error(
            `A task with the clientId/payloadId ${clientId} already exists`,
          )
          const error: TransactionError = {
            code: 409,
            message: `A task with the clientId/payloadId ${clientId} already exists`,
          }
          return Err(error)
        }

        const file = new FileModel<DbFile>({
          tenant,
          serviceType: 'internal',
          sourceReason: `Submit API request for BTR Seller Disclosure Agent Registration with clientId: ${clientId}`,
          createdOn: new Date(),
        })
        await file.save({ session })

        const meta: Meta[] = []
        meta.push({
          key: 'webhookPayload',
          value: JSON.stringify(body),
        })

        const testMode: TaskTestMode | undefined =
          environment !== 'prod' || hasIgnoreInNames(body)
            ? 'enabled'
            : undefined
        if (testMode) {
          await logger.debug(
            `BTR SDS Agent Registration test mode: ${testMode}`,
          )
        }

        const teamsSubscribers = await defaultTeamsSubscribers(
          johnny5Config,
          logger,
        )

        const task = new TaskModel<DbTask>({
          tenant,
          status: 'started',
          fileId: file._id,
          clientId,
          type: 'sds-agent-register',
          createdOn: new Date(),
          meta,
          teamsSubscribers,
          testMode,
        })

        await task.save({ session })
        return Ok({ task, file })
      })

      await session.endSession()

      if (!result.ok) {
        const { code, message } = result.val
        return status(code, message)
      }

      const { task, file } = result.val
      await taskStatus(task.id, file.id, 'started')

      await start(
        {
          pubsub: component.longQueues,
          queueName: 'johnny5-tasks',
          path: 'v1.btr-sds-agent-register',
        },
        { taskId: task.id, fileId: file.id, tenant },
      )

      await logger.info(`Finished BTR SDS Agent Registration`)
      return { id: task.id }
    },
    {
      body: btrSdsAgentWebhookSchema,
      headers: authHeaderSchema,
      response: {
        200: idStringSchema,
        401: unauthorizedSchema,
        409: t.String(),
      },
      detail: {
        summary: 'BTR SDS Agent Registration',
        tags: ['Johnny5', 'SDS Agents'],
      },
    },
  )

export const hasIgnoreInNames = (payload: BtrSdsAgentWebhook): boolean => {
  const containsIgnore = (value: unknown): boolean =>
    typeof value === 'string' && value.toLowerCase().includes('ignore')

  const agentHasIgnore = containsIgnore(payload.agent.full_name)
  const agencyHasIgnore = containsIgnore(payload.agency_name)

  return agentHasIgnore || agencyHasIgnore
}
