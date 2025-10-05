import { type Static, type StaticDecode, Type } from '@sinclair/typebox'

export type ccaMatterTpLinkParams = Static<typeof ccaMatterTpLinkParamsSchema>
export const ccaMatterTpLinkParamsSchema = Type.Optional(
  Type.Object({
    participantClientId: Type.Optional(Type.Number()),
  }),
)

export const TPLinkClientSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String(),
})

export type TPLinkParams = StaticDecode<typeof TPLinkParamsSchema>
export const TPLinkParamsSchema = Type.Object({
  matterId: Type.String(),
  client: TPLinkClientSchema,
})

export const SymlinkBlobSchema = Type.Object({
  type: Type.Literal('symlink'),
  target: Type.String(),
  createdAt: Type.String(),
})

export type SymlinkBlob = Static<typeof SymlinkBlobSchema>
