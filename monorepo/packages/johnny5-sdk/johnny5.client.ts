import { btr } from './api/btr'
import { cca } from './api/cca'
import { typeform } from './api/typeform'
import { createHttpService } from './http.factory'
import type { Johnny5ClientConfig } from './types/johnny5-client-config.type'

export type Johnny5Client = {
  btr: ReturnType<typeof btr>
  cca: ReturnType<typeof cca>
  typeform: ReturnType<typeof typeform>
}

export const johnny5Client = (config: Johnny5ClientConfig): Johnny5Client => {
  const httpService = createHttpService(config)

  return {
    btr: btr(httpService),
    cca: cca(httpService),
    typeform: typeform(httpService),
  }
}
