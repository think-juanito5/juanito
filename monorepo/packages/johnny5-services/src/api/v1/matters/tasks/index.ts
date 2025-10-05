import Elysia from 'elysia'
import { btrPexaAudit } from './pexa-audit'
import { btrPexaAuditFailedReady } from './pexa-audit-failed-ready'
import { compileBtrPexaAuditFilenote } from './pexa-audit-filenote'
import { btrPexaAuditValidate } from './pexa-audit-validate'

export const tasks = new Elysia({
  prefix: '/:id/tasks',
})
  .use(btrPexaAudit)
  .use(btrPexaAuditValidate)
  .use(btrPexaAuditFailedReady)
  .use(compileBtrPexaAuditFilenote)
