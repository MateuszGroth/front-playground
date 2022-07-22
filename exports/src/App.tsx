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
const data = [
  { name: 'George Washington ASD AS DAS DAS DAS DAS ASD ', birthday: '1732-02-22', address: 'Gdynia' },
  { name: 'John Adams', address: 'Gdynia', birthday: '1735-10-19' },
  { birthday: '1735-10-19', name: 'Mateusz' },
  // ... one row per President
]
const dataCopy = JSON.parse(JSON.stringify(data))
const orderedKeys = [...keys].sort((a, b) => order[a] - order[b])
const parsedData = dataCopy.map((row: Record<Key, string | number>) => {
  // put the row object into an array in the right order
  return orderedKeys.map((key) => row[key] ?? '')
})

const columnsWidths: Array<{ wch: number }> = parsedData
  .reduce((acc: number[], row: string[]) => {
    row.forEach((cell, i) => {
      if (!acc[i]) {
        acc[i] = 10
      }
      acc[i] = Math.max(acc[i], cell.length)
    })
    return acc
  }, [])
  .map((wch: number) => ({ wch }))

function App() {
  const handleClick = () => {
    const worksheet = XLSX.utils.json_to_sheet(parsedData)
    worksheet['!cols'] = columnsWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dates')
    XLSX.utils.sheet_add_aoa(worksheet, [orderedKeys.map((key) => KEY_MAP[key])], { origin: 'A1' })
    XLSX.writeFile(workbook, 'myfile.xlsx')
  }
  return (
    <div className="App">
      <button onClick={handleClick}>Export</button>
    </div>
  )
}

export default App
