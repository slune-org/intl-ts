import { LanguageMap } from './LanguageMap'
import { MessageDirect, MessageParams, Messages } from './Messages'

export type MessageFunction<
  T extends MessageDirect | MessageParams<any, any, any, any, any, any>
> = T extends string ? () => string : T

/**
 * The default functions and data for the Intl object.
 */
export interface IntlPrototype<T extends Messages> {
  /**
   * The retained preferences.
   */
  readonly $preferences: ReadonlyArray<string>

  /**
   * The underlying language map.
   */
  readonly $languageMap: LanguageMap<T>

  /**
   * Create a clone of this Intl object with the given preferences.
   * @param preferences The new preferences.
   * @param createGenerics True to create generic languages.
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

export type IntlMessages<T extends Messages> = {
  [P in keyof T]: MessageFunction<T[P]>
}

/**
 * Main type for internationalization. Intl objects are immutable.
 */
export type Intl<T extends Messages> = IntlPrototype<T> & IntlMessages<T>

/**
 * Format the preferences.
 * @param preferences The preferences.
 * @param createGenerics Create the generic preferences.
 */
function formatPreferences(
  preferences: ReadonlyArray<string>,
  createGenerics: boolean
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
 * Create a new Intl.
 * @param languageMap The Language map to use to get the messages.
 * @param preferences The preferred languages, ordered.
 * @param createGenerics True to create generic languages in preferences (e.g. will add 'en' for 'en-US').
 */
// tslint:disable-next-line:variable-name
export const Intl: {
  prototype: Intl<Messages>
  new <T extends Messages>(
    languageMap: LanguageMap<T>,
    preferences?: ReadonlyArray<string>,
    createGenerics?: boolean
  ): Intl<T>
} = function<T extends Messages>(
  this: Intl<T>,
  languageMap: LanguageMap<T>,
  preferences?: ReadonlyArray<string>,
  createGenerics: boolean = true
): void {
  const self: any = this // tslint:disable-line:no-this-assignment
  self.$languageMap = languageMap
  const _preferences: string[] = []
  if (preferences) {
    for (const preference of formatPreferences(preferences, createGenerics)) {
      if (
        !_preferences.includes(preference) &&
        this.$languageMap.contains(preference)
      ) {
        _preferences.push(preference)
      }
    }
  }
  self.$preferences = _preferences
  for (const key in this.$languageMap.default) {
    if (key in self) {
      throw new Error(`Entry ${key} is not permitted in language map`)
    }
    self[key] = this.$getMessageFunction(key)
  }
} as any

Intl.prototype.$withPreferences = function<T extends Messages>(
  this: Intl<T>,
  preferences: ReadonlyArray<string>,
  createGenerics?: boolean
): Intl<T> {
  return new Intl(this.$languageMap, preferences, createGenerics)
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
