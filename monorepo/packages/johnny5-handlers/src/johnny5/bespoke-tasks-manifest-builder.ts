import type {
  Action,
  ActionFolderLink,
  ActionParticipant,
  ActionStepService,
  DataCollectionRecordValue,
  DataCollectionRecordValuePutPostInner,
  Participant,
  ParticipantType,
  Task,
} from '@dbc-tech/actionstep'
import {
  type BespokeTasksFormattedInner,
  DataverseService,
} from '@dbc-tech/dataverse'
import { dateOffsetter } from '@dbc-tech/johnny5'
import { FileModel, JobModel } from '@dbc-tech/johnny5-mongodb'
import type {
  BespokeTasksDataFields,
  BespokeTasksEmail,
  BespokeTasksFiles,
  BespokeTasksManifest,
  CompleteTask,
  CreateTask,
  DatafieldCreate,
  MatterCreateFileNote,
  Tenant,
} from '@dbc-tech/johnny5/typebox'
import type { Issues } from '@dbc-tech/johnny5/typebox'
import type { Logger } from '@dbc-tech/logger'
import {
  type FormResponse,
  type FormResponseReshaped,
  reshapeFormResponse,
} from '@dbc-tech/typeform'

const escalationTriggers = [
  {
    form: 'opf600rB',
    question: 'ABguWwS53BcW',
    questionResponse: '::any::',
    answer: 'ABguWwS53BcW',
    email: true,
    task: true,
  }, // Q8 8 CCA
  {
    form: 'opf600rB',
    question: 'NgApOaiL64kK',
    questionResponse: 'Yes',
    answer: 'kFY2bDr9lPYm',
    email: true,
    task: true,
  }, // Q20 22
  {
    form: 'opf600rB',
    question: 'eaDA9Lm2E656',
    questionResponse: 'Yes',
    answer: 'Q90fA31N6N2e',
    email: true,
    task: true,
  }, // Q24 26
  {
    form: 'opf600rB',
    question: 'rjg9I8C32gLz',
    questionResponse: 'Yes',
    answer: 'vsOzCEWfvWCd',
    email: true,
    task: false,
  }, // Q28 30
  {
    form: 'opf600rB',
    question: 'scI8d2oIPVB0',
    questionResponse: 'Yes',
    answer: 'WrZVIbQe7zmi',
    email: true,
    task: true,
  }, // Q32 34 CCA
  {
    form: 'vPlAwdSg',
    question: 'zwe7zVibL4kk',
    questionResponse: '::any::',
    answer: 'zwe7zVibL4kk',
    email: true,
    task: true,
  }, // Q8 8 FCL
  {
    form: 'vPlAwdSg',
    question: '6DQxH93S8RE7',
    questionResponse: 'Yes',
    answer: '3kXRisOaQxdn',
    email: true,
    task: true,
  }, // Q20 22
  {
    form: 'vPlAwdSg',
    question: 'C1SuU8ZeGgK8',
    questionResponse: 'Yes',
    answer: 'nBWmrRHpYazW',
    email: true,
    task: true,
  }, // Q24 26
  {
    form: 'vPlAwdSg',
    question: 'SiDEqonrnM0Q',
    questionResponse: 'Yes',
    answer: 'irEVWp9n05Z1',
    email: true,
    task: false,
  }, // Q28 30
  {
    form: 'vPlAwdSg',
    question: '9c0AT1yJ59cI',
    questionResponse: 'Yes',
    answer: 'VIXmzNdYLKq9',
    email: true,
    task: true,
  }, // Q32 34 FCL
  {
    form: 'KcteLiXm',
    question: 'yFMnCleBKIES',
    questionResponse: '::any::',
    answer: 'yFMnCleBKIES',
    email: true,
    task: true,
  }, // Q8 8 BTR
  {
    form: 'KcteLiXm',
    question: '5GOyFDbEmR2n',
    questionResponse: 'Yes',
    answer: 'euXJ8mcfr2MX',
    email: true,
    task: true,
  }, // Q20 22
  {
    form: 'KcteLiXm',
    question: 'KewnmnkTvA1h',
    questionResponse: 'Yes',
    answer: 'Fq15hxdqQHLi',
    email: true,
    task: true,
  }, // Q24 26
  {
    form: 'KcteLiXm',
    question: 'FFaeNxfxSIFK',
    questionResponse: 'Yes',
    answer: 'DCnhAf6ZcRIc',
    email: true,
    task: false,
  }, // Q28 30
  {
    form: 'KcteLiXm',
    question: 'adaQQzZLKvuO',
    questionResponse: 'Yes',
    answer: 'WjqqHwIXeV7O',
    email: true,
    task: true,
  }, // Q32 34 BTR
]

