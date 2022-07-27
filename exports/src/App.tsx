import { exportToXLSX, exportToCsv } from './export'

type Key = 'name' | 'birthday' | 'address'
const keys: Key[] = ['name', 'birthday', 'address']
const KEY_MAP: Record<Key, string> = {
  name: 'Name',
  birthday: 'Birthday',
  address: 'Address dlugi adres asda das das ',
}

const order: Record<Key, number> = {
  name: 0,
  birthday: 1,
  address: 2,
}
type Row = Partial<Record<Key, string>>
const data: Row[] = [
  { name: 'George Wa,shin\ngton ASD AS DAS DAS DAS DAS ASD ', birthday: '1732-02-22', address: 'Gdynia' },
  { name: 'John "Adams', address: 'Gdynia', birthday: '1735-10-19' },
  { birthday: '1735-10-19', name: 'Mateusz' },
  { address: 'test' },
  // ... one row per President
]
const orderedKeys = [...keys].sort((a, b) => order[a] - order[b])

function App() {
  const handleClick = () => {
    exportToXLSX({
      data,
      orderedKeys,
      headerMap: KEY_MAP,
    })
  }
  const handleClickCsv = () => {
    exportToCsv({
      data,
      orderedKeys,
      headerMap: KEY_MAP,
    })
  }
  return (
    <div className="App">
      <button onClick={handleClick}>Export XlSX</button>
      <button onClick={handleClickCsv}>Export CSV</button>
    </div>
  )
}

export default App
