import { type Static, Type } from '@sinclair/typebox'

export const ccaPipedriveNotificationType = Type.Union([
  Type.Literal('sds-property-invalid'),
  Type.Literal('matter-name-refreshed'),
  Type.Literal('matter-creation-completed'),
  Type.Literal('matter-creation-initiated'),
  Type.Literal('matter-creation-error'),
  Type.Literal('matter-created-details'),
])

export type CcaPipedriveNotificationType = Static<
  typeof ccaPipedriveNotificationType
>
export const ccaPipedriveNotificationSchema = Type.Object({
  type: ccaPipedriveNotificationType,
  testMode: Type.Optional(Type.Boolean()),
})

export type CcaPipedriveNotification = Static<
  typeof ccaPipedriveNotificationSchema
>
