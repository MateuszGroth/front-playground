import { utils, writeFile, WorkSheet } from 'xlsx'

type Column<T extends Record<string, unknown>> = { key: keyof T; label?: string }
export interface XLSXExportArg<T extends Record<string, unknown>> {
  data: Array<T>
  columns: Column<T>[]
  fileName?: string
}

export const exportToXLSX = <T extends Record<string, unknown>>({
  data,
  columns,
  fileName,
}: XLSXExportArg<T>): void => {
  const orderedKeys = getOrderedKeys(columns)
  const worksheet = utils.json_to_sheet(cloneDeep(data), {
    header: orderedKeys as string[], // use correct order of keys
  })

  setColumnsWidths(worksheet, data, columns)
  addHeaderRow(worksheet, columns)

  const workbook = utils.book_new()

  writeFile(workbook, (fileName ?? 'data') + '.xlsx')
}

const cloneDeep = (data: any) => JSON.parse(JSON.stringify(data))

const getOrderedKeys = <T extends Record<string, unknown>>(columns: Column<T>[]): (keyof T)[] => {
  return columns.map(({ key }) => key)
}

const addHeaderRow = <T extends Record<string, unknown>>(worksheet: WorkSheet, columns: Column<T>[]): void => {
  utils.sheet_add_aoa(worksheet, [columns.map(({ key, label }) => label ?? key)], { origin: 'A1' })
}

const setColumnsWidths = <T extends Record<string, unknown>>(
  worksheet: WorkSheet,
  data: T[],
  columns: Column<T>[]
): void => {
  const MAX_CELL_WIDTH = 80
  const initialWidths = columns.map(({ key, label }) => String(label).length ?? String(key).length)

  const columnsWidths = data
    .reduce((acc: number[], row: T) => {
      columns.forEach(({ key }, i) => {
        if (!acc[i]) {
          acc[i] = 10
        }
        const cellContentLength = String(row[key])?.length ?? 0
        acc[i] = Math.max(acc[i], cellContentLength)
      })

      return acc
    }, initialWidths)
    .map((wch: number) => ({ wch: wch > MAX_CELL_WIDTH ? MAX_CELL_WIDTH : wch }))

  worksheet['!cols'] = columnsWidths
}
