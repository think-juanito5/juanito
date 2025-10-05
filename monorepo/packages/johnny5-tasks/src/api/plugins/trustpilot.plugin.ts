import { TrustPilotLinkService } from '@dbc-tech/cca-common'

export const createTrustPilotLinkService = () =>
  new TrustPilotLinkService({
    domain: process.env.CCA_DOMAIN_NAME!,
    encryptKeyHex: process.env.CCA_TRUSTPILOT_ENCRYPT_KEY!,
    authKeyHex: process.env.CCA_TRUSTPILOT_AUTH_KEY!,
  })
