import { Elysia } from 'elysia'
import { actionstep } from './actionstep'

export const v1 = new Elysia({ prefix: '/v1' }).use(actionstep)
