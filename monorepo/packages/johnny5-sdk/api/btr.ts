import { type HttpService, errorFrom } from '@dbc-tech/http2'
import {
  type BtrSdsAgentWebhook,
  CIdString,
  type IdString,
  type MatterDetails,
} from '@dbc-tech/johnny5/typebox'

export const btr = (httpService: HttpService) => {
  return {
    matters: {
      pexaAuditReady: async (actionId: number, taskId: number) => {
        const result = await httpService.post(
          {
            // TODO: change to /johnny5/v1/btr/matters/${actionId}/tasks/${taskId}/pexa-audit
            path: `/johnny5/v1/matters/${actionId}/tasks/${taskId}/pexa-audit`,
            body: { taskId },
          },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        if (result.val.status === 204) return null // No content, no Pexa Audit record created
        return result.val.data as IdString
      },
      pexaAuditFailedReady: async (actionId: number, taskId: number) => {
        const result = await httpService.post(
          {
            // TODO: change to /johnny5/v1/btr/matters/${actionId}/tasks/${taskId}/pexa-audit-failed-ready
            path: `/johnny5/v1/matters/${actionId}/tasks/${taskId}/pexa-audit-failed-ready`,
            body: { taskId },
          },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      pexaAuditFileNote: async (
        actionId: number,
        taskId: number,
        dataverseGuid: string,
        extra: string | undefined,
      ) => {
        const result = await httpService.post(
          {
            // TODO: change to /johnny5/v1/btr/matters/${actionId}/tasks/${taskId}/pexa-audit-filenote
            path: `/johnny5/v1/matters/${actionId}/tasks/${taskId}/pexa-audit-file-note`,
            body: { dataverseGuid, extra },
          },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
    },
    sds: {
      agentRegister: async (webhook: BtrSdsAgentWebhook): Promise<IdString> => {
        const result = await httpService.post(
          {
            // TODO: change to /johnny5/v1/btr/sds-agent-register
            path: `/johnny5/v1/btr-sds-agent-register`,
            body: webhook,
          },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
    },
    payments: {
      getMatterDetails: async (matterId: string): Promise<MatterDetails> => {
        const result = await httpService.get({
          path: `/johnny5/v1/matters/${matterId}/details`,
        })

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data as MatterDetails
      },
    },
  }
}
