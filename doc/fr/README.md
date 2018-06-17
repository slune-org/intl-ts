# intl-ts - Bibliothèque d'internationalisation à typage sûr

intl-ts est une bibliothèque d'internationalisation (i18n) pour TypeScript. Le paquet est compilé en ES2015 et peut donc également être utilisé par des applications JavaScript, mais peut potentiellement requérir une transformation par Babel pour être utilisé par les navigateurs. Ses principales caractéristiques sont :

- Typage sûr : l'utilisation d'un mauvais nom de message ou du mauvais type de paramètre est détecté à la compilation. Si votre EDI le permet, vous pouvez même avoir la complétion pour les noms de message.
- Mutable ou immuable : la bibliothèque peut être utilisée de façon immutable (idéal pour la plupart des cadres basés sur les états, tel que React/Redux) ou mutable (pour une meilleure performance).
- Agnostique : peut être utilisé à la fois côté serveur et côté navigateur.

# Installation

L'installation se fait avec la commande `npm install` :

```bash
$ npm install --save intl-ts
```

Si vous préférez utiliser `yarn` :

```bash
$ yarn add intl-ts
```

# Langue

Le français étant ma langue maternelle, fournir les documents et messages en français n'est pas une option. Les autres traductions sont bienvenues.

Cependant, l'anglais étant la langue de la programmation, le code, y compris les noms de variable et commentaires, sont en anglais.

# Utilisation

- Créez vos messages :

```typescript
// Version anglaise — défault
const en = {
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

// Le type décrivant les messages
type langType = typeof en

// Version française — complète
const fr: langType = {
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

// Version en français canadien — partielle
const fr_ca: Partial<langType> = {
  hello: (name: string) => `Allo ${name}`,
}

// Version en Espéranto — partielle
const eo: Partial<langType> = {
  welcome: 'Bonvenon!',
  hello: (name: string) => `Saluton ${name}`,
}
```

Notez que les noms des messages _ne doivent pas contenir l'un des mots-clés_ de l'[API Intl](api.md#intlt-extends-messages).

- Créez la table des langues correspondante :

```typescript
// Création directe
const languageMap = new LanguageMap({
  default: en,
  en,
  fr,
  fr_ca,
  eo,
})

// Création dynamique
const languageMap = new LanguageMap(en, 'en').merge({ fr, fr_ca }).merge({ eo })
```

Notez que vous devriez utiliser uniquement des minuscules, chiffres et souligné comme clés dans les tables de langues, car le code de la langue est formaté ainsi par la classe `Intl`.

- Créez l'objet d'internationalisation et utilisez-le !

```typescript
const lang = new Intl<langType>(languageMap, ['eo', 'fr-CA'])
lang.welcome() // 'Bonvenon!'
lang.showElementCount(0) // 'Il n’y a pas d’éléments' — La compilation vérifie que 0 est bien un nombre
```

# Mutabilité

L'état des objets ne changera jamais, sauf :

- la représentation d'une `LanguageMap` en JavaScript (à cause d'une initialisation paresseuse) ;
- si vous choisissez de modifier les préférences linguistiques avec `Intl.$changePreferences`.

Un nouvel objet est créé lors de l'appel à `LanguageMap.merge`, et les préférences peuvent être modifiées en clonant l'objet d'internationalisation avec `new Intl`.

# Documentation

- [Documentation de l'API](api.md)
- [Exemples de code](tips.md)