export class BespokeTasksManifestBuilder {
  private issues: Issues[] = []
  private dataCollectionRecordValues: DataCollectionRecordValue[] = []
  private action: Partial<Action> = {}
  private actionfolders: ActionFolderLink[] = []
  private actionparticipants: ActionParticipant[] = []
  private participantTypes: ParticipantType[] = []
  private participants: Participant[] = []
  private tasks: Task[] = []
  private config: BespokeTasksFormattedInner = []
  private answers: FormResponseReshaped = {}
  private emails: BespokeTasksEmail[] = []
  constructor(
    readonly jobId: string,
    readonly formResponse: FormResponse,
    readonly actionstep: ActionStepService,
    readonly dataverse: DataverseService,
    readonly logger: Logger,
    readonly correlationId?: string,
  ) {}

  async build(): Promise<BespokeTasksManifest> {
    const job = await JobModel.findById(this.jobId)
    if (!job) throw new Error(`Job Id:${this.jobId} not found`)
    if (!job.meta || !job.meta) {
      throw new Error(`Job Id:${this.jobId} does not have meta data`)
    }
    const file = await FileModel.findById(job.fileId)
    if (!file) throw new Error(`File Id:${job.fileId} not found`)
    const action_id = file.actionStepMatterId
    if (!action_id) {
      throw new Error(
        `File Id:${file._id} does not have an ActionStep Matter Id`,
      )
    }

    if (
      !this.formResponse.form_id ||
      !this.formResponse.definition ||
      !this.formResponse.definition.fields ||
      !this.formResponse.answers
    ) {
      throw new Error(
        `Job Id:${job._id} does not have a form response in additionalInfo`,
      )
    }
    await this.logger.debug(
      `hidden fields in form response: ${JSON.stringify(this.formResponse.hidden)}`,
    )
    this.answers = await reshapeFormResponse(this.formResponse, this.logger)
    await this.logger.debug(
      `Reshaped form response for job ${job._id} with form id ${this.formResponse.form_id}`,
      { answers: this.answers },
    )

    // let's get existing data from actionstep,
    // so that we can use it to create the manifest
    const [action, existingDataFields, apOuter, tasks, actionFolders] =
      await Promise.all([
        this.actionstep.getAction(action_id),
        this.actionstep.getDataCollectionRecordValues({
          filter: `action = ${action_id}`,
          pageSize: 'All',
        }),
        this.actionstep.getActionParticipants({
          filter: `action = ${action_id}`,
          include: 'participantType, participant',
          pageSize: 'All',
        }),
        this.actionstep.getTasks({
          filter: `action = ${action_id}`,
          pageSize: 'All',
        }),
        this.actionstep.getActionFoldersv2({
          filter: `action = ${action_id}`,
          pageSize: 'All',
        }),
      ])

    if (
      !apOuter.linked ||
      !apOuter.linked.participanttypes ||
      !apOuter.linked.participants
    ) {
      throw new Error(
        `Malformed actionparticipants response found for Action Id:${action_id}`,
      )
    }

    // populate the class properties with the existing data
    this.dataCollectionRecordValues =
      existingDataFields.datacollectionrecordvalues
    this.action = action.actions
    this.actionparticipants = apOuter.actionparticipants
    this.participantTypes = apOuter.linked.participanttypes
    this.participants = apOuter.linked.participants
    this.tasks = tasks.tasks
    this.actionfolders = actionFolders.actionfolders

    // make sure the payload contains the action type for later lookup
    if (!this.action || !this.action.links || !this.action.links.actionType) {
      throw new Error(
        `Action Id:${action_id} does not have a valid action type link`,
      )
    }

    // now get the config from dataverse that informs what we need to do
    this.config = await this.dataverse.getBespokeTasks(
      job.tenant,
      this.formResponse.form_id,
      +this.action.links.actionType,
    )

    const files = await this.files()

    const manifest: BespokeTasksManifest = {
      tenant: job.tenant,
      job: { id: job._id.toString() },
      completeTasks: await this.completeTasks(),
      datafields: await this.datafields(),
      files,
      createTasks: await this.createTasks(files, job.tenant), // potentially includes an email for FCL
      filenotes: await this.filenotes(files),
      emails: await this.compileEmails(this.emails, job.tenant),
    }

    return manifest
  }

