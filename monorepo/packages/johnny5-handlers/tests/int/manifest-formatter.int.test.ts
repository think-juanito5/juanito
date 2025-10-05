import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { ActionStepService } from '@dbc-tech/actionstep'
import { createMongoDbConnection } from '@dbc-tech/johnny5-mongodb'
import { type Logger, NullLogger } from '@dbc-tech/logger'
import { mock } from 'ts-mockito'
import { ManifestFormatter } from '../../src/johnny5/btr/manifest-formatter'
import { type TestMongoDb, testMongoDb } from '../utils/mongodb-testdata'

describe('ManifestFormatter', () => {
  let db: TestMongoDb
  let actionstep: ActionStepService
  let logger: Logger

  beforeAll(async () => {
    await createMongoDbConnection()
    db = testMongoDb()

    actionstep = mock(ActionStepService)
    logger = mock(NullLogger)
  })

  beforeEach(async () => {
    await db.clear()
  })

  describe('getDataValue', () => {
    it('should return the original value', async () => {
      // Arrange
      const file = await db.seeder.johnny5.file.create()
      const job = await db.seeder.johnny5.job.create((m) => {
        m.fileId = file.id
        m.serviceType = 'conveyancing-buy'
      })
      await db.seeder.johnny5.contractData.create((m) => {
        m.jobId = job.id
        m.fileId = file.id
        m.contractDataItems = [
          {
            fieldName: 'field1',
            value: 'value1',
            text: 'value1',
            displayName: 'Field 1',
            fieldType: 'string',
            confidence: 1,
            pageNumber: 1,
            location_left: 0,
            location_top: 0,
            location_width: 0,
            location_height: 0,
          },
          {
            fieldName: 'field2',
            value: 'value1',
            text: 'value1',
            displayName: 'Field 1',
            fieldType: 'string',
            confidence: 1,
            pageNumber: 1,
            location_left: 0,
            location_top: 0,
            location_width: 0,
            location_height: 0,
          },
        ]
      })
      await db.seeder.johnny5.contractDataValidation.create((m) => {
        m.jobId = job.id
        m.fileId = file.id
        m.correctionDataItems = [
          {
            fieldName: 'field2',
            value: 'modified',
          },
        ]
      })
      await db.seeder.johnny5.refdataContractData.create((m) => {
        m.name = 'field1'
      })
      await db.seeder.johnny5.refdataContractData.create((m) => {
        m.name = 'field2'
      })

      const manifestFormatter = new ManifestFormatter(job, actionstep, logger)

      // Act
      const value = await manifestFormatter.getDataValue('field1')

      // Assert
      expect(value).toBe('value1')
    })

    it('should return the original value on second attempt', async () => {
      // Arrange
      const file = await db.seeder.johnny5.file.create()
      const job = await db.seeder.johnny5.job.create((m) => {
        m.fileId = file.id
        m.serviceType = 'conveyancing-buy'
      })
      await db.seeder.johnny5.contractData.create((m) => {
        m.jobId = job.id
        m.fileId = file.id
        m.contractDataItems = [
          {
            fieldName: 'field1',
            value: 'value1',
            text: 'value1',
            displayName: 'Field 1',
            fieldType: 'string',
            confidence: 1,
            pageNumber: 1,
            location_left: 0,
            location_top: 0,
            location_width: 0,
            location_height: 0,
          },
          {
            fieldName: 'field2',
            value: 'value1',
            text: 'value1',
            displayName: 'Field 1',
            fieldType: 'string',
            confidence: 1,
            pageNumber: 1,
            location_left: 0,
            location_top: 0,
            location_width: 0,
            location_height: 0,
          },
        ]
      })
      await db.seeder.johnny5.contractDataValidation.create((m) => {
        m.jobId = job.id
        m.fileId = file.id
        m.correctionDataItems = [
          {
            fieldName: 'field2',
            value: 'modified',
          },
        ]
      })
      await db.seeder.johnny5.refdataContractData.create((m) => {
        m.name = 'field1'
      })
      await db.seeder.johnny5.refdataContractData.create((m) => {
        m.name = 'field2'
      })

      const manifestFormatter = new ManifestFormatter(job, actionstep, logger)

      // Act
      const value = await manifestFormatter.getDataValue('field1')
      const value2 = await manifestFormatter.getDataValue('field1')

      // Assert
      expect(value).toBe('value1')
      expect(value2).toBe('value1')
    })

    it('should return the corrected value', async () => {
      // Arrange
      const file = await db.seeder.johnny5.file.create()
      const job = await db.seeder.johnny5.job.create((m) => {
        m.fileId = file.id
        m.serviceType = 'conveyancing-buy'
      })
      await db.seeder.johnny5.contractData.create((m) => {
        m.jobId = job.id
        m.fileId = file.id
        m.contractDataItems = [
          {
            fieldName: 'field1',
            value: 'value1',
            text: 'value1',
            displayName: 'Field 1',
            fieldType: 'string',
            confidence: 1,
            pageNumber: 1,
            location_left: 0,
            location_top: 0,
            location_width: 0,
            location_height: 0,
          },
        ]
      })
      await db.seeder.johnny5.contractDataValidation.create((m) => {
        m.jobId = job.id
        m.fileId = file.id
        m.correctionDataItems = [
          {
            fieldName: 'field1',
            value: 'modified',
          },
        ]
      })
      await db.seeder.johnny5.refdataContractData.create((m) => {
        m.name = 'field1'
      })

      const manifestFormatter = new ManifestFormatter(job, actionstep, logger)

      // Act
      const value = await manifestFormatter.getDataValue('field1')

      // Assert
      expect(value).toBe('modified')
    })

    it('should return the corrected value on second attempt', async () => {
      // Arrange
      const file = await db.seeder.johnny5.file.create()
      const job = await db.seeder.johnny5.job.create((m) => {
        m.fileId = file.id
        m.serviceType = 'conveyancing-buy'
      })
      await db.seeder.johnny5.contractData.create((m) => {
        m.jobId = job.id
        m.fileId = file.id
        m.contractDataItems = [
          {
            fieldName: 'field1',
            value: 'value1',
            text: 'value1',
            displayName: 'Field 1',
            fieldType: 'string',
            confidence: 1,
            pageNumber: 1,
            location_left: 0,
            location_top: 0,
            location_width: 0,
            location_height: 0,
          },
        ]
      })
      await db.seeder.johnny5.contractDataValidation.create((m) => {
        m.jobId = job.id
        m.fileId = file.id
        m.correctionDataItems = [
          {
            fieldName: 'field1',
            value: 'modified',
          },
        ]
      })
      await db.seeder.johnny5.refdataContractData.create((m) => {
        m.name = 'field1'
      })

      const manifestFormatter = new ManifestFormatter(job, actionstep, logger)

      // Act
      const value = await manifestFormatter.getDataValue('field1')
      const value2 = await manifestFormatter.getDataValue('field1')

      // Assert
      expect(value).toBe('modified')
      expect(value2).toBe('modified')
    })
  })
})
