import { type TObject, type TString, Type } from '@sinclair/typebox'

// Read picks id only
export const Read = <T extends TObject<{ id: TString }>>(schema: T) =>
  Type.Pick(schema, ['id'])
// Delete indexes id ( type is a string)
export const Delete = <T extends TObject<{ id: TString }>>(schema: T) =>
  Type.Index(schema, ['id'])
