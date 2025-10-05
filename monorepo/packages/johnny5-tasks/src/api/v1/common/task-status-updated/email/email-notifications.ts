import { type DbFile, type DbTask } from '@dbc-tech/johnny5-mongodb'
import {
  component,
  createJohnny5CloudEvent,
  publish,
} from '@dbc-tech/johnny5/dapr'
import type {
  TaskEmailCloudEvent,
  TaskEmailMessage,
  TaskStatus,
  TaskStatusCloudEvent,
} from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import type { HydratedDocument } from 'mongoose'

export const emailNotifications = async (
  event: TaskStatusCloudEvent,
  task: HydratedDocument<DbTask>,
  file: HydratedDocument<DbFile>,
  logger: Logger,
  source: string,
  correlationId: string,
) => {
  const { data } = event
  const { fileId, taskId, tenant, status } = data
  const { emailSubscribers } = task

  if (!emailSubscribers || emailSubscribers.length === 0) {
    await logger.warn(
      `No email subscribers found for File Id:${fileId}, Task Id:${taskId}`,
    )
    return
  }

  const { subject, message } = await buildEmailMessage(task, file, status)

  for (const subscriber of emailSubscribers) {
    if (!subscriber.events.includes(status)) {
      continue
    }
    const messageSendEmail: TaskEmailMessage = {
      tenant,
      fileId,
      taskId,
      recipients: [
        {
          email: subscriber.email,
          name: subscriber.name,
        },
      ],
      subject,
      message,
    }

    const cloudEvent = createJohnny5CloudEvent({
      id: correlationId,
      source,
      type: 'v1.send-email',
    })
    const emailCloudEvent: TaskEmailCloudEvent = {
      ...cloudEvent,
      data: messageSendEmail,
    }

    await logger.debug(`Publishing message`, emailCloudEvent)

    await publish<TaskEmailCloudEvent>({
      pubsub: component.longQueues,
      topicOrQueue: 'johnny5-tasks',
      message: emailCloudEvent,
      logger,
      correlationId,
    })
  }
}

export const buildEmailMessage = async (
  task: HydratedDocument<DbTask>,
  file: HydratedDocument<DbFile>,
  status: TaskStatus,
): Promise<{ subject: string; message: string }> => {
  switch (task.type) {
    default:
      return buildDefaultMessage(task, file, status)
  }
}

export const buildDefaultMessage = async (
  task: HydratedDocument<DbTask>,
  file: HydratedDocument<DbFile>,
  status: TaskStatus,
): Promise<{ subject: string; message: string }> => {
  const { completedOn, createdOn, errorReason, fileId, id, tenant, type } = task
  const { actionStepMatterId, pipedriveDealId } = file

  const subject = `[Johnny5] ${type} Task Updated`
  let messageHeader = `Status updated: ${status}`
  switch (task.status) {
    case 'failed':
      messageHeader = `Failed Task`
      break
  }

  let message = `${messageHeader}

Task: ${id}
Type: ${type}
Status: ${status}
File: ${fileId}
Tenant: ${tenant}
Created On: ${createdOn}
`

  if (completedOn) message += `Completed On: ${completedOn}\n`
  if (actionStepMatterId) message += `Matter: ${actionStepMatterId}\n`
  if (pipedriveDealId) message += `Pipedrive Deal: ${pipedriveDealId}\n`
  if (errorReason) message += `Error Reason: ${errorReason}\n`
  message += `\nEnvironment: ${process.env.APP_ENV}`

  return { subject, message }
}
