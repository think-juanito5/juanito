import Elysia from 'elysia'
import { manifest_create } from './manifest-create'
import { matter_populate_data_collections } from './matter-populate-data-collections'
import { matter_populate_filenotes } from './matter-populate-filenotes'
import { matter_populate_files } from './matter-populate-files'
import { matter_populate_participants } from './matter-populate-participants'
import { matter_populate_tasks } from './matter-populate-tasks'
import { start } from './start'

export const index = new Elysia({ prefix: '/btr-contract-drop' })
  .use(start)
  .use(manifest_create)
  .use(matter_populate_participants)
  .use(matter_populate_data_collections)
  .use(matter_populate_filenotes)
  .use(matter_populate_tasks)
  .use(matter_populate_files)
