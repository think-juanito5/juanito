import { describe, expect, it } from 'bun:test'
import {
  type CouncilSearchOutput,
  councilBuildSearch,
  filterSearchCouncil,
} from './search-utils'

describe('utils > filterSearchCouncil', () => {
  describe.each([
    ['City Council of Test', 'Test'],
    ['Test Council', 'Test'],
    ['City of Bay Regional Council', 'Bay'],
    ['Test Input', 'Test Input'],
    ['city council of Test', 'Test'],
    ['BALONNE SHIRE COUNCIL', 'Balonne'],
    ['BARCALDINE REGIONAL COUNCIL', 'Barcaldine'],
    ['BLACKALL-TAMBOO REGIONAL COUNCIL', 'Blackall-Tamboo'],
    ['McKINLAY SHIRE COUNCIL', 'McKinlay'],
    ['BOULIA SHIRE COUNCIL', 'Boulia'],
    ['CASSOWARY COAST REGIONAL COUNCIL', 'Cassowary Coast'],
    ['CITY OF GOLD COAST', 'Gold Coast'],
    ['GYMPIE REGIONAL COUNCIL', 'Gympie'],
    ['MORETON BAY REGIONAL COUNCIL', 'Moreton Bay'],
    ['REDLAND CITY COUNCIL', 'Redland'],
    ['SUNSHINE COAST COUNCIL', 'Sunshine Coast'],
    ['WEIPA TOWN AUTHORITY', 'Weipa Town'],
    ['YARRABAH ABORIGINAL SHIRE COUNCIL', 'Yarrabah Aboriginal'],
    [' ', undefined],
    ['', undefined],
  ])('.filterSearchCouncil(%p)', (input, expected) => {
    it(`returns ${expected}`, () => {
      expect(filterSearchCouncil(input)).toEqual(expected as string)
    })
  })
})

describe('utils > councilBuildSearch', () => {
  describe.each([
    [
      'Test Council',
      {
        searchParams: [
          { name: 'displayName', value: 'Test Council' },
          { name: 'displayName_like', value: 'Test*' },
        ],
        filterVal: 'Test',
      },
    ],
    [
      'CITY OF GOLD COAST',
      {
        searchParams: [
          { name: 'displayName', value: 'City Of Gold Coast' },
          { name: 'displayName_like', value: 'Gold Coast*' },
        ],
        filterVal: 'Gold Coast',
      },
    ],
    [
      'Test Input',
      {
        searchParams: [
          { name: 'displayName', value: 'Test Input' },
          { name: 'displayName_like', value: 'Test Input*' },
        ],
        filterVal: 'Test Input',
      },
    ],
    [
      'BALONNE SHIRE COUNCIL',
      {
        searchParams: [
          { name: 'displayName', value: 'Balonne Shire Council' },
          { name: 'displayName_like', value: 'Balonne*' },
        ],
        filterVal: 'Balonne',
      },
    ],
    [
      'BARCALDINE REGIONAL COUNCIL',
      {
        searchParams: [
          { name: 'displayName', value: 'Barcaldine Regional Council' },
          { name: 'displayName_like', value: 'Barcaldine*' },
        ],
        filterVal: 'Barcaldine',
      },
    ],
    [
      'BOULIA SHIRE COUNCIL',
      {
        searchParams: [
          { name: 'displayName', value: 'Boulia Shire Council' },
          { name: 'displayName_like', value: 'Boulia*' },
        ],
        filterVal: 'Boulia',
      },
    ],
    [
      'CASSOWARY COAST REGIONAL COUNCIL',
      {
        searchParams: [
          { name: 'displayName', value: 'Cassowary Coast Regional Council' },
          { name: 'displayName_like', value: 'Cassowary Coast*' },
        ],
        filterVal: 'Cassowary Coast',
      },
    ],
    [
      'GYMPIE REGIONAL COUNCIL',
      {
        searchParams: [
          { name: 'displayName', value: 'Gympie Regional Council' },
          { name: 'displayName_like', value: 'Gympie*' },
        ],
        filterVal: 'Gympie',
      },
    ],
    [
      'MORETON BAY REGIONAL COUNCIL',
      {
        searchParams: [
          { name: 'displayName', value: 'Moreton Bay Regional Council' },
          { name: 'displayName_like', value: 'Moreton Bay*' },
        ],
        filterVal: 'Moreton Bay',
      },
    ],
    [
      'REDLAND CITY COUNCIL',
      {
        searchParams: [
          { name: 'displayName', value: 'Redland City Council' },
          { name: 'displayName_like', value: 'Redland*' },
        ],
        filterVal: 'Redland',
      },
    ],
    [
      'SUNSHINE COAST COUNCIL',
      {
        searchParams: [
          { name: 'displayName', value: 'Sunshine Coast Council' },
          { name: 'displayName_like', value: 'Sunshine Coast*' },
        ],
        filterVal: 'Sunshine Coast',
      },
    ],
    [
      'WEIPA TOWN AUTHORITY',
      {
        searchParams: [
          { name: 'displayName', value: 'Weipa Town Authority' },
          { name: 'displayName_like', value: 'Weipa Town*' },
        ],
        filterVal: 'Weipa Town',
      },
    ],
    [
      'YARRABAH ABORIGINAL SHIRE COUNCIL',
      {
        searchParams: [
          { name: 'displayName', value: 'Yarrabah Aboriginal Shire Council' },
          { name: 'displayName_like', value: 'Yarrabah Aboriginal*' },
        ],
        filterVal: 'Yarrabah Aboriginal',
      },
    ],
    [' ', undefined],
    ['', undefined],
    [undefined, undefined],
  ])('.councilBuildSearch(%p)', (input, expected) => {
    it(`returns ${JSON.stringify(expected)}`, () => {
      expect(councilBuildSearch(input)).toEqual(expected as CouncilSearchOutput)
    })
  })
})
