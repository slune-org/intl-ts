import {
  Messages,
  Message0,
  Message1,
  Message2,
  Message3,
  Message4,
  Message5,
  Message6,
} from './Messages'
import { LanguageMap } from './LanguageMap'

/**
 * Main class managing internationalization. Intl objects are immutable.
 */
export class Intl<T extends Messages> {
  readonly preferences: ReadonlyArray<string>

  /**
   * Create a new Intl.
   * @param languages The LanguageMap to use to get the messages.
   * @param preferences The preferred languages, ordered.
   * @param createGeneric True to create generic languages in preferences (e.g. will add 'en' for 'en-US').
   */
  constructor(
    private readonly languages: LanguageMap<T>,
    preferences?: ReadonlyArray<string>,
    createGeneric: boolean = true
  ) {
    const _preferences: string[] = []
    if (preferences) {
      for (let preference of Intl.formatPreferences(
        preferences,
        createGeneric
      )) {
        if (
          _preferences.indexOf(preference) < 0 &&
          this.languages.contains(preference)
        ) {
          _preferences.push(preference)
        }
      }
    }
    this.preferences = _preferences
  }

  private static formatPreferences(
    preferences: ReadonlyArray<string>,
    createGeneric: boolean
  ): string[] {
    let formattedPreferences: string[] = []
    for (let preference of preferences) {
      let portions: string[] = preference.split(/(?:[^A-Za-z0-9])/)
      while (portions.length > 0) {
        formattedPreferences.push(portions.join('_').toLowerCase())
        portions.pop()
        if (!createGeneric) {
          break
        }
      }
    }
    return formattedPreferences
  }

  /**
   * Change the preferred language. This will create a new Intl object.
   * @param preferences The preferred languages, ordered.
   * @param createGeneric True to create generic languages in preferences (e.g. will add 'en' for 'en-US').
   */
  changePreferences(
    preferences: ReadonlyArray<string>,
    createGeneric: boolean = true
  ): Intl<T> {
    return new Intl(this.languages, preferences, createGeneric)
  }

  /**
   * Get the translated message.
   * @param name The name of the message to get.
   */
  t<O extends Messages & { [P in K]: Message0 }, K extends keyof O>(
    this: Intl<O>,
    name: K
  ): string

  /**
   * Get the translated message.
   * @param name The name of the message to get.
   */
  t<O extends Messages & { [P in K]: Message1<P1> }, K extends keyof O, P1>(
    this: Intl<O>,
    name: K,
    p1: P1
  ): string

  /**
   * Get the translated message.
   * @param name The name of the message to get.
   */
  t<
    O extends Messages & { [P in K]: Message2<P1, P2> },
    K extends keyof O,
    P1,
    P2
  >(this: Intl<O>, name: K, p1: P1, p2: P2): string

  /**
   * Get the translated message.
   * @param name The name of the message to get.
   */
  t<
    O extends Messages & { [P in K]: Message3<P1, P2, P3> },
    K extends keyof O,
    P1,
    P2,
    P3
  >(this: Intl<O>, name: K, p1: P1, p2: P2, p3: P3): string

  /**
   * Get the translated message.
   * @param name The name of the message to get.
   */
  t<
    O extends Messages & { [P in K]: Message4<P1, P2, P3, P4> },
    K extends keyof O,
    P1,
    P2,
    P3,
    P4
  >(this: Intl<O>, name: K, p1: P1, p2: P2, p3: P3, p4: P4): string

  /**
   * Get the translated message.
   * @param name The name of the message to get.
   */
  t<
    O extends Messages & { [P in K]: Message5<P1, P2, P3, P4, P5> },
    K extends keyof O,
    P1,
    P2,
    P3,
    P4,
    P5
  >(this: Intl<O>, name: K, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5): string

  /**
   * Get the translated message.
   * @param name The name of the message to get.
   */
  t<
    O extends Messages & { [P in K]: Message6<P1, P2, P3, P4, P5, P6> },
    K extends keyof O,
    P1,
    P2,
    P3,
    P4,
    P5,
    P6
  >(
    this: Intl<O>,
    name: K,
    p1: P1,
    p2: P2,
    p3: P3,
    p4: P4,
    p5: P5,
    p6: P6
  ): string

  t<
    O extends Messages & { [P in K]: (...args: any[]) => string },
    K extends keyof O
  >(this: Intl<O>, name: K, ...args: any[]): string {
    const message = this.getMessage(name)
    if (typeof message === 'string') {
      return message
    } else {
      return (message as (...args: any[]) => string)(...args)
    }
  }

  /**
   * Get the message (string or function) with the given name, in the most accurate language.
   * @param name The name of the message.
   */
  getMessage<K extends keyof T>(name: K): T[K] {
    for (let preference of this.preferences) {
      let language: Partial<T> = this.languages.messages(preference)
      if (name in language) {
        return language[name] as T[K]
      }
    }
    return this.languages.default[name]
  }

  /**
   * The underlying language map.
   */
  get languageMap(): LanguageMap<T> {
    return this.languages
  }
}
