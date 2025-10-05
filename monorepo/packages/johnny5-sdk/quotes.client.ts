import { quotes } from './api/quotes'
import { createHttpService } from './http.factory'
import type { Johnny5ClientConfig } from './types/johnny5-client-config.type'

export type QuotesClient = {
  cca: {
    quotes: ReturnType<typeof quotes>
  }
}

export const quotesClient = (config: Johnny5ClientConfig): QuotesClient => {
  const httpService = createHttpService(config)

  return {
    cca: {
      quotes: quotes(httpService),
    },
  }
}
