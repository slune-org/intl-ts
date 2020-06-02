import { LanguageMap } from './LanguageMap'
import { MessageFunction, Messages, PartialMessages } from './MessageTypes'

/**
 * The default functions and data for the Intl object.
 */
interface IntlPrototype<T extends Messages> {
  /**
   * The retained preferences.
   */
  readonly $preferences: ReadonlyArray<string>

  /**
   * The underlying language map.
   */
  readonly $languageMap: LanguageMap<T>

  /**
   * Change the preferences for this Intl object.
   *
   * @param preferences - The new preferences.
   * @param createGenerics - If true (default), create generic languages.
   */
  $changePreferences(preferences: ReadonlyArray<string>, createGenerics?: boolean): this

  /**
   * Get the message function for the given name, in the most accurate language.
   *
   * @param name - The name of the message.
   */
  $getMessageFunction<K extends keyof T>(name: K): MessageFunction<T[K]>
}

type IntlMessages<T extends Messages> = { [P in keyof T]: MessageFunction<T[P]> }

/**
 * Main type for internationalization.
 */
export type Intl<T extends Messages> = IntlPrototype<T> & IntlMessages<T>

/**
 * Format the preferences.
 *
 * @param preferences - The preferences.
 * @param createGenerics - Create the generic preferences.
 * @returns Formatted preferences.
 */
function formatPreferences(preferences: ReadonlyArray<string>, createGenerics = true): string[] {
  const formattedPreferences: string[] = []
  for (const preference of preferences) {
    const portions: string[] = preference.split(/(?:[^A-Za-z0-9])/)
    while (portions.length > 0) {
      formattedPreferences.push(portions.join('_').toLowerCase())
      portions.pop()
      if (!createGenerics) {
        break
      }
    }
  }
  return formattedPreferences
}

/**
 * Calculate real preferences based on language map and given preferences.
 *
 * @param languageMap - The language map.
 * @param formattedPreferences - The already formatted preferences.
 * @returns Real preferences.
 */
function calculatePreferences(
  languageMap: LanguageMap<Messages>,
  formattedPreferences: string[]
): string[] {
  const preferences: string[] = []
  for (const preference of formattedPreferences) {
    if (!preferences.includes(preference) && languageMap.contains(preference)) {
      preferences.push(preference)
    }
  }
  return preferences
}

/*
 * Try to load the `mobx` library. If succeed, will give the ability to create observable and actions.
 */
let mobx: typeof import('mobx') | undefined
try {
  if (process && process.env && process.env.INTL_MOBX === 'no') {
    throw new Error()
  }
  // eslint-disable-next-line import/no-extraneous-dependencies
  mobx = require('mobx')
} catch {
  // Silent ignore
}

// Define a property which may be observable if `mobx` is available.
const defineObservableProperty: (o: any, p: string, value: any) => void =
  !!mobx && !!mobx.extendObservable && !!mobx.observable && !!mobx.observable.ref
    ? (o: any, p: string, value: any) => {
        mobx!.extendObservable(o, { [p]: value }, { [p]: mobx!.observable.ref })
        const d = Object.getOwnPropertyDescriptor(o, p)
        d!.enumerable = false
        Object.defineProperty(o, p, d!)
      }
    : (o: any, p: string, value: any) => {
        Object.defineProperty(o, p, {
          configurable: false,
          enumerable: false,
          value,
          writable: true,
        })
      }

/**
 * Create a new Intl.
 *
 * @param this - The Intl object.
 * @param mapOrSource - The Language map to use to get the messages, or the source Intl object to clone.
 * @param preferences - The preferred languages, ordered.
 * @param createGenerics - If true (default), create generic languages for preferences (e.g. Will add 'en'
 * for 'en-US').
 */
export const Intl: {
  prototype: Intl<Messages>
  new <T extends Messages>(
    mapOrSource: LanguageMap<T> | Intl<T>,
    preferences?: ReadonlyArray<string>,
    createGenerics?: boolean
  ): Intl<T>
} = function<T extends Messages>(
  this: Intl<T>,
  mapOrSource: LanguageMap<T> | Intl<T>,
  preferences?: ReadonlyArray<string>,
  createGenerics?: boolean
): void {
  // Create special properties
  Object.defineProperty(this, '$languageMap', {
    configurable: false,
    enumerable: false,
    value: mapOrSource instanceof Intl ? mapOrSource.$languageMap : mapOrSource,
    writable: false,
  })
  defineObservableProperty(
    this,
    '$preferences',
    preferences
      ? calculatePreferences(this.$languageMap, formatPreferences(preferences, createGenerics))
      : []
  )

  // Create (or clone) special functions
  if (mapOrSource instanceof Intl) {
    Object.assign(this, mapOrSource)
  } else {
    for (const key in this.$languageMap.messages()) {
      if (key in this) {
        throw new Error(`Intl: entry "${key}" is not permitted in language map`)
      }
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        value(this: Intl<T>, ...args: any[]) {
          return (this.$getMessageFunction(key) as any)(...args)
        },
        writable: false,
      })
    }
  }
} as any

Intl.prototype.$changePreferences = function<T extends Messages>(
  this: Intl<T>,
  preferences: ReadonlyArray<string>,
  createGenerics?: boolean
): Intl<T> {
  ;(this as any).$preferences = calculatePreferences(
    this.$languageMap,
    formatPreferences(preferences, createGenerics)
  )
  return this
}
if (!!mobx && !!mobx.action) {
  Intl.prototype.$changePreferences = mobx!.action(Intl.prototype.$changePreferences)
}

Intl.prototype.$getMessageFunction = function<T extends Messages, K extends keyof T>(
  this: Intl<T>,
  name: K
): MessageFunction<T[K]> {
  let message: T[K] | undefined
  for (const preference of this.$preferences) {
    const language: Readonly<PartialMessages<T>> = this.$languageMap.messages(preference)
    if (name in language) {
      message = (language as T)[name]
      break
    }
  }
  if (message === undefined) {
    message = this.$languageMap.messages()[name]
  }
  if (typeof message === 'string') {
    return (() => message) as any
  } else if (typeof message === 'function') {
    return message as MessageFunction<T[K]>
  } else {
    throw new Error(`Intl: undefined message is not permitted for entry "${name}"`)
  }
}
