import { ContractDataModel } from '../schema'

export type ContractDataQuery = typeof ContractDataQuery
/**
 * Creates a MongoDB query accessor for managing Files.
 * @returns An object with methods for creating and counting Files.
 */
/**
 * ContractDataQuery provides methods to interact with contract data in the MongoDB database.
 */
export const ContractDataQuery = {
  /**
   * Retrieves all contract data items for a given file ID.
   * @param fileId - The ID of the file to retrieve contract data items for.
   * @param tenant - The ID of the file to retrieve contract data items for.
   * @returns A promise that resolves to an array of contract data items.
   */
  getContractDataItems: async (tenant: string, fileId: string) => {
    const query = await ContractDataModel.findOne({
      tenant,
      fileId,
    }).exec()

    return query
  },
}
