import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from 'elysia/type-system'
import { Defaults } from '../constants'
import { cloudEventSchema } from './cloud-event.schema'
import { jobStatusSchema } from './job-status.schema'
import { taskStatusSchema } from './task-status.schema'

export type AustralianState = Static<typeof australianStateSchema>
export const australianStateSchema = Type.Union([
  Type.Literal('NSW'),
  Type.Literal('VIC'),
  Type.Literal('QLD'),
  Type.Literal('SA'),
  Type.Literal('WA'),
  Type.Literal('TAS'),
  Type.Literal('NT'),
  Type.Literal('ACT'),
])

export const AllStates: Array<AustralianState> = [
  'NSW',
  'VIC',
  'QLD',
  'SA',
  'WA',
  'TAS',
  'NT',
  'ACT',
]

export type Tenant = Static<typeof tenantSchema>
export const tenantSchema = Type.Union([
  Type.Literal('BTR'),
  Type.Literal('CCA'),
  Type.Literal('FCL'),
])

export const AllTenants: Array<Tenant> = ['CCA', 'BTR', 'FCL']

export type LogLevel = Static<typeof logLevelSchema>
export const logLevelSchema = Type.Union([
  Type.Literal('debug'),
  Type.Literal('info'),
  Type.Literal('error'),
  Type.Literal('trace'),
  Type.Literal('warn'),
])

export const AllLogLevels: Array<LogLevel> = [
  'debug',
  'info',
  'error',
  'trace',
  'warn',
]

export type Bst = Static<typeof bstSchema>
export const bstSchema = Type.Union([
  Type.Literal('B'),
  Type.Literal('S'),
  Type.Literal('T'),
])

export const AllBst: Array<Bst> = ['B', 'S', 'T']

export type IntentTag = Static<typeof intentTagSchema>
export const intentTagSchema = Type.Union([
  Type.Literal('buy'),
  Type.Literal('sell'),
])

export const AllIntentTags: Array<IntentTag> = ['buy', 'sell']

export type DataItemType = Static<typeof dataItemTypeSchema>
export const dataItemTypeSchema = Type.Union([
  Type.Literal('Text'),
  Type.Literal('Number'),
  Type.Literal('Date'),
])

export const AllDataItemTypes: Array<DataItemType> = ['Text', 'Number', 'Date']

export type DataItem = Static<typeof dataItemSchema>
export const dataItemSchema = Type.Object({
  name: Type.Readonly(Type.String()),
  value: Type.Readonly(Type.Optional(Type.String())),
  type: Type.Readonly(dataItemTypeSchema),
  rawText: Type.Readonly(Type.Optional(Type.String())),
  required: Type.Readonly(Type.Boolean()),
})

export type FileId = Static<typeof fileIdSchema>
export const fileIdSchema = Type.Object({
  tenant: tenantSchema,
  fileId: Type.String(),
})

export type FileCloudEvent = Static<typeof fileCloudEventSchema>
export const fileCloudEventSchema = Type.Composite([
  cloudEventSchema,
  Type.Object({
    data: fileIdSchema,
  }),
])

export type JobId = Static<typeof jobIdSchema>
export const jobIdSchema = Type.Object({
  tenant: tenantSchema,
  fileId: Type.String(),
  jobId: Type.String(),
})

export type JobCloudEvent = Static<typeof jobCloudEventSchema>
export const jobCloudEventSchema = Type.Composite([
  cloudEventSchema,
  Type.Object({
    data: jobIdSchema,
  }),
])

export type JobIdStatus = Static<typeof jobIdStatusSchema>
export const jobIdStatusSchema = Type.Object({
  tenant: tenantSchema,
  fileId: Type.String(),
  jobId: Type.String(),
  status: jobStatusSchema,
})

export type JobStatusCloudEvent = Static<typeof jobStatusCloudEventSchema>
export const jobStatusCloudEventSchema = Type.Composite([
  cloudEventSchema,
  Type.Object({
    data: jobIdStatusSchema,
  }),
])

export type TaskId = Static<typeof taskIdSchema>
export const taskIdSchema = Type.Object({
  tenant: tenantSchema,
  fileId: Type.String(),
  taskId: Type.String(),
})

