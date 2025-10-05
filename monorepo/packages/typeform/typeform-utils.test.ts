import { describe, expect, it } from 'bun:test'
import type { AnswerChoice, AnswerChoiceOther } from '@dbc-tech/typeform'
import { isAnswerChoiceEquals } from './typeform-utils'

describe('isAnswerChoiceEquals', () => {
  it('should return false if choice is undefined', () => {
    expect(isAnswerChoiceEquals(undefined, 'test')).toBe(false)
  })

  it('should return false if choice does not have a label property', () => {
    const choice = {} as AnswerChoice
    expect(isAnswerChoiceEquals(choice, 'test')).toBe(false)
  })

  it('should return true if choice label matches the provided label', () => {
    const choice: AnswerChoice = { label: 'test', id: '1', ref: '1' }
    expect(isAnswerChoiceEquals(choice, 'test')).toBe(true)
  })

  it('should return false if choice label does not match the provided label', () => {
    const choice: AnswerChoice = { label: 'not-test', id: '1', ref: '1' }
    expect(isAnswerChoiceEquals(choice, 'test')).toBe(false)
  })

  it('should return true if choice (AnswerChoiceOther) label matches the provided label', () => {
    const choice: AnswerChoiceOther = { other: 'test' }
    expect(isAnswerChoiceEquals(choice, 'test')).toBe(true)
  })

  it('should return false if choice (AnswerChoiceOther) label does not match the provided label', () => {
    const choice: AnswerChoiceOther = { other: 'other' }
    expect(isAnswerChoiceEquals(choice, 'test')).toBe(false)
  })
})
