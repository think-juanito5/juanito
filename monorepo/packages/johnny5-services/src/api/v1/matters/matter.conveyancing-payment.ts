import { datalakeQuery } from '@dbc-tech/datalake'
import { ccaPaymentFormSchema } from '@dbc-tech/johnny5/typebox'
import {
  authHeaderSchema,
  unauthorizedSchema,
} from '@dbc-tech/johnny5/typebox/http.schema'
import { Elysia, t } from 'elysia'
import { serializeError } from 'serialize-error'
import { appContext } from '../../plugins/app-context.plugin'
import { datalakeDb } from '../../plugins/db.datalake.plugin'

export const cca_conveyancing_payment = new Elysia({
  prefix: '/:id/payment',
})
  .use(appContext({ authorize: async ({ tenant }) => tenant === 'CCA' }))
  .use(datalakeDb)
  .get(
    '',
    async ({ params: { id }, ctx: { logger }, datalakeDb, status }) => {
      await logger.info(`Retrieving conveyancing payment for Matter ID: ${id}`)

      let clientDL
      try {
        clientDL = await datalakeDb.connect()

        if (!clientDL) {
          await logger.error('Failed to connect to Datalake')
          return status(500, 'Failed to connect to Datalake')
        }
        await logger.info(`Connected to Datalake for Matter ID: ${id}`)

        const dlQuery = datalakeQuery(clientDL)
        const conveyancingPayment =
          await dlQuery.conveyancingPayment.findByMatterId(id)

        if (!conveyancingPayment)
          return status(404, 'No conveyancing payment found')

        await logger.info(`Conveyancing payment found`)

        return {
          matter_id: id,
          matter_reference: conveyancingPayment.matterReference || '',
          customer_token: conveyancingPayment.customerToken || '',
          customer_name: conveyancingPayment.customerName || '',
          payment_method_token: conveyancingPayment.paymentMethodToken || '',
          amount: Number(conveyancingPayment.amount) || 0,
          email: conveyancingPayment.email || '',
          invoice_number: conveyancingPayment.invoiceNumber || '',
          payment_type: conveyancingPayment.paymentType || '',
        }
      } catch (error) {
        await logger.error(
          `Failed to process cca matter payment for Matter ID:${id}`,
          serializeError(error),
        )
        return status(500, 'Internal Server Error')
      } finally {
        clientDL?.release()
      }
    },
    {
      headers: authHeaderSchema,
      params: t.Object({
        id: t.Integer(),
      }),
      response: {
        200: ccaPaymentFormSchema,
        401: unauthorizedSchema,
        404: t.String(),
        500: t.String(),
      },
      detail: {
        summary: 'Get Conveyancing Payment',
        tags: ['Johnny5', 'Matters', 'Conveyancing Payment'],
      },
    },
  )
