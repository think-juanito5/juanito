import { clientConfig } from '@dbc-tech/datalake'
import { Elysia } from 'elysia'
import { Pool } from 'pg'

export const pgPoolDatalake = new Pool(clientConfig)

export const datalakeDb = new Elysia().decorate('datalakeDb', pgPoolDatalake)