  readonly getIssues = (): Issues[] => {
    return this.issues
  }

  async getParticipantByTypeName(
    participantTypeName: string,
  ): Promise<Participant | undefined> {
    const pt = this.participantTypes.find(
      (pt) => pt.displayName === participantTypeName,
    )
    if (!pt) {
      this.issues.push({
        description: `ParticipantType: ${participantTypeName} not found for matter ${this.action.id}`,
      })
      return
    }
    const assignee = this.actionparticipants.find(
      (ap) => +ap.links.participantType === pt.id,
    )
    if (!assignee || !assignee.links.participant) {
      this.issues.push({
        description: `Assignee with type ${participantTypeName} not found in action participants`,
      })
      return
    }
    const participant = this.participants.find(
      (p) => p.id === +assignee.links.participant,
    )
    if (!participant || !participant.email) {
      this.issues.push({
        description: `Participant with id ${assignee.links.participant} not found in action participants`,
      })
      return
    }
    return participant
  }

  async getParticipantByTypeNumber(
    participantType: number,
  ): Promise<Participant | undefined> {
    const assignee = this.actionparticipants.find(
      (ap) => ap.links.participantType === `${participantType}`,
    )
    if (!assignee || !assignee.links.participant) {
      await this.logger.debug('actionparticipants', this.actionparticipants)
      this.issues.push({
        description: `Assignee with type ${participantType} not found in action participants`,
      })
      return
    }
    const participant = this.participants.find(
      (p) => p.id === +assignee.links.participant,
    )
    if (!participant || !participant.email) {
      await this.logger.debug('participants', this.participants)
      this.issues.push({
        description: `Participant with id ${assignee.links.participant} not found in action participants`,
      })
      return
    }
    return participant
  }

  async compileEmails(
    emails: BespokeTasksEmail[],
    tenant: Tenant,
  ): Promise<BespokeTasksEmail[]> {
    const out: BespokeTasksEmail[] = []
    out.push(...emails)
    const ptName = tenant === 'CCA' ? 'Assigned Lawyer' : 'Conveyancer'
    const participant = await this.getParticipantByTypeName(ptName)
    if (!participant || !participant.email) {
      return out
    }
    const to = participant.email
    const subject =
      tenant === 'FCL'
        ? `Escalation questions from SDS Webform for Matter: ${this.action.id} and Intouch File Reference: ${this.action.reference}.`
        : `Escalation questions from SDS Webform for Matter: ${this.action.id}`

    const escalation: string[] = [
      `The Following Escalation questions have been answered by the client for Matter ${this.action.id}:`,
    ]
    // check for escalation triggers
    for (const trigger of escalationTriggers.filter(
      (t) => t.email && t.form === this.formResponse.form_id,
    )) {
      const question = this.answers[trigger.question]
      if (!question) continue
      const answer = this.answers[trigger.answer]
      if (
        question.response === trigger.questionResponse ||
        trigger.questionResponse === '::any::'
      )
        escalation.push(
          `Q: ${question.definition.title}\nA: ${answer.response}\n`,
        )
    }
    escalation.push('Please provide assistance to the admin Team as required')
    if (escalation.length > 2) {
      out.push({
        to,
        subject,
        body: escalation.join('\n'),
      })
    }
    return out
  }

