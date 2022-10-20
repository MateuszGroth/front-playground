import { Button, Container, Paper, Stack, Alert, IconButton, Fade } from '@mui/material'
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
            onClick={() => {
              const id = Date.now().toString()
              const promise = new Promise<{ name: string }>((res, rej) => {
                setTimeout(() => {
                  res({ name: 'TEST' })
                }, 5000)
              })
              toast.promise(
                promise,
                {
                  loading: 'Loading',
                  success: (data, ...arg) => (
                    <>
                      <Button onClick={() => toast.dismiss(id)}>Test</Button>
                      {`Successfully saved ${data.name}`}
                    </>
                  ),
                  error: (err) => `This just happened: ${err.toString()}`,
                },
                {
                  id: id,
                  style: {
                    minWidth: '250px',
                  },
                  success: {
                    duration: 5000,
                    icon: '🔥',
                    style: {
                      background: 'palegreen',
                    },
                  },
                }
              )
            }}
          >
            Show Toaster loading
          </Button>
          <Button
            color="secondary"
            variant="outlined"
            onClick={() => {
              toast.custom(
                (t) => (
                  // <Fade in={t.visible} unmountOnExit>
                  <Alert
                    sx={{
                      opacity: t.visible ? '1' : '0',
                      transform: t.visible
                        ? 'translateY(20px) scale(1) translateY(-20px)'
                        : 'translateY(20px) scale(0.2) translateY(-20px)',
                      transition: 'all 200ms ease-out',
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
                          toast.dismiss(t.id)
                          // toast.remove(t.id)
                          // setTimeout(() => toast.remove(t.id), 300)
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    }
                  >
                    Toaster Alert
                  </Alert>
                  // </Fade>
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
