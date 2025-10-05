import type { DataverseService } from '@dbc-tech/dataverse'
import { type DbFile, FileModel } from '@dbc-tech/johnny5-mongodb'
import { authHeaderSchema, unauthorizedSchema } from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import Elysia, { t } from 'elysia'
import { appContext } from '../../../plugins/app-context.plugin'

const compileFileNote = async (
  dataverse: () => DataverseService,
  dataverseGuid: string,
  logger: Logger,
  extra?: string,
): Promise<string> => {
  const dv = dataverse()
  await logger.debug('successfully created dataverse service')
  const results = await dv.getBtrPexaAuditResults({
    $filter: `_dbc_btr_pexa_audit_value eq '${dataverseGuid}'`,
    $select:
      'dbc_company_name, dbc_name, dbc_part, dbc_btr_pexa_audit_question, dbc_answer',
  })
  if (results.value.length === 0) {
    const msg = `No results found for BTR PEXA Audit record:${dataverseGuid}, ignoring`
    throw new Error(msg)
  }
  await logger.debug(
    `BTR PEXA Audit record:${dataverseGuid} has ${results.value.length} results`,
  )

  const partOrder = [
    'setup',
    'part 1',
    'part 2 voi',
    'part 3 caf',
    'part 4 pexa',
  ]

  // Group by name+company, then by part
  const grouped: Record<
    string,
    {
      companyName: string
      name: string
      parts: Record<string, typeof results.value>
    }
  > = {}
  await logger.debug('establishing groups', grouped)

  results.value.forEach((result) => {
    const name = result.dbc_name || ''
    const companyName = result.dbc_company_name || ''
    const key = `${name}|||${companyName}`

    if (!grouped[key]) {
      grouped[key] = {
        companyName,
        name,
        parts: {},
      }
    }
    const part = (result.dbc_part || '').toLowerCase()
    if (!grouped[key].parts[part]) {
      grouped[key].parts[part] = []
    }
    grouped[key].parts[part].push(result)
  })
  await logger.debug('grouping results', grouped)

  const fileNote: string[] = [
    `Pexa Audit Processed at ${new Date().toISOString()}`,
  ]
  if (extra) fileNote.push(`\n${extra}`)

  Object.values(grouped).forEach(({ name, companyName, parts }) => {
    const companySuffix = companyName ? ` (${companyName})` : ''
    fileNote.push(`\n${name}${companySuffix}`)
    partOrder.forEach((part) => {
      if (part !== 'setup') fileNote.push(`\n${part.toUpperCase()}`)
      const partResults = parts[part]
      if (partResults) {
        partResults.forEach((result) => {
          if (part === 'setup') {
            fileNote.push(
              `${result.dbc_btr_pexa_audit_question}: ${result.dbc_answer}`,
            )
          } else {
            fileNote.push(
              `${result.dbc_answer ?? 'NOT ANSWERED'}: ${result.dbc_btr_pexa_audit_question}`,
            )
          }
        })
      }
    })
  })

  const returnValue = fileNote.join('\n')
  return returnValue
}

export const compileBtrPexaAuditFilenote = new Elysia()
  .use(appContext({ authorize: async ({ tenant }) => tenant === 'BTR' }))
  .post(
    '/:actionstepTaskId/pexa-audit-filenote',
    async ({
      params: { id, actionstepTaskId },
      ctx: {
        jwt: { tenant },
        dataverse,
        logger,
      },
      body: { dataverseGuid, extra },
    }) => {
      await logger.info(
        `Starting BTR PEXA Audit processing for Action Id:${id}, Task Id:${actionstepTaskId}, audit Guid:${dataverseGuid}`,
      )

      let file = await FileModel.findOne({
        tenant,
        actionStepMatterId: id,
      })
      if (!file) {
        await logger.info(
          `Creating new file for BTR PEXA Audit processing for Action Id:${id}, Task Id:${actionstepTaskId}, audit Guid:${dataverseGuid}`,
        )
        file = new FileModel<DbFile>({
          tenant,
          serviceType: 'internal',
          sourceReason: `Processing PEXA Audit for Matter:${id}`,
          actionStepMatterId: id,
          createdOn: new Date(),
        })
        await file.save()
      }
      await logger.info(`fileId:${file.id}`)

      let filenote: string = ''
      try {
        filenote = await compileFileNote(
          dataverse,
          dataverseGuid,
          logger,
          extra,
        )
      } catch (error) {
        const msg = `Error compiling file note for BTR PEXA Audit record:${dataverseGuid}, Matter Id:${id}, ignoring`
        await logger.error(msg, error)
        return { dataverseGuid, filenote: msg }
      }

      return { dataverseGuid, filenote }
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        id: t.Number(),
        actionstepTaskId: t.Number(),
      }),
      body: t.Object({
        dataverseGuid: t.String(),
        extra: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          dataverseGuid: t.String(),
          filenote: t.String(),
        }),
        401: unauthorizedSchema,
        404: t.String(),
        409: t.String(),
      },
      detail: {
        tags: ['Matters', 'Tasks', 'PEXA Audit'],
        description: 'Process a completed BTR PEXA Audit',
        summary: 'Process PEXA Audit',
      },
    },
  )
