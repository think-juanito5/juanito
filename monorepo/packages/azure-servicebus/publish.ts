import { ServiceBusClient } from '@azure/service-bus'

let client: ServiceBusClient | undefined
function getClient(): ServiceBusClient {
  if (!client) {
    client = new ServiceBusClient(<string>process.env.SERVICEBUS_CONNECTION)
  }
  return client
}

export const publish = (
  payload: unknown,
  queueOrTopicName: string,
  scheduledEnqueueTimeUtc?: Date,
) => {
  const sender = getClient().createSender(queueOrTopicName)
  return sender.sendMessages({
    body: payload,
    scheduledEnqueueTimeUtc,
  })
}
