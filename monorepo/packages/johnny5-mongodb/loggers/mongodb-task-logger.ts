import type { LogLevel, Tenant } from '@dbc-tech/johnny5'
import type { Logger } from '@dbc-tech/logger'
import { ObjectId } from 'mongodb'
import { nanoid } from 'nanoid'
import { type AuditLog, AuditLogModel } from '../schema'

export type TaskLoggerConfig = {
  correlationId?: string
  fileId?: string
  taskId: string
  name: string
  tenant: Tenant
}

export interface TaskLogger extends Logger {
  correlationId: string
  fileId?: string
  taskId: string
  name: string
  tenant?: string
}

export const MongoDbTaskLogger = ({
  correlationId,
  fileId,
  taskId,
  name,
  tenant,
}: TaskLoggerConfig): TaskLogger => {
  const logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'
  const id = correlationId || nanoid(10)

  return {
    log: async (message: string, ...args: unknown[]) => {
      if (['info', 'debug', 'trace'].includes(logLevel!)) {
        return writeAuditLog(
          buildAutitLog(
            id,
            fileId,
            taskId,
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
            taskId,
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
            taskId,
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
            taskId,
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
            taskId,
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
          taskId,
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
    taskId,
    name,
  }
}

const buildAutitLog = (
  correlationId: string,
  fileId: string | undefined,
  taskId: string,
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
    taskId: new ObjectId(taskId),
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
