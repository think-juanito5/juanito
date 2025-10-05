import { Pool, type PoolClient } from 'pg'

/**
 * Connects to the database using the provided pool and sets the timezone to 'Australia/Melbourne'.
 * @param {Pool} pool - The database connection pool.
 * @returns {Promise<PoolClient>} - A promise that resolves to the connected client.
 */
export const melbourneConnect = async (pool: Pool): Promise<PoolClient> => {
  const client = await pool.connect()
  const tzCmd = "SET TIMEZONE TO 'Australia/Melbourne'"
  await client.query(tzCmd)
  return client
}
