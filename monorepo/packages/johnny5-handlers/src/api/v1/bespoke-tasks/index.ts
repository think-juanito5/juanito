import Elysia from 'elysia'
import { start } from './1.start'
import { manifest_create } from './2.manifest-create'
import { matter_complete_tasks } from './3.matter-complete-tasks'
import { matter_populate_data_fields } from './4.matter-populate-data-fields'
import { matter_upload_files } from './5.matter-upload-files'
import { matter_create_tasks } from './6.matter-create-tasks'
import { matter_populate_filenotes } from './7.matter-populate-filenotes'
import { matter_send_emails } from './8.matter-send-emails'

export const index = new Elysia({ prefix: '/bespoke-tasks' })
  .use(start)
  .use(manifest_create)
  .use(matter_complete_tasks)
  .use(matter_populate_data_fields)
  .use(matter_upload_files)
  .use(matter_create_tasks)
  .use(matter_populate_filenotes)
  .use(matter_send_emails)
