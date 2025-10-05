import { type Static, Type } from '@sinclair/typebox'
import { selectedPlanSchema } from './common.schema'

export type UpdateQuoteContractBlob = Static<
  typeof updateQuoteContractBlobSchema
>
export const updateQuoteContractBlobSchema = Type.Object({
  /**
   * The blob name containing the linked contract
   * @type {string}
   */
  blobName: Type.String(),
})

export type UpdateQuoteSelectPlan = Static<typeof updateQuoteSelectPlanSchema>
export const updateQuoteSelectPlanSchema = Type.Object({
  /**
   * The selected plan associated with the quote
   * @type {SelectedPlan}
   */
  plan: selectedPlanSchema,
})
