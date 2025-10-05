import { Elysia } from 'elysia'
import { actionfolders } from './actionfolders'
import { actionparticipants } from './actionparticipants'
import { actions } from './actions'
import { actiontypeparticipanttypes } from './actiontypeparticipanttypes'
import { actiontypes } from './actiontypes'
import { datacollectionfields } from './datacollectionfields'
import { datacollectionrecords } from './datacollectionrecords'
import { datacollectionrecordvalues } from './datacollectionrecordvalues'
import { datacollections } from './datacollections'
import { filenotes } from './filenotes'
import { participantdatafieldvalues } from './participantdatafieldvalues'
import { participantdefaulttypes } from './participantdefaulttypes'
import { participants } from './participants'
import { participanttypedatafields } from './participanttypedatafields'
import { participanttypes } from './participanttypes'
import { resthooks } from './resthooks'
import { steps } from './steps'
import { tasks } from './tasks'
import { uploaddocument } from './uploaddocument'
import { users } from './users'

export const actionstep = new Elysia({ prefix: '/actionstep' })
  .use(actions)
  .use(actionfolders)
  .use(actionparticipants)
  .use(actiontypes)
  .use(actiontypeparticipanttypes)
  .use(datacollections)
  .use(datacollectionfields)
  .use(datacollectionrecords)
  .use(datacollectionrecordvalues)
  .use(filenotes)
  .use(participants)
  .use(participantdatafieldvalues)
  .use(participantdefaulttypes)
  .use(participanttypedatafields)
  .use(participanttypes)
  .use(resthooks)
  .use(steps)
  .use(tasks)
  .use(uploaddocument)
  .use(users)
