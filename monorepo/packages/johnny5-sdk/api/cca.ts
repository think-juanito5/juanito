import { type HttpService, errorFrom } from '@dbc-tech/http2'
import {
  type BatchMatterClose,
  CCcaPaymentForm,
  CIdString,
  type CcaDealMatter,
  type CcaMatterNameRefresh,
  type CcaOnMatterArchive,
  type CcaPaymentForm,
  type IdString,
  type MatterClose,
  type MatterDeactivation,
  type MatterReactivation,
  type ccaMatterTpLinkParams,
} from '@dbc-tech/johnny5'

export const cca = (httpService: HttpService) => {
  return {
    deals: {
      createMatter: async (body: CcaDealMatter) => {
        const result = await httpService.post(
          // TODO: change to /johnny5/v1/cca/deals/{dealId}/matter and update body schema to suit
          { path: `/johnny5/v1/cca-deal-matter`, body },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      sdsNotificationIssue: async (body: CcaDealMatter) => {
        const result = await httpService.post(
          // TODO: change to /johnny5/v1/cca/deals/{dealId}/sds-notification and update body schema to suit
          { path: `/johnny5/v1/cca-sds-pipedrive-notification`, body },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      marketingStatusArchive: async (
        dealId: number,
        personId: number,
      ): Promise<IdString> => {
        const result = await httpService.post(
          {
            // TODO: change to /johnny5/v1/cca/deals/{dealId}/persons/{personId}/marketing-status-archive
            path: `/johnny5/v1/deals/${dealId}/persons/${personId}/marketing-status-archive`,
          },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      dealLostUnsubscribe: async (
        dealId: number,
        personId: number,
      ): Promise<IdString> => {
        const result = await httpService.post(
          {
            // TODO: change to /johnny5/v1/cca/deals/{dealId}/persons/{personId}/lost-unsubscribe
            path: `/johnny5/v1/deals/${dealId}/persons/${personId}/lost-unsubscribe`,
          },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
    },
    matters: {
      close: async (matterId: number, body: MatterClose) => {
        const result = await httpService.post({
          // TODO: change to /johnny5/v1/cca/matters/{matterId}/close
          path: `/johnny5/v1/matters/${matterId}/close`,
          body,
        })

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      batchClose: async (fileId: string, body: BatchMatterClose) => {
        const result = await httpService.post(
          // TODO: change to /johnny5/v1/cca/files/{fileId}/batch-matter-close
          { path: `/johnny5/v1/files/${fileId}/batch-matter-close`, body },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      deactivate: async (actionId: number, body: MatterDeactivation) => {
        const result = await httpService.post(
          // TODO: change to /johnny5/v1/cca/matters/{matterId}/deactivate
          { path: `/johnny5/v1/matters/${actionId}/deactivate`, body },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      reactivate: async (actionId: number, body: MatterReactivation) => {
        const result = await httpService.post(
          // TODO: change to /johnny5/v1/cca/matters/{matterId}/reactivate
          { path: `/johnny5/v1/matters/${actionId}/reactivate`, body },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      staleMatterCleanup: async () => {
        const result = await httpService.post(
          // TODO: change to /johnny5/v1/cca/stale-matter-cleanup
          { path: `/johnny5/v1/stale-matter-cleanup` },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      onArchive: async (body: CcaOnMatterArchive) => {
        const result = await httpService.post(
          // TODO: change to /johnny5/v1/cca/matters/{matterId}/on-archive
          { path: `/johnny5/v1/cca-on-matter-archive`, body },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      nameRefresh: async (actionId: number, body?: CcaMatterNameRefresh) => {
        const result = await httpService.post(
          {
            // TODO: change to /johnny5/v1/cca/matters/{matterId}/name-refresh
            path: `/johnny5/v1/matters/${actionId}/name-refresh`,
            body,
          },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      trustPilotLink: async (
        actionId: number,
        body?: ccaMatterTpLinkParams,
      ) => {
        const result = await httpService.post(
          {
            // TODO: change to /johnny5/v1/cca/matters/{matterId}/trustpilot-link
            path: `/johnny5/v1/matters/${actionId}/trustpilot-link`,
            body,
          },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      makePayment: async (actionId: number, body?: CcaPaymentForm) => {
        const result = await httpService.post(
          {
            // TODO: change to /johnny5/v1/cca/matters/{matterId}/payment
            path: `/johnny5/v1/matters/${actionId}/payment`,
            body,
          },
          CIdString,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
      getPayment: async (actionId: number) => {
        const result = await httpService.get(
          {
            // TODO: change to /johnny5/v1/cca/matters/{matterId}/payment
            path: `/johnny5/v1/matters/${actionId}/payment`,
          },
          CCcaPaymentForm,
        )

        if (!result.ok) throw errorFrom(result.val)
        return result.val.data
      },
    },
    emailUnsubscribe: async (
      email: string,
      option: string,
    ): Promise<IdString> => {
      const result = await httpService.post(
        {
          // TODO: change to /johnny5/v1/cca/email-unsubscribe
          path: `/johnny5/v1/cca-email-unsubscribe`,
          body: {
            email,
            option,
          },
        },
        CIdString,
      )
      if (!result.ok) throw errorFrom(result.val)
      return result.val.data
    },
  }
}
