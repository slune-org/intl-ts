// tslint:disable:no-implicit-dependencies (dev dependencies are enough for tests)
// tslint:disable:only-arrow-functions (mocha discourage to use arrow function)
import { expect } from 'chai'

import Intl from '.'
import {
  allAvailables,
  eo,
  fr,
  fr_ca,
  langType,
  languageMap,
} from './data.spec'

describe('Intl', function() {
  const lang: Intl<langType> = new Intl(languageMap)

  it('must be created with all map languages', function() {
    expect(lang.languageMap.availables).to.have.members(allAvailables)
  })

  it('must give default string', function() {
    expect(lang.t('hello', 'me')).to.equal('Hello me')
  })

  it('must format language string', function() {
    const newLang = lang.changePreferences(['fr-CA'])
    expect(newLang.t('hello', 'me')).to.equal('Allo me')
  })

  it('must fallback to generic types', function() {
    const newLang = lang.changePreferences(['fr-CA'])
    expect(newLang.t('welcome')).to.equal('Bienvenue !')
  })

  it('must not fallback to generic type', function() {
    const newLang = lang.changePreferences(['fr-CA'], false)
    expect(newLang.t('welcome')).to.equal('Welcome!')
  })

  it('must use preferred available message if one preference is given', function() {
    const newLang = lang.changePreferences(['eo'])
    expect(newLang.t('hello', 'me')).to.equal('Saluton me')
    expect(newLang.t('showElementCount', 1)).to.equal('There is one element')
  })

  it('must use preferred available message if multiple preferences are given', function() {
    const newLang = lang.changePreferences(['fr_CA', 'eo', 'fr'], false)
    expect(newLang.getMessage('welcome')).to.equal(eo.welcome)
    expect(newLang.getMessage('hello')).to.equal(fr_ca.hello)
    expect(newLang.getMessage('showElementCount')).to.equal(fr.showElementCount)
  })

  it('must use preferred available message or fallback to more generic type', function() {
    const newLang = lang.changePreferences(['eo', 'fr_CA'])
    expect(newLang.getMessage('welcome')).to.equal(eo.welcome)
    expect(newLang.getMessage('hello')).to.equal(eo.hello)
    expect(newLang.getMessage('showElementCount')).to.equal(fr.showElementCount)
  })

  it('must forget non existing language in preferences', function() {
    const newLang = lang.changePreferences(['eo', 'dummy', 'fr'])
    expect(newLang.preferences).to.have.ordered.members(['eo', 'fr'])
  })

  it('must be immutable', function() {
    expect(lang.changePreferences(['anything'])).to.be.not.equal(lang)
  })
})
