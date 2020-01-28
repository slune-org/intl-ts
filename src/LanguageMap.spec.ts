/* eslint-disable no-unused-expressions, prefer-arrow-callback */
import { expect } from 'chai'

import { LanguageMap } from '.'
import { PartialMessages, createMessages } from './MessageTypes'

// English version — default
export const en = createMessages({
  $: 'English',
  welcome: 'Welcome!',
  hello: (name: string) => `Hello ${name}`,
  get showElementCount(): (count: number) => string {
    return (count: number) => {
      switch (count) {
        case 0: {
          return 'There are no elements'
        }
        case 1: {
          return 'There is one element'
        }
        default: {
          return `There are ${this.formatNumber(count)} elements`
        }
      }
    }
  },
  formatNumber: (num: number) => {
    return `${num}.00`
  },
})

// Type describing message in a given language
export type langType = typeof en

// French version — full
export const fr = createMessages<langType>({
  $: 'Français',
  welcome: 'Bienvenue !',
  hello: (name: string) => `Bonjour ${name}`,
  get showElementCount(): (count: number) => string {
    return (count: number) => {
      switch (count) {
        case 0: {
          return 'Il n’y a pas d’éléments'
        }
        case 1: {
          return 'Il y a un élément'
        }
        default: {
          return `Il y a ${this.formatNumber(count)} éléments`
        }
      }
    }
  },
  formatNumber: (num: number) => {
    return `${num},00`
  },
})

// Canada french version — partial
// eslint-disable-next-line @typescript-eslint/camelcase
export const fr_ca = createMessages<PartialMessages<langType>>({
  $: 'Français (Canada)',
  hello: (name: string) => `Allo ${name}`,
})

// Esperanto version — partial
export const eo = createMessages<PartialMessages<langType>>({
  $: 'Esperanto',
  welcome: 'Bonvenon!',
  hello: (name: string) => `Saluton ${name}`,
})

export const languageMap = new LanguageMap({
  default: en,
  en: 'default',
  fr,
  fr_ca, // eslint-disable-line @typescript-eslint/camelcase
  eo,
})

export const allAvailables = ['en', 'fr', 'fr_ca', 'eo']

describe('LanguageMap', function() {
  it('must be created with a default language', function() {
    const testedLanguageMap = new LanguageMap(en)
    expect(testedLanguageMap.availables).to.be.empty
    expect(testedLanguageMap.messages().welcome).to.equal('Welcome!')
  })

  it('must be fully created, starting with definition', function() {
    const testedLanguageMap = new LanguageMap({ default: en, en: 'default', fr }).merge({
      fr_ca, // eslint-disable-line @typescript-eslint/camelcase
      eo,
    })
    expect(testedLanguageMap.availables).to.have.members(allAvailables)
  })

  it('must be fully created, starting with default language', function() {
    // eslint-disable-next-line @typescript-eslint/camelcase
    const testedLanguageMap = new LanguageMap(en, 'en').merge({ fr, fr_ca }).merge({ eo })
    expect(testedLanguageMap.availables).to.have.members(allAvailables)
  })

  it('must fail when adding a language with no name', function() {
    expect(() => new LanguageMap(en, 'en').merge({ fr: { hello: fr.hello } })).to.throw(
      'LanguageMap: merged "fr" has no name'
    )
  })

  it('must duplicate added message with no default', function() {
    const testedLanguageMap = new LanguageMap({ default: en, en: 'default', fr }).merge<{
      $: string
      unknown: string
    }>({ fr: { unknown: 'cassé' } })
    expect(testedLanguageMap.messages().unknown).to.equal('cassé')
  })

  it('must succeed when adding a message with provided (unknown) default', function() {
    expect(() =>
      new LanguageMap({ default: en, en: 'default', fr }).merge({
        fr: { known: 'ça marche' },
        default: { known: 'working' },
      })
    ).to.not.throw()
  })

  it('must succeed when adding a message with provided (known) default', function() {
    expect(() =>
      new LanguageMap({ default: en, en: 'default', fr }).merge({
        fr: { known: 'ça marche' },
        en: { known: 'working' },
      })
    ).to.not.throw()
  })

  it('must succeed when adding messages to default', function() {
    const testedLanguageMap = new LanguageMap({ default: en, en: 'default', fr }).merge({
      default: { msg1: 'default1' },
      en: { msg2: 'default2' },
    })
    expect(testedLanguageMap.messages().msg2).to.equal('default2')
    expect(testedLanguageMap.messages('en').msg1).to.equal('default1')
  })

  it('must fail when adding a definition with multiple defaults', function() {
    expect(() => new LanguageMap({ default: en, en: 'default', fr: 'default' })).to.throw(
      'LanguageMap: given definition has multiple defaults'
    )
  })

  it('must replace existing message for a language', function() {
    const testedLanguageMap = new LanguageMap({ default: en, en: 'default', fr }).merge({
      fr: fr_ca, // eslint-disable-line @typescript-eslint/camelcase
    })
    // eslint-disable-next-line @typescript-eslint/camelcase
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
    expect(languageMap.default).to.equal('en')
    expect(languageMap.messages()).to.equal(en)
  })

  it('must be immutable', function() {
    const languageMap0 = new LanguageMap(en, 'en')
    const languageMap1 = languageMap0.merge<{ $: string; another: string }>({
      default: { another: 'hello' },
      eo,
    })
    expect(languageMap1).to.be.not.equal(languageMap0)
    expect(languageMap0.contains('eo')).to.be.false
    expect(Object.keys(languageMap0.messages('en'))).to.not.contain('another')
    expect(languageMap1.contains('eo')).to.be.true
    expect(Object.keys(languageMap1.messages('en'))).to.contain('another')
  })

  it('must create Javascript string', function() {
    // eslint-disable-next-line prefer-const
    let messages = {}
    const js = languageMap.toString()
    // eslint-disable-next-line no-eval
    eval('messages=' + js)
    const duplicate = new LanguageMap(messages as any)
    expect(duplicate.availables).to.have.members(allAvailables)
    expect(duplicate.messages().welcome).to.equal(en.welcome)
    expect(duplicate.messages('fr').welcome).to.equal(fr.welcome)
    // eslint-disable-next-line @typescript-eslint/camelcase
    expect(duplicate.messages('fr_ca').hello('Arya')).to.equal(fr_ca.hello!('Arya'))
    expect(duplicate.messages('eo').welcome).to.equal(eo.welcome)
    expect(languageMap.toString()).to.equal(js)
  })

  it('must create Javascript partial string', function() {
    // eslint-disable-next-line prefer-const
    let messages = {}
    const js = languageMap.toString(['en', 'en', 'fr', 'fr_ca', 'it'])
    // eslint-disable-next-line no-eval
    eval('messages=' + js)
    const duplicate = new LanguageMap(messages as any)
    expect(duplicate.availables).to.have.members(allAvailables)
    expect(duplicate.messages().welcome).to.equal(en.welcome)
    expect(duplicate.messages('fr').welcome).to.equal(fr.welcome)
    // eslint-disable-next-line @typescript-eslint/camelcase
    expect(duplicate.messages('fr_ca').hello('Arya')).to.equal(fr_ca.hello!('Arya'))
    expect(duplicate.messages('eo').welcome).to.be.undefined
    expect(languageMap.toString(['fr', 'fr_ca'])).to.equal(js)
  })
})
