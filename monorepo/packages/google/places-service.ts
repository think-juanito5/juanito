import { PlacesClient } from '@googlemaps/places'
import { JWT } from 'google-auth-library'
import { Err, Ok } from 'ts-results-es'

export type PlacesServiceConfig = {
  apiKey: string
}
export class PlacesService {
  private client: PlacesClient

  constructor(config: PlacesServiceConfig) {
    const authClient = new JWT()
    authClient.fromAPIKey(config.apiKey)

    this.client = new PlacesClient({ authClient })
  }

  /**
   * @param fullAddress The full address to search for.
   * @returns A promise that resolves to an `Ok` result containing the search response if successful, or an `Err` result with an error message if search fails or the API returns no response.
   */
  async search(fullAddress: string) {
    const request = {
      textQuery: fullAddress,
    }

    try {
      const response = await this.client.searchText(request)
      return response ? Ok(response) : Err('No response from Google Places API')
    } catch (error) {
      return Err(
        `Error searching for address: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
