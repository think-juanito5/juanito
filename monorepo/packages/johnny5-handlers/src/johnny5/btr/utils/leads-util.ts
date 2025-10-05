import {
  type BtrConveyancer,
  BtrConveyancerModel,
} from '@dbc-tech/johnny5-mongodb'
import type { BtrSdsClientWebhook, Tenant } from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import { findConveyancerByPostcode } from '../../../mongodb/queries/btr-conveyancer.query'
import type {
  SdsFormLeadDetails,
  SdsLeadType,
  SdsPreferredLeadDetails,
} from '../types/sds-filenotes-details'

const BTR_DEFAULT_AREA = 'Q00'

export async function getMatterTemplateId(
  logger: Logger,
  tenant: Tenant,
  agent_id: string | undefined,
  area: string | undefined,
  postcode: number | undefined,
): Promise<number | undefined> {
  const hasArea = Boolean(area)
  const hasAgentId = Boolean(agent_id)
  const isColdLeads = !hasArea && !hasAgentId

  await logger.info(
    `Retrieving Matter Template ID for tenant: ${tenant}, area: ${area}, postcode: ${postcode}, agent_id: ${agent_id}`,
  )

  if (hasArea) {
    const conveyancerByArea = await BtrConveyancerModel.findOne({
      tenant,
      area,
    })

    if (conveyancerByArea) {
      logger.debug(`Using conveyancer from tenant/area match - ${area}`)
      return conveyancerByArea.templateMatterId
    }
    logger.warn(
      `No conveyancer found for area: ${area}, falling back to default area`,
    )
  } else if (isColdLeads) {
    if (!postcode) {
      logger.error('No postcode provided for cold leads')
      throw new Error('No postcode provided for cold leads')
    }
    const conveyancerByPostcode = await findConveyancerByPostcode(
      tenant,
      postcode,
    )

    if (conveyancerByPostcode) {
      logger.debug(`Using conveyancer matched by postcode: ${postcode}`)
      return conveyancerByPostcode.templateMatterId
    }

    logger.warn(
      `No conveyancer found for postcode: ${postcode}, falling back to default area`,
    )
  }

  const fallbackConveyancer = await BtrConveyancerModel.findOne({
    tenant,
    area: BTR_DEFAULT_AREA,
  })

  if (!fallbackConveyancer) {
    logger.error(`No default conveyancer found for area ${BTR_DEFAULT_AREA}`)
    return undefined
  }

  logger.debug(`Using fallback conveyancer for area: ${BTR_DEFAULT_AREA}`)
  return fallbackConveyancer.templateMatterId
}

export async function getPreferredLeadDetails(
  tenant: Tenant,
  leadType?: SdsLeadType,
  postcode?: string,
  area?: string,
): Promise<SdsPreferredLeadDetails> {
  const toPreferredDetails = (
    conveyancer: BtrConveyancer,
  ): SdsPreferredLeadDetails => ({
    templateId: conveyancer.templateMatterId,
    email: conveyancer.conveyancerEmail,
    areaCode: conveyancer.area,
  })

  if (leadType === 'Client Cold Lead' && postcode) {
    const conveyancerByPostcode = await findConveyancerByPostcode(
      tenant,
      +postcode,
    )

    if (conveyancerByPostcode) {
      return toPreferredDetails(conveyancerByPostcode)
    }
  } else if (leadType?.includes('Warm')) {
    const conveyancerByArea = await BtrConveyancerModel.findOne({
      tenant,
      area,
    })

    if (conveyancerByArea) {
      return toPreferredDetails(conveyancerByArea)
    }
  }

  const hqConveyancer = await BtrConveyancerModel.findOne({
    tenant,
    area: BTR_DEFAULT_AREA,
  })
  if (!hqConveyancer) {
    throw new Error(
      `No Default HQ conveyancer found for area ${BTR_DEFAULT_AREA}`,
    )
  }
  return toPreferredDetails(hqConveyancer)
}

export function getSdsLeadDetails(
  lead: BtrSdsClientWebhook,
): SdsFormLeadDetails {
  const hasArea = Boolean(lead.conveyancer_area)
  const hasAgentId = Boolean(lead.agent_id)

  if (hasAgentId) {
    return {
      leadSource: 'Agent Page',
      leadType: hasArea ? 'Agent Warm Lead' : 'Agent Cold Lead',
      openingBasis: 'Area Code',
    }
  }

  return {
    leadSource: hasArea ? 'Franchisee Page' : 'BTR Page',
    leadType: hasArea ? 'Client Warm Lead' : 'Client Cold Lead',
    openingBasis: hasArea ? 'Area Code' : 'Property Address Postcode',
  }
}
