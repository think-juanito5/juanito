import {
  type NumberOptions,
  type Static,
  type TNumber,
  type TSchema,
  Type,
} from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Value } from '@sinclair/typebox/value'
import { businessUnitsInnerSchema } from './standard-tables'

export const Nullable = <T extends TSchema>(schema: T) =>
  Type.Union([schema, Type.Null()])
export const Numeric = (property?: NumberOptions) => {
  const schema = Type.Number(property)

  return Type.Transform(
    Type.Union(
      [
        Type.String({
          format: 'numeric',
          default: 0,
        }),
        Type.Number(property),
      ],
      property,
    ),
  )
    .Decode((value) => {
      const number = +value
      if (isNaN(number)) return value

      if (property && !Value.Check(schema, number))
        throw new Error(
          `Validation error: ${JSON.stringify({ property, schema, number })}`,
        )

      return number
    })
    .Encode((value) => value) as unknown as TNumber
}

export const DataverseTokenSchema = Type.Object({
  token_type: Type.String(),
  expires_in: Type.Number(),
  ext_expires_in: Type.Number(),
  access_token: Type.String(),
})
export type DataverseToken = Static<typeof DataverseTokenSchema>
export const CDataverseToken = TypeCompiler.Compile(DataverseTokenSchema)

export const EntitySetSchema = Type.Object({
  '@odata.context': Type.String(),
  value: Type.Array(
    Type.Object({
      name: Type.String(),
      kind: Type.String(),
      url: Type.String(),
    }),
  ),
})
export type EntitySet = Static<typeof EntitySetSchema>
export const CEntitySet = TypeCompiler.Compile(EntitySetSchema)

export const legacyFields = Type.Object({
  _stageid_value: Type.Optional(Nullable(Type.String())),
  processid: Type.Optional(Nullable(Type.String())),
  traversedpath: Type.Optional(Nullable(Type.String())),
})

export const businessUnitSchema = Type.Object({})

export const commonFields = Type.Object({
  '@odata.etag': Type.Optional(Type.String()),
  importsequencenumber: Type.Optional(Nullable(Numeric())),
  utcconversiontimezonecode: Type.Optional(Nullable(Type.String())),
  statecode: Type.Optional(Type.Number()),
  'statecode@OData.Community.Display.V1.FormattedValue': Type.Optional(
    Type.String(),
  ),
  _owningteam_value: Type.Optional(Nullable(Type.String())),
  '_owningteam_value@OData.Community.Display.V1.FormattedValue': Type.Optional(
    Type.String(),
  ),
  _createdby_value: Type.Optional(Nullable(Type.String())),
  '_createdby_value@OData.Community.Display.V1.FormattedValue': Type.Optional(
    Type.String(),
  ),
  statuscode: Type.Optional(Type.Number()),
  'statuscode@OData.Community.Display.V1.FormattedValue': Type.Optional(
    Type.String(),
  ),
  _owninguser_value: Type.Optional(Nullable(Type.String())),
  '_owninguser_value@OData.Community.Display.V1.FormattedValue': Type.Optional(
    Type.String(),
  ),
  _modifiedonbehalfby_value: Type.Optional(Nullable(Type.String())),
  '_modifiedonbehalfby_value@OData.Community.Display.V1.FormattedValue':
    Type.Optional(Type.String()),
  _owningbusinessunit_value: Type.Optional(Nullable(Type.String())),
  '_owningbusinessunit_value@OData.Community.Display.V1.FormattedValue':
    Type.Optional(Type.String()),
  overriddencreatedon: Type.Optional(Nullable(Type.String())),
  createdon: Type.Optional(Type.String()),
  timezoneruleversionnumber: Type.Optional(Nullable(Type.Number())),
  _ownerid_value: Type.Optional(Type.String()),
  '_ownerid_value@OData.Community.Display.V1.FormattedValue': Type.Optional(
    Type.String(),
  ),
  versionnumber: Type.Optional(Nullable(Type.Number())),
  _createdonbehalfby_value: Type.Optional(Nullable(Type.String())),
  '_createdonbehalfby_value@OData.Community.Display.V1.FormattedValue':
    Type.Optional(Type.String()),
  modifiedon: Type.Optional(Type.String()),
  _modifiedby_value: Type.Optional(Nullable(Type.String())),
  '_modifiedby_value@OData.Community.Display.V1.FormattedValue': Type.Optional(
    Type.String(),
  ),
  owningbusinessunit: Type.Optional(businessUnitsInnerSchema),
})

export const commonFieldsFormattedSchema = Type.Object({
  importsequencenumber: Type.Optional(Nullable(Numeric())),
  utcconversiontimezonecode: Type.Optional(Nullable(Type.String())),
  statecode: Type.Optional(Type.String()),
  _owningteam_value: Type.Optional(Nullable(Type.String())),
  _createdby_value: Type.Optional(Nullable(Type.String())),
  statuscode: Type.Optional(Type.String()),
  _owninguser_value: Type.Optional(Nullable(Type.String())),
  _modifiedonbehalfby_value: Type.Optional(Nullable(Type.String())),
  _owningbusinessunit_value: Type.Optional(Nullable(Type.String())),
  overriddencreatedon: Type.Optional(Nullable(Type.String())),
  createdon: Type.Optional(Type.String()),
  timezoneruleversionnumber: Type.Optional(Nullable(Type.Number())),
  _ownerid_value: Type.Optional(Type.String()),
  versionnumber: Type.Optional(Nullable(Type.Number())),
  _createdonbehalfby_value: Type.Optional(Nullable(Type.String())),
  modifiedon: Type.Optional(Type.String()),
  _modifiedby_value: Type.Optional(Nullable(Type.String())),
  owningbusinessunit: Type.Optional(businessUnitsInnerSchema),
})

export const genericResponseSchema = Type.Object({
  '@odata.context': Type.String(),
  value: Type.Array(
    Type.Intersect([
      legacyFields,
      commonFields,
      Type.Record(Type.String(), Type.Unknown()),
    ]),
  ),
  '@odata.nextLink': Type.Optional(Type.String()),
})
export type GenericResponse = Static<typeof genericResponseSchema>
export const CGenericResponse = TypeCompiler.Compile(genericResponseSchema)
