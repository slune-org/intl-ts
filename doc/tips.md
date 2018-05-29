# Tips

Here are some examples of how to use the library.

# Node server

These examples suppose you have a Node.js server with a `locale` directory containing an `index.ts` file and one file per language, the name of the file be the language code.

## Language files

The main file will be for the default (reference) language.

```typescript
// locale/en.ts
export const messages = {
  welcome: 'Welcome!',
  hello: (name: string) => `Hello ${name}`,
  showElementCount: (count: number) => {
    switch (count) {
      case 0: {
        return 'There are no elements'
      }
      case 1: {
        return 'There is one element'
      }
      default: {
        return `There are ${count} elements`
      }
    }
  },
}
```

Complete language files will match the default language type to ensure no entry is forgotten.

```typescript
// locale/fr.ts
import { messages as default } from './en'

export const messages: typeof default = {
  welcome: 'Bienvenue !',
  hello: (name: string) => `Bonjour ${name}`,
  showElementCount: (count: number) => {
    switch (count) {
      case 0: {
        return 'Il n’y a pas d’éléments'
      }
      case 1: {
        return 'Il y a un élément'
      }
      default: {
        return `Il y a ${count} elements`
      }
    }
  },
}
```

Partial language files will match a `Partial` of the default language type, this will only ensure that parameters are matching.

```typescript
// locale/eo.ts
import { messages as default } from './en'

export const messages: Partial<typeof default> = {
  welcome: 'Bonvenon!',
  hello: (name: string) => `Saluton ${name}`,
}
```

## Index file

The purpose of the index file is to merge all this and create the internationalization object. It will export:

* the type of the messages (which is the type of the default language messages), because it will be needed in mutliple places,
* a reference to the internationalization object.

```typescript
// locale/index.ts
import { basename } from 'path'
import { sync } from 'glob'
import Intl, { LanguageMap } from 'intl-ts'
import { messages as en } from './en'

export type langType = typeof en

const languageMap = sync(`${__dirname}/*.js`)
  .map(file => basename(file, '.js'))
  .filter(language => language !== 'index')
  .map(language => require(`./${language}`).messages)
  .reduce((map, language) => map.merge(language), new LanguageMap(en))

export const lang = new Intl<langType>(languageMap, [process.env.LANG || ''])
```

## Usage

At server side, usage is rather straightforward.

```typescript
import { lang } from './locale/index'

const name = 'John Doe'
console.info(lang.hello(name))
```

## Send data to browser

The following snippet can be used in the `express` configuration of a `React` application to send needed data to the browser. An `index` template will be filled with the values of `htmlContent` and `preloaded`. A `Layout` component is expected to be entry point of the `React` part.

```typescript
import * as express from 'express'
import { renderToString } from 'react-dom/server'
import Layout from './components/Layout'
import { lang } from './locale/index'

// Calculate preferred languages order based on accept-language header
calculatePreferredLanguages(languages?: string | string[]): string[] {
  let preferred: string[] = []
  if (languages) {
    if (typeof languages === 'string') {
      preferred = languages.split(',')
    } else {
      preferred = languages
    }
  }
  return preferred.map(lang => lang.split(';')[0])
}

app = express()
app.use((req, res) => {
  const preferredLanguages = calculatePreferredLanguages(
    req.headers['accept-language']
  )
  const reqLang = lang.$withPreferences(preferredLanguages, false)
  const htmlContent = renderToString(<Layout />)
  const preloaded = `window.__PRELOADED_STATE__=${JSON.stringify({
    preferredLanguages,
  }).replace(/</g, '\\u003c')}; window.__PRELOADED_STATE__.languageMap=${
    lang.languageMap.js
  }`
  res.status(200).render('index', { htmlContent, preloaded })
})
```

# Browser side

The following snippet can be used to retrieve data prepared at server side (see previous code snippet).

```typescript
import Intl, { LanguageMapDefinition, LanguageMap } from 'intl-ts'
import { langType } from './locale/index'

declare global {
  interface Window {
    __PRELOADED_STATE__: {
      preferredLanguages: string[]
      languageMap: LanguageMapDefinition<langType>
    }
  }
}

const { preferredLanguages, languageMap } = window.__PRELOADED_STATE__
delete window.__PRELOADED_STATE__
const lang = new Intl<langType>(
  new LanguageMap(languageMap),
  preferredLanguages
)
```

# Let user select language

The following example shows how to prepare select box options for a user to select language from availables.

In every language, you should add an identification key. Let's use `$`:

```typescript
// locale/en.ts
export const messages = {
  $: 'English',
}
```

Then, this can be used, for example in a React component:

```typescript
// components/Lang.ts
lang.$languageMap.availables.map(langCode => (
  <option key={langCode} value={langCode}>
    {lang.$languageMap.messages(langCode).$ || langCode}
  </option>
))
```

Here, if the available language does not define our identification key, we simply used the language code instead.

# Format dates, numbers or objects

A formatting function takes parameters and return a string. This is exactly how message functions are defined. It is therefore easy to define a message function which will convert any value to a string directly in the language map and call it where needed. The formatting method will be sent if needed from server to browser as all other messages.
