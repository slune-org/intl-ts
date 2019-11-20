# Examples

Here are some examples of the library usage.

The source code contains two example projects in the directory `examples` which can be generated with the command:

```bash
$ npm run example
```

Those two projects very basics do exactly the same thing as seen by a final user. They show how to use the library in real life and are based on the source project located in the sub-directory `content`. Some code snippets extracted from the examples are used in this document.

In order to test one of those project, change to its directory and execute the command:

```bash
$ npm install && npm run go
```

You can then observe the result with a browser going at the address: http://localhost:8080.

Please note that the source project itself (`content`) could be tested, but because it does not have state management, its global state (i.e. selected language) cannot be modified. The interest is then limited to comparison with other projects.

## Complete sending and MobX usage

This example can be individually generated using the command:

```bash
$ npm run example:mobx-full
```

In this example, all translations are sent at start from the server to the client. The client then uses the MobX library in order to manage the language changes.

## Partial sending and Redux usage

This example can be individually generated using the command:

```bash
$ npm run example:redux-lite
```

In this example, only the needed translations are sent to the client. The client must then request a new translation map when the user selects another language. Language changes are managed by the Redux library.

# Locale directory

These examples are based on a `locale` directory containing an `index.ts` file and one file per language, the name of the file being the language code.

## Default language file

The main file will be for the default (reference) language. By the way, you can see how to create a formatting function (here times).

[See the full file](../examples/content/src/locale/en.ts)

```typescript
// locale/en.ts
export const messages = {
  $: 'English',
  welcome: 'Welcome here!',
  hello: (name: string) => `Hello ${name}!`,
  showNameSize: (size: number) => {
    switch (size) {
      case 0: {
        return 'You did not give a name yet.'
      }
      case 1: {
        return 'Your name has one single letter.'
      }
      default: {
        return `Your name has ${size} letters.`
      }
    }
  },
  convertTime: (date: Date) => {
    let time = ''
    if (date.getHours() === 0 && date.getMinutes() === 0) {
      time = 'midnight'
    } else if (date.getHours() === 12 && date.getMinutes() === 0) {
      time = 'noon'
    } else {
      time += ((date.getHours() + 11) % 12) + 1
      time += date.getMinutes() === 0 ? '' : ':' + ('0' + date.getMinutes()).slice(-2)
      time += date.getHours() >= 12 ? ' p.m.' : ' a.m.'
    }
    if (date.getSeconds() !== 0) {
      time += ` and ${date.getSeconds()} second`
      if (date.getSeconds() > 1) {
        time += 's'
      }
    }
    return time
  },
}
```

## Full translation

A full language file will match the default language type to ensure no entry is forgotten.

[See the full file](../examples/content/src/locale/fr.ts)

```typescript
// locale/fr.ts
import { messages as defLang } from './en'

export const messages: typeof defLang = {
  $: 'Français',
  welcome: 'Bienvenue ici !',
  hello: (name: string) => `Bonjour ${name} !`,
  showNameSize: (size: number) => {
    switch (size) {
      case 0: {
        return 'Vous n’avez pas encore indiqué de nom.'
      }
      case 1: {
        return 'Votre nom n’a qu’une seule lettre.'
      }
      default: {
        return `Votre nom a ${size} lettres.`
      }
    }
  },
  convertTime: (date: Date) => {
    let time = `${date.getHours()}h`
    time += ('0' + date.getMinutes()).slice(-2)
    if (date.getSeconds() !== 0) {
      time += ` et ${date.getSeconds()} seconde`
      if (date.getSeconds() > 1) {
        time += 's'
      }
    }
    return time
  },
}
```

## Partial translation

A partial language file will match a `PartialMessages` of the default language type. This will only ensure that parameters are matching.

```typescript
// locale/fr_ca.ts
import { PartialMessages } from 'intl-ts'
import { messages as defLang } from './en'

export const messages: PartialMessages<typeof defLang> = {
  $: 'Français (Canada)',
  welcome: 'Bienvenue icitte !',
}
```

Note that, by default, when the `Français (Canada)` will be selected, the `fr_ca` preference will be given to the `Intl` object which will automatically add the `fr` preference as second choice, which will correctly fill the translations (this is the result of the `createGenerics` option in the constructor and in the `$changePreferences()` method). As a last choice, if translation is still not found, the default language is used.

## Index file

The purpose of the index file is to merge all this and create the internationalization object. It will export:

- the type of the messages (which is the type of the default language messages), because it will be needed in multiple places,
- a reference to the internationalization object.

