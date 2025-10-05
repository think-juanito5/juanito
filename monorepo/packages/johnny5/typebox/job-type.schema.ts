import { type Static, Type } from '@sinclair/typebox'

export type JobType = Static<typeof jobTypeSchema>
export const jobTypeSchema = Type.Union([
  Type.Literal('file-opening'),
  Type.Literal('batch-matter-close'),
  Type.Literal('matter-opening'),
  Type.Literal('contract-drop'),
  Type.Literal('raq-deal'),
  Type.Literal('deal-matter'),
  Type.Literal('matter-deactivation'),
  Type.Literal('matter-reactivation'),
  Type.Literal('matter-close'),
  Type.Literal('stale-matter-cleanup'),
  Type.Literal('on-matter-archive'),
  Type.Literal('btr-pexa-audit'),
  Type.Literal('cca-unsubscribe'),
  Type.Literal('bespoke-tasks'),
  Type.Literal('sds-matter-creation'),
])

export const AllJobTypes: Array<JobType> = [
  'file-opening',
  'batch-matter-close',
  'matter-opening',
  'contract-drop',
  'raq-deal',
  'deal-matter',
  'matter-deactivation',
  'matter-reactivation',
  'matter-close',
  'stale-matter-cleanup',
  'on-matter-archive',
  'btr-pexa-audit',
  'cca-unsubscribe',
  'bespoke-tasks',
  'sds-matter-creation',
]