  async files(): Promise<BespokeTasksFiles[]> {
    const files: BespokeTasksFiles[] = []
    // starting with a subset of config, specifically the files
    const toFiles = this.config.filter(
      (item) => item.dbc_action_type === 'document',
    ) as BespokeTasksFormattedInner
    if (toFiles.length === 0) {
      this.logger.warn('No files to action per dataverse config')
      return []
    }
    await this.logger.debug(
      `Processing ${toFiles.length} files for action ${this.action.id}`,
      { toFiles },
    )

    // so, first we need to see if a question was asked in typeform
    // need to add a nullable trigger question in config, (null = triggered)
    // if populated (field id) then check if it was triggered according to
    // the nullable config response (null = triggered)
    const asked = toFiles.filter((item) => {
      if (!item.dbc_file_trigger_question) return true // triggered
      if (!item.dbc_file_trigger_response) return true // triggered
      if (!this.answers[item.dbc_file_trigger_question]) return false
      return (
        this.answers[item.dbc_file_trigger_question].response ===
        item.dbc_file_trigger_response
      )
    })
    await this.logger.debug(
      `Asked ${asked.length} files for action ${this.action.id}`,
      { asked },
    )

    // then check if a file was uploaded or not
    const answered = this.formResponse.answers.filter((ans) => {
      return ans.type === 'file_url' && ans.file_url && ans.file_url.length > 0
    })
    await this.logger.debug(
      `Answered ${answered.length} files for action ${this.action.id}`,
      { answered },
    )
    // if so we need to find the correct destination folder in actionstep,
    // if not then we need to mark it as missing for filenoting and task creation purposes
    for (const item of asked) {
      await this.logger.debug(
        `Processing file item ${item.dbc_typeform_question_id} for action ${this.action.id}`,
        { item },
      )
      const answeredFile = answered.find(
        (ans) => ans.field.id === item.dbc_typeform_question_id,
      )
      await this.logger.debug(
        `Answered file for item ${item.dbc_typeform_question_id} for action ${this.action.id}`,
        { answeredFile },
      )
      if (!answeredFile) {
        files.push({
          url: null,
          rename: item.dbc_stringvalue || '',
          folder: 0,
          parentFolder: null,
          isMissing: true,
        })
        continue
      }

      await this.logger.debug(
        `actionfolders for action ${this.action.id}`,
        this.actionfolders,
      )

      // now we need to find the correct action folder
      let parentFolderId: string

      // so, is there a parent folder?
      if (item.dbc_parent_folder) {
        const parentFolder = this.actionfolders.find(
          (af) => af.name === item.dbc_parent_folder,
        )
        await this.logger.debug(`parent folder for action ${this.action.id}?`, {
          parentFolder,
        })
        if (!parentFolder) {
          this.issues.push({
            description: `Parent folder:${item.dbc_parent_folder} not found for matter: ${this.action.id}`,
          })
          continue
        }
        parentFolderId = `${parentFolder.id}`
      }

      const actionFolder = this.actionfolders.find(
        (af) =>
          af.name === item.dbc_folder &&
          (parentFolderId ? af.links.parentFolder === parentFolderId : true),
      )
      await this.logger.debug(`action folder for action ${this.action.id}?`, {
        actionFolder,
      })
      if (!actionFolder) {
        this.issues.push({
          description: `Folder:${item.dbc_folder} not found for matter: ${this.action.id}`,
        })
        continue
      }

      // finally, we can add the file to the files array
      files.push({
        url:
          answered.find((ans) => ans.field.id === answeredFile.field.id)
            ?.file_url || null,
        rename: item.dbc_stringvalue || '',
        folder: actionFolder.id,
        parentFolder: actionFolder.links.parentFolder,
        isMissing: false,
      })
    }
    await this.logger.debug(
      `Processed ${files.length} files for action ${this.action.id}`,
      {
        files,
      },
    )

    return files
  }

