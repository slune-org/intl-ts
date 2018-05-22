# Exemples de code

Voici quelques exemples de la façon dont la bibliothèque peut être utilisée.

# Serveur Node

Ces exemples considèrent que vous avez un serveur Node.js avec un répertoire `locale` qui contient un fichier `index.ts` ainsi qu'un fichier pour chaque langue, le nom de ce fichier étant le code de langue.

## Fichiers de langue

Le fichier principal sera pour la langue par défaut (référence).

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

Les fichiers de langue complets seront typés sur la langue par défaut afin de vérifier qu'aucune entrée n'est oubliée.

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

Les fichiers de langue partiels seront typés sur un objet `Partial` du type de langue par défaut. Cela permettra simplement de s'assurer que les paramètres correspondent.

```typescript
// locale/eo.ts
import { messages as default } from './en'

export const messages: Partial<typeof default> = {
  welcome: 'Bonvenon!',
  hello: (name: string) => `Saluton ${name}`,
}
```

## Fichier d'index

L'objectif du fichier d'index est de fusionner tout cela et créer l'objet d'internationalisation. Il exportera :

* le type des messages (c'est à dire le type des messages de la langue par défaut), car il sera utilisé à plusieurs endroits ;
* une référence sur l'objet d'internationalisation.

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

## Utilisation

L'utilisation du côté serveur est relativement évidente.

```typescript
import { lang } from './locale/index'

const name = 'John Doe'
console.info(lang.t('hello', name))
```

## Envoi des données au navigateur

L'exemple suivant peut être utilisée dans la configuration `express` d'une application `React` pour envoyer les données nécessaires au navigateur. Un fichier modèle `index` sera complété avec les valeurs de `htmlContent` et `preloaded`. Un composant `Layout` est supposé être le point d'entrée de la partie `React`.

```typescript
import * as express from 'express'
import { renderToString } from 'react-dom/server'
import Layout from './components/Layout'
import { lang } from './locale/index'

// Calculer l'ordre des langues préférées, basé sur l'en-tête accept-language
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
  const reqLang = lang.changePreferences(preferredLanguages, false)
  const htmlContent = renderToString(<Layout />)
  const preloaded = `window.__PRELOADED_STATE__=${JSON.stringify({
    preferredLanguages,
  }).replace(/</g, '\\u003c')}; window.__PRELOADED_STATE__.languageMap=${
    lang.languageMap.js
  }`
  res.status(200).render('index', { htmlContent, preloaded })
})
```

# Côté navigateur

L'exemple suivant peut être utilisé pour récupérer les données préparées côté serveur (cf. exemple précédent).

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
