// tslint:disable:no-implicit-dependencies (dev dependencies are enough for tests)
// tslint:disable:only-arrow-functions (mocha discourage to use arrow function)
// tslint:disable:no-unused-expression (chai expressions are indeed side-effect)
import { expect } from 'chai'

import { LanguageMap } from '.'

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
        return `There are ${en.formatNumber(count)} elements`
      }
    }
  },
  formatNumber: (num: number) => {
    return `${num}.00`
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
        return `Il y a ${fr.formatNumber(count)} éléments`
      }
    }
  },
  formatNumber: (num: number) => {
    return `${num},00`
  },
}

// Canada french version — partial
// tslint:disable-next-line:variable-name (keep language code)
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

describe('LanguageMap', function() {
  it('must be created with a default language', function() {
    const testedLanguageMap = new LanguageMap(en)
    expect(testedLanguageMap.availables).to.be.empty
    expect(testedLanguageMap.default.welcome).to.equal('Welcome!')
  })

  it('must be fully created, starting with definition', function() {
    const testedLanguageMap = new LanguageMap({ default: en, en, fr }).merge({
      fr_ca,
      eo,
    })
    expect(testedLanguageMap.availables).to.have.members(allAvailables)
  })

  it('must be fully created, starting with default language', function() {
    const testedLanguageMap = new LanguageMap(en, 'en').merge({ fr, fr_ca }).merge({ eo })
    expect(testedLanguageMap.availables).to.have.members(allAvailables)
  })

  it('must replace existing message for a language', function() {
    const testedLanguageMap = new LanguageMap({ default: en, en, fr }).merge({
      fr: fr_ca,
    })
    expect(testedLanguageMap.messages('fr').hello).to.equal(fr_ca.hello)
    expect(testedLanguageMap.messages('fr').welcome).to.equal(fr.welcome)
  })

  it('must indicate if a language is supported', function() {
    allAvailables.forEach(lang => {
      expect(languageMap.contains(lang)).to.be.true
    })
  })

  it('must indicate if a language is not supported', function() {
    expect(languageMap.contains('dummy')).to.be.false
  })

  it('must not consider default language as supported', function() {
    expect(languageMap.contains('default')).to.be.false
  })

  it('must give required messages', function() {
    expect(languageMap.messages('eo')).to.equal(eo)
  })

  it('must give default messages', function() {
    expect(languageMap.default).to.equal(en)
    expect(languageMap.messages()).to.equal(languageMap.default)
  })

  it('must be immutable', function() {
    const languageMap0 = new LanguageMap(en)
    const languageMap1 = languageMap0.merge({ eo })
    expect(languageMap1).to.be.not.equal(languageMap0)
    expect(languageMap0.contains('eo')).to.be.false
    expect(languageMap1.contains('eo')).to.be.true
  })

  it('must create Javascript string', function() {
    let messages
    messages = {}
    const js = languageMap.js
    // tslint:disable-next-line:no-eval (need to evaluate produced JSon)
    eval('messages=' + js)
    const duplicate = new LanguageMap(messages)
    expect(duplicate.availables).to.have.members(allAvailables)
    expect(languageMap.js).to.equal(js)
  })
})
