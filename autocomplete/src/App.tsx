import { Container, Stack } from '@mui/material'
function App() {
  return (
    <Container sx={{ display: 'grid', placeItems: 'center' }}>
      <Stack direction={'row'} gap={2}>
        <div>Hello</div>
        <div>World</div>
      </Stack>
    </Container>
  )
}

export default App
