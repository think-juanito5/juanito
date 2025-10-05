import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import {
  MetaPagingSchema,
  Nullable,
  Numeric,
  TrueFalseSchema,
  linksSchema,
} from './common'
import { CountriesSchema } from './countries'
import { DivisionSchema } from './divisions'

export type ParticipantLinks = Static<typeof ParticipantLinksSchema>
export const ParticipantLinksSchema = Type.Object({
  physicalCountry: Type.String(),
  mailingCountry: Type.String(),
  division: Nullable(Type.String()),
})

export type Participant = Static<typeof ParticipantSchema>
export const ParticipantSchema = Type.Object({
  id: Numeric(),
  displayName: Type.String(),
  isCompany: TrueFalseSchema,
  companyName: Nullable(Type.String()),
  salutation: Nullable(Type.String()),
  firstName: Nullable(Type.String()),
  middleName: Nullable(Type.String()),
  lastName: Nullable(Type.String()),
  suffix: Nullable(Type.String()),
  preferredName: Nullable(Type.String()),
  physicalAddressLine1: Nullable(Type.String()),
  physicalAddressLine2: Nullable(Type.String()),
  physicalCity: Nullable(Type.String()),
  physicalStateProvince: Nullable(Type.String()),
  physicalPostCode: Nullable(Type.String()),
  mailingAddressLine1: Nullable(Type.String()),
  mailingAddressLine2: Nullable(Type.String()),
  mailingCity: Nullable(Type.String()),
  mailingStateProvince: Nullable(Type.String()),
  mailingPostCode: Nullable(Type.String()),
  phone1Label: Nullable(Type.String()),
  phone1Country: Nullable(Numeric()),
  phone1Area: Nullable(Numeric()),
  phone1Number: Nullable(Type.String()),
  phone1Notes: Nullable(Type.String()),
  phone2Label: Nullable(Type.String()),
  phone2Country: Nullable(Numeric()),
  phone2Area: Nullable(Numeric()),
  phone2Number: Nullable(Type.String()),
  phone2Notes: Nullable(Type.String()),
  phone3Label: Nullable(Type.String()),
  phone3Country: Nullable(Numeric()),
  phone3Area: Nullable(Numeric()),
  phone3Number: Nullable(Type.String()),
  phone3Notes: Nullable(Type.String()),
  phone4Label: Nullable(Type.String()),
  phone4Country: Nullable(Numeric()),
  phone4Area: Nullable(Numeric()),
  phone4Number: Nullable(Type.String()),
  phone4Notes: Nullable(Type.String()),
  fax: Nullable(Type.String()),
  sms: Nullable(Type.String()),
  email: Nullable(Type.String()),
  website: Nullable(Type.String()),
  occupation: Nullable(Type.String()),
  taxNumber: Nullable(Type.String()),
  birthTimestamp: Nullable(Type.String()),
  deathTimestamp: Nullable(Type.String()),
  maritalStatus: Nullable(Type.String()),
  gender: Nullable(Type.String()),
  genderTypeName: Nullable(Type.String()),
  isDeceased: Nullable(Type.String()),
  dateOfBirthStatus: Nullable(Type.String()),
  countryIdOfBirth: Nullable(Type.String()),
  modifiedTimestamp: Nullable(Type.String()),
  createdTimestamp: Nullable(Type.String()),
  amlStatus: Nullable(Type.String()),
  amlProgress: Nullable(Type.Number()),
  amlRisk: Nullable(Type.String()),
  amlNote: Nullable(Type.String()),
  importExternalReference: Nullable(Type.String()),
  links: ParticipantLinksSchema,
})

