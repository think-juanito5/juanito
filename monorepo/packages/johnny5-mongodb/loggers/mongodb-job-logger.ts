import type { LogLevel, Tenant } from '@dbc-tech/johnny5'
import type { Logger } from '@dbc-tech/logger'
import { ObjectId } from 'mongodb'
import { nanoid } from 'nanoid'
import { type AuditLog, AuditLogModel } from '../schema'

export type JobLoggerConfig = {
  correlationId?: string
  fileId?: string
  jobId: string
  name: string
  tenant: Tenant
}

export interface JobLogger extends Logger {
  correlationId: string
  fileId?: string
  jobId: string
  name: string
  tenant?: string
}

export const MongoDbJobLogger = ({
  correlationId,
  fileId,
  jobId,
  name,
  tenant,
}: JobLoggerConfig): JobLogger => {
  const logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'
  const id = correlationId || nanoid(10)

  return {
    log: async (message: string, ...args: unknown[]) => {
      if (['info', 'debug', 'trace'].includes(logLevel!)) {
        return writeAuditLog(
          buildAutitLog(
            id,
            fileId,
            jobId,
            name,
            tenant,
            'info',
            message,
            ...args,
          ),
        )
      }
    },
    trace: async (message: string, ...args: unknown[]) => {
      if (['trace'].includes(logLevel)) {
        return writeAuditLog(
          buildAutitLog(
            id,
            fileId,
            jobId,
            name,
            tenant,
            'trace',
            message,
            ...args,
          ),
        )
      }
    },
    debug: async (message: string, ...args: unknown[]) => {
      if (['debug', 'trace'].includes(logLevel)) {
        return writeAuditLog(
          buildAutitLog(
            id,
            fileId,
            jobId,
            name,
            tenant,
            'debug',
            message,
            ...args,
          ),
        )
      }
    },
    info: async (message: string, ...args: unknown[]) => {
      if (['info', 'debug', 'trace'].includes(logLevel)) {
        return writeAuditLog(
          buildAutitLog(
            id,
            fileId,
            jobId,
            name,
            tenant,
            'info',
            message,
            ...args,
          ),
        )
      }
    },
    warn: async (message: string, ...args: unknown[]) => {
      if (['warn', 'info', 'debug', 'trace'].includes(logLevel)) {
        return writeAuditLog(
          buildAutitLog(
            id,
            fileId,
            jobId,
            name,
            tenant,
            'warn',
            message,
            ...args,
          ),
        )
      }
    },
    error: (message: string, ...args: unknown[]) => {
      return writeAuditLog(
        buildAutitLog(
          id,
          fileId,
          jobId,
          name,
          tenant,
          'error',
          message,
          ...args,
        ),
      )
    },
    correlationId: id,
    fileId,
    jobId,
    name,
  }
}

const buildAutitLog = (
  correlationId: string,
  fileId: string | undefined,
  jobId: string,
  name: string,
  tenant: Tenant,
  logLevel: LogLevel,
  message: string,
  ...args: unknown[]
): Partial<AuditLog> => {
  let template = message
  for (const arg of args) {
    template += ` ${JSON.stringify(arg)}`
  }

  const auditLog: Partial<AuditLog> = {
    tenant,
    fileId: new ObjectId(fileId),
    jobId: new ObjectId(jobId),
    logLevel,
    message: template,
    tags: [correlationId, name],
  }

  return auditLog
}

const writeAuditLog = async (auditLog: Partial<AuditLog>): Promise<void> => {
  const newAudit = new AuditLogModel(auditLog)
  await newAudit.save()
}
