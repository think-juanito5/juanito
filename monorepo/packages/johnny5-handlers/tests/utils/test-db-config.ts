import type { ClientConfig } from 'pg'

export const testDbConfig: ClientConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'test',
  ssl: false,
}