  async datafields(): Promise<BespokeTasksDataFields> {
    const update: DataCollectionRecordValuePutPostInner[] = []
    const create: DatafieldCreate[] = []
    // starting with a subset of toAction, specifically the datafields
    const datafields = this.config.filter(
      (item) => item.dbc_action_type === 'datafield',
    ) as BespokeTasksFormattedInner
    if (datafields.length === 0) {
      this.logger.warn('No datafields to action per dataverse config')
      return {
        create,
        update,
      }
    }

    // now we need to check to see if we have any existing data collection record values
    // which means a data collection record already exists
    // and we can simply PUT the data collection record value
    // otherwise we need to POST a new data collection record
    // and then PUT the data collection record

    // so I want 2 arrays at the end, to be processed in order
    // 1. POST data collection records
    // 2. PUT data collection record values
    const fields = new Set<string>()
    for (const item of datafields) {
      // is the configuration valid?
      if (!item.dbc_datafield || !item.dbc_typeform_question_id) {
        this.issues.push({
          description: `Data field not configured for item ${item.dbc_typeform_question_id}`,
        })
        continue
      }

      // was the question asked and answered?
      if (!this.answers[item.dbc_typeform_question_id]) continue

      // have we already processed this field?
      if (fields.has(item.dbc_datafield)) continue

      // add the field to the set
      fields.add(item.dbc_datafield)
    }
    await this.logger.debug(
      `Processing ${fields.size} data fields for action ${this.action.id}`,
      { fields: Array.from(fields) },
    )

    for (const field of fields) {
      // what are the configured questions that could affect this field?
      const config = this.config.filter((item) => item.dbc_datafield === field)
      // note that this config has multiples of the question, if there are different
      // responses to different answers to the same question

      // start with answers for this field
      // and then join to the questions that affect this field
      // then filter to have either the same answer or a response of ::Response::
      const answered = config
        .map((cfg) => {
          const ans = this.answers[cfg.dbc_typeform_question_id!]
          if (
            ans &&
            (cfg.dbc_typeform_answer === ans.response ||
              cfg.dbc_typeform_answer === '::Response::')
          ) {
            // Combine properties from both config and answer
            return { ...cfg, ...ans }
          }
          return null
        })
        .filter(
          (
            item,
          ): item is (typeof config)[number] & (typeof this.answers)[string] =>
            item !== null,
        )

      const existing = this.dataCollectionRecordValues.find(
        (dcrv) => dcrv.links.dataCollectionField === field,
      ) // note this assumes no multiple entry datacollectionrecords exist

      await this.logger.debug(
        `${answered.length} questions affecting field ${field}:`,
        {
          answered,
        },
      )

      if (answered.length === 0) {
        if (existing) {
          update.push({
            id: existing.id,
            stringValue: null,
            links: {
              action: existing.links.action,
              dataCollection: existing.links.dataCollection,
              dataCollectionField: existing.links.dataCollectionField,
              dataCollectionRecord: existing.links.dataCollectionRecord,
            },
          })
        } // if not existing, then we do nothing
      } else if (answered.length === 1) {
        let val: string | null
        const item = answered[0]
        if (item.dbc_stringvalue === '::Response::') {
          val = item.response
        } else {
          val = item.dbc_stringvalue ?? null
        }

        if (existing) {
          // we have an existing data collection record value
          update.push({
            id: existing.id,
            stringValue: val,
            links: {
              action: existing.links.action,
              dataCollection: existing.links.dataCollection,
              dataCollectionField: existing.links.dataCollectionField,
              dataCollectionRecord: existing.links.dataCollectionRecord,
            },
          })
        } else {
          if (val) {
            create.push({
              stringValue: val,
              links: {
                action: `${this.action.id}`,
                dataCollection: field.split('--')[0],
                dataCollectionField: field,
              },
            })
          }
        }
      } else {
        // multiple items
        const responses = answered.map((ans) => ans.response)

        // we currently only have instruction on how to deal with multiple values
        // for 339--unregistered_encumbrances and 339--unregistered_encumbrances_agreement
        // where if any of the values is Yes, the final value is Yes otherwise No
        const regex = /^\d+--unregistered_encumbrances(_agreement)?$/
        if (regex.test(field)) {
          const finalValue = responses.includes('Yes') ? 'Yes' : 'No'
          if (existing) {
            // we have an existing data collection record value
            update.push({
              id: existing.id,
              stringValue: finalValue,
              links: {
                action: existing.links.action,
                dataCollection: existing.links.dataCollection,
                dataCollectionField: existing.links.dataCollectionField,
                dataCollectionRecord: existing.links.dataCollectionRecord,
              },
            })
          } else {
            create.push({
              stringValue: finalValue,
              links: {
                action: `${this.action.id}`,
                dataCollection: field.split('--')[0],
                dataCollectionField: field,
              },
            })
          }
        } else {
          // For other fields, log and throw and error
          throw new Error(
            `Unexpected multiple responses for field ${field}: ${responses.join(', ')}`,
          )
        }
      }
    }

    return {
      create,
      update,
    }
  }

