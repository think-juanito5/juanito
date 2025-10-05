import chalk, { type ChalkInstance } from 'chalk'

export type ColumnSpec = {
  name: string
  header?: string
  width: number
  headerStyle?: ChalkInstance
  style: ChalkInstance
}

export type TableSpec = {
  columns: ColumnSpec[]
}

export interface Table {
  writeHeader(): string
  writeRow(values: string[]): string
}

export class MarkdownTable {
  constructor(private spec: TableSpec) {}

  writeHeader(): string {
    let row: string = ''
    this.spec.columns.forEach(({ header }) => {
      const formattedHeader = `| ${header} `
      row += formattedHeader
    })
    row += ' |\n'
    this.spec.columns.forEach(() => {
      const formattedHeader = `|---`
      row += formattedHeader
    })
    row += '|'
    return row
  }

  writeRow(values: string[]): string {
    let row: string = ''
    this.spec.columns.forEach((column) => {
      const index = this.spec.columns.indexOf(column)
      if (index > values.length - 1) return

      const formattedValue = `| ${values[index] ?? ''} `
      row += formattedValue
    })
    row += ' |'
    return row
  }
}

export class ChalkTable {
  constructor(private spec: TableSpec) {}

  writeHeader(): string {
    let row: string = ''
    this.spec.columns.forEach(({ headerStyle, header, width }) => {
      const formattedHeader = (header ?? '').padEnd(width, ' ')
      const styler = headerStyle ?? chalk.white
      row += styler(formattedHeader)
    })

    return row
  }

  writeRow(values: string[]): string {
    let row: string = ''
    this.spec.columns.forEach((column) => {
      const index = this.spec.columns.indexOf(column)
      if (index > values.length - 1) return

      const formattedValue = (values[index] ?? '').padEnd(column.width, ' ')
      row += column.style(formattedValue)
    })

    return row
  }
}