export type TaskCloudEvent = Static<typeof taskCloudEventSchema>
export const taskCloudEventSchema = Type.Composite([
  cloudEventSchema,
  Type.Object({
    data: taskIdSchema,
  }),
])

export type TaskIdStatus = Static<typeof taskIdStatusSchema>
export const taskIdStatusSchema = Type.Object({
  tenant: tenantSchema,
  fileId: Type.String(),
  taskId: Type.String(),
  status: taskStatusSchema,
})

export type TaskStatusCloudEvent = Static<typeof taskStatusCloudEventSchema>
export const taskStatusCloudEventSchema = Type.Composite([
  cloudEventSchema,
  Type.Object({
    data: taskIdStatusSchema,
  }),
])

export type Environment = 'dev' | 'stage' | 'prod'
export const AllEnvironments: Array<Environment> = ['dev', 'stage', 'prod']

export type IdInt = Static<typeof idIntSchema>
export const idIntSchema = Type.Object({
  id: Type.Integer(),
})
export const CIdInt = TypeCompiler.Compile(idIntSchema)

export type IdString = Static<typeof idStringSchema>
export const idStringSchema = Type.Object({
  id: Type.String(),
})
export const CIdString = TypeCompiler.Compile(idStringSchema)

export const querySortSchema = Type.Union([
  Type.Literal('asc'),
  Type.Literal('desc'),
])

export const queryLimitSchema = Type.Number({
  minimum: Defaults.query.minimumLimit,
  maximum: Defaults.query.maximumLimit,
})

export type TypeFormClass = Static<typeof typeFormClassSchema>
export const typeFormClassSchema = Type.Union([
  Type.Literal('buyer-instruction'),
  Type.Literal('seller-instruction'),
])

export const AllTypeFormClasses: Array<TypeFormClass> = [
  'buyer-instruction',
  'seller-instruction',
]

export type TypeFormTask = Static<typeof typeFormTaskSchema>
export const typeFormTaskSchema = Type.Union([
  Type.Literal('create-task'),
  Type.Literal('complete-task'),
  Type.Literal('close-matter'),
  Type.Literal('update-datafield'),
  Type.Literal('add-to-hypercare'),
  Type.Literal('register-movinghub'),
])

export type PropertyType = Static<typeof propertyTypeSchema>
export const propertyTypeSchema = Type.Union([
  Type.Literal('LO'),
  Type.Literal('H'),
  Type.Literal('A'),
  Type.Literal('T'),
  Type.Literal('V'),
  Type.Literal('D'),
  Type.Literal('OTP'),
  Type.Literal('ED'),
  Type.Literal('VL'),
  Type.Literal('AVT'),
  Type.Literal('OTD'),
  Type.Literal('CND'),
  Type.Literal('OTA'),
  Type.Literal('OTH'),
  Type.Literal('OTV'),
])

export const AllPropertyType: Array<PropertyType> = [
  'LO', // Land Only
  'H', // Existing House
  'A', // Apartment
  'T', // Townhouse
  'V', // Villa
  'D', // Duplex
  'OTP', // Off The Plan
  'ED', // Existing Dwelling
  'VL', // Vacant Land
  'AVT', // Apartment/Townhouse/Villa
  'OTD', // Off The Plan Dwelling
  'CND', // Constructed New Dwelling
  'OTA', // Off The Plan - Apartment
  'OTH', // Off The Plan - House
  'OTV', // Off The Plan - Vacant Land
]

export type TimeToTransact = Static<typeof timeToTransactSchema>
export const timeToTransactSchema = Type.Union([
  Type.Literal('NOW'),
  Type.Literal('1M'),
  Type.Literal('3M'),
  Type.Literal('6M'),
  Type.Literal('7M'),
])
export const AllTimeToTransact: Array<TimeToTransact> = [
  'NOW',
  '1M',
  '3M',
  '6M',
  '7M',
]

export type CcaPartner = Static<typeof ccaPartnerSchema>
export const ccaPartnerSchema = Type.Union([Type.Literal('racv')])
export const AllCcaPartners: Array<CcaPartner> = ['racv']

export const selectedPlanSchema = Type.Union([
  Type.Literal('comprehensive'),
  Type.Literal('essential'),
])

export type SelectedPlan = Static<typeof selectedPlanSchema>
export const AllSelectedPlans: Array<SelectedPlan> = [
  'comprehensive',
  'essential',
]
