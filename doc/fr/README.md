# intl-ts - Bibliothèque d'internationalisation à typage sûr

intl-ts est une bibliothèque d'internationalisation (i18n) pour TypeScript. Le paquet est compilé en ES2015 et peut donc également être utilisé par des applications JavaScript, mais peut potentiellement requérir une transformation par Babel pour être utilisé par les navigateurs. Ses principales caractéristiques sont :

- Typage sûr : l'utilisation d'un mauvais nom de message ou du mauvais type de paramètre est détecté à la compilation. Si votre EDI le permet, vous pouvez même avoir la complétion pour les noms de message.
- Mutable ou immuable : la bibliothèque peut être utilisée de façon immutable (idéal pour la plupart des environnements basés sur les états, tel que React/Redux) ou mutable (pour une meilleure performance).
- Intégration MobX : si vous utilisez MobX, la propriété `$preferences` de l'objet `Intl` va automatiquement devenir observable, permettant, par exemple, aux composants `React` de se rafraichir automatiquement si la langue choisie change.
- Agnostique : peut être utilisé à la fois côté serveur (NodeJS) et côté navigateur.

Si vous utilisiez une version précédente de la bibliothèque, vous pouvez être intéressé par le [guide de migration](migrate.md)

# Langue

Les documents et messages, le code (y compris les noms de variable et commentaires), sont en anglais.

Cependant, Slune étant une entreprise française, tous les documents et messages importants doivent également être fournis en français. Les autres traductions sont bienvenues.

# Installation

L’installation se fait avec la commande `npm install` :

```bash
$ npm install --save intl-ts
```

# Utilisation

- Créez vos messages :

```typescript
// Version anglaise — défaut
const en = createMessages({
  $: 'English',
  welcome: 'Welcome here!',
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
})

// Le type décrivant les messages
type langType = typeof en

// Version française — complète
const fr = createMessages<langType>({
  $: 'Français',
  welcome: 'Bienvenue ici !',
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
})

// Version en français canadien — partielle
const fr_ca = createMessages<PartialMessages<langType>>({
  $: 'Français (Canada)',
  welcome: 'Bienvenue icitte !',
})

// Version en Espéranto — partielle
const eo = createMessages<PartialMessages<langType>>({
  $: 'Esperanto',
  welcome: 'Bonvenon ĉi-tie!',
  hello: (name: string) => `Saluton ${name}`,
})
```

La function `createMessages` est en réalité une fonction identité et n'est donc pas nécessaire. Son seul objectif est de permettre à TypeScript de contrôler le type des messages fournis.

Notez que les noms des messages _ne doivent pas contenir l'un des mots-clés_ de l'[API Intl](api.md#intlt-extends-messages).

- Créez la table de langues correspondante :

```typescript
// Création directe
const languageMap = new LanguageMap({
  default: en,
  en: 'default',
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
lang.welcome() // 'Bonvenon ĉi-tie!'
lang.showElementCount(0) // 'Il n’y a pas d’éléments' — La compilation vérifie que 0 est bien un nombre
```

# Mutabilité

L'état des objets ne changera jamais, sauf :

- la représentation d'une `LanguageMap` en chaine de caractères (à cause d'une initialisation paresseuse) ;
- si vous choisissez de modifier les préférences linguistiques avec `Intl.$changePreferences`, mais vous pouvez choisir de les modifier en clonant l'objet de départ à l'aide du constructeur copie.

Un nouvel objet est créé lors de l'appel à `LanguageMap.merge()`.

# Documentation

- [Documentation de l'API](api.md)
- [Exemples de code](examples.md)

# Contribuer

Bien que nous ne puissions pas garantir un temps de réponse, n’hésitez pas à ouvrir un incident si vous avez une question ou un problème pour utiliser ce paquet.

Les _Pull Requests_ sont bienvenues. Vous pouvez bien sûr soumettre des corrections ou améliorations de code, mais n’hésitez pas également à améliorer la documentation, même pour de petites fautes d’orthographe ou de grammaire.
