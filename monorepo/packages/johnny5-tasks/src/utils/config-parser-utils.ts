import { Johnny5ConfigService } from '@dbc-tech/johnny5-mongodb/utils/johnny5-config-service'

export function parseEmails(input: string | undefined): string[] {
  if (input === undefined) {
    throw new Error('Input is undefined')
  }

  try {
    // Replace single quotes with double quotes to allow loose JSON
    const normalized = input.replace(/'/g, '"')
    const parsed = JSON.parse(normalized)

    if (Array.isArray(parsed)) {
      const emails = parsed.filter(
        (item): item is string =>
          typeof item === 'string' && item.includes('@'),
      )
      return emails
    }

    if (typeof parsed === 'string' && parsed.includes('@')) {
      return [parsed]
    }

    throw new Error(
      'Parsed input is neither a valid string nor an array of strings',
    )
  } catch (err) {
    if (typeof input === 'string' && input.includes('@')) {
      return [input]
    }

    throw new Error(
      `Failed to parse email array: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

export const getCcaConfig = async (
  j5Cfg: Johnny5ConfigService,
  emailKey: string,
  templateIdKey: string,
) => {
  const getConfigValue = async (key: string) => {
    const res = await j5Cfg.get(key)
    return res?.value
  }
  const emails = await getConfigValue(emailKey)

  return {
    emailRecipients: emails ? parseEmails(emails) : [],
    templateId: await getConfigValue(templateIdKey),
  }
}