export type ParticipantPut = Static<typeof ParticipantPutSchema>
export const ParticipantPutSchema = Type.Object({
  participants: Type.Object({
    displayName: Type.Optional(Nullable(Type.String())),
    isCompany: Type.Optional(TrueFalseSchema),
    companyName: Type.Optional(Nullable(Type.String())),
    salutation: Type.Optional(Nullable(Type.String())),
    firstName: Type.Optional(Nullable(Type.String())),
    middleName: Type.Optional(Nullable(Type.String())),
    lastName: Type.Optional(Nullable(Type.String())),
    suffix: Type.Optional(Nullable(Type.String())),
    preferredName: Type.Optional(Nullable(Type.String())),
    physicalAddressLine1: Type.Optional(Nullable(Type.String())),
    physicalAddressLine2: Type.Optional(Nullable(Type.String())),
    physicalCity: Type.Optional(Nullable(Type.String())),
    physicalStateProvince: Type.Optional(Nullable(Type.String())),
    physicalPostCode: Type.Optional(Nullable(Type.String())),
    mailingAddressLine1: Type.Optional(Nullable(Type.String())),
    mailingAddressLine2: Type.Optional(Nullable(Type.String())),
    mailingCity: Type.Optional(Nullable(Type.String())),
    mailingStateProvince: Type.Optional(Nullable(Type.String())),
    mailingPostCode: Type.Optional(Nullable(Type.String())),
    phone1Label: Type.Optional(Nullable(Type.String())),
    phone1Country: Type.Optional(Nullable(Numeric())),
    phone1Area: Type.Optional(Nullable(Numeric())),
    phone1Number: Type.Optional(Nullable(Type.String())),
    phone1Notes: Type.Optional(Nullable(Type.String())),
    phone2Label: Type.Optional(Nullable(Type.String())),
    phone2Country: Type.Optional(Nullable(Numeric())),
    phone2Area: Type.Optional(Nullable(Numeric())),
    phone2Number: Type.Optional(Nullable(Type.String())),
    phone2Notes: Type.Optional(Nullable(Type.String())),
    phone3Label: Type.Optional(Nullable(Type.String())),
    phone3Country: Type.Optional(Nullable(Numeric())),
    phone3Area: Type.Optional(Nullable(Numeric())),
    phone3Number: Type.Optional(Nullable(Type.String())),
    phone3Notes: Type.Optional(Nullable(Type.String())),
    phone4Label: Type.Optional(Nullable(Type.String())),
    phone4Country: Type.Optional(Nullable(Numeric())),
    phone4Area: Type.Optional(Nullable(Numeric())),
    phone4Number: Type.Optional(Nullable(Type.String())),
    phone4Notes: Type.Optional(Nullable(Type.String())),
    fax: Type.Optional(Nullable(Type.String())),
    sms: Type.Optional(Nullable(Type.String())),
    email: Type.Optional(Nullable(Type.String())),
    website: Type.Optional(Nullable(Type.String())),
    occupation: Type.Optional(Nullable(Type.String())),
    taxNumber: Type.Optional(Nullable(Type.String())),
    birthTimestamp: Type.Optional(Nullable(Type.String())),
    deathTimestamp: Type.Optional(Nullable(Type.String())),
    maritalStatus: Type.Optional(Nullable(Type.String())),
    gender: Type.Optional(Nullable(Type.String())),
    genderTypeName: Type.Optional(Nullable(Type.String())),
    isDeceased: Type.Optional(Nullable(Type.String())),
    dateOfBirthStatus: Type.Optional(Nullable(Type.String())),
    countryIdOfBirth: Type.Optional(Nullable(Type.String())),
    modifiedTimestamp: Type.Optional(Nullable(Type.String())),
    createdTimestamp: Type.Optional(Nullable(Type.String())),
    amlStatus: Type.Optional(Nullable(Type.String())),
    amlProgress: Type.Optional(Nullable(Type.Number())),
    amlRisk: Type.Optional(Nullable(Type.String())),
    amlNote: Type.Optional(Nullable(Type.String())),
    importExternalReference: Type.Optional(Nullable(Type.String())),
    links: Type.Optional(ParticipantLinksSchema),
  }),
})

const linkedSchema = Type.Object({
  countries: Type.Optional(Type.Array(CountriesSchema)),
  divisions: Type.Optional(Type.Array(DivisionSchema)),
})

export type SingleParticipant = Static<typeof SingleParticipantSchema>
export const SingleParticipantSchema = Type.Object({
  links: linksSchema,
  participants: ParticipantSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ participants: MetaPagingSchema }),
  }),
})
export const CSingleParticipant = TypeCompiler.Compile(SingleParticipantSchema)

export type PagedParticipants = Static<typeof PagedParticipantsSchema>
export const PagedParticipantsSchema = Type.Object({
  links: linksSchema,
  participants: Type.Array(ParticipantSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ participants: MetaPagingSchema }),
  }),
})
export const CPagedParticipants = TypeCompiler.Compile(PagedParticipantsSchema)

export type UnknownParticipants = Static<typeof UnknownParticipantsSchema>
export const UnknownParticipantsSchema = Type.Object({
  links: linksSchema,
  participants: Type.Union([ParticipantSchema, Type.Array(ParticipantSchema)]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({
    paging: Type.Object({ participants: MetaPagingSchema }),
  }),
})
export const CUnknownParticipants = TypeCompiler.Compile(
  UnknownParticipantsSchema,
)
