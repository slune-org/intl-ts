import { LanguageMap } from './LanguageMap'

// English version — default
export const en = {
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

// Type describing message in a given language
export type langType = typeof en

// French version — full
export const fr: langType = {
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

// Canada french version — partial
export const fr_ca: Partial<langType> = {
  hello: (name: string) => `Allo ${name}`,
}

// Esperanto version — partial
export const eo: Partial<langType> = {
  welcome: 'Bonvenon!',
  hello: (name: string) => `Saluton ${name}`,
}

export const languageMap = new LanguageMap({
  default: en,
  en,
  fr,
  fr_ca,
  eo,
})

export const allAvailables = ['en', 'fr', 'fr_ca', 'eo']