  async createTasks(
    files: BespokeTasksFiles[],
    tenant: Tenant,
  ): Promise<CreateTask[]> {
    const createTasks: CreateTask[] = []
    // starting with a subset of toAction, specifically the createTasks
    const toCreate = this.config
      .filter((item) => item.dbc_action_type === 'createtask')
      .map((cfg) => {
        const ans = this.answers[cfg.dbc_typeform_question_id!]
        if (
          ans &&
          (cfg.dbc_typeform_answer === ans.response ||
            cfg.dbc_typeform_answer === '::Response::')
        ) {
          // Combine properties from both config and answer
          return { ...cfg, ...ans }
        }
        return null
      })
      .filter(
        (
          item,
        ): item is (typeof this.config)[number] &
          (typeof this.answers)[string] => item !== null,
      )

    await this.logger.debug(
      `Processing ${toCreate.length} tasks for action ${this.action.id}`,
      { toCreate },
    )

    if (toCreate.length === 0) {
      this.logger.warn('No create tasks to action per dataverse config')
    }

    // search this.tasks for the task name
    for (const item of toCreate) {
      await this.logger.debug(
        `Processing task item ${item.dbc_task_name} for action ${this.action.id}`,
        { item },
      )
      const task = this.tasks.find((t) => t.name === item.dbc_task_name)
      await this.logger.debug(`Task found for item ${item.dbc_task_name}?`, {
        task,
      })
      if (task) {
        this.issues.push({
          description: `Task with name ${item.dbc_task_name} already exists in action tasks`,
        })
        continue
      }
      const participant = await this.getParticipantByTypeNumber(
        item.dbc_task_assignee!,
      )
      if (!participant) continue

      const dueTimestamp = dateOffsetter(
        item.dbc_task_due_date_anchor === 'Webform Submission'
          ? new Date(this.formResponse.submitted_at)
          : new Date(), // need to update in future to deal with other anchors as needed
        item.dbc_task_due_date_offset || 0,
        item.dbc_task_business_day_offset || true,
      ).toISOString()

      // Create and push the task directly, consistent with other task creations in the file
      createTasks.push({
        name: item.dbc_task_name || '',
        description: item.dbc_taskdescription || '',
        status: 'Incomplete',
        dueTimestamp,
        links: {
          action: `${this.action.id}`,
          assignee: participant.id,
        },
      })
    }

    const ptName = tenant === 'CCA' ? 'Assigned Lawyer' : 'Conveyancer'
    const participant = await this.getParticipantByTypeName(ptName)
    if (!participant || !participant.email) {
      return createTasks
    }

    // if we have missing files, and the tenant is CCA or BTR
    // we need to add them to a new task
    // if the tenant is FCL, then add an email with same description
    const missingFiles = files.filter((f) => f.isMissing)
    const taskDescription: string[] = []
    if (missingFiles && missingFiles.length > 0) {
      taskDescription.push('Client has not provided the following documents:')
      for (const f of missingFiles) taskDescription.push(' - ' + f.rename)
      taskDescription.push('\nPlease follow up/check your email\n\n')

      if (['CCA', 'BTR'].includes(tenant)) {
        createTasks.push({
          name: 'Follow up client for missing documents',
          description: taskDescription.join('\n'),
          status: 'Incomplete',
          dueTimestamp: new Date().toISOString(),
          links: {
            action: `${this.action.id}`,
            assignee: participant.id,
          },
        })
      } else if (tenant === 'FCL') {
        this.emails.push({
          to: participant.email,
          subject: `Documents not uploaded by the client for Matter ${this.action.id} and Intouch File Reference: ${this.action.reference}`,
          body: taskDescription.join('\n'),
        })
      }
    }

    // check for escalation triggers
    const answers = escalationTriggers.filter((t) => {
      const answerRecord = this.formResponse.answers.find(
        (a) => a.field.id === t.question,
      )
      let answer
      if (answerRecord && answerRecord.text) answer = answerRecord.text
      else if (
        answerRecord &&
        answerRecord.choice &&
        'other' in answerRecord.choice
      )
        answer = answerRecord.choice.other
      else if (
        answerRecord &&
        answerRecord.choice &&
        'label' in answerRecord.choice
      )
        answer = answerRecord.choice.label
      return (
        t.task &&
        t.form === this.formResponse.form_id &&
        answerRecord &&
        (answer === t.questionResponse || t.questionResponse === '::any::')
      )
    })
    if (answers.length > 0) {
      if (['CCA', 'BTR'].includes(tenant)) {
        createTasks.push({
          name: 'Unregistered oral agreement',
          description: `Please review details provided by client via the escalation email, for unregistered oral agreements and provide a summary below which Admin Staff can insert into the SDS form. Please re-assign task to admin when below has been filled.

Admin to add into data field: unregistered oral agreements, located in the Property panel.
[insert details for admin here]`,
          status: 'Incomplete',
          dueTimestamp: new Date().toISOString(),
          links: {
            action: `${this.action.id}`,
            assignee: participant.id,
          },
        })
      } else if (tenant === 'FCL') {
        const adminParticipant =
          await this.getParticipantByTypeName('Admin Staff')
        if (!adminParticipant) {
          this.issues.push({
            description: `Admin Staff participant not found for tenant ${tenant}`,
          })
          return createTasks
        }
        createTasks.push({
          name: 'Unregistered oral agreement',
          description: `Please check your inbox for an email from the FCL conveyancer for what you need to add into the following data field located in the property panel: unregistered oral agreements`,
          status: 'Incomplete',
          dueTimestamp: new Date().toISOString(),
          links: {
            action: `${this.action.id}`,
            assignee: adminParticipant.id,
          },
        })
      }
    }

    return createTasks
  }

