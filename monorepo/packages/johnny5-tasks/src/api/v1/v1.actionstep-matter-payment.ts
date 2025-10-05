import {
  type InsertConveyancingPaymentSchema,
  datalakeQuery,
} from '@dbc-tech/datalake'
import { J5Config, ccaPaymentFormSchema, getValue } from '@dbc-tech/johnny5'
import { dbTimestampMelbourne } from '@dbc-tech/johnny5/utils'
import { serializeError } from 'serialize-error'
import { pgPoolDatalake } from '../plugins/db.datalake.plugin'
import { handlerStatus, taskHandler } from '../plugins/task-handler-plugin'

export const v1_actionstep_matter_payment = taskHandler({
  path: '/actionstep-matter-payment',
  handler: async ({ ctx }) => {
    const {
      logger,
      file: { actionStepMatterId },
      task: { meta },
      johnny5Config,
    } = ctx

    if (!actionStepMatterId) {
      return handlerStatus.fail(
        `File does not have actionStepMatterId: ${actionStepMatterId}`,
      )
    }

    await logger.info(
      `Starting CcaMatterPayment for File actionStepMatterId:${actionStepMatterId} debug notifications:`,
    )

    const sourceId = await johnny5Config.getString(
      J5Config.cca.ccaPayment.datalakeSourceId,
    )
    if (!sourceId) {
      await logger.error(
        `AZ Setting: ${J5Config.cca.ccaPayment.datalakeSourceId} is not set, skipping datalake insertion`,
      )
      return handlerStatus.fail(
        `AZ Setting: ${J5Config.cca.ccaPayment.datalakeSourceId} is not set, skipping datalake insertion`,
      )
    }

    if (!meta) {
      return handlerStatus.fail('No meta provided')
    }

    const paymentDetails = getValue(
      meta,
      'paymentDetails',
      ccaPaymentFormSchema,
    )
    if (!paymentDetails) {
      return handlerStatus.fail('No paymentDetails found in task metadata')
    }

    let clientDL
    try {
      await logger.info(
        `Processing CcaMatterPayment for Matter ID: ${actionStepMatterId}`,
      )

      clientDL = await pgPoolDatalake.connect()
      if (!clientDL) {
        return handlerStatus.fail('Datalake client not available')
      }
      const dlQuery = datalakeQuery(clientDL)

      const inputResponse = await dlQuery.dataInput.insertData({
        sourceId: +sourceId,
        data: paymentDetails,
        status: 'N',
        isTest: false,
        created: dbTimestampMelbourne(),
        updated: dbTimestampMelbourne(),
      })

      if (!inputResponse) {
        throw new Error(
          `Error creating DataInput for Matter ID: ${actionStepMatterId}`,
        )
      }

      await logger.info(
        `Created DataInput in Datalake for Matter ID: ${actionStepMatterId}, DataInput ID: ${inputResponse}`,
      )

      const updateDataInputStart = {
        status: 'P', // started processing
        startedProcessing: dbTimestampMelbourne(),
        updated: dbTimestampMelbourne(),
      }
      await dlQuery.dataInput.update(inputResponse, updateDataInputStart)

      const conveyancingPayment: InsertConveyancingPaymentSchema = {
        matterId: actionStepMatterId,
        matterReference: paymentDetails.matter_reference,
        customerToken: paymentDetails.customer_token,
        customerName: paymentDetails.customer_name,
        paymentMethodToken: paymentDetails.payment_method_token,
        amount: String(paymentDetails.amount),
        email: paymentDetails.email,
        invoiceNumber: paymentDetails.invoice_number,
        paymentType: paymentDetails.payment_type,
        dataId: inputResponse,
        created: dbTimestampMelbourne(),
      }

      const conveyancingPaymentID =
        await dlQuery.conveyancingPayment.insert(conveyancingPayment)

      if (!conveyancingPaymentID) {
        throw new Error(
          `Error inserting ConveyancingPayment for Matter ID: ${actionStepMatterId}`,
        )
      }

      await logger.info(
        `Inserted ConveyancingPayment with ID: ${conveyancingPaymentID}`,
      )

      const updateDataInputProcessingComplete = {
        status: 'S', // completed
        completedProcessing: dbTimestampMelbourne(),
        updated: dbTimestampMelbourne(),
      }
      await dlQuery.dataInput.update(
        inputResponse,
        updateDataInputProcessingComplete,
      )

      await logger.info(
        `Completed CcaMatterPayment for Matter ID: ${actionStepMatterId}`,
      )
      return handlerStatus.success()
    } catch (error) {
      await logger.warn(
        `Failed to process cca matter payment for matter:${actionStepMatterId}`,
        serializeError(error),
      )
      return handlerStatus.fail(
        `Failed to process cca matter payment for matter:${actionStepMatterId}`,
      )
    } finally {
      clientDL?.release()
    }
  },
})
