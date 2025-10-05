import { JobModel } from '../schema'

/**
 * Sets or updates a metadata value for a job document in the database.
 *
 * If a meta entry with the specified key exists for the job, its value is updated.
 * If no such entry exists, a new meta entry is pushed to the job's meta array.
 *
 * @param {string} jobId - The ID of the job document to update.
 * @param {string} key - The metadata key to set or update.
 * @param {string} value - The value to assign to the metadata key.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
export async function setValue(
  jobId: string,
  key: string,
  value: string,
): Promise<void> {
  // Try to update first
  const updateResult = await JobModel.updateOne(
    { _id: jobId, 'meta.key': key },
    {
      $set: {
        'meta.$.value': value,
      },
    },
  )

  // If no document was modified, push a new meta entry
  if (updateResult.modifiedCount === 0) {
    await JobModel.updateOne(
      { _id: jobId },
      {
        $push: {
          meta: {
            key: key,
            value: value,
          },
        },
      },
    )
  }
}
