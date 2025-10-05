import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { ContainerClientFactory } from '@dbc-tech/azure-storage'
import { TrustPilotLinkManager } from '@dbc-tech/cca-common'
import { TPLinkParamsSchema } from '@dbc-tech/johnny5'
import { type TPLinkParams } from '@dbc-tech/johnny5'
import { ConsoleLogger } from '@dbc-tech/logger'
import { Err, Ok, type Result } from 'ts-results-es'
// ─── Mocks ───────────────────────────────────────────

const mockCacheService = {
  set: mock(
    async (_key: string, _value: unknown): Promise<Result<boolean, string>> =>
      Ok(true),
  ),

  get: mock(async () => Ok({})), // not used directly anymore
  getValue: mock(async () => undefined as TPLinkParams | undefined), // not used directly anymore
  listKeys: mock(
    async (_prefix?: string): Promise<Result<string[], string>> =>
      Ok(['key1', 'key2']),
  ),
}

const mockFactory = {
  create: mock(() => Promise.resolve({})),
}

mock.module('@dbc-tech/azure-storage', () => ({
  AzureStorageCacheService: mock(() => mockCacheService),
  ContainerClientFactory: mock(() => mockFactory),
}))

// ─── Test Suite ──────────────────────────────────────

describe('TrustPilotLinkManager', () => {
  let manager: TrustPilotLinkManager
  const logger = ConsoleLogger()

  beforeEach(() => {
    mockCacheService.set.mockClear()
    mockCacheService.get.mockClear()
    mockCacheService.getValue.mockClear()
    mockCacheService.listKeys.mockClear()
    mockFactory.create.mockClear()

    manager = new TrustPilotLinkManager(logger)
  })

  // ─── Constructor ─────────────────────

  describe('constructor', () => {
    test('should create with default factory when none provided', () => {
      expect(manager).toBeInstanceOf(TrustPilotLinkManager)
    })

    test('should use provided factory when supplied', () => {
      const customFactory = {} as ContainerClientFactory
      const customManager = new TrustPilotLinkManager(logger, customFactory)
      expect(customManager).toBeInstanceOf(TrustPilotLinkManager)
    })
  })

  // ─── storeLink ──────────────────────

  describe('storeLink', () => {
    test('should call set with prefixed key and data', async () => {
      const data = {
        matterId: '456',
        client: { id: '123', name: 'Jane', email: 'jane@example.com' },
      }

      const result = await manager.storeLink(123, 456, data)
      expect(result.ok).toBeTrue()

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'johnny5/trustpilot-link/client-123/matter:456',
        data,
      )
    })

    test('should return error if set fails', async () => {
      const data = {
        matterId: '456',
        client: { id: '123', name: 'Jane', email: 'jane@example.com' },
      }

      mockCacheService.set.mockImplementationOnce(() =>
        Promise.resolve(Err('Set failed')),
      )
      const result = await manager.storeLink(999, 888, data)
      expect(result.err).toBeTrue()
      expect(result.val).toBe('Set failed')
    })
  })

  // ─── getLinks ───────────────────────

  describe('getLinks', () => {
    test('should call listKeys with correct prefix', async () => {
      const result = await manager.getLinks('123')
      expect(result.ok).toBeTrue()
      expect(result.val).toEqual(['key1', 'key2'])

      expect(mockCacheService.listKeys).toHaveBeenCalledWith(
        'johnny5/trustpilot-link/client-123',
      )
    })

    test('should return error if listKeys fails', async () => {
      mockCacheService.listKeys.mockImplementationOnce(() =>
        Promise.resolve(Err('List failed')),
      )

      const result = await manager.getLinks('456')
      expect(result.err).toBeTrue()
      expect(result.val).toBe('List failed')
    })
  })

  // ─── hasLink ────────────────────────

  describe('hasLink', () => {
    test('should return true if links exist', async () => {
      mockCacheService.listKeys.mockImplementationOnce(() =>
        Promise.resolve(Ok(['a', 'b'])),
      )
      const result = await manager.hasLink('123')
      expect(result.ok).toBeTrue()
      expect(result.val).toBeTrue()
    })

    test('should return false if no links exist', async () => {
      mockCacheService.listKeys.mockImplementationOnce(() =>
        Promise.resolve(Ok([])),
      )
      const result = await manager.hasLink('123')
      expect(result.ok).toBeTrue()
      expect(result.val).toBeFalse()
    })

    test('should return error if listKeys fails', async () => {
      mockCacheService.listKeys.mockImplementationOnce(() =>
        Promise.resolve(Err('List failed')),
      )
      const result = await manager.hasLink('999')
      expect(result.err).toBeTrue()
      expect(result.val).toBe('List failed')
    })
  })

  // ─── getDataValue ───────────────────

  describe('getDataValue', () => {
    test('should return validated value', async () => {
      const validData: TPLinkParams = {
        matterId: '456',
        client: { id: '123', name: 'John', email: 'john@example.com' },
      }

      mockCacheService.getValue.mockImplementationOnce(() =>
        Promise.resolve(validData),
      )

      const result = await manager.getDataValue('456', '123')
      expect(result).toEqual(validData)
      expect(mockCacheService.getValue).toHaveBeenCalledWith(
        'johnny5/trustpilot-link/client-123/matter:456',
        TPLinkParamsSchema,
      )
    })

    test('should return undefined if key not found', async () => {
      mockCacheService.getValue.mockImplementationOnce(() =>
        Promise.resolve(undefined),
      )
      const result = await manager.getDataValue('999', '888')
      expect(result).toBeUndefined()
    })
  })
})
