import { clientConfig } from '@dbc-tech/opsbi'
import { Elysia } from 'elysia'
import { Pool } from 'pg'

export const pgPoolOpsbi = new Pool(clientConfig)

export const opsbi = new Elysia().decorate('opsbi', pgPoolOpsbi)
