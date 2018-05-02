import { Messages } from './Messages'

/**
 * Definition of a language map, i.e. the object containing messages for each languages.
 */
export interface LanguageMapDefinition<T extends Messages> {
  default: T
  [key: string]: Partial<T>
}

/**
 * The language map contains a list of messages for each supported language. A LanguageMap is immutable.
 */
export class LanguageMap<T extends Messages> {
  private readonly definition: LanguageMapDefinition<T>
  private _js: string | null = null

  /**
   * Create a new LanguageMap with the given list of messages for all supported languages.
   * @param messages The language map definition.
   */
  constructor(messages: LanguageMapDefinition<T>)

  /**
   * Create a new LanguageMap with the default language messages.
   * @param messages The messages for the default language.
   * @param defaultLang The code of the default language (e.g. 'eo').
   */
  constructor(messages: T, defaultLang?: string)

  constructor(messages: T | LanguageMapDefinition<T>, defaultLang?: string) {
    if (isFullDefinition(messages)) {
      this.definition = messages
    } else {
      this.definition = { default: messages }
      if (defaultLang) {
        this.definition[defaultLang] = messages
      }
    }
  }

  /**
   * Merge new messages (or new languages) to the language map. This will create a new LanguageMap.
   * @param additional The additional messages.
   */
  merge(additional: { [key: string]: Partial<Messages> }): LanguageMap<T> {
    let _definition: LanguageMapDefinition<T> = { ...this.definition }
    Object.keys(additional).forEach(lang => {
      if (!(lang in _definition)) {
        _definition[lang] = {}
      }
      Object.keys(additional[lang]).forEach(message => {
        _definition[lang][message] = additional[lang][message]
      })
    })
    return new LanguageMap(_definition)
  }

  /**
   * Indicate if the map contains the given language.
   * @param lang The language to test.
   */
  contains(lang: string): boolean {
    return lang != 'default' && lang in this.definition
  }

  /**
   * Get available languages in this map.
   */
  get availables(): string[] {
    return Object.keys(this.definition).filter(l => l != 'default')
  }

  /**
   * Get the messages for the given language.
   * @param lang The language for which to get messages, unspecified to get default messages.
   */
  messages(lang?: string): T | Partial<T> {
    if (lang && this.contains(lang)) {
      return this.definition[lang]
    } else {
      return this.definition.default
    }
  }

  /**
   * Messages for default language.
   */
  get default(): T {
    return this.definition.default
  }

  /**
   * Javascript representation of the LanguageMap. The result can be evaluated to a LanguageMapDefinition.
   */
  get js(): string {
    if (!this._js) {
      this._js = '{'
      this._js += Object.keys(this.definition)
        .map(
          lang =>
            `"${lang}": {` +
            Object.keys(this.definition[lang])
              .map(title => [title, this.definition[lang][title]])
              .map(
                ([title, message]) =>
                  `"${title}": ` +
                  (typeof message === 'string'
                    ? `"${message}"`
                    : message!.toString())
              )
              .join(', ') +
            '}'
        )
        .join(', ')
      this._js += '}'
    }
    return this._js
  }
}

function isFullDefinition<T extends Messages>(
  messages: T | LanguageMapDefinition<T>
): messages is LanguageMapDefinition<T> {
  return 'default' in messages && typeof messages.default === 'object'
}
