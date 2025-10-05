import { TypeCompiler } from '@sinclair/typebox/compiler'
import { type Static, t } from 'elysia'

export const FileDataSchema = t.Object({
  id: t.Number(),
  user_id: t.Number(),
  log_id: t.Nullable(t.Number()),
  add_time: t.String(),
  update_time: t.String(),
  file_name: t.String(),
  file_size: t.Number(),
  active_flag: t.Boolean(),
  inline_flag: t.Boolean(),
  remote_location: t.String(),
  remote_id: t.String(),
  s3_bucket: t.Nullable(t.String()),
  url: t.String(),
  name: t.String(),
  description: t.Nullable(t.String()),
  deal_id: t.Nullable(t.Number()),
  lead_id: t.Nullable(t.Number()),
  person_id: t.Nullable(t.Number()),
  org_id: t.Nullable(t.Number()),
  product_id: t.Nullable(t.Number()),
  activity_id: t.Nullable(t.Number()),
  deal_name: t.String(),
  lead_name: t.Nullable(t.String()),
  person_name: t.String(),
  org_name: t.Nullable(t.String()),
  product_name: t.Nullable(t.String()),
  mail_message_id: t.Nullable(t.Number()),
  mail_template_id: t.Nullable(t.Number()),
  cid: t.Nullable(t.String()),
  file_type: t.String(),
})

export type DealFile = Static<typeof DealFileSchema>
export const DealFileSchema = t.Object({
  success: t.Boolean(),
  data: FileDataSchema,
})
export const CDealFile = TypeCompiler.Compile(DealFileSchema)

export type DealFiles = Static<typeof DealFilesSchema>
export const DealFilesSchema = t.Object({
  success: t.Boolean(),
  data: t.Array(FileDataSchema),
  additional_data: t.Object({}),
})
export const CDealFiles = TypeCompiler.Compile(DealFilesSchema)

export type Person = Static<typeof PersonSchema>
export const PersonSchema = t.Object({
  name: t.String(),
  email: t.String(),
  phone: t.String(),
  marketing_status: t.String(),
})

export type Deal = Static<typeof DealSchema>
export const DealSchema = t.Object({
  person_id: t.Number(),
  user_id: t.Optional(t.String()),
  creator_user_id: t.Optional(t.String()),
  title: t.String(),
  label: t.String(),
  stage_id: t.Number(),
  phone: t.Optional(t.String()),
  source: t.Optional(t.String()),
  referralPage: t.Optional(t.String()),
  leadSourceCampaign: t.Optional(t.String()),
  leadSourceCategory: t.Optional(t.String()),
  leadChannel: t.Optional(t.String()),
  leadSubSource: t.Optional(t.String()),
  state: t.Optional(t.String()),
  bst: t.Optional(t.String()),
  propertyDetIndex: t.Optional(t.String()),
  webformTtt: t.Optional(t.String()),
  enableMarketing: t.Optional(t.String()),
  racvConsent: t.Optional(t.String()),
  racvMembershipNo: t.Optional(t.String()),
  offerApplied: t.Optional(t.String()),
  otoProduct: t.Optional(t.String()),
  prefferredContactTime: t.Optional(t.String()),
  agentReferee: t.Optional(t.String()),
  ReferralId: t.Optional(t.String()),
  CampaignTrigger: t.Optional(t.String()),
  LeadJourney: t.Optional(t.String()),
})

export type SearchPerson = Static<typeof SearchPersonSchema>
export const SearchPersonSchema = t.Object({
  field: t.String(),
  term: t.String(),
})

export type PersonResponseItem = Static<typeof PersonResponseItemSchema>
export const PersonResponseItemSchema = t.Object({
  result_score: t.Number(),
  item: t.Object({
    id: t.Number(),
    type: t.String(),
    name: t.String(),
    phones: t.Array(t.String()),
    emails: t.Array(t.String()),
    primary_email: t.Nullable(t.String()),
    visible_to: t.Number(),
    owner: t.Object({
      id: t.Number(),
    }),
    organization: t.Nullable(t.Any()), // Define the structure if known
    custom_fields: t.Array(t.Any()), // Define the structure if known
    notes: t.Array(t.Any()), // Define the structure if known
    update_time: t.String(),
  }),
})

