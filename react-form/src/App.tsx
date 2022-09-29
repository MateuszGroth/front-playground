import { Container, Paper, Grid, Typography, TextField, Button } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(8).max(32).required(),
  min: yup
    .number()
    .positive()
    .integer()
    .test({
      name: 'less-than-max',
      exclusive: false,
      params: {},
      message: 'Min must be lower than Max',
      test: function (value, context) {
        const max = context.parent.max
        if (value == null || max == null) {
          return true
        }

        return isNaN(max) || isNaN(value) || value <= max
      },
    })
    .required(),
  max: yup
    .number()
    .positive()
    .integer()
    .test({
      name: 'more-than-min',
      exclusive: false,
      params: {},
      message: 'Max must be bigger than Min',
      test: function (value, context) {
        const min = context.parent.min
        if (value == null || min == null) {
          return true
        }

        return isNaN(min) || isNaN(value) || value >= min
      },
    })
    .required(),
  uncontrolled: yup.string().min(3).required(),
})

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isSubmitted },
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
                    error={(formState.isSubmitted || isDirty) && !!error}
                    helperText={(formState.isSubmitted || isDirty) && !!error && error?.message}
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
                    error={(formState.isSubmitted || isDirty) && !!error}
                    helperText={(formState.isSubmitted || isDirty) && !!error && error?.message}
                  />
                </>
              )}
            />
          </Grid>
          <Grid item xs={3}>
            <Controller
              name={'min'}
              control={control}
              render={({ field: { value, ...rest }, fieldState: { error, isDirty, isTouched }, formState }) => (
                <>
                  <Typography variant={'subtitle1'}>Min</Typography>
                  <TextField
                    {...rest}
                    fullWidth
                    value={value ?? ''}
                    error={(formState.isSubmitted || isDirty) && !!error}
                    helperText={(formState.isSubmitted || isDirty) && !!error && error?.message}
                  />
                </>
              )}
            />
          </Grid>
          <Grid item xs={3}>
            <Controller
              name={'max'}
              control={control}
              render={({ field: { value, ...rest }, fieldState: { error, isDirty, isTouched }, formState }) => (
                <>
                  <Typography variant={'subtitle1'}>Max</Typography>
                  <TextField
                    {...rest}
                    fullWidth
                    value={value ?? ''}
                    error={(formState.isSubmitted || isDirty) && !!error}
                    helperText={(formState.isSubmitted || isDirty) && !!error && error?.message}
                  />
                </>
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant={'subtitle1'}>Unregistered</Typography>
            <TextField
              {...register('uncontrolled')}
              fullWidth
              error={(isSubmitted || dirtyFields.uncontrolled) && !!errors.uncontrolled}
              helperText={
                (isSubmitted || dirtyFields.uncontrolled) && !!errors.uncontrolled && errors.uncontrolled.message
              }
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
