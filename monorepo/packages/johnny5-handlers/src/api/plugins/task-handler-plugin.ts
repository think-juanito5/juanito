import {
  type DaprResponseSchema,
  type TaskCloudEvent,
  dapr,
  daprResponseSchema,
  setJsonContentHeader,
  taskCloudEventSchema,
} from '@dbc-tech/johnny5'
import { Elysia } from 'elysia'
import { serializeError } from 'serialize-error'
import { type TaskContext, taskContext } from './task-context.plugin'

export type TaskHandlerStatus = 'success' | 'ignore' | 'retry' | 'fail'
export type TaskHandlerResponse = {
  status: TaskHandlerStatus
  errorReason?: string
}
export const handlerStatus = {
  success: (): TaskHandlerResponse => ({
    status: 'success',
  }),
  ignore: (errorReason?: string): TaskHandlerResponse => ({
    status: 'ignore',
    errorReason,
  }),
  retry: (): TaskHandlerResponse => ({
    status: 'retry',
  }),
  fail: (errorReason: string): TaskHandlerResponse => ({
    status: 'fail',
    errorReason,
  }),
}

export type TaskHandlerConfig = {
  path: string
  handler: (args: {
    ctx: TaskContext
    body: TaskCloudEvent
  }) => Promise<TaskHandlerResponse | void>
  name?: string
}

const getDaprResponse = async (
  response: TaskHandlerResponse,
  { logger, name, status, task }: TaskContext,
): Promise<DaprResponseSchema> => {
  switch (response.status) {
    case 'success':
      await status('completed')
      await logger.info(`Task: ${name}, id: ${task.id}, completed`, response)
      return dapr.success
    case 'ignore':
      await status('abandoned')
      await logger.warn(`Task: ${name}, id: ${task.id}, abandoned`, response)
      return dapr.drop
    case 'retry':
      await logger.warn(`Task: ${name}, id: ${task.id}, retrying`, response)
      return dapr.retry
    case 'fail':
      await status('failed', response.errorReason)
      await logger.error(`Task: ${name}, id: ${task.id}, failed`, response)
      return dapr.drop
    default: {
      const errorMessage = `Task: ${name}, id: ${task.id}, failed with unexpected response status: ${response.status}`
      await status('failed', response.errorReason || errorMessage)
      await logger.error(errorMessage, response)
      return dapr.drop
    }
  }
}

export const runTask = async (args: {
  ctx: TaskContext
  body: TaskCloudEvent
  handler: (args: {
    ctx: TaskContext
    body: TaskCloudEvent
  }) => Promise<TaskHandlerResponse | void>
}): Promise<DaprResponseSchema> => {
  const { ctx, body, handler } = args
  const { logger, name, task, status } = ctx

  await logger.info(`Task ${name}, id: ${task.id}, started`)

  try {
    const response = (await handler({ ctx, body })) || handlerStatus.success()
    const daprResponse = await getDaprResponse(response, ctx)
    await logger.info(`Task ${name}, id: ${task.id}, finished`, response)
    return daprResponse
  } catch (error) {
    const jsonError = serializeError(error)
    await logger.error(
      `Task: ${name}, id: ${task.id}, unhandled error`,
      jsonError,
    )
    await status('failed', JSON.stringify(jsonError))
    return dapr.drop
  }
}

export const taskHandler = ({ path, handler, name }: TaskHandlerConfig) =>
  new Elysia()
    .use(taskContext({ name }))
    .onRequest(({ request }) => setJsonContentHeader(request))
    .post(path, async ({ ctx, body }) => runTask({ ctx, body, handler }), {
      body: taskCloudEventSchema,
      response: {
        200: daprResponseSchema,
      },
    })
