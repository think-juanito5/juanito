import { RefdataContractDataModel } from '../schema'

export type RefdataContractDataQuery = typeof RefdataContractDataQuery
/**
 * Creates a MongoDB query accessor for managing Files.
 * @returns An object with methods for retrieving records.
 */
/**
 * RefdataContractDataQuery provides methods to interact with ref contract data in the MongoDB database.
 */
export const RefdataContractDataQuery = {
  /**
   * Retrieves all ref contract data items for a given tenant.
   * @param tenant - The tenant of the file to retrieve ref contract data items for.
   * @param tag - The tag that identifies the service type.
   * @returns A promise that resolves to an array of ref contract data items.
   */
  getRefdataContractData: async (tenant: string, tags: string[]) => {
    const q = RefdataContractDataModel.find({
      tenant,
    }).where('tags', {
      $all: tags,
    })
    return await q.lean().exec()
  },
}
