import { type Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import {
  MetaPagingSchema,
  Nullable,
  Numeric,
  TrueFalseSchema,
  linksSchema,
} from './common'
import { DivisionSchema } from './divisions'
import { ParticipantSchema } from './participants'
import { RateSchema } from './rates'

export type UserLinks = Static<typeof UserLinksSchema>
export const UserLinksSchema = Type.Object({
  defaultRate: Nullable(Type.String()),
  division: Nullable(Type.String()),
  participant: Nullable(Type.String()),
  role: Nullable(Type.String()),
  rate: Nullable(Type.String()),
  defaultUtbmsTimekeeperCode: Nullable(Type.String()),
})

export const UserSchema = Type.Object({
  id: Numeric(),
  isCurrent: TrueFalseSchema,
  emailAddress: Nullable(Type.String()),
  isActive: TrueFalseSchema,
  hasAuthority: TrueFalseSchema,
  links: UserLinksSchema,
  orgkey: Type.Optional(Type.String()),
})
export type User = Static<typeof UserSchema>

const linkedSchema = Type.Object({
  rates: Type.Optional(Type.Array(RateSchema)),
  divisions: Type.Optional(Type.Array(DivisionSchema)),
  participants: Type.Optional(Type.Array(ParticipantSchema)),
  role: Type.Optional(Type.Array(Type.Object({}))),
})

export const SingleUserSchema = Type.Object({
  links: linksSchema,
  users: UserSchema,
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({ paging: Type.Object({ users: MetaPagingSchema }) }),
})
export type SingleUser = Static<typeof SingleUserSchema>
export const CSingleUser = TypeCompiler.Compile(SingleUserSchema)

export const PagedUsersSchema = Type.Object({
  links: linksSchema,
  users: Type.Array(UserSchema),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({ paging: Type.Object({ users: MetaPagingSchema }) }),
})
export type PagedUsers = Static<typeof PagedUsersSchema>
export const CPagedUsers = TypeCompiler.Compile(PagedUsersSchema)

export const UnknownUsersSchema = Type.Object({
  links: linksSchema,
  users: Type.Union([UserSchema, Type.Array(UserSchema)]),
  linked: Type.Optional(linkedSchema),
  meta: Type.Object({ paging: Type.Object({ users: MetaPagingSchema }) }),
})
export type UnknownUsers = Static<typeof UnknownUsersSchema>
export const CUnknownUsers = TypeCompiler.Compile(UnknownUsersSchema)
