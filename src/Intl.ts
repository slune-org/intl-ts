import { LanguageMap } from './LanguageMap'
import { MessageFunction, Messages } from './Messages'

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
   * @param preferences The new preferences.
   * @param createGenerics If true (default), create generic languages.
   */
  $changePreferences(
    preferences: ReadonlyArray<string>,
    createGenerics?: boolean
  ): this

  /**
   * Deprecated, create a new Intl object instead.
   */
  $withPreferences(
    preferences: ReadonlyArray<string>,
    createGenerics?: boolean
  ): Intl<T>

  /**
   * Get the message function for the given name, in the most accurate language.
   * @param name The name of the message.
   */
  $getMessageFunction<K extends keyof T>(name: K): MessageFunction<T[K]>
}

type IntlMessages<T extends Messages> = {
  [P in keyof T]: MessageFunction<T[P]>
}

/**
 * Main type for internationalization.
 */
export type Intl<T extends Messages> = IntlPrototype<T> & IntlMessages<T>

/**
 * Format the preferences.
 * @param preferences The preferences.
 * @param createGenerics Create the generic preferences.
 */
function formatPreferences(
  preferences: ReadonlyArray<string>,
  createGenerics: boolean = true
): string[] {
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
 * @param languageMap The language map.
 * @param formattedPreferences The already formatted preferences.
 */
function calculatePreferences(
  languageMap: LanguageMap<any>,
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

/**
 * Create a new Intl.
 * @param mapOrSource The Language map to use to get the messages, or the source Intl object to clone.
 * @param preferences The preferred languages, ordered.
 * @param createGenerics If true (default), create generic languages for preferences (e.g. will add 'en' for 'en-US').
 */
// tslint:disable-next-line:variable-name (building a special object)
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
  Object.defineProperty(this, '$preferences', {
    configurable: true, // Needed to make it observable
    enumerable: false,
    value: preferences
      ? calculatePreferences(
          this.$languageMap,
          formatPreferences(preferences, createGenerics)
        )
      : [],
    writable: true,
  })

  // Create (or clone) special functions
  if (mapOrSource instanceof Intl) {
    Object.assign(this, mapOrSource)
  } else {
    for (const key in this.$languageMap.default) {
      if (key in this) {
        throw new Error(`Entry ${key} is not permitted in language map`)
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
  // tslint:disable-next-line:no-this-assignment
  const thisAny: any = this
  thisAny.$preferences = calculatePreferences(
    this.$languageMap,
    formatPreferences(preferences, createGenerics)
  )
  return this
}

Intl.prototype.$withPreferences = function<T extends Messages>(
  this: Intl<T>,
  preferences: ReadonlyArray<string>,
  createGenerics?: boolean
): Intl<T> {
  // tslint:disable-next-line:no-console (temporary deprecation message)
  console.log(
    'Warning: Intl.$withPreferences is deprecated — Create a new Intl instead'
  )
  return new Intl(this, preferences, createGenerics)
}

Intl.prototype.$getMessageFunction = function<
  T extends Messages,
  K extends keyof T
>(this: Intl<T>, name: K): MessageFunction<T[K]> {
  let message: T[K] | null = null
  for (const preference of this.$preferences) {
    const language: Partial<T> = this.$languageMap.messages(preference)
    if (name in language) {
      message = language[name] as T[K]
      break
    }
  }
  if (!message) {
    message = this.$languageMap.default[name]
  }
  if (typeof message === 'string') {
    return (() => message) as MessageFunction<T[K]>
  } else {
    return message as MessageFunction<T[K]>
  }
}
