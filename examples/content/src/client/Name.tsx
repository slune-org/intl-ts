// eslint-disable-next-line import/no-duplicates
import * as React from 'react'
// eslint-disable-next-line import/no-duplicates
import { ChangeEvent, FunctionComponent, useCallback, useState } from 'react'
import { useLang } from './Store'

const Name: FunctionComponent = () => {
  const lang = useLang()
  const [userName, setUserName] = useState('')

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value)
  }, [])

  const greetings = userName ? <p>{lang.hello(userName)}</p> : undefined

  return (
    <>
      <hr />
      <label htmlFor="username">{lang.enterName()}</label>&nbsp;
      <input id="username" type="text" value={userName} onChange={onChange}></input>
      <hr />
      {greetings}
      <p>{lang.showNameSize(userName.length)}</p>
    </>
  )
}
export default Name
