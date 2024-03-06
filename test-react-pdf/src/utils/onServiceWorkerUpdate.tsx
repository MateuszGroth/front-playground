import { useState } from 'react'
import { createRoot, Root } from 'react-dom/client'

// import { Snackbar, Button, Typography, Alert as MuiAlert } from '@mui/material'
// import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'

export const onServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
  const rootEl = document.createElement('div')
  rootEl.setAttribute('data-testid', 'update-available')
  document.body.appendChild(rootEl)

  const root = createRoot(rootEl)
  root.render(<UpdateAvailableAlert root={root} rootEl={rootEl} registration={registration} />)
}

type TProps = {
  root: Root
  rootEl: HTMLElement
  registration: ServiceWorkerRegistration
}

const UpdateAvailableAlert = ({ root, rootEl, registration }: TProps) => {
  const [open, setOpen] = useState(true)

  const handleClose = (event?: any, reason?: string) => {
    if (reason === 'clickaway') {
      // do not the alert close on window click
      return
    }

    setOpen(false)
  }

  const handleExited = () => {
    // queue unmount
    setTimeout(() => {
      root.unmount()
      rootEl.remove()
    }, 0)
  }

  const handleUpdate = () => {
    if (registration?.waiting) {
      // let waiting Service Worker know it should became active
      registration.waiting.postMessage('SKIP_WAITING')
    }
    setOpen(false)
  }

  return <></>

  // return (
  // <Snackbar
  //   open={open}
  //   onClose={handleClose}
  //   TransitionProps={{
  //     onExited: handleExited,
  //   }}
  //   anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  // >
  //   <MuiAlert
  //     elevation={6}
  //     variant="filled"
  //     icon={<SystemUpdateAltIcon />}
  //     action={
  //       <>
  //         <Button style={{ color: 'rgba(255,255,255,0.8)' }} onClick={handleClose}>
  //           Skip
  //         </Button>
  //         <Button style={{ color: '#fff' }} onClick={handleUpdate}>
  //           Update Now
  //         </Button>
  //       </>
  //     }
  //     severity={'info'}
  //   >
  //     <Typography style={{ paddingRight: '1rem' }} variant="body1">
  //       New version of the Application is available!
  //     </Typography>
  //   </MuiAlert>
  // </Snackbar>
  // )
}
