import * as XLSX from 'xlsx'

type Key = 'name' | 'birthday' | 'address'
const keys: Key[] = ['name', 'birthday', 'address']
const KEY_MAP: Record<Key, string> = {
  name: 'Name',
  birthday: 'Birthday',
  address: 'Address',
}

const order: Record<Key, number> = {
  name: 0,
  birthday: 1,
  address: 2,
}
type Row = Partial<Record<Key, string>>
const data: Row[] = [
  { name: 'George Wa,shington ASD AS DAS DAS DAS DAS ASD ', birthday: '1732-02-22', address: 'Gdynia' },
  { name: 'John "Adams', address: 'Gdynia', birthday: '1735-10-19' },
  { birthday: '1735-10-19', name: 'Mateusz' },
  { address: 'test' },
  // ... one row per President
]
const orderedKeys = [...keys].sort((a, b) => order[a] - order[b])

const columnsWidths: Array<{ wch: number }> = data
  .reduce((acc: number[], row: Row) => {
    orderedKeys.forEach((key, i) => {
      if (!acc[i]) {
        acc[i] = 10
      }
      acc[i] = Math.max(acc[i], row[key]?.length ?? 0)
    })
    return acc
  }, [])
  .map((wch: number) => ({ wch }))

function App() {
  const handleClick = () => {
    const worksheet = XLSX.utils.json_to_sheet(JSON.parse(JSON.stringify(data)), {
      header: orderedKeys, // use correct order of keys
    })
    worksheet['!cols'] = columnsWidths
    XLSX.utils.sheet_add_aoa(worksheet, [orderedKeys.map((key) => KEY_MAP[key])], { origin: 'A1' })

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dates')

    // override header to mapped keys
    XLSX.writeFile(workbook, 'myfile.xlsx')
  }
  const handleClickCsv = () => {
    // const worksheet = XLSX.utils.json_to_sheet(data, {
    //   header: orderedKeys, // use correct order of keys
    // })
    // XLSX.utils.sheet_add_aoa(worksheet, [orderedKeys.map((key) => KEY_MAP[key])], { origin: 'A1' })
    // const csv = XLSX.utils.sheet_to_csv(worksheet)

    // self made csv string
    const csvRowsArray = [orderedKeys.map((key) => KEY_MAP[key]).join(',')]
    const formatValue = (value: string | number | Date | null | undefined): string => {
      let innerValue
      if (value instanceof Date) {
        innerValue = value.toLocaleString()
      } else if (value != null) {
        innerValue = String(value)
      } else {
        innerValue = ''
      }

      let result = innerValue.replace(/"/g, '""')
      if (/("|,|\n)/.test(result)) {
        result = '"' + result + '"'
      }

      return result
    }
    data.forEach((rowData) => {
      csvRowsArray.push(orderedKeys.map((key) => formatValue(rowData[key])).join(','))
    })
    const csvString = csvRowsArray.join('\n')

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })

    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'myfile.csv')
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  return (
    <div className="App">
      <button onClick={handleClick}>Export XlSX</button>
      <button onClick={handleClickCsv}>Export CSV</button>
    </div>
  )
}

export default App
