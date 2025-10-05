import crypto from 'crypto'

interface TrustPilotPayload {
  email: string
  name: string
  ref: string
  [key: string]: string // Allows additional properties
}

export type TrustPilotConfig = {
  domain: string
  encryptKeyHex: string
  authKeyHex: string
}

export class TrustPilotLinkService {
  private readonly encryptKey: Buffer
  private readonly authKey: Buffer
  private readonly domain: string
  private payload: TrustPilotPayload

  constructor(config: TrustPilotConfig) {
    this.domain = config.domain
    this.encryptKey = Buffer.from(config.encryptKeyHex, 'hex')
    this.authKey = Buffer.from(config.authKeyHex, 'hex')
    this.payload = {} as TrustPilotPayload
  }

  /**
   * Sets the initial payload.
   * @param payload - The initial payload object.
   * @returns this - For method chaining.
   */
  public setPayload(payload: TrustPilotPayload): this {
    this.payload = payload
    return this
  }

  /**
   * Adds or updates a property in the payload.
   * @param key - The property key.
   * @param value - The property value.
   * @returns this - For method chaining.
   */
  public addPayload(key: string, value: string): this {
    this.payload[key] = value
    return this
  }

  /**
   * Generates the encrypted TrustPilot link.
   * @returns The encrypted TrustPilot evaluation link.
   */
  public generateLink(): string {
    if (!this.payload.email || !this.payload.name || !this.payload.ref) {
      throw new Error(
        "Payload must contain at least 'email', 'name', and 'ref'.",
      )
    }

    const jsonPayload = JSON.stringify(this.payload)
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptKey, iv)
    const encrypted = Buffer.concat([
      cipher.update(jsonPayload, 'utf8'),
      cipher.final(),
    ])

    const hmac = crypto.createHmac('sha256', this.authKey)
    hmac.update(Buffer.concat([iv, encrypted]))

    const HMAC = hmac.digest()
    const base64Payload = Buffer.concat([iv, encrypted, HMAC]).toString(
      'base64',
    )

    // Optimized URL encoding
    const encryptedData = encodeURIComponent(base64Payload)

    return `https://www.trustpilot.com/evaluate-bgl/${this.domain}?p=${encryptedData}`
  }
}
