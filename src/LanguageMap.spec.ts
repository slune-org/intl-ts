import { expect } from 'chai'
import { LanguageMap } from '.'
import { en, fr, fr_ca, eo, languageMap, allAvailables } from './data.spec'

describe('LanguageMap', () => {
  it('must be created with a default language', () => {
    const languageMap = new LanguageMap(en)
    expect(languageMap.availables).to.be.empty
    expect(languageMap.default.welcome).to.be.equal('Welcome!')
  })

  it('must be fully created, starting with definition', () => {
    const languageMap = new LanguageMap({ default: en, en, fr }).merge({
      fr_ca,
      eo,
    })
    expect(languageMap.availables).to.have.members(allAvailables)
  })

  it('must be fully created, starting with default language', () => {
    const languageMap = new LanguageMap(en, 'en')
      .merge({ fr, fr_ca })
      .merge({ eo })
    expect(languageMap.availables).to.have.members(allAvailables)
  })

  it('must replace existing message for a language', () => {
    const languageMap = new LanguageMap({ default: en, en, fr }).merge({
      fr: fr_ca,
    })
    expect(languageMap.messages('fr').hello).to.be.equal(fr_ca.hello)
    expect(languageMap.messages('fr').welcome).to.be.equal(fr.welcome)
  })

  it('must indicate if a language is supported', () => {
    allAvailables.forEach(lang => {
      expect(languageMap.contains(lang)).to.be.true
    })
  })

  it('must indicate if a language is not supported', () => {
    expect(languageMap.contains('dummy')).to.be.false
  })

  it('must not consider default language as supported', () => {
    expect(languageMap.contains('default')).to.be.false
  })

  it('must give required messages', () => {
    expect(languageMap.messages('eo')).to.be.equal(eo)
  })

  it('must give default messages', () => {
    expect(languageMap.default).to.be.equal(en)
    expect(languageMap.messages()).to.be.equal(languageMap.default)
  })

  it('must be immutable', () => {
    const languageMap0 = new LanguageMap(en)
    const languageMap1 = languageMap0.merge({ eo })
    expect(languageMap1).to.be.not.equal(languageMap0)
    expect(languageMap0.contains('eo')).to.be.false
    expect(languageMap1.contains('eo')).to.be.true
  })

  it('must create Javascript string', () => {
    let messages = {}
    const js = languageMap.js
    eval('messages=' + js)
    const duplicate = new LanguageMap(messages)
    expect(duplicate.availables).to.have.members(allAvailables)
    expect(languageMap.js).to.be.equal(js)
  })
})
