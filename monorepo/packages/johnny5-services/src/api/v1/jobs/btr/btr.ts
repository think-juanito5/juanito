import { Elysia } from 'elysia'
import { btr_contract_validate } from './jobs.btr-contract-validate'

export const btr = new Elysia().use(btr_contract_validate)
