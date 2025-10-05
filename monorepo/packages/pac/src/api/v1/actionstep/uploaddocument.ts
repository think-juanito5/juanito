// import { bufferToStream } from '../../../utils/stream-utils'
import { Readable } from 'stream'
import { SingleDocumentLinkMatterSchema } from '@dbc-tech/actionstep'
import { Elysia, status, t } from 'elysia'
import { serializeError } from 'serialize-error'
import { type DocumentUpload, documentUploadSchema } from '../../../schema'
import { RemoveNulls } from '../../../utils/object-utils'
import { transformNullableToOptional } from '../../../utils/query-utils'
import { type AppContext, appContext } from '../../plugins/app-context.plugin'

export const uploaddocument = new Elysia().use(appContext()).post(
  '/uploaddocument',
  async ({
    body,
    ctx,
  }: {
    body: DocumentUpload
    ctx: AppContext
  }) => {
    const { actionstep, jwt, httpService } = ctx
    const fileUploadUrl =
      process.env[`${jwt.tenant.toUpperCase()}_ACTIONSTEP_FILE_UPLOAD_URL`]
    if (!fileUploadUrl) {
      return status(500, 'File upload URL not configured')
    }
    const as = actionstep()
    const http = httpService()
    const resp = await http.get({
      path: body.bloburl,
      customOptions: { dataFormat: 'stream' },
    })

    if (!resp.ok) {
      const errorText = resp.val.statusText
      ctx.logger.error(
        `Failed to download blob from URL ${body.bloburl}: ${errorText}`,
        serializeError(errorText),
      )
      return status(500, 'Failed to download blob from the provided URL')
    }

    // first to upload the file to Actionstep, and get the fileId
    const uploadResponse = await as.uploadDocument(
      resp.val.data as Readable,
      body.filename,
      fileUploadUrl,
    )
    if (!uploadResponse.files) {
      return status(400, 'File upload failed')
    }

    // then to query the folders for the action
    let folderId: number
    // if no parentFolder do a specific query
    if (!body.parentFolder) {
      const directFolder = await as.getActionFoldersv2({
        filter: `action = ${body.matterId} and name = '${body.folder}' and parentFolder IS NULL`,
      })
      if (directFolder.actionfolders.length === 0) {
        return status(
          400,
          `Folder "${body.folder}" not found for action ${body.matterId}`,
        )
      }
      folderId = directFolder.actionfolders[0].id
    } else {
      // if parentFolder, get all
      const all = await as.getActionFoldersv2({
        filter: `action = ${body.matterId}`,
      })
      // and filter here to get parentFolderId
      const parentFolderId = all.actionfolders.find(
        (f) => f.name === body.parentFolder && f.links.parentFolder === null,
      )?.id
      if (!parentFolderId) {
        return status(
          400,
          `Parent folder "${body.parentFolder}" not found for action ${body.matterId}`,
        )
      }

      // and then narrow down to the specific folder
      const folder = all.actionfolders.find(
        (f) =>
          f.name === body.folder &&
          f.links.parentFolder === `${parentFolderId}`,
      )
      if (!folder) {
        return status(
          400,
          `Folder "${body.folder}" not found under parent folder "${body.parentFolder}" for action ${body.matterId}`,
        )
      }
      folderId = folder.id
    }

    // now link the file to the matter/folder
    const linkBody = {
      actiondocuments: {
        displayName: body.filename,
        file: `${uploadResponse.files.id};${body.filename}`,
        links: {
          action: `${body.matterId}`,
          folder: `${folderId}`,
        },
      },
    }
    const linkResponse = await as.linkDocumentToMatter(linkBody)
    if (!linkResponse.actiondocuments) {
      return status(400, 'Linking document to matter failed')
    }

    return RemoveNulls(linkResponse)
  },
  {
    body: documentUploadSchema,
    response: {
      200: transformNullableToOptional(SingleDocumentLinkMatterSchema),
      400: t.String(),
      500: t.String(),
    },
  },
)
