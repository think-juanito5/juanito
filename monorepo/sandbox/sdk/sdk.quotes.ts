import type { CcaRaqWebhook } from '@dbc-tech/johnny5'
import { quotesClient } from '@dbc-tech/johnny5-sdk'
import { ConsoleLogger } from '@dbc-tech/logger'

const {
  cca: { quotes },
} = quotesClient({
  authBaseUrl: process.env['AUTH_BASE_URL']!,
  authApiKey: process.env['CCA_RAQ_API_KEY']!,
  baseUrl: process.env['CCA_SERVICES_BASE_URL']!,
  logger: ConsoleLogger(),
})

const requestQuote = async () => {
  const raq: CcaRaqWebhook = {
    bst: 'S',
    cid: '',
    agent: 'Vincent Bowen',
    email: 'ignored2e@gmail.com',
    notes: 'Address:   || More Info:  || Referral ID# :  ',
    optIn: false,
    phone: '0400000001',
    state: 'QLD',
    utm_id: '12142393',
    channel: 'email',
    lastName: 'Ignored 2e',
    firstName: 'Ignored 2e',
    utm_medium: '',
    utm_source: 'Unknown',
    utm_content: 'concierge',
    propertyType: 'A',
    referralPage: 'https://localhost:3000',
    utm_campaign: '',
    sendEmailQuote: false,
    timeToTransact: 'NOW',
    sdsRequired: true,
    webhook_id: 'opkfewpoi3iohnjwegiopuj4',
  }

  const quote = await quotes.request(raq)
  // console.log('Created quote id:', quote.id)

  return quote
}

const getQuote = async (quoteId: string) => {
  const quote = await quotes.get(quoteId)
  // console.log('Retrieved quote:', quote)

  return quote
}

requestQuote().then(async (quote) => {
  console.log('Created quote:', quote)
  const fetchedQuote = await getQuote(quote.id)
  console.log('Fetched quote:', fetchedQuote)
}).catch((err) => {
  console.error('Error requesting quote', err)
  process.exit(1)
})
