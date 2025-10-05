import type {
  BtrSdsClientWebhook,
  BtrSdsPerson,
} from '@dbc-tech/johnny5/typebox'
import type {
  FileNotesMatterCreationDetails,
  FileNotesReferences,
  SdsPreferredLeadDetails,
} from '../types/sds-filenotes-details'

export class ActionstepFileNotesBuilder {
  constructor(
    private readonly webhookData: BtrSdsClientWebhook,
    private readonly matterDetails: FileNotesMatterCreationDetails,
    private readonly refs: FileNotesReferences,
    private readonly preferredDetails?: SdsPreferredLeadDetails,
    private readonly contactMatch?: string,
  ) {}

  #formatSeller(seller: BtrSdsPerson, index: number): string {
    return `
Seller ${index} Details
Seller Full Name (including middle name/s): ${seller.full_name}
Seller Number: ${seller.phone}
Seller Email Address: ${seller.email}`
  }

  #formatSellers(): string {
    return this.webhookData.sellers
      .slice(0, 3)
      .map((seller, i) => this.#formatSeller(seller, i + 1))
      .join('\n')
  }

  #formatContactMatching(): string {
    if (!this.contactMatch) return ''
    return `Contact card matching

${this.contactMatch}`
  }

  public format(): string {
    const sellersSection = this.#formatSellers()
    const contactSection = this.#formatContactMatching()
    const fixUrl = (url: string) =>
      url.replace(/lc=([^&]+)/, (_, p1) => `lc=${encodeURIComponent(p1)}`)

    return `Website submission update:

Submission details

Property Address being sold: ${this.webhookData.property_address}
${sellersSection}

Agency Business/Office Name: ${this.webhookData.agency_name}
Agent Name: ${this.webhookData.agent.full_name}
Agent Number: ${this.webhookData.agent.phone}
Agent Email Address: ${this.webhookData.agent.email}
---
Matter creation decision

Referral page: ${fixUrl(this.webhookData.referral_url)}
Lead source: ${this.matterDetails.leadSource}
Lead type: ${this.matterDetails.leadType}
Matter opening basis: ${this.matterDetails.basis}
Conveyancer: ${this.preferredDetails?.email || ''}
Area Code: ${this.preferredDetails?.areaCode || this.webhookData.conveyancer_area || ''}
Matter Template ID: ${this.preferredDetails?.templateId || this.matterDetails.templateId || ''}
Property Address Postcode: ${this.matterDetails.postcode}
---
${contactSection}
---
Refs

Matter: ${this.refs.matter}
File: ${this.refs.file}
Job: ${this.refs.job}
Webhook: ${this.refs.webhook}
Created: ${this.refs.created}
Environment: ${this.refs.environment}`
  }
}
