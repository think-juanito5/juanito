import * as opsbi from '@dbc-tech/opsbi'
import { type NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres'
import { Pool, type PoolClient } from 'pg'
import { testDbConfig } from './test-db-config'

export type DimDates = typeof opsbi.dimDates.$inferInsert
export type DimGrossLeads = typeof opsbi.dimGrossLeads.$inferInsert
export type DimMatters = typeof opsbi.dimMatters.$inferInsert
export type DimStates = typeof opsbi.dimStates.$inferInsert
export type FactMatters = typeof opsbi.factMatters.$inferInsert
export type FactTypeformResponses =
  typeof opsbi.factTypeformResponses.$inferInsert

export type TestOpsbiData = typeof testOpsbiData
export const testOpsbiData = {
  dim: {
    date: (cb?: (e: DimDates) => void): DimDates => {
      const entity: DimDates = {
        date: '2024/01/01',
        dateId: 0,
        epoch: 0,
        daySuffix: '',
        dayName: '',
        dayOfWeek: 0,
        dayOfMonth: 0,
        dayOfQuarter: 0,
        dayOfYear: 0,
        weekOfMonth: 0,
        weekOfYear: 0,
        weekOfYearIso: '',
        monthActual: 0,
        monthName: '',
        monthNameAbbreviated: '',
        quarterActual: 0,
        quarterName: '',
        yearActual: 0,
        firstDayOfWeek: '2024/01/01',
        lastDayOfWeek: '2024/01/01',
        firstDayOfMonth: '2024/01/01',
        lastDayOfMonth: '2024/01/01',
        firstDayOfQuarter: '2024/01/01',
        lastDayOfQuarter: '2024/01/01',
        firstDayOfYear: '2024/01/01',
        lastDayOfYear: '2024/01/01',
        mmyyyy: '',
        mmddyyyy: '',
        weekendIndr: false,
      }
      if (cb) cb(entity)
      return entity
    },
    grossLead: (cb?: (e: DimGrossLeads) => void): DimGrossLeads => {
      const entity: DimGrossLeads = {
        id: 0,
      }
      if (cb) cb(entity)
      return entity
    },
    matter: (cb?: (e: DimMatters) => void): DimMatters => {
      const entity: DimMatters = {
        actionId: 1,
      }
      if (cb) cb(entity)
      return entity
    },
    states: (cb?: (e: DimStates) => void): DimStates => {
      const entity: DimStates = {
        stateId: 0,
        state: 'NSW',
      }
      if (cb) cb(entity)
      return entity
    },
  },
  fact: {
    matter: (cb?: (e: FactMatters) => void): FactMatters => {
      const entity: FactMatters = {
        actionId: 1,
        dateMatterCreated: '2024/01/01',
        isOto: false,
        isTestMatter: false,
        isMigratedMatter: false,
        isRestrictedMatter: false,
        hasDraft: false,
        hasReview: false,
        hasSettled: false,
        hasCancelled: false,
        hasTerminated: false,
        isRepeat: false,
        sale: 0,
      }
      if (cb) cb(entity)
      return entity
    },
    typeformResponse: (
      cb?: (e: FactTypeformResponses) => void,
    ): FactTypeformResponses => {
      const entity: FactTypeformResponses = {
        formId: '',
        fieldRefId: '',
        responseId: '',
        landedAt: '2024-01-01T00:00:00.000Z',
      }
      if (cb) cb(entity)
      return entity
    },
  },
}

export type TestOpsbiSeeder = ReturnType<typeof testOpsbiSeeder>
export const testOpsbiSeeder = (
  db: NodePgDatabase<typeof opsbi>,
  data: TestOpsbiData,
) => {
  return {
    data,
    db,
    dim: {
      date: {
        insert: async (cb?: (e: DimDates) => void): Promise<DimDates> => {
          const entity = data.dim.date(cb)
          await db.insert(opsbi.dimDates).values(entity)
          return entity
        },
      },
      grossLead: {
        insert: async (
          cb?: (e: DimGrossLeads) => void,
        ): Promise<DimGrossLeads> => {
          const entity = data.dim.grossLead(cb)
          await db.insert(opsbi.dimGrossLeads).values(entity)
          return entity
        },
      },
      matter: {
        insert: async (cb?: (e: DimMatters) => void): Promise<DimMatters> => {
          const entity = data.dim.matter(cb)
          await db.insert(opsbi.dimMatters).values(entity)
          return entity
        },
      },
      states: {
        insert: async (cb?: (e: DimStates) => void): Promise<DimStates> => {
          const entity = data.dim.states(cb)
          await db.insert(opsbi.dimStates).values(entity)
          return entity
        },
      },
    },
    fact: {
      matter: {
        insert: async (cb?: (e: FactMatters) => void): Promise<FactMatters> => {
          const entity = data.fact.matter(cb)
          await db.insert(opsbi.factMatters).values(entity)
          return entity
        },
      },
      typeformResponse: {
        insert: async (
          cb?: (e: FactTypeformResponses) => void,
        ): Promise<FactTypeformResponses> => {
          const entity = data.fact.typeformResponse(cb)
          await db.insert(opsbi.factTypeformResponses).values(entity)
          return entity
        },
      },
    },
  }
}

export type TestOpsbiPool = ReturnType<typeof testOpsbiPool>
export const testOpsbiPool = () => {
  const pgPool = new Pool(testDbConfig)
  let client: PoolClient
  return {
    connect: async () => {
      client = await pgPool.connect()
      return testOpsbiDb(client)
    },
    release: async () => {
      client.release()
      await pgPool.end()
    },
  }
}

export type TestOpsbiDb = ReturnType<typeof testOpsbiDb>
export const testOpsbiDb = (client: PoolClient) => {
  const db = drizzle(client, { schema: opsbi })
  const seeder = testOpsbiSeeder(db, testOpsbiData)
  return {
    client,
    db,
    migrate: async () => {
      const file = Bun.file('../../migrations/opsbi.sql')
      const text = await file.text()
      const statements = text.split('--> statement-breakpoint')
      for (const statement of statements) {
        await client.query(statement)
      }
    },
    clear: async () => {
      await client.query(`
      DO
      $func$
      BEGIN
        EXECUTE
        (SELECT 'TRUNCATE TABLE ' || string_agg(oid::regclass::text, ', ') || ' CASCADE'
          FROM   pg_class
          WHERE  relkind = 'r'  -- only tables
          AND    relnamespace = 'silver'::regnamespace
        );
      END
      $func$;
      `)
    },
    data: testOpsbiData,
    seeder,
  }
}
