import Intl from 'intl-ts'
import { createContext, useContext } from 'react'

type langType = import('../locale').langType

export class Store {
  public constructor(public lang: Intl<langType>) {}
}

const storeContext = createContext<Store | undefined>(undefined)
export function useLang(): Intl<langType> {
  const store = useContext(storeContext)
  if (!store) {
    throw new Error('Trying to use store before initialization')
  }
  return store.lang
}
export const StoreProvider = storeContext.Provider
