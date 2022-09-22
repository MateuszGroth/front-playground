import { useEffect, useState, createContext, useMemo, ReactNode, useContext } from 'react'
import { Snackbar, Alert as MuiAlert } from '@mui/material'

type Severity = 'info' | 'success' | 'warning' | 'error'

type AlertData = {
  message: string
  severity?: Severity
  onClose?(): void
  hideDuration?: number
}

type AlertsContextData = {
  showAlert(arg: AlertData): void
}

type AlertState = AlertData & { key: number }

const AlertsContext = createContext<AlertsContextData>({
  showAlert: () => null,
})

const DEFAULT_HIDE_DURATION = 3000

const DEFAULT_SEVERITY: Severity = 'info'

type Props = {
  children: ReactNode
}

const AlertsProvider = ({ children }: Props) => {
  const [snackPack, setSnackPack] = useState<AlertState[]>([])
  const [messageInfo, setMessageInfo] = useState<AlertState | undefined>(undefined)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] })
      setSnackPack((prev) => prev.slice(1))
      setOpen(true)
    } else if (snackPack.length && messageInfo && open) {
      // Close an active snack when a new one is added
      setOpen(false)
    }
  }, [snackPack, messageInfo, open])

  const onClose = (event?: any, reason?: string) => {
    if (reason === 'clickaway') {
      // do not the alert close on window click
      return
    }

    setOpen(false)
    messageInfo?.onClose?.()
  }

  const handleExited = () => {
    setMessageInfo(undefined)
  }

  const context = useMemo(() => {
    const showAlert = (data: AlertData) => {
      const newAlertData = {
        key: new Date().getTime(),
        hideDuration: DEFAULT_HIDE_DURATION,
        severity: DEFAULT_SEVERITY,
        ...data,
      }
      setSnackPack((prev) => [...prev, newAlertData])
    }

    return {
      showAlert,
    }
  }, [])

  return (
    <AlertsContext.Provider value={context}>
      {children}
      <Alert open={open} onClose={onClose} handleExited={handleExited} messageInfo={messageInfo} />
    </AlertsContext.Provider>
  )
}
export default AlertsProvider

export const useShowAlert = () => {
  const { showAlert } = useContext(AlertsContext)

  return showAlert
}
type AlertProps = {
  open: boolean
  onClose: () => void
  handleExited: () => void
  messageInfo?: AlertState
}

export const Alert = ({ onClose, open, messageInfo, handleExited }: AlertProps) => {
  return (
    <Snackbar
      key={messageInfo?.key}
      open={open}
      autoHideDuration={messageInfo?.severity === 'success' ? messageInfo?.hideDuration : null}
      onClose={onClose}
      TransitionProps={{
        onExited: handleExited,
      }}
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      data-testid="snackbar"
    >
      <MuiAlert
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
        onClose={onClose}
        severity={messageInfo?.severity || DEFAULT_SEVERITY}
      >
        {messageInfo?.message || ''}
      </MuiAlert>
    </Snackbar>
  )
}
