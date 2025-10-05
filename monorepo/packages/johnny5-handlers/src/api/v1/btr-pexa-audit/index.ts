import type { DataverseService } from '@dbc-tech/dataverse'
import Elysia from 'elysia'
import { audit_failed } from './audit-failed'
import { audit_passed } from './audit-passed'
import { start } from './start'
import { subsequentAuditStart } from './subsequent-audit-start'

export const index = new Elysia({ prefix: '/btr-pexa-audit' })
  .use(start)
  .use(audit_passed)
  .use(audit_failed)
  .use(subsequentAuditStart)

export const compileTaskDescription = async (
  dataverse: () => DataverseService,
  dataverseGuid: string,
): Promise<string | undefined> => {
  const dv = dataverse()
  const results = await dv.getBtrPexaAuditResults({
    $filter: `(_dbc_btr_pexa_audit_value eq '${dataverseGuid}') and (dbc_answer eq 'No')`,
    $select:
      'dbc_company_name, dbc_name, dbc_part, dbc_btr_pexa_audit_question, dbc_answer',
  })

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

  const taskDescription: string[] = [
    `Pexa Audit Processed at ${new Date().toISOString()}`,
  ]

  Object.values(grouped).forEach(({ name, companyName, parts }) => {
    const companySuffix = companyName ? ` (${companyName})` : ''
    taskDescription.push(`\n${name}${companySuffix}`)
    partOrder.forEach((part) => {
      const partResults = parts[part]
      if (partResults) {
        partResults.forEach((result) => {
          taskDescription.push(
            `${result.dbc_answer}: ${result.dbc_part} - ${result.dbc_btr_pexa_audit_question}`,
          )
        })
      }
    })
  })

  const returnValue =
    taskDescription.length > Object.keys(grouped).length + 1
      ? taskDescription.join('\n')
      : undefined
  return returnValue
}
