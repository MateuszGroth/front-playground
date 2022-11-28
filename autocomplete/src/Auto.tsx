import { useState, useEffect, useMemo, useCallback, forwardRef, ForwardedRef, useRef, useImperativeHandle } from 'react'
import { List, Chip, TextField, Autocomplete, CircularProgress } from '@mui/material'
import { throttle } from 'lodash'

import { useData, Option } from './useData'

const Auto = () => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [value, setValue] = useState<Option[]>([])

  const pokemonsQueryData = useData(open, inputValue)
  const { fetchNextPage, hasNextPage, isFetching, data, error, isError } = pokemonsQueryData

  const newOptions = useMemo<Option[]>(() => {
    const fetched =
      data?.pages.flatMap((page) => {
        return page.results
      }) ?? []
    const uniqueOptions: Option[] = []
    const currentValue = value.map((val) => ({ ...val, isSelected: true }))
    return [...fetched, ...currentValue].reduce((acc, curr) => {
      if (!acc.some(({ name }) => name === curr.name)) {
        acc.push(curr)
      }
      return acc
    }, uniqueOptions)
  }, [value, data])

  const handleChange = (ev: any, newValue: Option[]) => {
    setValue(newValue)
  }
  const handleScroll = useCallback(
    (ev: any) => {
      if (!hasNextPage || isFetching) {
        return
      }
      const listHeight = ev.target.scrollHeight
      const offsetBottom = ev.target.scrollTop + ev.target.offsetHeight
      const shouldFetch = listHeight - offsetBottom < 200
      if (!shouldFetch) {
        return
      }

      fetchNextPage()
    },
    [hasNextPage, isFetching, fetchNextPage]
  )

  const throttledHandleScroll = useMemo(() => {
    return throttle(handleScroll, 300)
  }, [handleScroll])

  const isLoading = isFetching

  return (
    <Autocomplete
      sx={{ flexBasis: '15rem', minWidth: '15rem' }}
      multiple
      // filterSelectedOptions
      data-testid="autocomplete"
      size="small"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue.trim())
      }}
      filterOptions={(options) => options.filter(({ isSelected }) => !isSelected)}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      loading={isLoading}
      onChange={handleChange}
      value={value}
      options={newOptions}
      renderTags={(value: readonly Option[], getTagProps) =>
        value.map((option: Option, index: number) => (
          <Chip variant="outlined" size="small" label={option.name} {...getTagProps({ index })} />
        ))
      }
      clearIcon={isLoading ? <></> : undefined}
      ListboxComponent={ListBox}
      ListboxProps={{
        onScroll: throttledHandleScroll,
        // onScroll: (ev: UIEvent<HTMLElement>) => {
        //   ev.persist();
        //   throttledHandleScroll(ev);
        // },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size={'small'}
          name={'autocomplete'}
          label={'My Autocomplete'}
          error={isError}
          helperText={error ? error.toString().slice(0, 35) : undefined}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading && (
                  <CircularProgress color="primary" size={20} sx={{ position: 'absolute', right: '37px' }} />
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}

type ListBoxProps = React.HTMLAttributes<HTMLUListElement>

const ListBox = forwardRef(function ListBoxBase(props: ListBoxProps, ref: ForwardedRef<HTMLUListElement>) {
  const innerRef = useRef<any>()
  const { children, ...rest } = props

  useImperativeHandle(ref, () => {
    return {
      querySelector: (selector: string) => innerRef.current.querySelector(selector),
      parentElement: {
        contains: (el: HTMLElement) => innerRef.current.parentElement.contains(el),
        querySelector: (selector: string) => {
          const object = innerRef.current.parentElement.querySelector(selector)

          // if (selector === '[role="listbox"]') {
          //   const property = 'scrollTop'
          //   var ownObjectProto = Object.getPrototypeOf(object)
          //   // exit if bad property
          //   console.log(object[property])
          //   if (object[property] == null) {
          //     console.error(property + ' is not a property of ' + object.toString())
          //     return
          //   }

          //   while (!Object.getOwnPropertyDescriptor(ownObjectProto, property)) {
          //     ownObjectProto = Object.getPrototypeOf(ownObjectProto)
          //   }

          //   var ownProperty = Object.getOwnPropertyDescriptor(ownObjectProto, property)
          //   Object.defineProperty(object, property, {
          //     // Create a new setter for the property
          //     set: function (val) {
          //       // if (val === 0) {
          //       //   // const currentTop = ownProperty?.get?.call(this);
          //       //   // console.log()
          //       //   return ownProperty?.set?.call(this, 0)
          //       // }
          //       return (object.scrollTop = val)
          //     },
          //   })
          // }

          return object
        },
      },
    } as any
  }) //

  return (
    // role=list-box must not be removed. It makes the autocomplete not scroll to the top on options change
    // eslint-disable-next-line jsx-a11y/aria-role
    <List
      {...rest}
      ref={innerRef}
      sx={{
        'li:hover': {
          background: (theme) => theme.palette.action.hover,
        },
      }}
    >
      {children}
    </List>
  )
})

export default Auto
