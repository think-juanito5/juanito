import { type HttpService, errorFrom } from '@dbc-tech/http2'
import { CIdString, type IdString } from '@dbc-tech/johnny5/typebox'
import type { TypeFormWebhookReceived } from '../schema'

export const typeform = (httpService: HttpService) => {
  return {
    bespokeTasks: async (
      webhook: TypeFormWebhookReceived,
    ): Promise<IdString> => {
      const result = await httpService.post(
        // TODO: change to /johnny5/v1/typeform/bespoke-tasks
        { path: `/johnny5/v1/bespoke-tasks`, body: webhook },
        CIdString,
      )
      if (!result.ok) throw errorFrom(result.val)
      return result.val.data
    },
  }
}
