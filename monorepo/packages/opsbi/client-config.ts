import type { ClientConfig } from 'pg'

export const clientConfig: ClientConfig = {
  host: process.env.OPSBI_POSTGRES_HOST!,
  port: +process.env.OPSBI_POSTGRES_PORT!,
  user: process.env.OPSBI_POSTGRES_USER!,
  password: process.env.OPSBI_POSTGRES_PASSWORD!,
  database: process.env.OPSBI_POSTGRES_DB!,
  ssl:
    process.env.POSTGRES_DISABLE_SSL === 'true'
      ? false
      : { rejectUnauthorized: false },
}
