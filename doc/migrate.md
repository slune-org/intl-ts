# Migrating from v3 or previous to v4

If you where using a previous version of the library, here are the few modifications to do in order to user version 4.

# Intl

## Method \$withPreferences is removed

The `$withPreferences(preferences: ReadonlyArray<string>, createGenerics: boolean = true): Intl<T>` method, already deprecated since the version 3, is now removed. You now have to create a new object using the constructor `new Intl<T>(intl: Intl<T>, preferences: ReadonlyArray<string>, createGenerics: boolean)`.

Example :

```diff
-t = t.$withPreferences(preferences, createGenerics);
+t = new Intl(t, preferences, createGenerics);
```

# LanguageMap

## Property js is removed

The `js` property returning the representation of the object as a legal `Javascript` string, is removed and replaced with the method `toString(langs?: string[]): string` used with no parameter. Note that the default language is no more duplicated, but indicated using the new way to manage default language (see below).

Example :

```diff
-const script = `window.messages = ${messageMap.js};`;
+const script = `window.messages = ${messageMap.toString()};`;
```

## Property default does not have the same meaning

The `default` property is now returning the code of the language which is used by default instead of the default language messages. Si you need to get the default messages, you now have to use the version with no parameters of the `messages(): Readonly<T>` method.

Example :

```diff
-messages = langMap.default;
+messages = langMap.messages();
```

## Messages are now read-only

The `messages(lang: string): Readonly<PartialMessages<T>>` (or `messages(): Readonly<T>`) method is returning messages in a given or the default language. Returned messages are directly those in memory, which could allow them to be modified. This is not expected by the library, and to prevent this, the return type of this method is now tagged as `Readonly`.

## Language name is mandatory

Messages given to the constructor must, for each of them, have an entry `$` containing the name of the language, usually in the language itself.

The same is for the `merge<A extends Messages>(additional: { [key: string]: Partial<A> }): LanguageMap<T & A>` method which will raise an exception if the `additional` parameter contains a language which is not already in the original object and does not contain the `$` entry.

Example :

```diff
 const en = {
+  $: 'English',
   welcome: 'Welcome here!',
```

## Default language is not managed the same way anymore

In previous version, if a language code was given, the default language was duplicated inside the object. Now, the default language is internally indicated by the `default` string instead of the language messages. Note that only one language must be indicated this way; an exception will be raised otherwise. The string representation (see above) is using this new way to do.

Example :

```diff
 const langMapDefinition = {
   default: en,
-  en,
+  en: 'default',
   fr,
```

The default language must contain all the messages available in other languages. An exception will be raised by the `merge<A extends Messages>(additional: { [key: string]: Partial<A> }): LanguageMap<T & A>` method if you try to add an entry in another language while it does not exist in the default one.