  async completeTasks(): Promise<CompleteTask[]> {
    const completeTasks: CompleteTask[] = []
    // starting with a subset of toAction, specifically the completeTasks
    const toComplete = this.config
      .filter((item) => item.dbc_action_type === 'completeTask')
      .map((cfg) => {
        const ans = this.answers[cfg.dbc_typeform_question_id!]
        if (
          ans &&
          (cfg.dbc_typeform_answer === ans.response ||
            cfg.dbc_typeform_answer === '::Response::')
        ) {
          // Combine properties from both config and answer
          return { ...cfg, ...ans }
        }
        return null
      })
      .filter(
        (
          item,
        ): item is (typeof this.config)[number] &
          (typeof this.answers)[string] => item !== null,
      )

    if (toComplete.length === 0) {
      this.logger.warn('No complete tasks to action per dataverse config')
      return []
    }

    // search this.tasks for the task name
    for (const item of toComplete) {
      const task = this.tasks.find((t) => t.name === item.dbc_task_name)
      if (!task) {
        this.issues.push({
          description: `Task with name ${item.dbc_task_name} not found in action tasks`,
        })
        continue
      }
      completeTasks.push({
        id: task.id,
        name: task.name,
        status: 'Complete',
        completedTimestamp: new Date().toISOString(),
        links: {
          action: task.links.action,
          assignee: task.links.assignee,
        },
      })
    }

    return completeTasks
  }

  async filenotes(files: BespokeTasksFiles[]): Promise<MatterCreateFileNote[]> {
    // build a file note of all responses
    const responseNote: string[] = []
    responseNote.push(
      `Webform Received: ${this.formResponse.definition?.title}\n`,
    )
    const missingFiles = files.filter((f) => f.isMissing)
    if (missingFiles.length > 0) {
      responseNote.push(
        `Missing Documents:\n${missingFiles.map((f) => ' - ' + f.rename).join('\n')}\n`,
      )
    }

    if (this.answers) {
      responseNote.push('Form Responses:')
      for (const ans of Object.values(this.answers)) {
        responseNote.push(`${ans.definition.title}:\n${ans.response}\n`)
      }
    }

    const out = [
      {
        note: responseNote.join('\n'),
      },
    ]

    if (this.issues.length > 0) {
      out.push({
        note: `Automation update:\n- ${this.issues
          .map((i) => i.description)
          .join('\n- ')}`,
      })
    }

    return out
  }
}
