import type { ActionStepService } from '@dbc-tech/actionstep'
import type { Issues } from '@dbc-tech/johnny5'
import {
  FileModel,
  JobModel,
  type ManifestMeta,
} from '@dbc-tech/johnny5-mongodb'
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
import type { Logger } from '@dbc-tech/logger'
import { PipedriveV1Service, PipedriveV2Service } from '@dbc-tech/pipedrive'
import type { ManifestBuilder } from '../manifest-builder'
import { ManifestFormatter } from './manifest-formatter'
export class CcaManifestBuilder implements ManifestBuilder {
  private issues: Issues[] = []
  constructor(
    readonly actionstep: ActionStepService,
    readonly pipedriveV1: PipedriveV1Service,
    readonly pipedriveV2: PipedriveV2Service,
    readonly logger: Logger,
    readonly correlationId?: string,
  ) {}

  async build(jobId: string): Promise<MatterManifest> {
    const job = await JobModel.findById(jobId)
    if (!job) throw new Error(`Job Id:${jobId} not found`)

    const file = await FileModel.findById(job.fileId)
    if (!file) throw new Error(`File Id:${job.fileId} not found`)
    const dealId = file.pipedriveDealId!

    const formatter = new ManifestFormatter(
      job,
      dealId,
      this.pipedriveV1,
      this.pipedriveV2,
      this.actionstep,
      this.logger,
    )

    const manifest: MatterManifest = {
      participants: await this.participants(formatter),
      data_collections: await this.dataCollections(formatter),
      filenotes: await this.filenotes(formatter),
      tasks: await this.tasks(formatter),
      files: await this.files(formatter),
      steps: await this.steps(formatter),
      meta: await this.manifestMeta(formatter),
    }
    this.issues = formatter.issues
    return manifest
  }

  async participants(
    formatter: ManifestFormatter,
  ): Promise<MatterCreateParticipants> {
    const existingParticipants =
      await formatter.existingParticipantsFromContract()

    const newParticipants: MatterCreateNewParticipant[] = []

    const buyerOrseller = await formatter.buyer_seller_participant()
    await this.logger.debug('buyerOrseller', buyerOrseller)

    if (buyerOrseller) newParticipants.push(buyerOrseller)

    const property_address = await formatter.property_participant()
    await this.logger.debug('property_address', property_address)
    if (property_address) newParticipants.push(property_address)

    const linkParticipants =
      await formatter.create_link_participants(newParticipants)

    await this.logger.debug('linkParticipants', linkParticipants)

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

  async manifestMeta(formatter: ManifestFormatter): Promise<ManifestMeta[]> {
    return formatter.manifestMeta()
  }

  readonly getIssues = (): Issues[] => {
    return this.issues
  }
}
