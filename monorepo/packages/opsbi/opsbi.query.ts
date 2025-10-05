import { and, eq, lt } from 'drizzle-orm'
import { type NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres'
import type { PgSelect } from 'drizzle-orm/pg-core'
import type { PoolClient } from 'pg'

import * as opsbi from './opsbi.schema'

export type OpsbiQuery = ReturnType<typeof opsbiQuery>
export const opsbiQuery = (client: PoolClient) => {
  const db = drizzle(client, { schema: opsbi })
  return {
    client,
    matters: {
      onlineConversionsWithTypeFormResponses: () =>
        onlineConversionMattersWithTypeFormResponses(db),
      staleOnlineConversions: (dateMatterCreated: string) =>
        onlineConversionMattersWithTypeFormResponses(db)
          .$dynamic()
          .where(
            and(
              eq(opsbi.factStaleMatters.typeformQuestionsAnswered, 0),
              eq(opsbi.factStaleMatters.unbilledDisbursements, 0),
              eq(opsbi.factStaleMatters.outstandingInvoices, 0),
              lt(opsbi.factStaleMatters.dateMatterCreated, dateMatterCreated),
            ),
          ),
    },
  }
}

export const onlineConversionMattersWithTypeFormResponses = (
  db: NodePgDatabase<typeof opsbi>,
) =>
  db
    .select({
      action_id: opsbi.factStaleMatters.actionId,
      dateMatterCreated: opsbi.factStaleMatters.dateMatterCreated,
      isTestMatter: opsbi.factStaleMatters.isTestMatter,
      stepName: opsbi.factStaleMatters.stepName,
      leadJourney: opsbi.factStaleMatters.leadJourney,
      typeformQuestionsAnswered:
        opsbi.factStaleMatters.typeformQuestionsAnswered,
      unbilledDisbursements: opsbi.factStaleMatters.unbilledDisbursements,
      outstandingInvoices: opsbi.factStaleMatters.outstandingInvoices,
    })
    .from(opsbi.factStaleMatters)

export const staleMatters = <T extends PgSelect>(
  qb: T,
  dateMatterCreated: string,
) =>
  qb
    .having(({ questionsAnswered }) => eq(questionsAnswered, 0))
    .where(lt(opsbi.factMatters.dateMatterCreated, dateMatterCreated))
