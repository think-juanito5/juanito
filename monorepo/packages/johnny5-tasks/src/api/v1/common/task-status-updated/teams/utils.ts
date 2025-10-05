import { formatInTimeZone } from 'date-fns-tz'
import { enAU } from 'date-fns/locale'

export const getTeamsDisplayDate = (date: Date) =>
  formatInTimeZone(
    date,
    'Australia/Melbourne',
    `EEE, dd MMM yyyy HH:mm:ss zzz`,
    { locale: enAU },
  )

export const getMarkdownEmail = (email: string) => `[${email}](mailto:${email})`
