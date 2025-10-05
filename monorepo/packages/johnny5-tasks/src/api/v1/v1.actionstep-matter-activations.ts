import { CCAActionStepService } from '@dbc-tech/actionstep'
import { HttpError } from '@dbc-tech/http'
import { serializeError } from 'serialize-error'
import { handlerStatus, taskHandler } from '../plugins/task-handler-plugin'

export const v1_actionstep_matter_activations = taskHandler({
  path: '/actionstep-matter-activations',
  handler: async ({ ctx }) => {
    const {
      logger,
      file: { actionStepMatterId },
      task: { meta, type, id: taskId, fileId },
    } = ctx
    if (!actionStepMatterId) {
      throw new Error('File does not have an Actionstep Matter Id')
    }
    if (!meta) {
      throw new Error('No meta provided')
    }

    let filenote
    if (meta.find((m) => m.key === 'filenote')) {
      filenote = meta.find((m) => m.key === 'filenote')!.value
    }
    if (!filenote) {
      throw new Error(`No ${type} reason provided`)
    }

    await logger.info(
      `Starting ${type} for File Id:${fileId}, Task Id:${taskId}, Matter Id:${actionStepMatterId}`,
    )

    const as = ctx.actionstep()
    const cca = new CCAActionStepService(as, logger)

    try {
      switch (type) {
        case 'matter-deactivation':
          await cca.deactivateMatter(actionStepMatterId)
          break
        case 'matter-reactivation':
          await cca.reactivateMatter(actionStepMatterId)
          break
        case 'matter-close':
          await cca.closeMatter(actionStepMatterId)
          break
        default:
          throw new Error(`Unknown type: ${type}`)
      }
      await logger.info(
        `Successfully processed ${type} for Matter:${actionStepMatterId} for File Id:${fileId}, Task Id:${taskId}`,
      )
      await as.createFileNote({
        filenotes: {
          text: filenote,
          links: { action: `${actionStepMatterId}` },
        },
      })
    } catch (e) {
      if (e instanceof HttpError) {
        if (e.status === 404) {
          await logger.warn(
            `Matter:${actionStepMatterId} is not found or deleted`,
          )
          return handlerStatus.ignore(
            `Matter:${actionStepMatterId} not found or deleted`,
          )
        }
      }

      const errJson = serializeError(e)
      await logger.error(
        `Failed to update Matter:${actionStepMatterId} for File Id:${fileId}, Task Id:${taskId}`,
        errJson,
      )

      throw e
    }

    return handlerStatus.success()
  },
})
