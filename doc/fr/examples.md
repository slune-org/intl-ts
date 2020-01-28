# Exemples

Voici quelques exemples de la façon d'utiliser la bibliothèque.

Le code source contient deux projets d'exemples dans le répertoire `examples` qui peuvent être générés à l'aide de la commande :

```bash
$ npm run example
```

Ces deux projets très basiques font exactement la même chose du point de vue de l'utilisateur final. Ils montrent comment utiliser la bibliothèque en situation réelle et sont basés sur le projet source se trouvant dans le sous-répertoire `content`. Quelques extraits tirés des exemples sont repris dans ce document.

Pour tester l'un de ces projet, déplacez-vous dans son répertoire et exécutez la commande :

```bash
$ npm install && npm start
```

Vous pourrez ensuite observer le résultat à l'aide d'un navigateur en vous rendant à l'adresse http://localhost:8080.

Notez que le projet source lui-même (`content`) peut être testé, mais ne possédant pas de gestionnaire d'état, son état global (donc la langue sélectionnée) ne peut être modifié. L'intérêt sera donc limité à de la comparaison avec les autres projets.

## Envoi complet et utilisation de MobX

Cet exemple peut être généré individuellement à l'aide de la commande :

```bash
$ npm run example:mobx-full
```

Dans cet exemple, toutes les traductions sont envoyés dès le départ par le serveur au client. Le client utilise ensuite la bibliothèque MobX pour gérer les changements de langue.

## Envoi partiel et utilisation de Redux

Cet exemple peut être généré individuellement à l'aide de la commande :

```bash
$ npm run example:redux-lite
```

Dans cet exemple, seules les traductions nécessaires sont envoyées au client. Celui-ci doit donc demander une nouvelle table de traductions dès que l'utilisateur sélectionne une autre langue. Les changements de langue sont gérés par la bibliothèque Redux.

# Répertoire des locales

Ces exemples sont basés sur un répertoire `locale` qui contient un fichier `index.ts` ainsi qu'un fichier pour chaque langue, le nom de ce fichier étant le code de langue.

## Fichier de langue par défaut

Le fichier principal sera pour la langue par défaut (référence). Vous pouvez noter au passage comment créer une fonction de formatage (ici pour les heures).

[Voir le fichier complet](../../examples/content/src/locale/en.ts)

```typescript
// locale/en.ts
export const messages = createMessages({
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
})
```

## Traduction complète

Un fichier de langue complet sera typé sur la langue par défaut afin de vérifier qu'aucune entrée n'est oubliée.

[Voir le fichier complet](../../examples/content/src/locale/fr.ts)

```typescript
// locale/fr.ts
import { messages as defLang } from './en'

export const messages = createMessages<typeof defLang>({
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
})
```

## Traduction partielle

Un fichier de langue partiel sera typé sur un objet `PartialMessages` du type de la langue par défaut. Cela permettra simplement de s'assurer que les paramètres correspondent.

```typescript
// locale/fr_ca.ts
import { messages as defLang } from './en'

export const messages = createMessages<PartialMessages<typeof defLang>>({
  $: 'Français (Canada)',
  welcome: 'Bienvenue icitte !',
})
```

Notez que par défaut, lorsque le `Français (Canada)` sera sélectionné, la préférence `fr_ca` sera donnée à l'objet `Intl` qui ajoutera automatiquement la préférence `fr` en second choix, ce qui complétera les traductions correctement (c'est le résultat de l'option `createGenerics` du constructeur ou de la méthode `$changePreferences()`). En dernier choix, si la traduction n'est toujours pas trouvée, c'est la langue par défaut qui est utilisée.

## Fichier d'index

L'objectif du fichier d'index est de fusionner tout cela et créer l'objet d'internationalisation. Il exportera :

- le type des messages (c'est à dire le type des messages de la langue par défaut), car il sera utilisé à plusieurs endroits ;
- une référence sur l'objet d'internationalisation.

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

# Côté serveur

L'utilisation du côté serveur est relativement triviale.

```typescript
import { lang } from './locale'

const name = 'Jane Doe'
console.info(lang.hello(name))
```

Notez que si certains messages ne sont utilisés que du côté server et donc jamais envoyés au client, cela pourrait être une bonne idée de les conserver dans un objet `Intl` séparé.

## Envoi des données au navigateur

L'extrait de code suivant utilise la bibliothèque Express pour générer l'intégralité de la page à envoyer au client (_Server Side Rendering_), en y intégrant la totalité des traductions.

[Voir le fichier complet](../../examples/content/src/index.ts)

```typescript
const stringifyLanguage = (language: Intl<any>): string =>
  `window.__LANGUAGE__=${JSON.stringify({
    preferences: language.$preferences,
  }).replace(/</g, '\\u003c')}; window.__LANGUAGE__.languageMap=${language.$languageMap.toString()}`

// Calculer l'ordre des langues préférées, basé sur l'en-tête accept-language
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
  // Cloner la langue en utilisant les préférences calculées
  // Ne pas créer les génériques, ils devraient déjà être inclus dans les préférences du navigateur
  const reqLang = new Intl(lang, preferredLanguages, false)
  const htmlContent = renderToString(createLayout(reqLang))
  const preload = stringifyLanguage(reqLang)
  res.status(200).send(content(htmlContent, preload))
})
```

## Envoi partiel

Dans le cadre d'un gros projet avec beaucoup de traductions, il peut être intéressant de n'envoyer que les traductions nécessaires (liées aux préférences). Il faut donc modifier la méthode `stringifyLanguage` définie ci-dessus :

```typescript
const stringifyLanguage = (language: Intl<any>): string =>
  `window.__LANGUAGE__=${JSON.stringify({
    preferences: language.$preferences,
  }).replace(/</g, '\\u003c')}; window.__LANGUAGE__.languageMap=${language.$languageMap.toString(
    language.$preferences
  )}`
```

Il faut également prévoir une entrée dans notre serveur pour envoyer les autres traductions à la demande :

```typescript
app.get('/lang/:code', (req, res) => {
  const reqLang = new Intl(lang, [req.params.code])
  res.status(200).send(stringifyLanguage(reqLang))
})
```

# Côté navigateur

Les données envoyées par le serveur peuvent ensuite être récupérées du côté client :

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

Notez l'utilisation de l'import de type TypeScript `import('../locale').langType` qui permet de ne pas intégrer toutes les traductions dans le fichier d'assemblage (_bundle_) qui sera généré.

## Utiliser les traductions

La sélection de la langue ayant un impact sur la totalité de l'application, il est fortement conseillé de mettre l'objet linguistique dans l'état global du projet, et donc d'utiliser une bibliothèque de gestion des états, tel que MobX ou Redux.

Dans l'extrait ci-dessous, on utilise une méthode `useLang()` dont les détails d'implémentation dépendent de la bibliothèque utilisée. Vous pourrez vous référer aux projets exemples si besoin.

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

## Laisser l'utilisateur choisir sa langue

L'exemple suivant montre comment utiliser une boite de sélection pour permettre à l'utilisateur de choisir sa langue parmi celles disponibles :

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

Cette exemple utilise MobX (d'où l'utilisation de `useObserver()`) et modifie donc directement l'objet `Intl`. Si l'objet linguistique doit être immuable, la méthode `onChange` devrait plutôt envoyer un évènement au gestionnaire d'état :

```tsx
const updatePreference = useUpdatePreference()
const onChange = useCallback(
  (event: ChangeEvent<HTMLSelectElement>) => {
    updatePreference(event.target.value)
  },
  [updatePreference]
)
```
