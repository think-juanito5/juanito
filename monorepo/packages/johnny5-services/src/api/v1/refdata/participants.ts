import {
  ParticipantQuery,
  mapRefdataParticipant,
} from '@dbc-tech/johnny5-mongodb'
import { idStringSchema } from '@dbc-tech/johnny5/typebox'
import {
  ParticipantCreate,
  ParticipantUpdate,
  participantSchema,
} from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { appContext } from '../../plugins/app-context.plugin'

export const participants = new Elysia({
  prefix: '/participants',
})
  .use(appContext())
  .post(
    '',
    async ({ body, ctx: { jwt } }) => {
      const participant = await ParticipantQuery.createParticipant({
        ...body,
        tenant: jwt.tenant,
      })
      return participant.id
    },
    {
      headers: authHeaderSchema,
      body: ParticipantCreate,
      response: {
        200: t.String(),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary: 'Create a participant',
        tags: ['Participants'],
      },
    },
  )
  .get(
    '',
    async ({ query, ctx: { jwt } }) => {
      const response = await ParticipantQuery.getAll(
        jwt.tenant,
        query.category,
        query.participant_id,
      )
      return response.map(mapRefdataParticipant)
    },
    {
      headers: authHeaderSchema,
      query: t.Object({
        category: t.Optional(t.String()),
        participant_id: t.Optional(t.Number()),
      }),
      response: {
        200: t.Array(participantSchema),
        400: t.String(),
        401: unauthorizedSchema,
      },
      detail: {
        summary:
          'Get all participants with matching category and/or participant_id',
        tags: ['Johnny5', 'Refdata', 'Participants'],
      },
    },
  )
  .get(
    ':id',
    async ({ params: { id }, ctx: { jwt }, status }) => {
      const response = await ParticipantQuery.getParticipantById(id, jwt.tenant)
      if (!response) {
        return status(404, `Participant with id ${id} not found`)
      }
      return {
        ...response,
        id: response._id.toString(),
      }
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        200: participantSchema,
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Get a participant by id',
        tags: ['Johnny5', 'Refdata', 'Participants'],
      },
    },
  )
  .put(
    ':id',
    async ({
      body: ParticipantUpdate,
      ctx: { jwt },
      params: { id },
      set,
      status,
    }) => {
      const updatedParticipant = await ParticipantQuery.updateParticipantById(
        id,
        jwt.tenant,
        ParticipantUpdate,
      )
      if (updatedParticipant) {
        set.status = 204
        return
      }
      return status(404, `Participant with id ${id} not found`)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      body: ParticipantUpdate,
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Update a participant by id',
        tags: ['Johnny5', 'Refdata', 'Participants'],
      },
    },
  )
  .delete(
    ':id',
    async ({ params: { id }, ctx: { jwt }, set, status }) => {
      const response = await ParticipantQuery.deleteParticipantById(
        id,
        jwt.tenant,
      )
      if (response) {
        set.status = 204
        return
      }
      return status(404, `Participant with id ${id} not found`)
    },
    {
      headers: authHeaderSchema,
      params: idStringSchema,
      response: {
        204: t.Void(),
        401: unauthorizedSchema,
        404: t.String(),
      },
      detail: {
        summary: 'Delete a participant by id',
        tags: ['Johnny5', 'Refdata', 'Participants'],
      },
    },
  )
