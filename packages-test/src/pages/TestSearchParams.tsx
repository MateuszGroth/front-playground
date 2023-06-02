import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

function TestSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    console.log('idzie to')
    setSearchParams(searchParams)
  }, [])

  useEffect(
    () => () => {
      console.log('idzie unmount')
    },
    []
  )

  return <div>TestSearchParams</div>
}

export default TestSearchParams
