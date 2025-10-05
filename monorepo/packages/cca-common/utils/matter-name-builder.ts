import { type AustralianState } from '@dbc-tech/johnny5/typebox'
import type { ManifestMeta } from '@dbc-tech/johnny5/typebox/manifest-meta.schema'
import { type Intent } from '@dbc-tech/johnny5/utils'

export type AdditionalInfoTypes =
  | 'Conveyance'
  | 'Drafting'
  | 'Review'
  | 'Self-service Review'
  | 'Seller disclosure statement'

export type EntityMatterNameParams = {
  isCompany: boolean
  companyName?: string
  lastName?: string
  state: AustralianState
  intent: Intent
  matterId: number
  roleInitials?: string
  additionalInfo?: AdditionalInfoTypes
  testMode: boolean
}

export enum MatterNamingMethod {
  ContractDrafting = 'Contract Drafting',
  ContractReview = 'Contract Review',
  PreSettlement = 'Pre-Settlement',
  Initial = 'Initial Stage',
  SellerDisclosureStatement = 'Seller Disclosure Statement',
}

/**
 * A utility class for constructing formatted matter names based on metadata and naming methods.
 *
 * The `MatterNameBuilder` class provides a fluent API for creating and formatting matter names
 * using metadata and specific naming conventions. It supports immutability and method chaining
 * for ease of use.
 *
 * ### Usage
 *
 * - Use `MatterNameBuilder.fromMeta(meta)` to create an instance from existing metadata.
 * - Use `MatterNameBuilder.fromData(params)` to create an instance from structured input parameters.
 * - Chain the `withMethod(method)` method to specify a naming method.
 * - Call `build()` to generate the formatted matter name string.
 *
 * ### Example
 *
 * ```typescript
 * const builder = MatterNameBuilder.fromData({
 *   isCompany: true,
 *   companyName: "Example Company",
 *   lastName: "Doe",
 *   state: "NSW",
 *   intent: "sell",
 *   matterId: 12345,
 *   roleInitials: "JD",
 *   testMode: false,
 * });
 *
 * const matterName = builder
 *   .withMethod(MatterNamingMethod.ContractDrafting)
 *   .build();
 *
 * console.log(matterName); // Outputs: "NSW-SELL-EXAMPLE COMPANY-DRAFT-12345"
 * ```
 *
 * ### Naming Format
 *
 * The generated matter name follows this format:
 * `[PREFIX][STATE]-[INTENT]-[ENTITY_NAME]-[STEP_CODE]-[MATTER_ID]`
 *
 * - `PREFIX`: Optional, "TEST-" if `testMode` is true.
 * - `STATE`: The Australian state, derived from metadata.
 * - `INTENT`: The intent, either "sell" or another value, derived from metadata.
 * - `ENTITY_NAME`: The company name (truncated to 20 characters) if `isCompany` is true, otherwise the last name.
 * - `STEP_CODE`: Determined by `roleInitials` or the `namingMethod`:
 *   - `ContractDrafting`: "DRAFT"
 *   - `ContractReview`: "REVIEW"
 *   - `PreSettlement`: Throws an error if `roleInitials` is missing.
 *   - Default: "DRAFT" for "sell" intent, otherwise "REVIEW".
 * - `MATTER_ID`: The numeric matter ID, derived from metadata.
 *
 * ### Error Handling
 *
 * - Throws an error if required metadata fields (`state`, `intent`, or `matterId`) are missing or invalid.
 * - Throws an error if `namingMethod` is `PreSettlement` and `roleInitials` is not provided.
 */
export class MatterNameBuilder {
  private readonly meta: ReadonlyArray<ManifestMeta>
  private namingMethod?: MatterNamingMethod

  private constructor(meta: ManifestMeta[]) {
    // Ensure immutability
    this.meta = meta.map(({ key, value }) => ({ key, value }))
  }

  /**
   * Factory for existing meta values
   * Creates a new instance of `MatterNameBuilder` using the provided metadata.
   *
   * @param meta - An array of `ManifestMeta` objects that contain the metadata
   *               required to build the matter name.
   * @returns A new instance of `MatterNameBuilder`.
   */
  static fromMeta(meta: ManifestMeta[]): MatterNameBuilder {
    return new MatterNameBuilder(meta)
  }

  /**
   * Factory for high-level structured input
   * Creates an instance of `MatterNameBuilder` from the provided `EntityMatterNameParams`.
   *
   * @param params - The parameters of type `EntityMatterNameParams` used to create the metadata for the builder.
   * @returns A new instance of `MatterNameBuilder` initialized with metadata created from the provided parameters.
   */
  static fromData(params: EntityMatterNameParams): MatterNameBuilder {
    return new MatterNameBuilder(MatterNameBuilder.createMetaFromData(params))
  }

