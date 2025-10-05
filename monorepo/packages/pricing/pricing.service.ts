import type { DataverseServiceConfig, Pricing } from '@dbc-tech/dataverse'
import { DataverseService } from '@dbc-tech/dataverse'
import type { Tenant } from '@dbc-tech/johnny5/typebox/common.schema'
import type { QueryInput } from './pricing.schema'

const ALL_PRICING_FIELDS =
  'dbc_priceid, dbc_brand, dbc_state, dbc_bst, dbc_date_effective_from, dbc_name, dbc_property_type, dbc_drafting_fee, dbc_review_fee, dbc_conveyancing_fee, dbc_searchesfee, dbc_searches_fee_min, dbc_searches_fee_max, dbc_enabled, dbc_show_on_website, dbc_sds_fee'

export class PricingService {
  private tenant: Tenant
  private dv: DataverseService

  constructor(config: DataverseServiceConfig & { tenant: Tenant }) {
    this.tenant = config.tenant
    this.dv = new DataverseService(config)
  }

  async getPrices(query: QueryInput): Promise<Pricing[]> {
    const { state, bst, propertyType, effectiveDate, version } = query
    let filter: string = `dbc_brand eq '${this.tenant}'`
    if (state) filter += ` and dbc_state eq '${state}'`
    if (bst) filter += ` and dbc_bst eq '${bst}'`
    if (propertyType) filter += ` and dbc_name eq '${propertyType}'`
    if (version !== 'draft') filter += ` and dbc_enabled eq true`
    if (version === 'draft') {
      filter += ` and dbc_enabled ne true`
    } else if (version === 'current') {
      filter += ` and dbc_date_effective_from le '${new Date().toISOString()}'`
    }
    if (effectiveDate) {
      const lower = new Date(
        new Date(effectiveDate).getTime() - 1 * 24 * 60 * 60 * 1000,
      )
      const upper = new Date(
        new Date(effectiveDate).getTime() + 1 * 24 * 60 * 60 * 1000,
      )
      filter += ` and dbc_date_effective_from gt '${lower.toISOString()}'`
      filter += ` and dbc_date_effective_from lt '${upper.toISOString()}'`
    }
    const response = await this.dv.getPricing({
      $filter: filter,
      $select: ALL_PRICING_FIELDS,
      $orderby: 'dbc_date_effective_from desc',
    })
    if (!response || !response.value) {
      throw new Error('Error querying dataverse')
    }

    if (version === 'current') {
      const maxDate = response.value[0].dbc_date_effective_from
      const currentPrices = response.value.filter(
        (price) => price.dbc_date_effective_from === maxDate,
      )
      return currentPrices
    }
    if (response.value.length === 0) {
      return []
    }
    return response.value
  }

  async getPriceById(id: string): Promise<Pricing | null> {
    const response = await this.dv.getPricing({
      $filter: `dbc_brand eq ${this.tenant} and dbc_priceid eq '${id}'`,
      $select: ALL_PRICING_FIELDS,
    })
    if (!response || !response.value) {
      throw new Error('Error querying dataverse')
    }
    if (response.value.length === 0) {
      return null
    }
    return response.value[0]
  }
}
