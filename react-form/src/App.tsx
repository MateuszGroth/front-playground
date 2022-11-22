import { Container, Paper, Grid, Typography, TextField, Button } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { dirtyValues } from './helpers'

const EMAIL_REGEX = new RegExp(/^[\w\-.]+@(\w[\w-]*\.)+\w+$/)

// const getValidationSchema = (t: (key: string) => string) => {
//   return yup.object().shape({
//     startedAt: yup
//       .date()
//       .nullable()
//       .typeError(t("validation.date"))
//       .test("isAfterDueAt", t("validation.before_due_at"), (value, context) => {
//         if (value && context.parent.dueAt) {
//           return !moment(value).isAfter(context.parent.dueAt);
//         }
//         return true;
//       })
//       .test("isAfterFinishedAt", t("validation.before_finished_at"), (value, context) => {
//         if (value && context.parent.finishedAt) {
//           return !moment(value).isAfter(context.parent.finishedAt);
//         }
//         return true;
//       }),
//     dueAt: yup
//       .date()
//       .nullable()
//       .typeError(t("validation.date"))
//       .test("isBeforeStartedAt", t("validation.after_started_at"), (value, context) => {
//         if (value && context.parent.startedAt) {
//           return !moment(value).isBefore(context.parent.startedAt);
//         }
//         return true;
//       }),
//     finishedAt: yup
//       .date()
//       .nullable()
//       .typeError(t("validation.date"))
//       .test("isBeforeStartedAt", t("validation.after_started_at"), (value, context) => {
//         if (value && context.parent.startedAt) {
//           return !moment(value).isBefore(context.parent.startedAt);
//         }
//         return true;
//       }),
//     customerContact: yup.object().shape({
//       email: yup.string().matches(EMAIL_REGEX, {
//         message: t("validation.email"),
//         excludeEmptyString: true,
//       }),
//     }),
//   });
// };

const schema = yup.object().shape({
  startedAt: yup.date().nullable().typeError('Invalid Date'),
  email: yup
    .string()
    .email()
    .matches(EMAIL_REGEX, {
      message: 'Please enter your email',
      excludeEmptyString: true,
    })
    .required(),
  password: yup.string().min(8).max(32).required(),
  customerContact: yup.object().shape({
    email: yup.string().matches(EMAIL_REGEX, {
      message: 'Please enter your email',
      excludeEmptyString: true,
    }),
  }),

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
    }),
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
    watch,
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isSubmitted, isDirty },
    reset,
    control,
  } = useForm({
    reValidateMode: 'onSubmit',
    resolver: yupResolver(schema),
  })
  const startedAt = watch('startedAt')

  const onSubmit = (data: any) => {
    if (!isDirty) {
      return
    }

    const patchObj = dirtyValues(dirtyFields, data)
    console.log({ patchObj, data, startedAt })
    // reset()
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
                    // we validate on submit, so no need to check for isDirty and isSubmitted
                    // error={(formState.isSubmitted || isDirty) && !!error}
                    // helperText={(formState.isSubmitted || isDirty) && !!error && error?.message}
                    error={!!error}
                    helperText={error?.message}
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
                    // error={(formState.isSubmitted || isDirty) && !!error}
                    // helperText={(formState.isSubmitted || isDirty) && !!error && error?.message}
                    error={!!error}
                    helperText={error?.message}
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
                    // error={(formState.isSubmitted || isDirty) && !!error}
                    // helperText={(formState.isSubmitted || isDirty) && !!error && error?.message}
                    error={!!error}
                    helperText={error?.message}
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
                    // error={(formState.isSubmitted || isDirty) && !!error}
                    // helperText={(formState.isSubmitted || isDirty) && !!error && error?.message}
                    error={!!error}
                    helperText={error?.message}
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
              error={!!errors.uncontrolled}
              helperText={(errors?.uncontrolled?.message as string) ?? undefined}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name={'customerContact.email'}
              control={control}
              render={({ field: { value, ...rest }, fieldState: { error, isDirty, isTouched }, formState }) => (
                <>
                  <Typography variant={'subtitle1'}>Contact email</Typography>
                  <TextField
                    {...rest}
                    fullWidth
                    value={value ?? ''}
                    // error={(formState.isSubmitted || isDirty) && !!error}
                    // helperText={(formState.isSubmitted || isDirty) && !!error && error?.message}
                    error={!!error}
                    helperText={error?.message}
                  />
                </>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name={'startedAt'}
              control={control}
              render={({ field: { value, ...rest }, fieldState: { error, isDirty, isTouched }, formState }) => (
                <>
                  <Typography variant={'subtitle1'}>Start Date</Typography>
                  <TextField
                    {...rest}
                    fullWidth
                    value={value ?? ''}
                    // error={(formState.isSubmitted || isDirty) && !!error}
                    // helperText={(formState.isSubmitted || isDirty) && !!error && error?.message}
                    error={!!error}
                    helperText={error?.message}
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
