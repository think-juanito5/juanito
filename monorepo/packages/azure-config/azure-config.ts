import { AppConfigurationClient } from '@azure/app-configuration'
import { type StaticDecode, type TSchema } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

export type Config = {
  connectionString: string
  appEnv: string
  appName: string
}

export type AppConfig = ReturnType<typeof appConfig>
export const appConfig = (config: Config) => {
  const client = new AppConfigurationClient(config.connectionString)
  const { appName, appEnv: label } = config
  const getAppKey = (key: string) => `${appName}:${key}`
  const getAppConfigSetting = async (key: string) => {
    const appKey = getAppKey(key)
    try {
      const setting = await client.getConfigurationSetting({
        key: appKey,
        label,
      })
      return setting.value
    } catch (_) {
      return undefined
    }
  }

  return {
    /**
     * Retrieves the application configuration setting for the specified key.
     *
     * @param key - The key for which to retrieve the configuration setting.
     * @returns A promise that resolves to the value of the configuration setting.
     * @throws Will return undefined if the setting is not found or if it does not have a value.
     */
    getSetting: async (key: string) => getAppConfigSetting(key),

    /**
     * Retrieves the application configuration setting for the specified key, parsed as a number.
     *
     * @param key - The key for which to retrieve the configuration setting.
     * @returns A promise that resolves to a numeric value of the configuration setting.
     * @throws Will return undefined if the setting is not found or if it does not have a value.
     */
    getNumber: async (key: string) => {
      const setting = await getAppConfigSetting(key)
      if (!setting) return undefined
      const parsed = Number(setting)
      if (Number.isNaN(parsed)) return undefined
      return parsed
    },

    /**
     * Retrieves the application configuration flag for the specified key.
     *
     * @param key - The key for which to retrieve the configuration setting.
     * @returns A promise that resolves to a boolean value which is true when the setting has a string value of `true`.
     * @throws Will return undefined if the setting is not found or if it does not have a value.
     */
    getFlag: async (key: string) => (await getAppConfigSetting(key)) == 'true',

    /**
     * Retrieves the json parsed application configuration value for the specified key.
     *
     * @param key - The key for which to retrieve the configuration setting.
     * @param schema - The schema to validate the setting value against.
     * @param shouldThrow - A flag indicating whether to throw an error if the setting is not found or is invalid. If `false`, `undefined` is returned instead.
     * @returns A promise that resolves to the parsed value if found and valid, otherwise `undefined` if `shouldThrow` is `false`.
     * @throws {Error} If `shouldThrow` is `true` and the setting value is not found or is invalid.
     */
    getValue: async <
      T extends TSchema,
      Output = StaticDecode<T>,
      Result extends Output = Output,
    >(
      key: string,
      schema: T,
      shouldThrow: boolean = true,
    ): Promise<Result | undefined> => {
      const setting = await getAppConfigSetting(key)
      if (!setting) {
        if (shouldThrow) {
          throw new Error(`Setting value not found for key: ${key}`)
        }
        return undefined
      }

      try {
        return Value.Parse(schema, JSON.parse(setting))
      } catch (error) {
        if (shouldThrow) {
          throw new Error(
            `Setting value is not valid for key: ${key}\n${error instanceof Error ? error.message : String(error)}`,
          )
        }
        return undefined
      }
    },
  }
}
