// eslint-disable-next-line import/no-duplicates
import * as React from 'react'
// eslint-disable-next-line import/no-duplicates
import { FunctionComponent } from 'react'
import { useLang } from './Store'

const Welcome: FunctionComponent = () => {
  const lang = useLang()
  return <h1>{lang.welcome()}</h1>
}
export default Welcome
