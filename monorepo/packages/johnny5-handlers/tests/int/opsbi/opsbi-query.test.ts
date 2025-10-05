import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { type OpsbiQuery, opsbiQuery } from '@dbc-tech/opsbi'
import {
  type TestOpsbiDb,
  type TestOpsbiPool,
  type TestOpsbiSeeder,
  testOpsbiPool,
} from '../../utils/test-opsbi-db'

describe('OpsbiQuery', () => {
  let pool: TestOpsbiPool
  let db: TestOpsbiDb
  let seeder: TestOpsbiSeeder

  let query: OpsbiQuery

  beforeAll(async () => {
    pool = testOpsbiPool()
    db = await pool.connect()
    seeder = db.seeder
    await db.migrate()

    query = opsbiQuery(db.client)
  })

  beforeEach(async () => {
    await db.clear()
  })

  afterAll(async () => {
    await db.clear()
    pool.release()
  })

  describe('matters', () => {
    describe('onlineConversionsWithTypeFormResponses', () => {
      it('should return result for an OC matter in CD step with web responses', async () => {
        // Arrange
        await seeder.dim.matter.insert((m) => {
          m.stepName = 'Contract Drafting'
          m.actionId = 1
        })
        await seeder.dim.date.insert((d) => {
          d.dateId = 20200520
          d.date = '2024-05-20'
        })
        await seeder.dim.grossLead.insert((g) => {
          g.id = 99
          g.lead_journey = 'Online Conversion'
        })
        await seeder.fact.matter.insert((m) => {
          m.dateMatterCreated = '2024-05-20'
          m.actionId = 1
          m.leadKey = 99
        })
        await seeder.fact.typeformResponse.insert((t) => {
          t.actionKey = 1
          t.responseId = '1'
        })
        await seeder.fact.typeformResponse.insert((t) => {
          t.actionKey = 1
          t.responseId = '2'
        })

        // Act
        const result =
          await query.matters.onlineConversionsWithTypeFormResponses()

        // Assert
        expect(result.length).toBe(1)
        expect(result[0]).toEqual({
          action_id: 1,
          dateMatterCreated: '2024-05-20',
          isTestMatter: false,
          stepName: 'Contract Drafting',
          leadJourney: 'Online Conversion',
          typeformQuestionsAnswered: 2,
          unbilledDisbursements: 0,
          outstandingInvoices: 0,
        })
      })

      it('should return result for an OC matter in CD step with no web responses', async () => {
        // Arrange
        await seeder.dim.matter.insert((m) => {
          m.stepName = 'Contract Drafting'
          m.actionId = 1
        })
        await seeder.dim.date.insert((d) => {
          d.dateId = 20200520
          d.date = '2024-05-20'
        })
        await seeder.dim.grossLead.insert((g) => {
          g.id = 99
          g.lead_journey = 'Online Conversion'
        })
        await seeder.fact.matter.insert((m) => {
          m.dateMatterCreated = '2024-05-20'
          m.actionId = 1
          m.leadKey = 99
        })

        // Act
        const result =
          await query.matters.onlineConversionsWithTypeFormResponses()

        // Assert
        expect(result.length).toBe(1)
        expect(result[0]).toEqual({
          action_id: 1,
          dateMatterCreated: '2024-05-20',
          isTestMatter: false,
          stepName: 'Contract Drafting',
          leadJourney: 'Online Conversion',
          typeformQuestionsAnswered: 0,
          unbilledDisbursements: 0,
          outstandingInvoices: 0,
        })
      })
    })

    describe('withoutResponses', () => {
      it('should return result for an OC matter in CD step when a response is received', async () => {
        // Arrange
        await seeder.dim.matter.insert((m) => {
          m.stepName = 'Contract Drafting'
          m.actionId = 1
        })
        await seeder.dim.date.insert((d) => {
          d.dateId = 20200520
          d.date = '2024-05-20'
        })
        await seeder.dim.grossLead.insert((g) => {
          g.id = 97
          g.lead_journey = 'Online Conversion'
        })
        await seeder.fact.matter.insert((m) => {
          m.dateMatterCreated = '2024-05-20'
          m.actionId = 1
          m.leadKey = 97
        })

        await seeder.dim.matter.insert((m) => {
          m.stepName = 'Contract Drafting'
          m.actionId = 2
        })
        await seeder.dim.grossLead.insert((g) => {
          g.id = 98
          g.lead_journey = 'Online Conversion'
        })
        await seeder.fact.matter.insert((m) => {
          m.dateMatterCreated = '2024-05-20'
          m.actionId = 2
          m.leadKey = 98
        })
        await seeder.fact.typeformResponse.insert((t) => {
          t.actionKey = 2
          t.responseId = '1'
        })

        await seeder.dim.matter.insert((m) => {
          m.stepName = 'Contract Drafting'
          m.actionId = 3
        })
        await seeder.dim.date.insert((d) => {
          d.dateId = 20200521
          d.date = '2024-05-21'
        })
        await seeder.dim.grossLead.insert((g) => {
          g.id = 99
          g.lead_journey = 'Online Conversion'
        })
        await seeder.fact.matter.insert((m) => {
          m.dateMatterCreated = '2024-05-21'
          m.actionId = 3
          m.leadKey = 99
        })

        // Act
        const result = await query.matters.staleOnlineConversions('2024-05-21')

        // Assert
        expect(result.length).toBe(1)
        expect(result[0]).toEqual({
          action_id: 1,
          dateMatterCreated: '2024-05-20',
          isTestMatter: false,
          stepName: 'Contract Drafting',
          leadJourney: 'Online Conversion',
          typeformQuestionsAnswered: 0,
          unbilledDisbursements: 0,
          outstandingInvoices: 0,
        })
      })
    })
  })
})
