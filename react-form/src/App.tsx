import { Container, Paper, Grid, Typography, TextField, Button } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(8).max(32).required(),
})

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: yupResolver(schema),
  })
  const onSubmit = (data: any) => {
    console.log({ data })
    reset()
  }
  const onReset = (data: any) => {
    reset()
  }

  return (
    <Container sx={{ height: '100%', py: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid item xs={12}>
            <Controller
              name={'email'}
              control={control}
              render={({ field: { value, ...rest }, fieldState: { error, isDirty, isTouched }, formState }) => (
                <>
                  <Typography variant={'subtitle1'}>Email</Typography>
                  <TextField
                    {...rest}
                    fullWidth
                    value={value ?? ''}
                    error={isDirty && !!error}
                    helperText={isDirty && !!error && error?.message}
                  />
                </>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name={'password'}
              control={control}
              render={({ field: { value, ...rest }, fieldState: { error, isDirty, isTouched }, formState }) => (
                <>
                  <Typography variant={'subtitle1'}>Password</Typography>
                  <TextField
                    {...rest}
                    fullWidth
                    value={value ?? ''}
                    error={isDirty && !!error}
                    helperText={isDirty && !!error && error?.message}
                  />
                </>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" sx={{ mr: 2 }} onClick={handleSubmit(onSubmit)}>
              Submit
            </Button>
            <Button type="button" onClick={onReset}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default App
