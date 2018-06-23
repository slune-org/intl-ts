// tslint:disable:no-implicit-dependencies (dev dependencies are enough for tests)
// tslint:disable:only-arrow-functions (mocha discourage to use arrow function)
import { expect } from 'chai'

import Intl, { LanguageMap, Messages } from '.'
import { allAvailables, eo, fr, fr_ca, langType, languageMap } from './LanguageMap.spec'

describe('Intl', function() {
  const lang: Intl<langType> = new Intl(languageMap)

  it('must be created with all map languages', function() {
    expect(lang.$languageMap.availables).to.have.members(allAvailables)
  })

  it('must give default string', function() {
    expect(lang.hello('me')).to.equal('Hello me')
  })

  const RESERVED = ['$preferences', '$languageMap', '$changePreferences', '$withPreferences', '$getMessageFunction']
  RESERVED.forEach(key => {
    const messages: Messages = {}
    messages[key] = 'forbidden'
    const reservedMap = new LanguageMap(messages)
    it(`must throw an exception if language map contains reserved keyword ${key}`, function() {
      expect(() => {
        new Intl(reservedMap)
      }).to.throw(/not permitted/i)
    })
  })

  describe('creating new object', function() {
    it('must format language string', function() {
      const newLang = new Intl(lang, ['fr-CA'])
      expect(newLang.hello('me')).to.equal('Allo me')
    })

    it('must fallback to generic types', function() {
      const newLang = new Intl(lang, ['fr-CA'])
      expect(newLang.welcome()).to.equal('Bienvenue !')
    })

    it('must not fallback to generic type', function() {
      const newLang = new Intl(lang, ['fr-CA'], false)
      expect(newLang.welcome()).to.equal('Welcome!')
    })

    it('must use preferred available message if one preference is given', function() {
      const newLang = new Intl(lang, ['eo'])
      expect(newLang.hello('me')).to.equal('Saluton me')
      expect(newLang.showElementCount(1)).to.equal('There is one element')
    })

    it('must use preferred available message if multiple preferences are given', function() {
      const newLang = new Intl(lang, ['fr_CA', 'eo', 'fr'], false)
      expect(newLang.welcome()).to.equal(eo.welcome)
      expect(newLang.$getMessageFunction('hello')).to.equal(fr_ca.hello)
      expect(newLang.$getMessageFunction('showElementCount')).to.equal(fr.showElementCount)
    })

    it('must use preferred available message or fallback to more generic type', function() {
      const newLang = new Intl(lang, ['eo', 'fr_CA'])
      expect(newLang.welcome()).to.equal(eo.welcome)
      expect(newLang.$getMessageFunction('hello')).to.equal(eo.hello)
      expect(newLang.$getMessageFunction('showElementCount')).to.equal(fr.showElementCount)
    })

    it('must forget non existing language in preferences', function() {
      const newLang = new Intl(lang, ['eo', 'dummy', 'fr'])
      expect(newLang.$preferences).to.have.ordered.members(['eo', 'fr'])
    })

    it('must format values as defined in language map', function() {
      expect(lang.showElementCount(2)).to.equal('There are 2.00 elements')
      const newLang = new Intl(lang, ['fr'])
      expect(newLang.showElementCount(2)).to.equal('Il y a 2,00 éléments')
    })

    it('must be immutable', function() {
      expect(new Intl(lang, ['anything'])).not.to.equal(lang)
    })
  })

  describe('#$withPreferences (deprecated)', function() {
    it('must format language string', function() {
      const newLang = lang.$withPreferences(['fr-CA'])
      expect(newLang.hello('me')).to.equal('Allo me')
    })

    it('must fallback to generic types', function() {
      const newLang = lang.$withPreferences(['fr-CA'])
      expect(newLang.welcome()).to.equal('Bienvenue !')
    })

    it('must not fallback to generic type', function() {
      const newLang = lang.$withPreferences(['fr-CA'], false)
      expect(newLang.welcome()).to.equal('Welcome!')
    })

    it('must use preferred available message if one preference is given', function() {
      const newLang = lang.$withPreferences(['eo'])
      expect(newLang.hello('me')).to.equal('Saluton me')
      expect(newLang.showElementCount(1)).to.equal('There is one element')
    })

    it('must use preferred available message if multiple preferences are given', function() {
      const newLang = lang.$withPreferences(['fr_CA', 'eo', 'fr'], false)
      expect(newLang.welcome()).to.equal(eo.welcome)
      expect(newLang.$getMessageFunction('hello')).to.equal(fr_ca.hello)
      expect(newLang.$getMessageFunction('showElementCount')).to.equal(fr.showElementCount)
    })

    it('must use preferred available message or fallback to more generic type', function() {
      const newLang = lang.$withPreferences(['eo', 'fr_CA'])
      expect(newLang.welcome()).to.equal(eo.welcome)
      expect(newLang.$getMessageFunction('hello')).to.equal(eo.hello)
      expect(newLang.$getMessageFunction('showElementCount')).to.equal(fr.showElementCount)
    })

    it('must forget non existing language in preferences', function() {
      const newLang = lang.$withPreferences(['eo', 'dummy', 'fr'])
      expect(newLang.$preferences).to.have.ordered.members(['eo', 'fr'])
    })

    it('must format values as defined in language map', function() {
      expect(lang.showElementCount(2)).to.equal('There are 2.00 elements')
      const newLang = lang.$withPreferences(['fr'])
      expect(newLang.showElementCount(2)).to.equal('Il y a 2,00 éléments')
    })

    it('must be immutable', function() {
      expect(lang.$withPreferences(['anything'])).not.to.equal(lang)
    })
  })

  describe('#$changePreferences', function() {
    afterEach('Reset preferences to default', function() {
      lang.$changePreferences([])
    })

    it('must format language string', function() {
      lang.$changePreferences(['fr-CA'])
      expect(lang.hello('me')).to.equal('Allo me')
    })

    it('must fallback to generic types', function() {
      lang.$changePreferences(['fr-CA'])
      expect(lang.welcome()).to.equal('Bienvenue !')
    })

    it('must not fallback to generic type', function() {
      lang.$changePreferences(['fr-CA'], false)
      expect(lang.welcome()).to.equal('Welcome!')
    })

    it('must use preferred available message if one preference is given', function() {
      lang.$changePreferences(['eo'])
      expect(lang.hello('me')).to.equal('Saluton me')
      expect(lang.showElementCount(1)).to.equal('There is one element')
    })

    it('must use preferred available message if multiple preferences are given', function() {
      lang.$changePreferences(['fr_CA', 'eo', 'fr'], false)
      expect(lang.welcome()).to.equal(eo.welcome)
      expect(lang.$getMessageFunction('hello')).to.equal(fr_ca.hello)
      expect(lang.$getMessageFunction('showElementCount')).to.equal(fr.showElementCount)
    })

    it('must use preferred available message or fallback to more generic type', function() {
      lang.$changePreferences(['eo', 'fr_CA'])
      expect(lang.welcome()).to.equal(eo.welcome)
      expect(lang.$getMessageFunction('hello')).to.equal(eo.hello)
      expect(lang.$getMessageFunction('showElementCount')).to.equal(fr.showElementCount)
    })

    it('must forget non existing language in preferences', function() {
      lang.$changePreferences(['eo', 'dummy', 'fr'])
      expect(lang.$preferences).to.have.ordered.members(['eo', 'fr'])
    })

    it('must format values as defined in language map', function() {
      expect(lang.showElementCount(2)).to.equal('There are 2.00 elements')
      lang.$changePreferences(['fr'])
      expect(lang.showElementCount(2)).to.equal('Il y a 2,00 éléments')
    })

    it('must not be immutable', function() {
      expect(lang.$changePreferences(['anything'])).to.equal(lang)
    })
  })
})
