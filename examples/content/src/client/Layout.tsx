// eslint-disable-next-line import/no-duplicates
import * as React from 'react'
// eslint-disable-next-line import/no-duplicates
import { FunctionComponent, createElement } from 'react'
import Intl from 'intl-ts'
import Clock from './Clock'
import Language from './Language'
import Name from './Name'
import { Store, StoreProvider } from './Store'
import Welcome from './Welcome'

type langType = import('../locale').langType

export interface LayoutProps {
  lang: Intl<langType>
}

const Layout: FunctionComponent<LayoutProps> = ({ lang }) => {
  return (
    <StoreProvider value={new Store(lang)}>
      <Welcome />
      <Clock />
      <Language />
      <Name />
    </StoreProvider>
  )
}
export default Layout

export function createLayout(lang: Intl<langType>) {
  return createElement(Layout, { lang })
}