export type PersonResponse = Static<typeof PersonResponseSchema>
export const PersonResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    items: t.Array(PersonResponseItemSchema), // Define the structure of the items if known
  }),
  additional_data: t.Object({
    pagination: t.Object({
      start: t.Number(),
      limit: t.Number(),
      more_items_in_collection: t.Boolean(),
    }),
  }),
})

export const CPersonResponse = TypeCompiler.Compile(PersonResponseSchema)
export type DealResponse = Static<typeof DealResponseSchema>
export type DealResponseSchema = Static<typeof DealResponseSchema>
export const DealResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    id: t.Number(),
    creator_user_id: t.Object({
      id: t.Number(),
      name: t.String(),
      email: t.String(),
      has_pic: t.Number(),
      pic_hash: t.String(),
      active_flag: t.Boolean(),
      value: t.Number(),
    }),
    user_id: t.Object({
      id: t.Number(),
      name: t.String(),
      email: t.String(),
      has_pic: t.Number(),
      pic_hash: t.String(),
      active_flag: t.Boolean(),
      value: t.Number(),
    }),
    person_id: t.Object({
      active_flag: t.Boolean(),
      name: t.String(),
      email: t.Array(
        t.Object({
          label: t.String(),
          value: t.String(),
          primary: t.Boolean(),
        }),
      ),
      phone: t.Array(
        t.Object({
          label: t.String(),
          value: t.String(),
          primary: t.Boolean(),
        }),
      ),
      owner_id: t.Number(),
      value: t.Number(),
    }),
    org_id: t.Nullable(t.Any()), // Define the structure if known
    stage_id: t.Number(),
    title: t.String(),
    value: t.Number(),
    currency: t.String(),
    add_time: t.String(),
    update_time: t.String(),
    stage_change_time: t.Nullable(t.String()),
    active: t.Boolean(),
    deleted: t.Boolean(),
    status: t.String(),
    probability: t.Nullable(t.Number()),
    next_activity_date: t.Nullable(t.String()),
    next_activity_time: t.Nullable(t.String()),
    next_activity_id: t.Nullable(t.Number()),
    last_activity_id: t.Nullable(t.Number()),
    last_activity_date: t.Nullable(t.String()),
    lost_reason: t.Nullable(t.String()),
    visible_to: t.String(),
    close_time: t.Nullable(t.String()),
    pipeline_id: t.Number(),
    won_time: t.Nullable(t.String()),
    first_won_time: t.Nullable(t.String()),
    lost_time: t.Nullable(t.String()),
    products_count: t.Number(),
    files_count: t.Number(),
    notes_count: t.Number(),
    followers_count: t.Number(),
    email_messages_count: t.Number(),
    activities_count: t.Number(),
    done_activities_count: t.Number(),
    undone_activities_count: t.Number(),
    participants_count: t.Number(),
    expected_close_date: t.Nullable(t.String()),
    last_incoming_mail_time: t.Nullable(t.String()),
    last_outgoing_mail_time: t.Nullable(t.String()),
    label: t.Nullable(t.String()),
    rotten_time: t.Optional(t.Nullable(t.String())),
    owner_name: t.String(),
    cc_email: t.String(),
    // Add other fields as necessary
  }),
  related_objects: t.Object({
    user: t.Record(
      t.String(),
      t.Object({
        id: t.Number(),
        name: t.String(),
        email: t.String(),
        has_pic: t.Number(),
        pic_hash: t.String(),
        active_flag: t.Boolean(),
      }),
    ),
    pipeline: t.Record(
      t.String(),
      t.Object({
        id: t.Number(),
        name: t.String(),
        url_title: t.String(),
        order_nr: t.Number(),
        active: t.Boolean(),
        deal_probability: t.Boolean(),
        add_time: t.String(),
        update_time: t.String(),
      }),
    ),
    stage: t.Record(
      t.String(),
      t.Object({
        id: t.Number(),
        order_nr: t.Number(),
        name: t.String(),
        active_flag: t.Boolean(),
        deal_probability: t.Number(),
        pipeline_id: t.Number(),
        rotten_flag: t.Boolean(),
        rotten_days: t.Nullable(t.Number()),
        add_time: t.String(),
        update_time: t.String(),
        pipeline_name: t.String(),
        pipeline_deal_probability: t.Boolean(),
      }),
    ),
    person: t.Record(
      t.String(),
      t.Object({
        active_flag: t.Boolean(),
        id: t.Number(),
        name: t.String(),
        email: t.Array(
          t.Object({
            label: t.String(),
            value: t.String(),
            primary: t.Boolean(),
          }),
        ),
        phone: t.Array(
          t.Object({
            label: t.String(),
            value: t.String(),
            primary: t.Boolean(),
          }),
        ),
        owner_id: t.Number(),
      }),
    ),
  }),
})

