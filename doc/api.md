# Messages

This interface describes how objects containing messages for a given language should be written. This type may be used if messages are taken from a foreign application (e.g. plugin). In most cases, the `typeof` default language will be enough.

Do not type your default language with `Message`, because if you do so, `typeof` will return `Message` and you will loose the specific type checking of your messages. If your default language is not written as expected, a compile time error will be raised when the language map will be created.

# LanguageMapDefinition<T extends Messages>

This interface describes the data of a full language map. It may be used to retrieve a serialized language map, for exemple when a language map is transmitted from server to browser (see [code snippets](./examples.md)).

The generic parameter `T` represents the type of the default language.

Note that the `Intl` class converts language code to lowercase and digit separated with underscores. So, instead of, for example `no-NO-NY`, you should use `no_no_ny` in the language map definition key.

# LanguageMap<T extends Messages>

This object is containing the language map, i.e. the default language messages and all translations for all languages.

The generic parameter `T` represents the type of the default language.

## constructor(messages: LanguageMapDefinition<T>)

Create a language map based on a definition (an object containing all language map data, including default language).

## constructor(messages: T, defaultLang?: string)

Create a language map base on the default messages. If the `defaultLang` parameter is given, the default messages will also be used for language corresponding to the given name. This may be useful for the default language to be listed in available languages.

## merge(additional: { [key: string]: Partial<Messages> }): LanguageMap<T>

Create a new language map containing given messages merged to current definition. The `additional` parameter may replace existing strings, create new languages or even extend the string list (e.g. plugin specific messages).

## contains(lang: string): boolean

Indicate if the language map contains the given language. This cannot be used to test existance of default language, but default language is always present.

## availables: string[]

Give the list of available languages. These are the languages which would return true if tested with `contains`. This parameter is read-only.

## messages(lang?: string): T | Partial<T>

Give all the messages for the given language code. If the language is not available or if the parameter `lang` is not provided, this will return default language messages.

## default: T

Give all the messages for the default language. This parameter is read-only.

## js: string

Give a JavaScript string which is a serialization of the language map. This parameter is read-only.

# Intl<T extends Messages>

This class is managing the internationalization object. It is based on a language map and language preferences.

The generic parameter `T` represents the type of the default language.

## constructor(languages: LanguageMap<T>, preferences?: ReadonlyArray<string>, createGeneric: boolean = true)

Create an internationalization object using the given language map. If `preferences` parameter is provided, its value will be used as the user preferred language order. If true, the parameter `createGeneric` allow more generic language codes to be automatically added in preferences. For example, if preference contains `no-NO-NY`, it will automatically add `no-NO` and `no` in this order after this entry. This parameter may be set to false, for example when using browser preferred languages, as end-user may already define specific and generic preferences.

Note that language code are formatted to lowercase and digit separated with underscores. So, instead of `no-NO-NY`, the actual language code will be `no_no_ny`. This will ensure a single way of writting language codes, using characters which are valid as object keys in TypeScript (preventing the need to use quotes).

## changePreferences(preferences: ReadonlyArray<string>, createGeneric: boolean = true): Intl<T>

Create a new internationalization object with the same language map as this one but new preferences.

## t<K extends keyof T>(name: K, ...args: any[]): string

Build the message for the given name with given parameters in the most appropriate language. This method is actually overridden so that parameter types are checked at compile time against message expected parameter types.

## getMessage<K extends keyof T>(name: K): T[K]

Get the message corresponding to the given name in the most appropriate language. The message is not formatted and may be a string or a function.

## languageMap: LanguageMap<T>

Get the underlying language map. This parameter is read-only.
