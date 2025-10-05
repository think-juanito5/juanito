import type { CcaPipedriveNotificationType } from '@dbc-tech/johnny5'
import type { Logger } from '@dbc-tech/logger'
import {
  PipedriveV1Service,
  customFields,
  pipedriveDealStatus,
  pipedriveStage,
} from '@dbc-tech/pipedrive'
import { serializeError } from 'serialize-error'
import type { MatterDetails } from '../pipedrive-notes'
import {
  generateMatterDetailsMessage,
  generateMatterNameRefreshMessage,
  getMessageTemplate,
} from '../pipedrive-notes'

export class FilenotePipedriveService {
  private dealId?: number
  private matterDetails?: MatterDetails

  private notificationTypes: CcaPipedriveNotificationType[] = []
  private shouldHandleCompleted = false
  private shouldHandleErrorProperty = false

  constructor(
    private pipedrive: PipedriveV1Service,
    private logger: Logger,
  ) {}

  deal(dealId: number): this {
    this.dealId = dealId
    return this
  }

  details(details: MatterDetails): this {
    if (!this.dealId) throw new Error('dealId is not set.')
    this.matterDetails = details
    return this
  }

  notify(...types: CcaPipedriveNotificationType[]): this {
    this.notificationTypes.push(...types)
    return this
  }

  handleCompleted(): this {
    this.shouldHandleCompleted = true
    return this
  }

  handleErrorProperty(): this {
    this.shouldHandleErrorProperty = true
    return this
  }

  async exec(): Promise<this> {
    if (!this.dealId) throw new Error('dealId is not set.')

    if (this.notificationTypes.length > 0) {
      for (const type of this.notificationTypes) {
        try {
          await this.logger.info(
            `Notifying Pipedrive for dealId ${this.dealId}`,
            { type },
          )

          const message = this.getMessage(
            type,
            ['matter-name-refreshed', 'matter-created-details'].includes(type)
              ? this.matterDetails
              : undefined,
          )
          if (message) {
            await this.pipedrive.createPipedriveNote(this.dealId, message)
          }
        } catch (error) {
          await this.logger.error(
            `Failed to notify Pipedrive for dealId ${this.dealId}`,
            { type, error: serializeError(error) },
          )
        }
      }
    }

    if (this.shouldHandleCompleted) {
      await this.execHandleCompleted()
    }

    if (this.shouldHandleErrorProperty) {
      await this.execHandleErrorProperty()
    }
    this.notificationTypes = []
    return this
  }

  private getMessage(
    type: CcaPipedriveNotificationType,
    details?: MatterDetails,
  ): string | undefined {
    switch (type) {
      case 'matter-name-refreshed':
        return details ? generateMatterNameRefreshMessage(details) : undefined

      case 'matter-created-details':
        return details ? generateMatterDetailsMessage(details) : undefined

      default:
        return getMessageTemplate(type) ?? undefined
    }
  }

  private async execHandleCompleted() {
    if (!this.matterDetails) throw new Error('Matter details are not set.')

    const update: Record<string, number | string | undefined> = {
      stage_id: pipedriveStage.matterCreated,
      status: pipedriveDealStatus.won,
    }

    if (
      this.matterDetails.matterName &&
      !this.matterDetails.matterName.includes('pending')
    ) {
      update[customFields.matterName] = this.matterDetails.matterName
    }

    if (this.matterDetails.additionalInfo === 'Conveyance') {
      update[customFields.reviewFee] = '0'
    }
    await this.pipedrive.updateDeal(this.dealId!, update)
  }

  private async execHandleErrorProperty() {
    await this.pipedrive.updateDeal(this.dealId!, {
      stage_id: pipedriveStage.workInProgress,
      status: pipedriveDealStatus.open,
    })
  }
}