export const CDealResponse = TypeCompiler.Compile(DealResponseSchema)

export type CreatePersonResponseSchema = Static<
  typeof CreatePersonResponseSchema
>
export const CreatePersonResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    id: t.Number(),
    company_id: t.Number(),
    owner_id: t.Object({
      id: t.Number(),
      name: t.String(),
      email: t.String(),
      has_pic: t.Number(),
      pic_hash: t.String(),
      active_flag: t.Boolean(),
      value: t.Number(),
    }),
    org_id: t.Nullable(t.Any()), // Define the structure if known
    name: t.String(),
    first_name: t.String(),
    last_name: t.String(),
    open_deals_count: t.Number(),
    related_open_deals_count: t.Number(),
    closed_deals_count: t.Number(),
    related_closed_deals_count: t.Number(),
    participant_open_deals_count: t.Number(),
    participant_closed_deals_count: t.Number(),
    email_messages_count: t.Number(),
    activities_count: t.Number(),
    done_activities_count: t.Number(),
    undone_activities_count: t.Number(),
    files_count: t.Number(),
    notes_count: t.Number(),
    followers_count: t.Number(),
    won_deals_count: t.Number(),
    related_won_deals_count: t.Number(),
    lost_deals_count: t.Number(),
    related_lost_deals_count: t.Number(),
    active_flag: t.Boolean(),
    phone: t.Array(t.Any()), // Define the structure if known
    email: t.Array(t.Any()), // Define the structure if known
    first_char: t.String(),
    update_time: t.String(),
    delete_time: t.Nullable(t.String()),
    add_time: t.String(),
    visible_to: t.String(),
    picture_id: t.Nullable(t.Any()), // Define the structure if known
    next_activity_date: t.Nullable(t.String()),
    next_activity_time: t.Nullable(t.String()),
    next_activity_id: t.Nullable(t.Number()),
    last_activity_id: t.Nullable(t.Number()),
    last_activity_date: t.Nullable(t.String()),
    last_incoming_mail_time: t.Nullable(t.String()),
    last_outgoing_mail_time: t.Nullable(t.String()),
    label: t.Nullable(t.String()),
    label_ids: t.Array(t.Any()), // Define the structure if known
    im: t.Array(t.Any()), // Define the structure if known
    postal_address: t.Nullable(t.String()),
    postal_address_subpremise: t.Nullable(t.String()),
    postal_address_street_number: t.Nullable(t.String()),
    postal_address_route: t.Nullable(t.String()),
    postal_address_sublocality: t.Nullable(t.String()),
    postal_address_locality: t.Nullable(t.String()),
    postal_address_admin_area_level_1: t.Nullable(t.String()),
    postal_address_admin_area_level_2: t.Nullable(t.String()),
    postal_address_country: t.Nullable(t.String()),
    postal_address_postal_code: t.Nullable(t.String()),
    postal_address_formatted_address: t.Nullable(t.String()),
    notes: t.Nullable(t.String()),
    birthday: t.Nullable(t.String()),
    job_title: t.Nullable(t.String()),
    org_name: t.Nullable(t.String()),
    marketing_status: t.String(),
    doi_status: t.Number(),
    cc_email: t.String(),
    primary_email: t.String(),
    owner_name: t.String(),
    fa73897383f1f9b770336537db7500cf8d075509: t.Nullable(t.Any()), // Define the structure if known
    '445d83bc0eed59a72f3a3b22eec06a3ec42f9aa8': t.Nullable(t.Any()), // Define the structure if known
    '9be2d2996aca412eb7b2ae50258cf106bcb686a0': t.Nullable(t.Any()), // Define the structure if known
    '33767eb28b8b2195c8aa0ce9a35de12bc23a5673': t.Nullable(t.Any()), // Define the structure if known
    '3ad76360fd57d1aa8c74da6b7b13a5ea36a570d6': t.Nullable(t.Any()), // Define the structure if known
    eec4de640af3ed0559eee524d7b6dd7f6e158e8c: t.Nullable(t.Any()), // Define the structure if known
    '66165196647c1ab1b35b97f280f49dee25cf22c9': t.Nullable(t.Any()), // Define the structure if known
  }),
  additional_data: t.Object({
    didMerge: t.Boolean(),
  }),
  related_objects: t.Object({
    user: t.Record(
      t.String(),
      t.Object({
        id: t.Number(),
        name: t.String(),
        email: t.String(),
        has_pic: t.Number(),
        pic_hash: t.String(),
        active_flag: t.Boolean(),
      }),
    ),
  }),
})

