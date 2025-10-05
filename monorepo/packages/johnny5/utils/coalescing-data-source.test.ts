import { beforeEach, describe, expect, it, mock } from 'bun:test'
import type { DataItem } from '../typebox'
import { CoalescingDataSource } from './coalescing-data-source'

describe('CoalescingDataSource', () => {
  const contractDataSource = {
    get: mock((_name: string) => Promise.resolve({} as DataItem)),
  }

  const correctionDataSource = {
    get: mock((_name: string) => Promise.resolve({} as DataItem)),
  }

  let coalescingDataSource: CoalescingDataSource

  beforeEach(() => {
    coalescingDataSource = new CoalescingDataSource(
      contractDataSource,
      correctionDataSource,
    )
  })

  it('should return correction data item if has value', async () => {
    const name = 'date_of_contract'
    const contractDataValueItem: DataItem = {
      value: '01/11/2024',
      name,
      type: 'Text',
      required: true,
    }
    const correctionDataValueItem: DataItem = {
      value: '02/11/2024',
      name,
      type: 'Text',
      required: true,
    }
    contractDataSource.get.mockResolvedValue(contractDataValueItem)
    correctionDataSource.get.mockResolvedValue(correctionDataValueItem)

    const result = await coalescingDataSource.get(name)

    expect(result).toBe(correctionDataValueItem)
    expect(contractDataSource.get).toHaveBeenCalledWith(name)
    expect(correctionDataSource.get).toHaveBeenCalledWith(name)
  })

  it('should return correction data item if has empty string', async () => {
    const name = 'date_of_contract'
    const contractDataValueItem: DataItem = {
      value: '01/11/2024',
      name,
      type: 'Text',
      required: true,
    }
    const correctionDataValueItem: DataItem = {
      value: '',
      name,
      type: 'Text',
      required: true,
    }
    contractDataSource.get.mockResolvedValue(contractDataValueItem)
    correctionDataSource.get.mockResolvedValue(correctionDataValueItem)

    const result = await coalescingDataSource.get(name)

    expect(result).toBe(correctionDataValueItem)
    expect(contractDataSource.get).toHaveBeenCalledWith(name)
    expect(correctionDataSource.get).toHaveBeenCalledWith(name)
  })

  it('should return contract data item if correction data value is null', async () => {
    const name = 'date_of_contract'
    const contractDataValueItem: DataItem = {
      value: '01/11/2024',
      name,
      type: 'Text',
      required: true,
    }
    const correctionDataValueItem: DataItem = {
      value: null as unknown as string,
      name,
      type: 'Text',
      required: true,
    }
    contractDataSource.get.mockResolvedValue(contractDataValueItem)
    correctionDataSource.get.mockResolvedValue(correctionDataValueItem)

    const result = await coalescingDataSource.get(name)

    expect(result).toBe(contractDataValueItem)
    expect(contractDataSource.get).toHaveBeenCalledWith(name)
    expect(correctionDataSource.get).toHaveBeenCalledWith(name)
  })

  it('should return contract data item if correction data value is undefined', async () => {
    const name = 'date_of_contract'
    const contractDataValueItem: DataItem = {
      value: '01/11/2024',
      name,
      type: 'Text',
      required: true,
    }
    const correctionDataValueItem: DataItem = {
      value: undefined as unknown as string,
      name,
      type: 'Text',
      required: true,
    }
    contractDataSource.get.mockResolvedValue(contractDataValueItem)
    correctionDataSource.get.mockResolvedValue(correctionDataValueItem)

    const result = await coalescingDataSource.get(name)

    expect(result).toBe(contractDataValueItem)
    expect(contractDataSource.get).toHaveBeenCalledWith(name)
    expect(correctionDataSource.get).toHaveBeenCalledWith(name)
  })
})
