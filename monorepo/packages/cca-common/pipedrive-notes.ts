import type { CcaPipedriveNotificationType } from '@dbc-tech/johnny5'
import type { AdditionalInfoTypes } from './utils/matter-name-builder'

export const systemFooter = (): string =>
  `**** <i>[Johnny5] EMC (${process.env.APP_ENV?.toUpperCase() || 'unknown'}) SYSTEM GENERATED</i> ****`

export const MessageTemplates: Partial<
  Record<CcaPipedriveNotificationType, string>
> = {
  'matter-creation-initiated': `<b>STATUS:</b> Automatic Matter Creation initiated ....<br><br>${systemFooter()}`,
  'matter-creation-completed': `<b>STATUS:</b> Automatic Matter Creation - Completed!<br><br>${systemFooter()}`,
  'matter-creation-error': `<b>STATUS:</b> Automatic Matter Creation encountered an error!<br>Please contact the IT team for support.<br><br>${systemFooter()}`,
  'sds-property-invalid': `<b>STATUS:</b> Automatic Matter Creation - Unsuccessful!<br><br>
Cannot proceed as Address Fields are not completely filled out. Deal has been moved back to “Work in Progress”.<br><br>
Kindly complete the address fields and move to “Ready for MC” once resolved.<br><br>${systemFooter()}`,
}

export const getMessageTemplate = (
  type: CcaPipedriveNotificationType,
): string | undefined => MessageTemplates[type]

export interface MatterDetails {
  matterName?: string
  clientName?: string
  matterTypeName?: string
  postCode?: string
  concierge?: string
  additionalInfo?: AdditionalInfoTypes
  assignedToName?: string
}

export const generateMatterDetailsMessage = ({
  matterName = '',
  clientName = '',
  matterTypeName = '',
  postCode = '',
  concierge = 'OPEN',
}: MatterDetails): string => `
  Matter Created with Ref: ${matterName}<br>
  Client: ${clientName}<br>
  ${matterTypeName}<br>
  Concierge: ${concierge}<br>
  Postcode: ${postCode}
  <br><br>${systemFooter()}`

export const generateMatterNameRefreshMessage = ({
  matterName = '',
  assignedToName = '',
}: MatterDetails): string => `
    Matter Created with Ref: ${matterName}<br>
    Conveyancer Assigned: ${assignedToName}<br>
    <br><br>${systemFooter()}`
