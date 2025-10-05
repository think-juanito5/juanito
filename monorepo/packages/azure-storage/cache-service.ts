import { type StaticDecode, type TSchema } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { Err, Ok, type Result } from 'ts-results-es'
import { ContainerClientFactory } from './container-client-factory'

export interface CacheService {
  set: (key: string, value: unknown) => Promise<Result<boolean, string>>
  get: <
    T extends TSchema,
    Output = StaticDecode<T>,
    TResult extends Output = Output,
  >(
    key: string,
  ) => Promise<Result<TResult, string>>
  listKeys: (prefix?: string) => Promise<Result<string[], string>>
  getValue: <
    T extends TSchema,
    Output = StaticDecode<T>,
    TResult extends Output = Output,
  >(
    key: string,
    schema: T,
  ) => Promise<TResult | undefined>
}

export class AzureStorageCacheService implements CacheService {
  constructor(private factory: ContainerClientFactory) {}

  async set(key: string, value: unknown): Promise<Result<boolean, string>> {
    try {
      const containerClient = await this.factory.create()
      const blockBlobClient = containerClient.getBlockBlobClient(key)
      const data = JSON.stringify(value)
      await blockBlobClient.upload(data, data.length)
      return Ok(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return Err(`Cache set failed: ${message}`)
    }
  }

  async get<
    T extends TSchema,
    Output = StaticDecode<T>,
    TResult extends Output = Output,
  >(key: string): Promise<Result<TResult, string>> {
    try {
      const containerClient = await this.factory.create()
      const blockBlobClient = containerClient.getBlockBlobClient(key)
      const downloadResponse = await blockBlobClient.download(0)

      if (!downloadResponse.readableStreamBody) {
        return Err('No readable stream body found')
      }

      const stream = downloadResponse.readableStreamBody
      const chunks: Uint8Array[] = []
      for await (const chunk of stream as AsyncIterable<Buffer>) {
        chunks.push(chunk)
      }

      const buffer = Buffer.concat(chunks)
      const json = buffer.toString('utf-8')
      const data = JSON.parse(json) as TResult

      return Ok(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return Err(`Cache retrieval failed: ${message}`)
    }
  }

  async listKeys(prefix?: string): Promise<Result<string[], string>> {
    try {
      const containerClient = await this.factory.create()
      const iterator = containerClient.listBlobsFlat({ prefix })
      const keys: string[] = []

      for await (const blob of iterator) {
        keys.push(blob.name)
      }

      return Ok(keys)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return Err(`List keys failed: ${message}`)
    }
  }

  async getValue<
    T extends TSchema,
    Output = StaticDecode<T>,
    TResult extends Output = Output,
  >(key: string, schema: T): Promise<TResult | undefined> {
    const result = await this.get<T, Output, TResult>(key)

    if (result.err) {
      throw new Error(`Cache get failed for key "${key}": ${result.val}`)
    }

    try {
      return Value.Cast(schema, result.val) as TResult
    } catch (err) {
      throw new Error(
        `Cached value for "${key}" failed schema validation.\n${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }
}
