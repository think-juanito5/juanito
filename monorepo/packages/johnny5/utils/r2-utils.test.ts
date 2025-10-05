import { describe, expect, it } from 'bun:test'
import { convertBlobFilenameToR2 } from './r2-utils'

describe('convertBlobFilenameToR2', () => {
  it('replaces all / with :', () => {
    expect(convertBlobFilenameToR2('folder/subfolder/file.txt')).toBe(
      'folder:subfolder:file.txt',
    )
    expect(convertBlobFilenameToR2('/leading/slash')).toBe(':leading:slash')
    expect(convertBlobFilenameToR2('no/slash')).toBe('no:slash')
    expect(convertBlobFilenameToR2('nochange.txt')).toBe('nochange.txt')
    expect(convertBlobFilenameToR2('')).toBe('')
  })

  it('handles multiple consecutive slashes', () => {
    expect(convertBlobFilenameToR2('a//b///c')).toBe('a::b:::c')
  })
})
