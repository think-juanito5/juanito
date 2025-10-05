import { ContractDataValidationModel } from '@dbc-tech/johnny5-mongodb'

export type CorrectionDataQuery = typeof CorrectionDataQuery
/**
 * Creates a MongoDB query accessor for managing Files.
 * @returns An object with methods for creating and counting Files.
 */
/**
 * CorrectionDataQuery provides methods to interact with correction contract data in the MongoDB database.
 */
export const CorrectionDataQuery = {
  /**
   * Retrieves all correction data items for a given file ID.
   * @param fileId - The ID of the file to retrieve correction data items for.
   * @param tenant
   * @returns A promise that resolves to an array of correction data items.
   */
  getCorrectionDataItems: async (tenant: string, fileId: string) => {
    const query = await ContractDataValidationModel.findOne({
      tenant,
      fileId,
    }).exec()

    return query
  },
}
