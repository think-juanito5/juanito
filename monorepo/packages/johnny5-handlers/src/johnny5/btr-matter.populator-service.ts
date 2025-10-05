import { type TaskPut } from '@dbc-tech/actionstep'
import { ActionStepService } from '@dbc-tech/actionstep'
import type {
  ActionChangeStepPut,
  LinkMatterDocumentPost,
  SingleActionDocumentFolder,
} from '@dbc-tech/actionstep'
import {
  type Issues,
  J5Config,
  type MatterCreateDataCollections,
  type MatterCreateFile,
  type MatterCreateLinkToParticipant,
  type MatterCreateParticipants,
  type MatterCreateTask,
  capitalise,
} from '@dbc-tech/johnny5'
import {
  ActionFolder,
  identityTypes,
  participantTypes,
} from '@dbc-tech/johnny5-btr'
import { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'
import type { Logger } from '@dbc-tech/logger'
import { serializeError } from 'serialize-error'
import { prepareStepchangeToSds } from '../actionstep/utils/btr-matter-sds-stepchange'
import { ParticipantHelper } from '../actionstep/utils/participant-helper'
import { downloadDocumenFromAzureStorage } from '../utils/azure-utils'
import { BtrCollectionHelper } from './btr-matter.collection-service'

type NewParticipant = {
  type_id: number
  value: number
}

type MatterParticipantType = {
  id: number
  type_id: number
  participantCount: number
}
export class BtrMatterPopulator {
  private readonly ptcpHelper: ParticipantHelper
  private agentParticipantId: number | undefined

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

  async addParticipants(participants: MatterCreateParticipants) {
    const newParticipants: NewParticipant[] = []
    const matterParticipants: MatterParticipantType[] = []

    try {
      await this.logger.info(
        `addParticipants(*) New Participants #matterId: ${this.matterId}`,
      )

      const actionParticipantsResult =
        await this.actionstep.getActionParticipants({
          filter: `action = ${this.matterId}`,
          include: 'action',
        })
      if (
        !actionParticipantsResult ||
        !actionParticipantsResult.linked?.actions
      ) {
        const errMsg = `Error encountered in Matter: ${this.matterId}, participants does not exist in AS!`
        await this.logger.error(errMsg)
        throw new Error(errMsg)
      }

      const mParticipants: MatterParticipantType[] =
        actionParticipantsResult.actionparticipants.map((p) => {
          return {
            id: +p.links.participant,
            type_id: +p.links.participantType,
            participantCount: p.participantNumber,
          }
        })

      matterParticipants.push(...mParticipants)

      await this.logger.debug(
        `addParticipants(*) @matterId:${this.matterId} #Existing Participants: ${JSON.stringify(
          matterParticipants,
        )}`,
      )

      const buyerTypeId = await this.j5config.get(
        J5Config.actionstep.buyerTypeId,
      )
      if (!buyerTypeId) {
        throw new Error('Buyer Type Id not found in Johnny5 Config')
      }

      const sellerTypeId = await this.j5config.get(
        J5Config.actionstep.sellerTypeId,
      )
      if (!sellerTypeId) {
        throw new Error('Seller Type Id not found in Johnny5 Config')
      }

      const agentOfficeTypeId = await this.j5config.get(
        J5Config.actionstep.sellerAgentOfficeTypeId,
      )
      if (!agentOfficeTypeId) {
        throw new Error('Agent Office Type Id not found in Johnny5 Config')
      }

      for (const participant of participants.new ?? []) {
        const existingParticipant = matterParticipants.find(
          (p) => p.type_id === participant.type_id,
        )
        const pCount = existingParticipant?.participantCount || 0

        await this.logger.info(
          `addParticipants(*) #matterActivityLogged  @matterId:${this.matterId} #type:${participant.type_id}  cnt: ${pCount} existingParticipant: ${JSON.stringify(
            existingParticipant,
          )}`,
        )
        if (existingParticipant) {
          const isBuyerOrSeller = [
            +buyerTypeId.value,
            +sellerTypeId.value,
          ].includes(participant.type_id)

          const isSecondBuyerOrSeller =
            (participant.description &&
              ['buyer_2', 'seller_2'].includes(participant.description)) ||
            false

          if (pCount === 1 && isBuyerOrSeller && isSecondBuyerOrSeller) {
            await this.logger.info(
              `addParticipants(*) #matterActivityLogged  @matterId:${this.matterId} #type:${participant.type_id} @${participant.description} #Processing participant creation albeit exist - pcount: ${pCount}`,
              { isBuyerOrSeller, isSecondBuyerOrSeller },
            )
          } else {
            await this.logger.warn(
              `addParticipants(-) matterId:${this.matterId} #Participant already exists with type: ${participant.type_id} and description: ${participant.description}, skipping creation!`,
              { isBuyerOrSeller, isSecondBuyerOrSeller },
            )
            continue
          }
        }

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

        //if participant is a property, force to property participant
        if (participant.type_id === participantTypes.propertyAddress) {
          await this.ptcpHelper.forceToPropertyParticipant(
            {
              participantdefaulttypes: {
                links: {
                  participant: `${participantId}`,
                  participantType: `${identityTypes.property}`,
                },
              },
            },
            `${identityTypes.company}`,
          )
        }

        newParticipants.push({
          type_id: participant.type_id,
          value: participantId,
        })

        if (
          participant.type_id === +agentOfficeTypeId.value // agent office type id
        ) {
          this.agentParticipantId = participantId
          await this.logger.info(
            `addParticipants(*) @matterId:${this.matterId} #Agent Participant Id: ${this.agentParticipantId}`,
          )
        }
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

      const councilTypeId = await this.j5config.get(
        J5Config.actionstep.councilTypeId,
      )
      if (!councilTypeId) {
        throw new Error('Council Type Id not found in Johnny5 Config')
      }
      const waterAuthTypeId = await this.j5config.get(
        J5Config.actionstep.waterAuthTypeId,
      )
      if (!waterAuthTypeId) {
        throw new Error('Water Authority Type Id not found in Johnny5 Config')
      }
      for (const participant of participants.existing ?? []) {
        if (
          participant.type_id === +councilTypeId.value ||
          participant.type_id === +waterAuthTypeId.value
        ) {
          await this.logger.debug(
            `addParticipants(*) matterId:${this.matterId} #Linking Process for council-water-auth for participant: ${participant.id} of type: ${participant.type_id}`,
          )

          const existingParticipant = matterParticipants.find(
            (p) => p.type_id === participant.type_id,
          )
          if (existingParticipant) {
            if (existingParticipant.id === participant.id) {
              await this.logger.debug(
                `addParticipants(*) matterId:${this.matterId} #Skipping council-water-auth link process:, no change needed for participant: ${participant.id} of type: ${participant.type_id}`,
              )
            } else {
              await this.logger.warn(
                `addParticipants(-) matterId:${this.matterId} @council-water-auth link process #Participant already exists with different ID! Skipping: ${participant.id} of type: ${participant.type_id}`,
              )
              const pcpt = await this.actionstep.getParticipant(participant.id)
              const pcptName = pcpt.participants.displayName

              this.ptcpHelper.addMatterNotes({
                description: `The contract indicated the ${capitalise(participant.description)} was "${pcptName}". Please check and update if required.`,
                meta: [
                  `name: ${participant.description}`,
                  `value: ${pcptName}`,
                  `type: ${participant.type_id}`,
                ],
              })
            }
            continue
          }
        }

        await this.logger.info(
          `addParticipants.existing(*) matterId:${this.matterId} #ID: ${participant.id}, Type: ${participant.type_id},  Description: ${participant.description}`,
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
      const otherSidePcptType = await this.j5config.get(
        J5Config.actionstep.othersideTypeId,
      )
      const clientPcptType = await this.j5config.get(
        J5Config.actionstep.clientTypeId,
      )
      if (!clientPcptType || !otherSidePcptType) {
        await this.logger.warn(
          `addParticipants(-) matterId:${this.matterId} #${clientPcptType} & ${otherSidePcptType} Participant Type not found from J5 Config!`,
        )
      } else {
        for (const linkData of participants.link_matter ?? []) {
          await this.logger.debug(
            `addParticipants(*) matterId:${this.matterId} #Linking participant data: ${JSON.stringify(linkData)}`,
          )

          if (linkData.target_type_id === +clientPcptType.value) {
            await this.addLinkToClientParticipant(newParticipants, linkData)
          } else if (linkData.target_type_id === +otherSidePcptType.value) {
            await this.addLinkToClientParticipant(newParticipants, linkData)
          } else {
            const sourceParticipantId = linkData.participant_id
              ? linkData.participant_id
              : newParticipants.find(
                  (x) => x.type_id === linkData.source_type_id,
                )?.value

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
      const colHelper = new BtrCollectionHelper(
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
        await this.logger.info(
          `addFilenotes(+) @matterId:${this.matterId} Created note Id: ${res.filenotes.id}`,
        )
      }
    } catch (error) {
      await this.logger.error(
        'addFilenotes(-) @matterId:${this.matterId} #Failed to create Filenotes:',
        serializeError(error),
      )
      throw new Error('Failed to create Filenotes! ')
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

      const sdsTag =
        matterIssues.length > 0
          ? matterIssues[0].description.includes('Website submission')
          : false
      if (!sdsTag) {
        matterIssues.push({
          description: `*Filenotes are provided based on the details in the contract prior to checking if a contact card already exists in Actionstep, please make sure to verify that the details are correct.`,
        })
      }

      const text =
        matterIssues.length === 1
          ? matterIssues[0].description
          : matterIssues
              .map((issue, index) => {
                if (index === matterIssues.length - 1) {
                  return `\n\n${issue.description}`
                }
                return sdsTag
                  ? `${issue.description}`
                  : `${index + 1}. ${issue.description}`
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
      throw new Error('Failed to create issues as Filenotes! ')
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
    const fileUploadUrl = process.env['BTR_ACTIONSTEP_FILE_UPLOAD_URL']!

    await this.logger.info(
      `addFiles(+) #matterId: ${this.matterId} AS Uploading files...`,
    )
    try {
      for (const file of files ?? []) {
        await this.logger.info(
          `addFiles(+) @matterId:${this.matterId} #downloading... filename: ${file.filename} url: ${file.url}`,
        )

        const res = await downloadDocumenFromAzureStorage(file.url)
        if (typeof res.val === 'string') {
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

          const res = await this.actionstep.getActionFolder({
            name: ActionFolder.CorrespondenceDocumentsIn,
            action: `${this.matterId}`,
          })

          const dirFetched = (res as SingleActionDocumentFolder).actionfolders
          const contractFolderId = dirFetched ? dirFetched.id : undefined
          if (contractFolderId) {
            xparam.actiondocuments.links.folder = `${contractFolderId}`
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

  async SdsChangeStepProcess(matterId: number, changestepAssignedId: number) {
    await this.logger.info(
      `SdsChangeStepProcess(+) @matterId:${matterId} #Processing Change Step...`,
    )
    try {
      const res = await this.actionstep.getActionChangeStep(matterId)
      if (!res || !res.linked?.steps) {
        throw new Error(`actionchangestep: ${matterId} not found`)
      }

      const changeStepParam = await prepareStepchangeToSds(
        res,
        this.logger,
        matterId,
        changestepAssignedId,
        this.j5config,
      )
      if (!changeStepParam) {
        throw new Error('Failed to prepare SDS StepChange param data!')
      }

      const res2 = await this.actionstep.updateActionChangeStepNode(
        changeStepParam as ActionChangeStepPut,
      )
      await this.logger.info(
        `SdsChangeStepProcess(-) @matterId:${matterId} #Change Step Process completed! ChangeStep Node Id:`,
        res2.actionchangestep?.[0].id,
      )
    } catch (error) {
      const errJson = serializeError(error)
      await this.logger.error(
        `SdsChangeStepProcess(-) @matterId:${matterId} #Error details: `,
        errJson,
      )
      throw new Error(errJson.message)
    }
  }
  public get btrAgentParticipantId(): number | undefined {
    return this.agentParticipantId
  }
}
