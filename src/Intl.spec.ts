import { expect } from 'chai'
import Intl from '.'
import {
  langType,
  languageMap,
  allAvailables,
  fr,
  fr_ca,
  eo,
} from './data.spec'

describe('Intl', function() {
  const lang: Intl<langType> = new Intl(languageMap)

  it('must be created with all map languages', function() {
    expect(lang.languageMap.availables).to.have.members(allAvailables)
  })

  it('must give default string', function() {
    expect(lang.t('hello', 'me')).to.be.equal('Hello me')
  })

  it('must format language string', function() {
    const newLang = lang.changePreferences(['fr-CA'])
    expect(newLang.t('hello', 'me')).to.be.equal('Allo me')
  })

  it('must fallback to generic types', function() {
    const newLang = lang.changePreferences(['fr-CA'])
    expect(newLang.t('welcome')).to.be.equal('Bienvenue !')
  })

  it('must not fallback to generic type', function() {
    const newLang = lang.changePreferences(['fr-CA'], false)
    expect(newLang.t('welcome')).to.be.equal('Welcome!')
  })

  it('must use preferred available message if one preference is given', function() {
    const newLang = lang.changePreferences(['eo'])
    expect(newLang.t('hello', 'me')).to.be.equal('Saluton me')
    expect(newLang.t('showElementCount', 1)).to.be.equal('There is one element')
  })

  it('must use preferred available message if multiple preferences are given', function() {
    const newLang = lang.changePreferences(['fr_CA', 'eo', 'fr'], false)
    expect(newLang.getMessage('welcome')).to.be.equal(eo.welcome)
    expect(newLang.getMessage('hello')).to.be.equal(fr_ca.hello)
    expect(newLang.getMessage('showElementCount')).to.be.equal(
      fr.showElementCount
    )
  })

  it('must use preferred available message or fallback to more generic type', function() {
    const newLang = lang.changePreferences(['eo', 'fr_CA'])
    expect(newLang.getMessage('welcome')).to.be.equal(eo.welcome)
    expect(newLang.getMessage('hello')).to.be.equal(eo.hello)
    expect(newLang.getMessage('showElementCount')).to.be.equal(
      fr.showElementCount
    )
  })

  it('must forget non existing language in preferences', function() {
    const newLang = lang.changePreferences(['eo', 'dummy', 'fr'])
    expect(newLang.preferences).to.have.ordered.members(['eo', 'fr'])
  })

  it('must be immutable', function() {
    expect(lang.changePreferences(['anything'])).to.be.not.equal(lang)
  })
})
