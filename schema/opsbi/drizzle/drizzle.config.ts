import { defineConfig } from 'drizzle-kit'
export default defineConfig({
  driver: 'pg',
  schema: './schema/*',
  out: './schema-files',
  dbCredentials: {
    host: process.env.POSTGRES_HOST!,
    port: +process.env.POSTGRES_PORT!,
    database: process.env.POSTGRES_DB!,
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
  },
  verbose: true,
  strict: true,
})
