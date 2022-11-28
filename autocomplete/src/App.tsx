import { Container, Stack, Typography } from '@mui/material'
import Auto from './Auto'
// import AutoNew from './AutoNew'
// import AutoCustom from './AutoCustom'
function App() {
  return (
    <Container sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <Stack gap={2}>
        <Stack direction={'row'} gap={2} sx={{ mb: 2 }}>
          <Typography>My Autocomplete test</Typography>
          <Auto />
        </Stack>
        {/* <Stack direction={'row'} gap={2}>
          <Typography>Custom Autocomplete</Typography>
          <AutoCustom />
        </Stack> */}
        {/* <Stack direction={'row'} gap={2}>
          <Typography>New Autocomplete</Typography>
          <AutoNew />
        </Stack> */}
      </Stack>
    </Container>
  )
}

export default App
