import { Button, Container, Paper, Stack, Alert, IconButton, Icon } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack'
import toast, { Toaster } from 'react-hot-toast'
import AlertsProvider, { useShowAlert } from './Alert'

function App() {
  const showAlert = useShowAlert()
  const { enqueueSnackbar } = useSnackbar()

  const handleClickVariant = (variant: VariantType) => () => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar('Notistack alert', { variant })
  }

  return (
    <Container sx={{ height: '100%', py: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack direction={'row'} gap={2}>
          <Button
            onClick={() =>
              showAlert({
                message: 'Custom snacks using only material',
                severity: 'success',
              })
            }
          >
            Show Custom
          </Button>
          <Button color="secondary" onClick={handleClickVariant('warning')}>
            Show Notistick
          </Button>
          <Button
            color="secondary"
            variant="outlined"
            onClick={() => {
              toast.custom(
                (t) => (
                  <Alert
                    sx={{
                      fontSize: '1rem',
                      maxWidth: '80vw',

                      [`& .MuiAlert-message`]: {
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                      },
                    }}
                    elevation={6}
                    variant="filled"
                    severity={'info'}
                    action={
                      <IconButton
                        size="small"
                        onClick={() => {
                          console.log(t.id)
                          // toast.remove(t.id)
                          toast.dismiss(t.id)
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    }
                  >
                    Toaster Alert
                  </Alert>
                ),
                {
                  position: 'bottom-right',
                  duration: Infinity,
                }
              )
            }}
          >
            Show Toaster
          </Button>
          <Button
            color="secondary"
            variant="outlined"
            onClick={() => {
              const tid = toast.error('test', { duration: 10000, position: 'bottom-right' })
              setTimeout(() => toast.dismiss(tid), 5000)
            }}
          >
            Show Toaster test
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
const WithAlerts = () => {
  return (
    <AlertsProvider>
      <SnackbarProvider maxSnack={3}>
        <App />
        <Toaster />
      </SnackbarProvider>
    </AlertsProvider>
  )
}
export default WithAlerts
