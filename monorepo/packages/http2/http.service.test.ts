import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test'
import { ConsoleLogger } from '@dbc-tech/logger'
import { http, HttpResponse } from 'msw'
import { SetupServerApi, setupServer } from 'msw/node'
import { HttpService, errorFrom } from './http.service'

describe('auth', () => {
  const baseUrl = 'https://auth.dbc.example'
  const logger = ConsoleLogger()
  let server: SetupServerApi

  const auth = async (apikey: string, retryStatusCodes?: number[]) => {
    const tokenService = new HttpService({
      baseUrl,
      logger,
      retryStatusCodes: retryStatusCodes ?? [401],
    })

    const result = await tokenService.post({
      path: '/v1/apikey',
      headers: {
        apikey,
      },
    })
    if (!result.ok) throw errorFrom(result.val)

    return result.val.data
  }

  const apiKeyHandler = ({ apiKey }: { apiKey: string }) =>
    http.post(`${baseUrl}/v1/apikey`, ({ request }) => {
      if (request.headers.get('apikey') !== apiKey)
        return new HttpResponse('Incorrect API key', { status: 401 })

      return HttpResponse.json({
        access_token: 'mocked_access_token',
      })
    })

  const flakyApiKeyHandler = ({
    apiKey,
    retries,
  }: { apiKey: string; retries: number }) =>
    http.post(`${baseUrl}/v1/apikey`, function* ({ request }) {
      if (request.headers.get('apikey') !== apiKey)
        return new HttpResponse('Incorrect API key', { status: 401 })

      let count = 0

      while (count < retries) {
        count++
        yield new HttpResponse(null, { status: 401 })
      }

      count++
      return HttpResponse.json({
        access_token: 'mocked_access_token',
      })
    })

  beforeAll(() => {
    server = setupServer()
    server.listen()
  })

  afterAll(() => {
    server.close()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  it('should return a token', async () => {
    server.use(apiKeyHandler({ apiKey: 'test' }))

    const response = await auth('test')

    expect(response).toEqual({
      access_token: 'mocked_access_token',
    })
  })

  it('should retry and return a token', async () => {
    server.use(flakyApiKeyHandler({ apiKey: 'test', retries: 2 }))

    const response = await auth('test')

    expect(response).toEqual({
      access_token: 'mocked_access_token',
    })
  })

  it('should fail after retries exhausted', async () => {
    server.use(flakyApiKeyHandler({ apiKey: 'test', retries: 4 }))

    expect(auth('test')).rejects.toThrow('Unauthorized')
  })

  it('should fail after first attempt when retryStatusCodes does not include 401', async () => {
    server.use(flakyApiKeyHandler({ apiKey: 'test', retries: 4 }))

    expect(
      auth('wrong', [408, 409, 425, 429, 500, 502, 503, 504]),
    ).rejects.toThrow('Unauthorized')
  })
})
