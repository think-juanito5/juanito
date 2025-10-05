import type { DataSource } from '@dbc-tech/johnny5/interfaces'
import type {
  BtrSdsClientWebhook,
  DataItem,
  PropertyAddress,
} from '@dbc-tech/johnny5/typebox'

export class SdsWebhookReader implements DataSource {
  private readonly dataMap: Record<string, string | undefined>

  constructor(
    private readonly data: BtrSdsClientWebhook,
    private readonly validatedAddress: PropertyAddress,
  ) {
    this.dataMap = this.buildDataMap()
  }

  public async get(name: string): Promise<DataItem> {
    const value = this.dataMap[name]

    return {
      name,
      value,
      rawText: value,
      type: 'Text',
      required: true,
    }
  }

  private buildDataMap(): Record<string, string | undefined> {
    return {
      id: this.data.webhook_id,
      created_on: this.data.created_on,
      ...this.mapPropertyFields(this.data),
      ...this.mapSellerFields(this.data.sellers),
      ...this.mapAgentFields(this.data),
    }
  }

  private mapPropertyFields(
    webhook: BtrSdsClientWebhook,
  ): Record<string, string | undefined> {
    return {
      property_full_address: webhook.property_address,
      property_address_line_1: this.validatedAddress.addressLine1,
      property_address_line_2: this.validatedAddress.addressLine2,
      property_suburb: this.validatedAddress.suburb,
      property_state: this.validatedAddress.state,
      property_postcode: this.validatedAddress.postcode,
    }
  }

  private mapAgentFields(
    webhook: BtrSdsClientWebhook,
  ): Record<string, string | undefined> {
    return {
      sellers_agent_name: webhook.agent.full_name,
      sellers_agency_name: webhook.agency_name,
      sellers_agent_email: webhook.agent.email,
      sellers_agent_phone: webhook.agent.phone,
      sellers_agent_id: webhook.agent_id,
      sellers_agent_website: webhook.referral_url,
    }
  }

  private mapSellerFields(
    sellers: BtrSdsClientWebhook['sellers'],
  ): Record<string, string> {
    const map: Record<string, string> = {}

    sellers.forEach((seller, index) => {
      const isFirst = index === 0
      const base = isFirst ? 'sellers' : `seller_${index + 1}`

      map[`${base}_name`] = seller.full_name
      map[`${base}_email`] = seller.email
      map[`${base}_phone`] = seller.phone
    })

    return map
  }
}
