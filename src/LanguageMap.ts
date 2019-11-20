import { Messages, PartialMessages } from './MessageTypes'

/**
 * Definition of a language map (the object containing messages for each languages).
 */
export type LanguageMapDefinition<T extends Messages> = {
  default: T
} & Omit<{ [lang: string]: PartialMessages<T> | 'default' }, 'default'>

/**
 * The language map contains a list of messages for each supported language. A LanguageMap is immutable.
 */
export class LanguageMap<T extends Messages> {
  private readonly definition: LanguageMapDefinition<T>
  private _js: { [lang: string]: string } = {}

  /**
   * Create a new LanguageMap with the given list of messages for all supported languages. The messages for
   * the default language should not be specified twice, instead, the language entry should contain the
   * string “default” instead of an object. There must only be one such “default” values in all provided
   * languages.
   *
   * @param messages - The language map definition.
   */
  public constructor(messages: LanguageMapDefinition<T>)

  /**
   * Create a new LanguageMap with the default language messages.
   *
   * @param messages - The messages for the default language.
   * @param defaultLang - The code of the default language (e.g. `eo`).
   */
  public constructor(messages: T, defaultLang?: string)

  /*
   * Constructor implementation.
   */
  public constructor(messages: T | LanguageMapDefinition<T>, defaultLang?: string) {
    function isFullDefinition<T extends Messages>(
      tested: T | LanguageMapDefinition<T>
    ): tested is LanguageMapDefinition<T> {
      return 'default' in tested && typeof tested.default === 'object'
    }

    if (isFullDefinition(messages)) {
      this.definition = messages
      if (
        Object.values(messages).reduce((count, values) => (count += values === 'default' ? 1 : 0), 0) > 1
      ) {
        throw new Error('LanguageMap: given definition has multiple defaults')
      }
    } else {
      this.definition = { default: messages }
      if (defaultLang) {
        this.definition[defaultLang] = 'default'
      }
    }
  }

  /**
   * Merge new messages (or new languages) to the language map. This will create a new LanguageMap. Note
   * that all added languages **must** have their name defined in the `$` entry.
   *
   * @param additional - The additional messages.
   * @returns A new language map containing current and added messages.
   */
  public merge<A extends Messages>(additional: { [lang: string]: Partial<A> }): LanguageMap<T & A> {
    const defaultLang = this.default
    function sortValue(key: string) {
      return key === 'default' ? -2 : defaultLang && key === defaultLang ? -1 : 0
    }
    const _definition = Object.entries(this.definition).reduce((previous, [lang, messages]) => {
      previous[lang] = lang === defaultLang ? 'default' : { ...(messages as PartialMessages<T & A>) }
      return previous
    }, {} as LanguageMapDefinition<T & A>)

    Object.entries(additional)
      .sort(([a], [b]) => sortValue(a) - sortValue(b))
      .map<[string, Partial<A>]>(([lang, messages]) => [
        defaultLang && lang === defaultLang ? 'default' : lang,
        messages,
      ])
      .forEach(([lang, messages]) => {
        if (!(lang in _definition)) {
          if (!('$' in messages)) {
            throw new Error(`LanguageMap: merged "${lang}" has no name`)
          }
          _definition[lang] = {} as any
        }
        Object.keys(messages).forEach(message => {
          if (lang !== 'default' && !(message in _definition.default)) {
            ;(_definition.default as any)[message] = messages[message]
          }
          ;(_definition[lang] as any)[message] = messages[message]
        })
      })
    return new LanguageMap(_definition)
  }

  /**
   * Indicate if the map contains the given (non default) language.
   *
   * @param lang - The language to test.
   * @returns True if the map contains the language.
   */
  public contains(lang: string): boolean {
    return lang !== 'default' && lang in this.definition
  }

  /**
   * @returns The available languages in this map.
   */
  public get availables(): string[] {
    return Object.keys(this.definition).filter(l => l !== 'default')
  }

  /**
   * Get the default messages.
   *
   * @returns Default messages.
   */
  public messages(): Readonly<T>

  /**
   * Get the messages for the given language, or default if language is not found.
   *
   * @param lang - The language for which to get messages.
   * @returns Appropriate messages.
   */
  public messages(lang: string): Readonly<PartialMessages<T>>

  /*
   * Implementation
   */
  public messages(lang?: string): Readonly<PartialMessages<T>> {
    if (lang && this.contains(lang)) {
      const result = this.definition[lang]
      if (result !== 'default') {
        return result
      }
    }
    return this.definition.default
  }

  /**
   * @returns Default language if any.
   */
  public get default(): string | undefined {
    return Object.keys(this.definition).find(lang => this.definition[lang] === 'default')
  }

  /**
   * Get a string representation of the language map containing either all the messages (if no lang given)
   * or the only the messages of the given languages plus names of other ones. The representation is legal
   * `Javascript` and can be eval'd to a LanguageMapDefinition.
   *
   * @param langs - The languages for which to get the full representation.
   * @returns The string representation.
   */
  public toString(langs?: ReadonlyArray<string>): string {
    const treatedLangs = (langs || this.availables).slice()
    const defaultLang = this.default
    defaultLang && treatedLangs.unshift(defaultLang)
    treatedLangs.unshift('default')
    const full: string[] = treatedLangs
      .filter((lang, index, array) => array.indexOf(lang) === index)
      .filter(lang => lang in this.definition)
      .map(lang => this.getLangString(lang))
    const partial: string[] = this.availables
      .filter(lang => !treatedLangs.includes(lang))
      .map(lang => `"${lang}":{"$":"${(this.definition[lang] as PartialMessages<T>).$}"}`)
    return '{' + [...full, ...partial].join(',') + '}'
  }

  /**
   * Get or create a string representation for the given language.
   *
   * @param lang - The language for which to get a string representation.
   * @returns The string representation of the language.
   */
  private getLangString(lang: string): string {
    if (!(lang in this._js)) {
      this._js[lang] =
        this.definition[lang] === 'default'
          ? `"${lang}":"default"`
          : `"${lang}":{` +
            Object.entries(this.definition[lang])
              .map(
                ([title, message]) =>
                  `"${title}":` + (typeof message === 'string' ? `"${message}"` : message!.toString())
              )
              .join(',') +
            '}'
    }
    return this._js[lang]
  }
}
