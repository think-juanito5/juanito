import { HttpService } from '@dbc-tech/http'
import type { Logger } from '@dbc-tech/logger'
import { nanoid } from 'nanoid'
import type { CloudEvent, JobId, Tenant } from '../typebox'

export type PublishConfig<T extends Record<string, unknown>> = {
  pubsub: string
  topicOrQueue: string
  message: T
  logger: Logger
  correlationId?: string
  metadata?: Record<string, string>
}

export const publish = <T extends Record<string, unknown>>({
  pubsub,
  topicOrQueue,
  message,
  logger,
  correlationId,
  metadata,
}: PublishConfig<T>) => {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/cloudevents+json',
    ...(correlationId ? { 'x-correlation-id': correlationId } : {}),
  }

  const http = new HttpService({
    baseUrl: `http://localhost:3500`,
    defaultHeaders,
    logger,
    defaultQueryParams: metadata,
  })

  return http.post({
    path: `/v1.0/publish/${pubsub}/${topicOrQueue}`,
    body: message,
  })
}

export type CloudEventConfig = {
  id: string
  source: string
  type: string
}

export const createJohnny5CloudEvent = ({
  id,
  source,
  type,
}: CloudEventConfig): CloudEvent => {
  return {
    id: `${id}.${nanoid(6)}`,
    specversion: '1.0',
    datacontenttype: 'application/cloudevents+json',
    source,
    type,
    time: new Date().toISOString(),
  }
}

export type RouteConfig = {
  pubsub: string
  queueName: string
  path: string
}

export const publishCloudEvent = async (
  route: RouteConfig,
  logger: Logger,
  correlationId: string,
  name: string,
  data: Record<string, unknown>,
  scheduledEnqueueTimeUtc?: Date,
) => {
  const cloudEvent = createJohnny5CloudEvent({
    id: correlationId,
    source: name,
    type: route.path,
  })

  const message = {
    ...cloudEvent,
    data,
  }

  const metadata: Record<string, string> = {}
  if (scheduledEnqueueTimeUtc) {
    metadata['metadata.ScheduledEnqueueTimeUtc'] =
      scheduledEnqueueTimeUtc.toISOString()
  }

  const pubsub = route.pubsub
  const queueName = route.queueName
  await logger.debug(`Publishing to queue:${queueName} at ${pubsub}`, message)

  await publish<CloudEvent>({
    pubsub,
    topicOrQueue: queueName,
    message,
    logger,
    correlationId,
    metadata,
  })
}

export const publishJobCloudEvent = async (
  route: RouteConfig,
  logger: Logger,
  jobId: string,
  fileId: string,
  correlationId: string,
  name: string,
  tenant: Tenant,
  scheduledEnqueueTimeUtc?: Date,
) => {
  const data: JobId = { jobId, fileId, tenant }
  return publishCloudEvent(
    route,
    logger,
    correlationId,
    name,
    data,
    scheduledEnqueueTimeUtc,
  )
}