  /**
   * Sets the naming method to be used for building matter names.
   *
   * @param method - The naming method to be applied.
   * @returns The current instance to allow method chaining.
   */
  withMethod(method: MatterNamingMethod): this {
    this.namingMethod = method
    return this
  }

  build(): string {
    const metaMap = new Map(this.meta.map(({ key, value }) => [key, value]))

    const state = metaMap.get('state') as AustralianState | undefined
    const intent = metaMap.get('intent') as Intent | undefined
    const companyName = metaMap.get('companyName')
    const lastName = metaMap.get('lastName')
    const isCompany = metaMap.get('isCompany') === 'true'
    const matterId = Number(metaMap.get('matterId'))
    const testMode = metaMap.get('testMode') === 'true'
    const roleInitials = metaMap.get('roleInitials')
    const additionalInfo = metaMap.get('additionalInfo') as
      | AdditionalInfoTypes
      | undefined

    if (!state || !intent || isNaN(matterId)) {
      throw new Error(
        `Missing required meta fields: state, intent, or matterId`,
      )
    }

    const entityName = isCompany
      ? (companyName?.slice(0, 20) ?? '')
      : (lastName ?? '')

    const prefix = testMode ? 'TEST-' : ''

    let stepCode = roleInitials

    switch (this.namingMethod) {
      case MatterNamingMethod.ContractDrafting:
        stepCode = 'DRAFT'
        break
      case MatterNamingMethod.ContractReview:
        stepCode = 'REVIEW'
        break
      case MatterNamingMethod.SellerDisclosureStatement:
        stepCode = 'SDS'
        break
      case MatterNamingMethod.PreSettlement:
        {
          if (!roleInitials) {
            throw new Error(`Missing roleInitials for Pre-Settlement`)
          }
        }
        break

      default: {
        //init value
        if (!additionalInfo) {
          stepCode = intent === 'sell' ? 'DRAFT' : 'REVIEW'
        } else {
          if (additionalInfo === 'Conveyance' && !roleInitials) {
            throw new Error(`Missing roleInitials for Conveyance`)
          }

          stepCode = (() => {
            if (additionalInfo === 'Drafting') return 'DRAFT'
            if (
              ['Review', 'Self-service Review'].includes(additionalInfo ?? '')
            )
              return 'REVIEW'
            if (additionalInfo === 'Conveyance') return roleInitials
            if (additionalInfo === 'Seller disclosure statement') return 'SDS'
            return ''
          })()
        }
      }
    }

    return `${prefix}${state}-${intent}-${entityName}-${stepCode}-${matterId}`.toUpperCase()
  }

  /**
   * Creates an array of `ManifestMeta` objects from the provided `EntityMatterNameParams`.
   * Each key-value pair in the `params` object is transformed into a `ManifestMeta` object.
   * Optional properties like `roleInitials` and `additionalInfo` are included only if they are defined.
   *
   * @param params - The parameters used to generate the metadata.
   * @param params.isCompany - Indicates whether the entity is a company.
   * @param params.companyName - The name of the company (if applicable).
   * @param params.lastName - The last name of the individual (if applicable).
   * @param params.state - The state associated with the entity.
   * @param params.intent - The intent or purpose of the matter.
   * @param params.matterId - The unique identifier for the matter.
   * @param params.roleInitials - The initials of the role (optional).
   * @param params.testMode - Indicates whether the operation is in test mode.
   * @param params.additionalInfo - Additional information about the matter (optional).
   *
   * @returns An array of `ManifestMeta` objects representing the metadata.
   */
  private static createMetaFromData(
    params: EntityMatterNameParams,
  ): ManifestMeta[] {
    const {
      isCompany,
      companyName,
      lastName,
      state,
      intent,
      matterId,
      roleInitials,
      testMode,
      additionalInfo,
    } = params

    const meta: ManifestMeta[] = [
      { key: 'isCompany', value: String(isCompany) },
      { key: 'companyName', value: companyName ?? '' },
      { key: 'lastName', value: lastName ?? '' },
      { key: 'state', value: state },
      { key: 'intent', value: intent },
      { key: 'matterId', value: matterId.toString() },
      { key: 'testMode', value: String(testMode) },
    ]

    if (roleInitials) {
      meta.push({ key: 'roleInitials', value: roleInitials })
    }
    if (additionalInfo) {
      meta.push({ key: 'additionalInfo', value: additionalInfo })
    }

    return meta
  }
}
