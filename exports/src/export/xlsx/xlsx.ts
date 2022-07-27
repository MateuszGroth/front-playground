import { utils, writeFile } from 'xlsx'

export interface XLSXExportArg<T> {
  data: Array<T>
  orderedKeys: (keyof T)[]
  headerMap?: Record<keyof T, string>
  fileName?: string
}

const getColumnsWidths = <T>(
  data: T[],
  orderedKeys: (keyof T)[],
  headerMap?: Record<keyof T, string>
): Array<{ wch: number }> => {
  const initialWidths = orderedKeys.map((key) => headerMap?.[key].length ?? String(key).length)

  return data
    .reduce((acc: number[], row: T) => {
      orderedKeys.forEach((key, i) => {
        if (!acc[i]) {
          acc[i] = 10
        }
        acc[i] = Math.max(acc[i], String(row[key])?.length ?? 0)
      })
      return acc
    }, initialWidths)
    .map((wch: number) => ({ wch }))
}

export const exportToXLSX = <T>({ data, orderedKeys, headerMap, fileName }: XLSXExportArg<T>): void => {
  const worksheet = utils.json_to_sheet(JSON.parse(JSON.stringify(data)), {
    header: orderedKeys as string[], // use correct order of keys
  })

  worksheet['!cols'] = getColumnsWidths(data, orderedKeys, headerMap)
  utils.sheet_add_aoa(worksheet, [orderedKeys.map((key) => headerMap?.[key] ?? key)], { origin: 'A1' })

  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Report')

  writeFile(workbook, (fileName ?? 'data') + '.xlsx')
}
