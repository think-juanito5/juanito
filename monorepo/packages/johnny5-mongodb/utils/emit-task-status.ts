import {
  component,
  createJohnny5CloudEvent,
  publish,
} from '@dbc-tech/johnny5/dapr'
import type {
  TaskStatus,
  TaskStatusCloudEvent,
  Tenant,
} from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import { type DbTask, TaskModel } from '../schema'

export const emitTaskStatus = async (
  status: TaskStatus,
  errorReason: string | undefined,
  logger: Logger,
  taskId: string,
  fileId: string,
  correlationId: string,
  name: string,
  tenant: Tenant,
) => {
  await logger.debug(`Updating Task ${taskId} status to ${status}`)

  const completedStatuses: TaskStatus[] = [
    'completed',
    'completed-with-errors',
    'abandoned',
  ]
  const update: Partial<DbTask> = {
    status,
    erroredOn: errorReason ? new Date() : undefined,
    completedOn: completedStatuses.includes(status) ? new Date() : undefined,
    errorReason,
  }

  await logger.debug(`Updating Task ${taskId} status`, update)

  await TaskModel.findByIdAndUpdate(taskId, update)

  const cloudEvent = createJohnny5CloudEvent({
    id: correlationId,
    source: name,
    type: 'v1.task-status-updated',
  })
  const message: TaskStatusCloudEvent = {
    ...cloudEvent,
    data: {
      tenant,
      fileId,
      taskId,
      status,
    },
  }

  const pubsub = component.topics
  const topicName = 'johnny5-task-events'
  await logger.debug(`Publishing to topic:${topicName} at ${pubsub}`, message)

  await publish<TaskStatusCloudEvent>({
    pubsub,
    topicOrQueue: topicName,
    message,
    logger,
    correlationId,
  })
}