export const CCreatePerson = TypeCompiler.Compile(CreatePersonResponseSchema)

//--postnotes--
//Pipedrive Notes
const NoteUserSchema = t.Object({
  email: t.Nullable(t.String()),
  name: t.Nullable(t.String()),
  icon_url: t.Nullable(t.Optional(t.String())),
  is_you: t.Boolean(),
})

const NotePersonSchema = t.Object({
  name: t.Nullable(t.String()),
})

const NotesDealSchema = t.Object({
  title: t.Nullable(t.String()),
})

const NotesSchema = t.Object({
  id: t.Number(),
  user_id: t.Number(),
  deal_id: t.Number(),
  person_id: t.Number(),
  org_id: t.Nullable(t.Number()),
  lead_id: t.Nullable(t.Number()),
  content: t.String(),
  add_time: t.Nullable(t.String()),
  update_time: t.Nullable(t.String()),
  active_flag: t.Boolean(),
  pinned_to_deal_flag: t.Boolean(),
  pinned_to_person_flag: t.Boolean(),
  pinned_to_organization_flag: t.Boolean(),
  pinned_to_lead_flag: t.Boolean(),
  last_update_user_id: t.Nullable(t.Number()),
  organization: t.Nullable(t.Object({})),
  person: t.Nullable(NotePersonSchema),
  deal: t.Nullable(NotesDealSchema),
  lead: t.Nullable(t.Object({})),
  user: t.Nullable(NoteUserSchema),
})

const SinglePipedriveNotesSchema = t.Object({
  success: t.Boolean(),
  data: NotesSchema,
})

const PipedriveNotesSchema = t.Object({
  success: t.Boolean(),
  data: t.Array(NotesSchema),
  additional_data: t.Optional(t.Object({})),
})

export type SinglePipedriveNote = Static<typeof SinglePipedriveNotesSchema>
export const CSinglePipedriveNote = TypeCompiler.Compile(
  SinglePipedriveNotesSchema,
)

export type PagePipedriveNotes = Static<typeof PipedriveNotesSchema>
export const CPagePipedriveNotes = TypeCompiler.Compile(PipedriveNotesSchema)

export type PipedriveDealPutResponse = Static<
  typeof PipedriveDealPutResponseSchema
>
export const PipedriveDealPutResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    id: t.Number(),
    stage_id: t.Number(),
    update_time: t.String(),
    active: t.Boolean(),
    status: t.String(),
  }),
  additional_data: t.Optional(t.Nullable(t.Object({}))),
  related_objects: t.Optional(t.Nullable(t.Object({}))),
})

export const CPipedriveDealPutResponse = TypeCompiler.Compile(
  PipedriveDealPutResponseSchema,
)

const UserDataSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  email: t.Optional(t.String()),
  lang: t.Optional(t.Number()),
  locale: t.Optional(t.String()),
  timezone_name: t.Optional(t.String()),
  timezone_offset: t.Optional(t.String()),
  default_currency: t.Optional(t.String()),
  icon_url: t.Nullable(t.Optional(t.String())),
  active_flag: t.Optional(t.Boolean()),
  is_deleted: t.Optional(t.Boolean()),
  is_admin: t.Optional(t.Number()),
  role_id: t.Optional(t.Number()),
  created: t.Optional(t.String()),
  has_created_company: t.Optional(t.Boolean()),
  is_you: t.Optional(t.Boolean()),
  access: t.Optional(t.Array(t.Object({}))),
})

export type DealUserCustomResponse = Pick<
  Static<typeof UserDataSchema>,
  'name' | 'email'
>
export type DealUserResponse = Static<typeof DealUserResponseSchema>
export const DealUserResponseSchema = t.Object({
  success: t.Boolean(),
  data: UserDataSchema,
  additional_data: t.Optional(t.Object({})),
})
export const CDealUserResponse = TypeCompiler.Compile(DealUserResponseSchema)
