import { type Static, Type } from '@sinclair/typebox'

export type ManifestMetaType = Static<typeof manifestMetaTypeSchema>
export const manifestMetaTypeSchema = Type.Union([
  Type.Literal('matterTypeName'),
  Type.Literal('natureOfProperty'),
  Type.Literal('state'),
  Type.Literal('intent'),
  Type.Literal('clientName'),
  Type.Literal('clientCode'),
  Type.Literal('postCode'),
  Type.Literal('concierge'),
  Type.Literal('isCompany'),
  Type.Literal('additionalInfo'),
  Type.Literal('companyName'),
  Type.Literal('lastName'),
  Type.Literal('matterId'),
  Type.Literal('dealId'),
  Type.Literal('roleInitials'),
  Type.Literal('testMode'),
])

export const AllManifestMetaTypes: Array<ManifestMetaType> = [
  'matterTypeName',
  'natureOfProperty',
  'state',
  'intent',
  'clientName',
  'clientCode',
  'postCode',
  'concierge',
  'isCompany',
  'additionalInfo',
  'companyName',
  'lastName',
  'matterId',
  'dealId',
  'roleInitials',
  'testMode',
]

export type ManifestMeta = Static<typeof manifestMetaSchema>
export const manifestMetaSchema = Type.Object({
  key: manifestMetaTypeSchema,
  value: Type.String(),
})
