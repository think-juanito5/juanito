import { type Johnny5Client, johnny5Client } from '../../packages/johnny5-sdk/johnny5.client'
import { ConsoleLogger } from '@dbc-tech/logger'

const { btr } = johnny5Client({
  authBaseUrl: process.env['AUTH_BASE_URL']!,
  authApiKey: process.env['BTR_API_KEY']!,
  baseUrl: process.env['CCA_SERVICES_BASE_URL']!,
  logger: ConsoleLogger(),
})

const getMatterDetails = async (matterId: number) => {
  const matterDetails = await btr.payments.getMatterDetails(matterId.toString())
  console.log('Matter Details:', matterDetails)
  return matterDetails
}

const testMain = async () => {
  console.log('Starting testMain...')  
  await getMatterDetails(273618)
}

testMain().catch((err) => {
  console.error('Error in testMain', err)
  process.exit(1)
})
