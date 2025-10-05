import type { Tenant } from '@dbc-tech/johnny5'
import { type StaticDecode, type TSchema } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import {
  type Johnny5Config,
  Johnny5ConfigModel,
} from '../schema/johnny5-config.schema'

export class Johnny5ConfigService {
  constructor(readonly tenant: Tenant) {}

  /**
   * Retrieves a Johnny5Config by name and optional tags.
   *
   * @param name The name of the configuration to retrieve.
   * @param tags Optional tags to filter the configuration.
   * @returns A promise that resolves to the Johnny5Config if found, otherwise undefined.
   */
  async get(name: string, tags?: string[]): Promise<Johnny5Config | undefined> {
    const q = Johnny5ConfigModel.findOne({
      tenant: this.tenant,
      name,
    })
    if (tags && tags.length > 0) {
      q.where('tags', {
        $all: tags,
      })
    }

    const config = await q.lean().exec()
    return config ?? undefined
  }

  /**
   * Retrieves the configuration value for the specified name & tags, parsed as a string.
   *
   * @param name - The name for which to retrieve the configuration setting.
   * @param tags - Optional tags to filter the configuration setting.
   * @returns A promise that resolves to a string value of the configuration setting or undefined if setting is not found.
   */
  async getString(name: string, tags?: string[]): Promise<string | undefined> {
    const setting = await this.get(name, tags)
    if (!setting) return undefined
    return setting.value
  }

  /**
   * Retrieves the configuration value for the specified name & tags, parsed as a number.
   *
   * @param name - The name for which to retrieve the configuration setting.
   * @param tags - Optional tags to filter the configuration setting.
   * @returns A promise that resolves to a numeric value of the configuration setting or undefined if setting is not found or cannot be parsed as a number.
   */
  async getNumber(name: string, tags?: string[]): Promise<number | undefined> {
    const setting = await this.get(name, tags)
    if (!setting) return undefined
    const parsed = Number(setting)
    if (Number.isNaN(parsed)) return undefined
    return parsed
  }

  /**
   * Retrieves the json parsed configuration value for the specified name.
   *
   * @param name - The name for which to retrieve the configuration setting.
   * @param schema - The schema to validate the setting value against.
   * @param shouldThrow - A flag indicating whether to throw an error if the setting is not found or is invalid. If `false`, `undefined` is returned instead.
   * @param tags - Optional tags to filter the configuration setting.
   * @returns A promise that resolves to the parsed value if found and valid, otherwise `undefined` if `shouldThrow` is `false`.
   * @throws {Error} If `shouldThrow` is `true` and the setting value is not found or is invalid.
   */
  async getValue<
    T extends TSchema,
    Output = StaticDecode<T>,
    Result extends Output = Output,
  >(
    name: string,
    schema: T,
    shouldThrow: boolean = true,
    tags?: string[],
  ): Promise<Result | undefined> {
    const setting = await this.get(name, tags)
    if (!setting) {
      if (shouldThrow) {
        throw new Error(`Config not found for name: ${name}`)
      }
      return undefined
    }

    try {
      return Value.Parse(schema, JSON.parse(setting.value))
    } catch (error) {
      if (shouldThrow) {
        throw new Error(
          `Config value is not valid for name: ${name}\n${error instanceof Error ? error.message : String(error)}`,
        )
      }
      return undefined
    }
  }
}

export const createJohnny5ConfigService = (tenant: Tenant) =>
  new Johnny5ConfigService(tenant)
