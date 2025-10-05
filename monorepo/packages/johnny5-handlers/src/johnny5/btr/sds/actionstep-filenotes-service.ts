import type { ActionStepService } from '@dbc-tech/actionstep'
import { type DbJob, JobModel } from '@dbc-tech/johnny5-mongodb'
import type { Logger } from '@dbc-tech/logger'
import type { HydratedDocument } from 'mongoose'

import {
  type BtrSdsClientWebhook,
  type PropertyAddress,
  btrSdsClientWebhookSchema,
  getString,
  getValue,
  propertyAddressSchema,
} from '@dbc-tech/johnny5'
import type {
  FileNotesMatterCreationDetails,
  FileNotesReferences,
  SdsFormLeadDetails,
  SdsPreferredLeadDetails,
} from '../types/sds-filenotes-details'
import { getPreferredLeadDetails, getSdsLeadDetails } from '../utils/leads-util'
import { ActionstepFileNotesBuilder } from './actionstep-filenotes-builder'

export class ActionstepFileNoteService {
  private readonly webhook: BtrSdsClientWebhook
  private readonly matterCreationDetails: FileNotesMatterCreationDetails
  private readonly references: FileNotesReferences
  private readonly validatedAddress?: PropertyAddress
  private formLeadDetails?: SdsFormLeadDetails

  constructor(
    private readonly matterId: number,
    private readonly job: HydratedDocument<DbJob>,
    private readonly actionstep: ActionStepService,
    private readonly logger: Logger,
  ) {
    this.webhook = this.validateWebhookPayload()
    this.validatedAddress = this.getValidatedAddress()
    this.references = this.createReferences()
    this.matterCreationDetails = this.determineMatterCreationDetails()
  }

  private validateWebhookPayload(): BtrSdsClientWebhook {
    const webhook = getValue(
      this.job.meta,
      'webhookPayload',
      btrSdsClientWebhookSchema,
      false,
    )
    if (!webhook) {
      this.logger.error(
        `Job Id:${this.job.id} Webhook data not found in job meta`,
      )
      throw new Error('Webhook data not found in job meta')
    }
    this.logger.debug(
      `Webhook data found in job meta for Job Id:${this.job.id}`,
    )
    return webhook
  }

  private getValidatedAddress(): PropertyAddress | undefined {
    return getValue(
      this.job.meta,
      'validatedAddress',
      propertyAddressSchema,
      false,
    )
  }

  public async saveFilenotesToMeta(fn: string): Promise<void> {
    const key = 'sdsFilenotes'
    await JobModel.updateOne({ _id: this.job.id }, { $pull: { meta: { key } } })
    await JobModel.updateOne(
      { _id: this.job.id },
      { $push: { meta: { key, value: fn } } },
    )
  }

  private createReferences(): FileNotesReferences {
    return {
      matter: `${this.matterId}`,
      job: this.job.id.toString(),
      file: this.job.fileId.toString(),
      webhook: this.webhook.webhook_id,
      created: new Date().toISOString(),
      environment: process.env.APP_ENV || 'dev',
    }
  }

  private determineMatterCreationDetails(): FileNotesMatterCreationDetails {
    if (
      !this.formLeadDetails ||
      Object.keys(this.formLeadDetails).length === 0
    ) {
      this.formLeadDetails = getSdsLeadDetails(this.webhook)
    }
    const { leadSource, leadType, openingBasis: basis } = this.formLeadDetails

    const isWarm = leadType.includes('Warm')
    const templateId = this.job.meta
      ? getString(this.job.meta, 'templateMatterId', false)
      : undefined

    return {
      leadSource,
      leadType: isWarm ? 'Warm Lead' : 'Cold Lead',
      basis,
      templateId: templateId ?? '',
      postcode: this.validatedAddress?.postcode ?? '',
    }
  }

  public getPreferredHQDetails = async (): Promise<SdsPreferredLeadDetails> => {
    const { leadType } = this.formLeadDetails || {}
    return await getPreferredLeadDetails(
      this.job.tenant,
      leadType,
      this.validatedAddress?.postcode,
      this.webhook.conveyancer_area,
    )
  }

  public buildFileNotes(
    preferredDetails?: SdsPreferredLeadDetails,
    contactMatch?: string,
  ): string {
    const formatter = new ActionstepFileNotesBuilder(
      this.webhook,
      this.matterCreationDetails,
      this.references,
      preferredDetails,
      contactMatch,
    )
    return formatter.format()
  }

  public async createSubmissionDetailsWithError(
    errMessage: string,
  ): Promise<void> {
    const preferredDetails = await this.getPreferredHQDetails()
    const submissionDetails = this.buildFileNotes(preferredDetails)
    const note = {
      filenotes: {
        text: submissionDetails.concat(errMessage ? `\n\n\n${errMessage}` : ''),
        links: {
          action: `${this.matterId}`,
        },
      },
    }
    await this.saveFilenotesToMeta(submissionDetails)
    await this.actionstep.createFileNote(note)
  }

  public async logFileNotes(errMessage: string): Promise<void> {
    const note = {
      filenotes: {
        text: errMessage,
        links: {
          action: `${this.matterId}`,
        },
      },
    }
    await this.actionstep.createFileNote(note)
  }
}
