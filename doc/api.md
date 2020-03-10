# Messages

This interface describes how objects containing messages for a given language should be written. This type may be used if messages are taken from a foreign application (e.g. plugin). In most cases, the `typeof` default language will be enough.

It is advised not to use keys starting with `$` in messages, to prevent conflict with the `Intl` reserved keywords; but it is mandatory that, for each language, a `$` entry is provided with the name of language. Usually, the name of the language is specified in the language itself.

Each message can be either a string or a function returning a string. The `Messages` type also accepts `undefined`, but this is due to _TypeScript_ constraint and will throw an error if used.

Do not type your default language with `Messages`, because if you do so, `typeof` will return `Messages` and you will loose the specific type checking of your messages. Use the function `createMessages` to check the messages type.

# PartialMessages\<T extends Messages>

This type may be used to indicate a partial translation. It is similar to `Partial<T>` except that the `$` entry is mandatory.

# createMessages\<T extends Messages>(messages: T): T

This identity function does nothing by itself. It is advised to use it anyway for creating messages of a given language as it will allow TypeScript to check for the message types.

# LanguageMapDefinition\<T extends Messages>

This interface describes the data of a full language map. It may be used to retrieve a serialized language map, for exemple when a language map is transmitted from server to browser (see [examples](./examples.md)).

The generic parameter `T` represents the type of the default language.

Note that the `Intl` class converts language code to lowercase and digit separated with underscores. So, instead of, for example `no-NO-NY`, you should use `no_no_ny` in the language map definition key.

A language map definition may have one entry which contains the `default` string instead of the translation. This is used to indicate that this language code is the default language.

# LanguageMap\<T extends Messages>

This object is containing the language map, i.e. the default language messages and all translations for all languages.

The generic parameter `T` represents the type of the default language.

## constructor(messages: LanguageMapDefinition\<T>)

Create a language map based on a definition (an object containing all language map data, including default language).

## constructor(messages: T, defaultLang?: string)

Create a language map base on the default messages. If the `defaultLang` parameter is given, the default messages will also be used for language corresponding to the given name. This may be useful for the default language to be listed in available languages.

## merge\<A extends Messages>(additional: { [key: string]: Partial\<A> }): LanguageMap\<T & A>

Create a new language map containing given messages merged to current definition. The `additional` parameter provides messages which may replace existing strings, create new languages or even extend the string list (e.g. plugin specific messages).

The method will raise an exception if the `additional` parameter contains a language which is not already in the original object and does not contain the `$` entry.

If a message is given in any language while it does not exist in default language, the entry will be duplicated in the default language.

## contains(lang: string): boolean

Indicate if the language map contains the given language. This cannot be used to test existence of `default` language, but default language is always present.

## availables: string[]

Give the list of available languages. These are the languages which would return true if tested with `contains`. This parameter is read-only.

## messages(): Readonly\<T>

Give all the default messages.

## messages(lang: string): Readonly\<PartialMessages\<T>>

Give all the messages for the given language code. If the language is not available, this will return default language messages.

## default: string | undefined

Returns the default language code, if any. This parameter is read-only.

## toString(langs?: string[]): string

Give a string representation of the language map. If the `langs` parameter is specified, only the specified languages will be fully represented. For others, only the language name (`$` key) will be printed in the string. This can be useful if there are a lot of different languages and you don't want the server to send all the translations to the client application, but you want the client application to be able to select from all available languages.

The string is written in legal `JavaScript`.

# Intl\<T extends Messages>

This class is managing the internationalization object. It is based on a language map and language preferences.

The generic parameter `T` represents the type of the default language.

## constructor(languages: LanguageMap\<T>, preferences?: ReadonlyArray\<string>, createGenerics: boolean = true)

Create an internationalization object using the given language map. If `preferences` parameter is provided, its value will be used as the user preferred language order. If true, the parameter `createGenerics` allow more generic language codes to be automatically added in preferences. For example, if preference contains `no-NO-NY`, it will automatically add `no-NO` and `no` in this order after this entry. This parameter may be set to false, for example when using browser preferred languages, as end-user may already define specific and generic preferences.

Note that language codes are formatted to lowercase and digit separated with underscores. So, instead of `no-NO-NY`, the actual language code will be `no_no_ny`. This will ensure a single way of writing language codes, using characters which are valid as object keys in TypeScript (preventing the need to use quotes).

Note that the message names _must not contain one of the keyword_ of the API. In order to prevent name collision, API methods and data begin with a \$ character.

## constructor(intl: Intl\<T>, preferences?: ReadonlyArray\<string>, createGenerics: boolean = true)

Clone the given internationalization object with new preferences. In other words, this will create a new internationalization object with the same language map as the given one but new preferences. Calling this constructor will be faster than creating a new object based on the language map, because message methods will be copied instead of being recreated.

## \$changePreferences(preferences: ReadonlyArray\<string>, createGenerics: boolean = true): this

Change the language preferences of this internationalization object. This is the only method which will modify the object state. If you need your object to be immutable, use the clone constructor instead (see above).

If the MobX library can be loaded, this function will automatically become an action, preventing it from throwing an exception if in MobX strict mode.

## \$preferences: ReadonlyArray\<string>

The preferences really used by the object. Only languages which are found in the language map are retained. This parameter is read-only.

If the MobX library can be loaded, this property will automatically be observable. Because it is read each time a message is displayed, it means that all observers displaying strings will automatically be refreshed when preferences are modified.

## \$languageMap: LanguageMap<T>

Get the underlying language map. This parameter is read-only.

## \$getMessageFunction\<K extends keyof T>(name: K): MessageFunction\<T[K]>

Get the message corresponding to the given name in the most appropriate language. The message is transformed into a function if it is a string.

## All default language keys

Build the message string for the name used as function with given parameters (for which types will be checked) in the most appropriate language.

Note that the language map keys _must not contain one of the reserved_ of the API. In order to prevent name collision, API methods and data begin with a \$ character.
