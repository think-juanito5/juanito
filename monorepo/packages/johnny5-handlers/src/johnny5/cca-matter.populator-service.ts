import { type TaskPut } from '@dbc-tech/actionstep'
import { ActionStepService } from '@dbc-tech/actionstep'
import type { PagedActionChangeStep } from '@dbc-tech/actionstep/actionstep.enhanced.schema'
import type {
  ActionChangeStepPut,
  LinkMatterDocumentPost,
} from '@dbc-tech/actionstep/actionstep.schema'
import {
  type AustralianState,
  type Intent,
  type Issues,
  J5Config,
  type MatterCreateDataCollections,
  type MatterCreateFile,
  type MatterCreateLinkToParticipant,
  type MatterCreateParticipants,
  type MatterCreateTask,
  type MatterManifestMeta,
} from '@dbc-tech/johnny5'
import { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import type { Logger } from '@dbc-tech/logger'
import { serializeError } from 'serialize-error'
import { prepareStepchangeToSds } from '../actionstep/utils/cca-matter-sds-stepchange'
import { ParticipantHelper } from '../actionstep/utils/participant-helper'
import { downloadDocumenFromAzureStorage } from '../utils/azure-utils'
import { CcaCollectionHelper } from './cca-matter.collection-service'
import { MatterTransType } from './cca/constants'
import {
  type NewParticipant,
  buildOnlineConversionData,
} from './cca/utils/online-conversion.utils'

export class CcaMatterPopulator {
  private readonly ptcpHelper: ParticipantHelper

  constructor(
    readonly j5config: Johnny5ConfigService,
    readonly actionstep: ActionStepService,
    readonly logger: Logger,
    readonly matterId: number,
  ) {
    this.ptcpHelper = new ParticipantHelper(
      this.actionstep,
      this.logger,
      j5config,
    )
  }

  async addParticipants(participants: MatterCreateParticipants): Promise<void> {
    const newParticipants: NewParticipant[] = []

    try {
      const clientPcptType = await this.j5config.get(
        J5Config.actionstep.clientTypeId,
      )
      if (!clientPcptType) {
        throw new Error('Client Participant Type not found from J5 Config!')
      }

      await this.logger.info(
        'addParticipants(*) New Participants #matterId: ',
        this.matterId,
      )

      for (const participant of participants.new ?? []) {
        const participantId =
          await this.ptcpHelper.processNewParticipant(participant)

        const param = {
          actionparticipants: {
            links: {
              action: `${this.matterId}`,
              participantType: `${participant.type_id}`,
              participant: `${participantId}`,
            },
          },
        }

        await this.ptcpHelper.linkExistingParticipant(param)

        newParticipants.push({
          type_id: participant.type_id,
          value: participantId,
        })
      }

      //as filenotes issues outside manifest
      await this.logger.info(
        `addParticipants(*) @matterId:${this.matterId} #filenote: ${JSON.stringify(this.ptcpHelper.issues || [])}`,
      )

      //existing participants
      if (!participants.existing) {
        await this.logger.warn(
          `addParticipants(-) matterId:${this.matterId} #No existing participants found!`,
        )
      }

      await this.logger.info('addParticipants(*) Existing Participants')
      for (const participant of participants.existing ?? []) {
        await this.logger.info(
          `addParticipants(*) matterId:${this.matterId} #ID: ${participant.id}, Type: ${participant.type_id}, Description: ${participant.description}`,
        )
        const param = {
          actionparticipants: {
            links: {
              action: `${this.matterId}`,
              participantType: `${participant.type_id}`,
              participant: `${participant.id}`,
            },
          },
        }
        await this.ptcpHelper.linkExistingParticipant(param)
      }

      //linking participants
      for (const linkData of participants.link_matter ?? []) {
        await this.logger.debug(
          `addParticipants(*) matterId:${this.matterId} #Linking participant data: ${JSON.stringify(linkData)}`,
        )

        if (linkData.target_type_id === +clientPcptType.value) {
          await this.addLinkToClientParticipant(newParticipants, linkData)
        } else {
          const sourceParticipantId = linkData.participant_id
            ? linkData.participant_id
            : newParticipants.find((x) => x.type_id === linkData.source_type_id)
                ?.value

          if (sourceParticipantId) {
            const param = {
              actionparticipants: {
                links: {
                  action: `${this.matterId}`,
                  participantType: `${linkData.target_type_id}`,
                  participant: `${sourceParticipantId}`,
                },
              },
            }
            await this.ptcpHelper.linkExistingParticipant(param)
          } else {
            await this.logger.warn(
              `addParticipants(-) matterId:${this.matterId} #Data Problem! Source ID not found!`,
              JSON.stringify(linkData),
            )
          }
        }
      }
    } catch (error) {
      await this.logger.error(
        `addParticipants(-) matterId:${this.matterId} #Failed to create Participant! Error: `,
        serializeError(error),
      )
    }
  }

  private async addLinkToClientParticipant(
    newParticipants: NewParticipant[],
    linkData: MatterCreateLinkToParticipant,
  ) {
    const listPcpt = newParticipants
      .filter((x) => x.type_id === linkData.source_type_id)
      .map((x) => x.value)
    for (const sourceParticipantId of listPcpt) {
      const param = {
        actionparticipants: {
          links: {
            action: `${this.matterId}`,
            participantType: `${linkData.target_type_id}`,
            participant: `${sourceParticipantId}`,
          },
        },
      }
      if (!sourceParticipantId) {
        await this.logger.warn(
          `addLinkToClientParticipant(-) matterId:${this.matterId} #Data Problem! Source ID not found!`,
          JSON.stringify(linkData),
        )
      } else {
        await this.ptcpHelper.linkExistingParticipant(param)
      }
    }
  }

  async addCollections(collections: MatterCreateDataCollections) {
    try {
      const colHelper = new CcaCollectionHelper(
        this.actionstep,
        this.logger,
        this.matterId,
      )
      await this.logger.info(
        `addCollections(+) @matterId:${this.matterId} #Creating Collections..`,
      )

      const matterCollectionIds = collections.prepare

      for (const collectionId of Object.values(matterCollectionIds)) {
        await colHelper.createDataCollectionIgnoreResponse(collectionId)
      }

      const collectionInputRecords: Record<string, string> = {}
      collections.create.map((item) => {
        collectionInputRecords[item.field_name] = item.value
      })

      const propertyTypeId = await this.j5config.get(
        J5Config.actionstep.propertyTypeId,
      )
      if (!propertyTypeId) {
        throw new Error('Property Type ID not found from J5 Config!')
      }
      const propertyParticipantId =
        await this.actionstep.getPropertyParticipantId(
          this.matterId,
          propertyTypeId.value,
        )

      if (propertyParticipantId) {
        collectionInputRecords['propertyadd'] = propertyParticipantId
        await this.logger.info(
          `addCollections(+) @matterId:${this.matterId} #Property Participant ID: ${propertyParticipantId}`,
        )
      }

      await this.logger.info(
        'addCollections(*) collectionInputRecords: ',
        collectionInputRecords,
      )

      const refCollectionRecords = await colHelper.getCollectionRecords(
        matterCollectionIds,
        collectionInputRecords,
      )

      await this.logger.info(
        'addCollections(*) refCollectionRecords: ',
        refCollectionRecords,
      )

      if (!refCollectionRecords) {
        throw new Error('Failed to get collection records!')
      }

      await colHelper.processMatterCollectionRecords(
        refCollectionRecords.data,
        collectionInputRecords,
      )
    } catch (error) {
      await this.logger.error(
        `addCollections(-) matterId:${this.matterId} #Failed to process Collections:`,
        serializeError(error),
      )
      throw new Error('Failed to process collection records!')
    }
  }

  async addFilenotes(filenotes: { note: string }[] | undefined) {
    try {
      for (const filenote of filenotes ?? []) {
        await this.logger.debug(
          `addFilenotes(+) @matterId:${this.matterId} #filenote: ${filenote.note}`,
        )
        const note = {
          filenotes: {
            text: filenote.note,
            links: {
              action: `${this.matterId}`,
            },
          },
        }

        const res = await this.actionstep.createFileNote(note)
        if (!res.filenotes.id) {
          await this.logger.error(
            `addFilenotes(-) @matterId:${this.matterId} #Failed to create Filenotes!`,
          )
          throw new Error('Failed to create Filenotes! ')
        } else {
          await this.logger.info(
            `addFilenotes(+) @matterId:${this.matterId} Created note Id: ${res.filenotes.id}`,
          )
        }
      }
    } catch (error) {
      await this.logger.error(
        'addFilenotes(-) @matterId:${this.matterId} #Failed to create Filenotes:',
        serializeError(error),
      )
    }
  }

  async addIssuesAsFilenotes(matterIssues: Issues[] | undefined) {
    try {
      if (!matterIssues || matterIssues?.length === 0) {
        await this.logger.warn(
          `addIssuesAsFilenotes(-) @matterId:${this.matterId} #No issues found!`,
        )
        return
      }

      await this.logger.debug(
        `addIssuesAsFilenotes(+) @matterId:${this.matterId} #issues: ${JSON.stringify(matterIssues)}`,
      )

      matterIssues.push({
        description: `*Filenotes are provided based on the details in the contract prior to checking if a contact card already exists in Actionstep, please make sure to verify that the details are correct.`,
      })

      const text =
        matterIssues.length === 1
          ? matterIssues[0].description
          : matterIssues
              .map((issue, index) => {
                if (index === matterIssues.length - 1) {
                  return `\n\n${issue.description}`
                }
                return `${index + 1}. ${issue.description}`
              })
              .join('\n')

      const note = {
        filenotes: {
          text,
          links: {
            action: `${this.matterId}`,
          },
        },
      }

      const res = await this.actionstep.createFileNote(note)
      await this.logger.info(
        `addIssuesAsFilenotes(+) @matterId:${this.matterId} Created note Id: ${res.filenotes.id}`,
      )
    } catch (error) {
      await this.logger.error(
        'addIssuesAsFilenotes(-) @matterId:${this.matterId} #Failed to create issues as Filenotes:',
        serializeError(error),
      )
    }
  }

  async addTasks(tasks: MatterCreateTask[] | undefined) {
    try {
      for (const task of tasks ?? []) {
        await this.logger.debug(
          `addTasks(+) @matterId:${this.matterId} #filenote: ${task.name}`,
        )

        const taskParams: Partial<TaskPut> = {
          tasks: {
            name: task.name,
            description: task.description,
            links: {
              action: `${this.matterId}`,
              assignee: `${task.assignee_id}`,
            },
          },
        }
        const res = await this.actionstep.createTask(taskParams as TaskPut)

        await this.logger.info(
          `addTasks(+) @matterId:${this.matterId} Created note Id: `,
          res.tasks.id,
        )
      }
    } catch (error) {
      await this.logger.error(
        `addTasks(+) @matterId:${this.matterId} #Failed to create Filenotes! Error:`,
        serializeError(error),
      )
    }
  }

  async addFiles(files: MatterCreateFile[] | undefined) {
    const fileUploadUrl = process.env['CCA_ACTIONSTEP_FILE_UPLOAD_URL']!

    await this.logger.info(
      `addFiles(+) #matterId: ${this.matterId} AS Uploading files...`,
    )
    try {
      for (const file of files ?? []) {
        await this.logger.info(
          `addFiles(+) @matterId:${this.matterId} #downloading... filename: ${file.filename} url: ${file.url}`,
        )

        const res = await downloadDocumenFromAzureStorage(file.url)
        if (typeof res.val === 'string' || !res.val) {
          await this.logger.error(
            `addFiles(-) @matterId:${this.matterId} #Failed to download file: ${file.url}! Error: `,
            res.val,
          )
          continue
        }
        const streamData = res.val

        await this.logger.debug(
          `addFiles(+) @matterId:${this.matterId} #uploading... filename: ${file.filename} url: ${file.url}`,
        )
        const uploadRes = await this.actionstep.uploadDocument(
          streamData,
          file.filename,
          fileUploadUrl,
        )

        if (!uploadRes || !uploadRes.files.id) {
          await this.logger.error(
            `addFiles(-) @matterId:${this.matterId} #Failed to upload file in Actionstep! Error: `,
            serializeError(uploadRes),
          )
          continue
        }

        await this.logger.info(
          `addFiles(+) @matterId:${this.matterId} #done! upload status:${uploadRes.files.status} url: ${file.url}`,
        )

        if (uploadRes.files.status === 'Uploaded') {
          const fileName = file.filename
          const actionstepFileId = uploadRes.files.id
          const xparam: LinkMatterDocumentPost = {
            actiondocuments: {
              displayName: `${fileName}`,
              file: `${actionstepFileId};${fileName}`,
              links: {
                action: `${this.matterId}`,
              },
            },
          }

          const resLink = await this.actionstep.linkDocumentToMatter(xparam)
          await this.logger.info(
            `addFiles(#) @matterId:${this.matterId} #linked document status: ${
              resLink.actiondocuments.status
            } id: ${resLink.actiondocuments.id}`,
          )
        }
      }
    } catch (error) {
      await this.logger.error(
        `addFiles(-) @matterId:${this.matterId} #Failed to upload file! Error: `,
        serializeError(error),
      )
    }
  }

  public get issues(): Issues[] {
    return this.ptcpHelper.issues
  }

  async onlineConversionProcess(
    matterId: number,
    natureProperty: string | undefined,
  ): Promise<string> {
    try {
      const res = await this.actionstep.getActionChangeStep(matterId)
      if (!res || !res.linked?.steps) {
        throw new Error(`actionchangestep: ${matterId} not found`)
      }

      const changestepAssignedId = await this.j5config.get(
        J5Config.actionstep.changestepAssignedId,
      )
      if (!changestepAssignedId) {
        throw new Error('Change Step Assigned ID not found from J5 Config!')
      }

      const changeStepParam = await buildOnlineConversionData(
        res,
        this.logger,
        {
          matterId,
          natureProperty,
          changestepAssignedId: +changestepAssignedId.value,
        },
      )
      if (!changeStepParam) {
        throw new Error('Failed to build online conversion data!')
      }

      const res2 = await this.actionstep.updateActionChangeStepNode(
        changeStepParam as ActionChangeStepPut,
      )
      const nodeId = res2.actionchangestep?.[0].id
      await this.logger.info(
        `onlineConversionProcess(+) @matterId:${matterId} #Action Change Step Node Id =>`,
        nodeId,
      )
      return nodeId
    } catch (error) {
      const errJson = serializeError(error)
      await this.logger.error(
        `onlineConversionProcess(-) @matterId:${matterId} #Error details: ${JSON.stringify(errJson, null, 2)}`,
      )
      throw new Error('Error in onlineConversionProcess')
    }
  }

  async updateMatterName(
    meta: MatterManifestMeta[] | undefined,
    testMode: string | undefined,
    isOnlineConv: boolean = false,
  ): Promise<string | undefined> {
    try {
      if (!meta) {
        throw new Error(
          `updateMatterName(-) matterId:${this.matterId} #metafest is empty!`,
        )
      }

      await this.logger.info(
        `updateMatterName(+) matterId:${this.matterId} #Meta: ${JSON.stringify(meta)}`,
      )
      const clientName = meta.find((m) => m.key === 'clientName')?.value
      if (!clientName) {
        throw new Error(`#Client name not found!`)
      }

      const intent = meta?.find((m) => m.key === 'intent')?.value as Intent
      if (!intent) {
        throw new Error(`#Intent not found!`)
      }

      const clientCode = meta?.find((m) => m.key === 'clientCode')?.value
      if (!intent) {
        throw new Error(`#clientCode not found!`)
      }

      const state = meta?.find((m) => m.key === 'state')
        ?.value as AustralianState
      if (!state) {
        throw new Error(`#State not found!`)
      }

      const practitionerId = await this.j5config.get(
        J5Config.actionstep.practitionerId,
        [state],
      )
      if (!practitionerId) {
        throw new Error(`#Practitioner Id not found in J5 config!`)
      }

      const fileOwnerId = await this.j5config.get(
        J5Config.actionstep.fileOwnerId,
      )
      if (!fileOwnerId) {
        throw new Error(`#File Owner Id not found in J5 config!`)
      }

      const assignedToTemplate = isOnlineConv
        ? J5Config.cca.actionstep.draftingId
        : J5Config.actionstep.conveyancingAdministrationId

      const matterAssignedTo = await this.j5config.get(assignedToTemplate)
      if (!matterAssignedTo) {
        throw new Error(`#CCA/Admin Id not found in J5 config!`)
      }

      const randomNo = String(Math.floor(Math.random() * 100)).padStart(2, '0')
      testMode = testMode === 'true' ? 'TEST-' : ''

      const matterName = `${testMode}${state}-${MatterTransType[intent]}-${practitionerId.value}-${fileOwnerId.value}-${clientCode}-${this.matterId}${randomNo}`
      await this.logger.info(
        `updateMatterName(+) matterId:${this.matterId} #New Matter Name: ${matterName}`,
      )

      const result = await this.actionstep.updateAction(this.matterId, {
        actions: {
          name: matterName,
          links: {
            assignedTo: matterAssignedTo.value,
          },
        },
      })

      if (!result.actions.id) {
        await this.logger.warn(
          `updateMatterName(-) matterId:${this.matterId} #Failed updating Matter name!`,
        )
        throw new Error('Failed to update Matter name!')
      }

      await this.logger.info(
        `updateMatterName(+) matterId:${this.matterId} #Matter Name Updated!`,
        { matterId: result.actions.id, matterName: result.actions.name },
      )
      return matterName
    } catch (error) {
      await this.logger.error(
        `updateMatterName(-) matterId:${this.matterId} #Failed to update Matter name! Error: `,
        serializeError(error),
      )
    }
  }

  async SdsChangeStepProcess(
    matterId: number,
    changestepAssignedId: number,
  ): Promise<string> {
    await this.logger.info(
      `SdsChangeStepProcess(+) @matterId:${matterId} #Processing Change Step...`,
    )
    try {
      const res = (await this.actionstep.getActionChangeStep(matterId)) as
        | PagedActionChangeStep
        | undefined
      if (!res || !res.linked?.steps) {
        throw new Error(`actionchangestep: ${matterId} not found`)
      }

      const changeStepParam = await prepareStepchangeToSds(
        res,
        this.logger,
        matterId,
        changestepAssignedId,
      )
      if (!changeStepParam) {
        throw new Error('Failed to prepare SDS StepChange param data!')
      }

      const res2 = await this.actionstep.updateActionChangeStepNode(
        changeStepParam as ActionChangeStepPut,
      )
      const nodeId = res2.actionchangestep?.[0].id
      await this.logger.info(
        `SdsChangeStepProcess(+) @matterId:${matterId} #Action Change Step Node Id =>`,
        nodeId,
      )
      return nodeId
    } catch (error) {
      const errJson = serializeError(error)
      await this.logger.error(
        `ChangeStepProcess(-) @matterId:${matterId} #Error details: `,
        errJson,
      )
      throw new Error('Error in ChangeStepProcess')
    }
  }
}
