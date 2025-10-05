import { type HttpService, errorFrom } from '@dbc-tech/http2'
import type { CcaRaqWebhook, Quote } from '@dbc-tech/johnny5'

export const quotes = (httpService: HttpService) => {
  return {
    request: async (body: CcaRaqWebhook): Promise<Quote> => {
      const result = await httpService.post({ path: `/quotes/v1`, body })

      if (!result.ok) throw errorFrom(result.val)
      return result.val.data as Quote
    },
    get: async (quoteId: string): Promise<Quote> => {
      const result = await httpService.get({
        path: `/quotes/v1/${quoteId}`,
      })

      if (!result.ok) throw errorFrom(result.val)
      return result.val.data as Quote
    },
  }
}
