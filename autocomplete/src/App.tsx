import { Container, Stack, Typography } from '@mui/material'
import Auto from './AutoNew'
function App() {
  return (
    <Container sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <Stack direction={'row'} gap={2}>
        <Typography>My Autocomplete</Typography>
        <Auto />
      </Stack>
    </Container>
  )
}

export default App
