import { HttpService, type HttpServiceConfig } from '@dbc-tech/http'

export const createHttpService = (config: HttpServiceConfig) => {
  const deets = {
    baseUrl: config.baseUrl,
    defaultHeaders: config.defaultHeaders || {},
    defaultQueryParams: config.defaultQueryParams || {},
    logger: config.logger,
  }
  return new HttpService(deets)
}
