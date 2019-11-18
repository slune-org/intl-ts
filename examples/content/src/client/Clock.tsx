// eslint-disable-next-line import/no-duplicates
import * as React from 'react'
// eslint-disable-next-line import/no-duplicates
import { FunctionComponent, useEffect, useState } from 'react'
import { useLang } from './Store'

const Clock: FunctionComponent = () => {
  const lang = useLang()
  const [date, setDate] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  return <p>{lang.displayTime(lang.convertDate(date), lang.convertTime(date))}</p>
}
export default Clock
