import { Elysia } from 'elysia'

export const health = new Elysia()
  .get('/startup', () => 'OK') // Startup probe
  .get('/healthz', () => 'OK') // Liveness probe
  .get('/ready', () => 'OK') // Readiness probe (should contain all dependency checks including database connections)
  .get('/version', () => process.env.APP_VERSION) // Version endpoint
