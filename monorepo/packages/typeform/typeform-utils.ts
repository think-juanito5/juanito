import type { Logger } from '@dbc-tech/logger'
import type {
  AnswerChoice,
  AnswerChoiceOther,
  AnswerType,
  FormResponse,
  FormResponseReshaped,
} from './typeform.schema'

export const isAnswerChoiceEquals = (
  choice: AnswerChoice | AnswerChoiceOther | undefined,
  value: string,
): boolean => {
  if (!choice) {
    return false
  }
  return 'label' in choice ? choice.label === value : choice.other === value
}

export const reshapeFormResponse = async (
  form: FormResponse,
  logger: Logger,
): Promise<FormResponseReshaped> => {
  const reshaped: FormResponseReshaped = {}

  const fields: Record<string, (typeof form.definition.fields)[0]> = {}

  for (const field of form.definition?.fields ?? []) {
    // want to check if field title contains a hidden field
    // in the format {{hidden:fieldId}}
    // if it does, we want to replace that part of the title with
    // the corresponding value from form.hidden
    let title = field.title
    await logger.debug(`Processing field ${field.id} with title: ${title}`, {
      field,
    })
    const pat = /{{hidden:(\w+)}}/g
    if (form.hidden && Object.values(form.hidden).length > 0) {
      const hidden = form.hidden
      title = title.replace(pat, (_, hiddenKey) => {
        const key = hiddenKey as keyof typeof hidden
        const value = hidden[key]
        logger.debug(
          `Replacing hidden field ${key} with value: ${value}. From hidden fields: ${JSON.stringify(hidden)}`,
        )
        return value ?? ''
      })
    } else {
      await logger.debug(`No hidden fields found in form response`, {
        form,
      })
    }
    fields[field.id] = { ...field, title }
  }
  if (!fields || Object.keys(fields).length === 0) {
    throw new Error('No fields found in form response definition')
  }

  for (const ans of form.answers) {
    const field = fields[ans.field.id]
    if (!field) {
      throw new Error(`Field ${ans.field.id} not found in form definition`)
    }
    let response: string

    switch (field.type) {
      case 'boolean':
        response = ans.boolean ? 'Yes' : 'No'
        break
      case 'multiple_choice':
      case 'choice':
        if (ans.choice) {
          'label' in ans.choice
            ? (response = ans.choice.label || '')
            : (response = ans.choice.other || '')
        } else {
          response = ''
        }
        break
      case 'choices':
        if (ans.choices && ans.choices.labels) {
          response = ans.choices.labels.join(', ')
        } else {
          response = ''
        }
        break
      case 'date':
        response = ans.date || ''
        break
      case 'email':
        response = ans.email || ''
        break
      case 'file_url':
        response = ans.file_url || ''
        break
      case 'text':
      case 'short_text':
      case 'long_text':
        response = ans.text || ''
        break
      case 'number':
        response = ans.number?.toString() ?? '0'
        break
      case 'payment':
        response = ans.payment?.amount ?? '0'
        break
      case 'phone_number':
        response = ans.phone_number || ''
        break
      case 'url':
        response = ans.url || ''
        break
      default:
        await logger.warn(
          `Unknown field type ${field.type} for field ${field.id}. Response will be set to 'Unknown type'.`,
          { field },
        )
        response = 'Unknown type'
    }

    reshaped[field.id] = {
      type: field.type as AnswerType,
      definition: field,
      response,
    }
  }
  const endingDefinition = form.definition.endings.find(
    (ending) => ending.id === form.ending.id,
  )
  if (!endingDefinition) {
    throw new Error(`Ending ${form.ending.id} not found in form definition`)
  }
  reshaped[form.ending.id] = {
    type: 'ending',
    definition: endingDefinition,
    response: 'end',
  }
  return reshaped
}
