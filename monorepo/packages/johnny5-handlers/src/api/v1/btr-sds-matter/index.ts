import Elysia from 'elysia'
import { create } from './create'
import { manifest_create } from './manifest-create'
import { populate_data_collections } from './populate-data-collections'
import { populate_filenotes } from './populate-filenotes'
import { populate_files } from './populate-files'
import { populate_participants } from './populate-participants'
import { populate_stepchange } from './populate-stepchange'
import { start } from './start'

export const index = new Elysia({ prefix: '/btr-sds-matter' })
  .use(start)
  .use(create)
  .use(manifest_create)
  .use(populate_participants)
  .use(populate_data_collections)
  .use(populate_filenotes)
  .use(populate_files)
  .use(populate_stepchange)