```typescript
// locale/index.ts
import { basename } from 'path'
import { sync } from 'glob'
import Intl, { LanguageMap, PartialMessages } from 'intl-ts'
import { messages as en } from './en'

export type langType = typeof en

const languageMap = sync(`${__dirname}/*.js`)
  .map(file => basename(file, '.js'))
  .filter(language => !['index', 'en'].includes(language))
  .map(language => ({ [language]: require(`./${language}`).messages as PartialMessages<langType> }))
  .reduce((map, language) => map.merge(language), new LanguageMap(en, 'en'))

export const lang = new Intl<langType>(languageMap, [process.env.LANG || ''])
```

# Server side

At server side, usage is rather straightforward.

```typescript
import { lang } from './locale'

const name = 'Jane Doe'
console.info(lang.hello(name))
```

Note that if some messages are only be used at server side and never be sent to the client, it may be a good idea to keep them in a separated `Intl` object.

## Send data to browser

The following snippet is using the Express library to generate the full page to be sent to the client (_Server Side Rendering_) and adds all the translations to it.

[See the full file](../examples/content/src/index.ts)

```typescript
const stringifyLanguage = (language: Intl<any>): string =>
  `window.__LANGUAGE__=${JSON.stringify({
    preferences: language.$preferences,
  }).replace(/</g, '\\u003c')}; window.__LANGUAGE__.languageMap=${language.$languageMap.toString()}`

// Calculate preferred languages order based on accept-language header
function calculatePreferredLanguages(languages?: string | string[]): string[] {
  let preferred: string[] = []
  if (languages) {
    if (typeof languages === 'string') {
      preferred = languages.split(',')
    } else {
      preferred = languages
    }
  }
  return preferred.map(prefLang => prefLang.split(';')[0])
}

const app = express()
app.get('/', (req, res) => {
  const preferredLanguages = calculatePreferredLanguages(req.headers['accept-language'])
  // Clone the language using calculated preferences
  // Do not create generics, it should already be included in browser preferences
  const reqLang = new Intl(lang, preferredLanguages, false)
  const htmlContent = renderToString(createLayout(reqLang))
  const preload = stringifyLanguage(reqLang)
  res.status(200).send(content(htmlContent, preload))
})
```

## Partial sending

With a big project with a lot of translations, it may be interesting to only send the needed translations (related to preferences). It is then needed to update the `stringifyLanguage` method above:

```typescript
const stringifyLanguage = (language: Intl<any>): string =>
  `window.__LANGUAGE__=${JSON.stringify({
    preferences: language.$preferences,
  }).replace(/</g, '\\u003c')}; window.__LANGUAGE__.languageMap=${language.$languageMap.toString(
    language.$preferences
  )}`
```

Another entry must also be added to the server in order to send other translations on demand:

```typescript
app.get('/lang/:code', (req, res) => {
  const reqLang = new Intl(lang, [req.params.code])
  res.status(200).send(stringifyLanguage(reqLang))
})
```

# Browser side

Data sent by the server can afterwards be retrieved by the client:

```typescript
export function eatLanguageData(
  container?: HTMLElement
): { preferences: string[]; languageMap: LanguageMap<import('../locale').langType> } {
  if (!window.__LANGUAGE__) {
    throw new Error('Data initialization error')
  }
  const preferences = window.__LANGUAGE__.preferences
  const languageMap = new LanguageMap(window.__LANGUAGE__.languageMap)
  delete window.__LANGUAGE__
  container && container.remove()
  return { preferences, languageMap }
}

const { preferences, languageMap } = eatLanguageData(document.getElementById('preload') || undefined)
const lang = new Intl(languageMap, preferences, false)
```

Note the usage of the TypeScript type import `import('../locale').langType` which will allow the generated bundle file not to already integrate all the translations.

## Use translations

Because language selection has an impact on the full application, it is highly advised to put the linguistic object into the global state, and therefore use a state management library, like MobX or Redux.

On the below snippet, a `useLang()` method is used, for which implementation details are depending on the used library. Please refer to the example projects if needed.

```tsx
import * as React from 'react'
import { FunctionComponent } from 'react'
import { useLang } from './Store'

const Welcome: FunctionComponent = () => {
  const lang = useLang()
  return <h1>{lang.welcome()}</h1>
}
export default Welcome
```

## Let user select language

The following example shows how to use a select box for a user to select language from available ones:

```tsx
const Language: FunctionComponent = () => {
  const lang = useLang()
  const languageMap = lang.$languageMap
  const selected = lang.$preferences.length > 0 ? lang.$preferences[0] : lang.$languageMap.default

  const onChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    lang.$changePreferences([event.target.value])
  }, [])

  return useObserver(() => (
    <>
      <label htmlFor="lang-select">{lang.selectLanguage()}</label>&nbsp;
      <select id="lang-select" value={selected} onChange={onChange}>
        {languageMap.availables.sort().map(langCode => (
          <option key={langCode} value={langCode}>
            {languageMap.messages(langCode).$}
          </option>
        ))}
      </select>
    </>
  ))
}
```

This snippet is using MobX (so the `useObserver()`) and so directly modifies the `Intl` object. If the linguistic object must be immutable, the `onChange` method should instead send an event to the state manager:

```tsx
const updatePreference = useUpdatePreference()
const onChange = useCallback(
  (event: ChangeEvent<HTMLSelectElement>) => {
    updatePreference(event.target.value)
  },
  [updatePreference]
)
```
