import type { ActionStepService } from '@dbc-tech/actionstep'
import { JobModel } from '@dbc-tech/johnny5-mongodb'
import type {
  MatterCreateDataCollections,
  MatterCreateFile,
  MatterCreateFileNote,
  MatterCreateNewParticipant,
  MatterCreateParticipants,
  MatterCreateStep,
  MatterCreateTask,
  MatterManifest,
} from '@dbc-tech/johnny5/typebox'
import type { Issues } from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import { type ManifestBuilder } from '../manifest-builder'
import { ManifestFormatter } from './manifest-formatter'
export class BtrManifestBuilder implements ManifestBuilder {
  private issues: Issues[] = []
  constructor(
    readonly actionstep: ActionStepService,
    readonly logger: Logger,
    readonly correlationId?: string,
  ) {}

  async build(jobId: string): Promise<MatterManifest> {
    const job = await JobModel.findById(jobId)
    if (!job) throw new Error(`Job Id:${jobId} not found`)

    const formatter = new ManifestFormatter(job, this.actionstep, this.logger)

    const manifest: MatterManifest = {
      participants: await this.participants(formatter),
      data_collections: await this.dataCollections(formatter),
      filenotes: await this.filenotes(formatter),
      tasks: await this.tasks(formatter),
      files: await this.files(formatter),
      steps: await this.steps(formatter),
    }

    this.issues = formatter.issues
    return manifest
  }

  readonly getIssues = (): Issues[] => {
    return this.issues
  }

  async participants(
    formatter: ManifestFormatter,
  ): Promise<MatterCreateParticipants> {
    const existingParticipants =
      await formatter.existingParticipantsFromContract()

    const newParticipants: MatterCreateNewParticipant[] = []

    const buyer1 = await formatter.buyer1_participant()
    if (buyer1) newParticipants.push(buyer1)

    const buyer2 = await formatter.buyer2_participant()
    if (buyer2) newParticipants.push(buyer2)

    const seller1 = await formatter.seller1_participant()
    if (seller1) newParticipants.push(seller1)

    const seller2 = await formatter.seller2_participant()
    if (seller2) newParticipants.push(seller2)

    const othersideSolicitor = await formatter.otherside_solicitor_participant()
    if (othersideSolicitor) newParticipants.push(othersideSolicitor)

    const othersideSolicitorContact =
      await formatter.otherside_solicitor_primary_contact_participant()
    if (othersideSolicitorContact)
      newParticipants.push(othersideSolicitorContact)

    const propertyAddress = await formatter.property_address_participant()
    if (propertyAddress) newParticipants.push(propertyAddress)

    const sellerAgent = await formatter.seller_agent_participant()
    if (sellerAgent) newParticipants.push(sellerAgent)

    const buyerAgent = await formatter.buyer_agent_participant()
    if (buyerAgent) newParticipants.push(buyerAgent)

    const depositHolder = await formatter.deposit_holder_participant()
    if (depositHolder) newParticipants.push(depositHolder)

    const linkParticipants =
      await formatter.create_link_participants(newParticipants)

    return {
      existing: existingParticipants,
      new: newParticipants,
      link_matter: linkParticipants,
    }
  }

  async dataCollections(
    formatter: ManifestFormatter,
  ): Promise<MatterCreateDataCollections> {
    return {
      prepare: await formatter.prepare_collections(),
      create: await formatter.create_collections(),
    }
  }

  async filenotes(
    formatter: ManifestFormatter,
  ): Promise<MatterCreateFileNote[]> {
    return formatter.filenotes()
  }

  async tasks(formatter: ManifestFormatter): Promise<MatterCreateTask[]> {
    return formatter.tasks()
  }

  async files(formatter: ManifestFormatter): Promise<MatterCreateFile[]> {
    return formatter.files()
  }

  async steps(formatter: ManifestFormatter): Promise<MatterCreateStep> {
    return formatter.steps()
  }
}
