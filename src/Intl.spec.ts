/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai'
import { autorun, configure as mobxConfigure, observable, runInAction } from 'mobx'

import Intl, { LanguageMap, Messages } from '.'
// eslint-disable-next-line @typescript-eslint/camelcase
import { allAvailables, en, eo, fr, fr_ca, langType, languageMap } from './LanguageMap.spec'

mobxConfigure({ enforceActions: 'observed' })

describe('Intl', function() {
  const lang: Intl<langType> = new Intl(languageMap)

  it('must have the Intl prototype', function() {
    expect(lang).to.be.instanceOf(Intl)
  })

  it('must be created with all map languages', function() {
    expect(lang.$languageMap.availables).to.have.members(allAvailables)
  })

  it('must give default string', function() {
    expect(lang.hello('me')).to.equal('Hello me')
  })

  const RESERVED = ['$preferences', '$languageMap', '$changePreferences', '$getMessageFunction']
  RESERVED.forEach(key => {
    const messages: Messages = { $: 'Reserved' }
    messages[key] = 'forbidden'
    const reservedMap = new LanguageMap(messages)
    it(`must throw an exception if language map contains reserved keyword ${key}`, function() {
      expect(() => {
        new Intl(reservedMap)
      }).to.throw(/not permitted/i)
    })
  })

  it('must throw an exception if language map contains undefined values', function() {
    const undefinedLang: any = new Intl(new LanguageMap({ $: 'Undefined', value: undefined }))
    expect(() => undefinedLang.value()).to.throw(/not permitted/i)
  })

  it('must not consider empty string as undefined value', function() {
    const emptyLang: any = new Intl(new LanguageMap({ $: 'Empty', value: '' }))
    expect(() => emptyLang.value()).not.to.throw()
  })

  it('must only find messages on object enumeration', function() {
    const keys = []
    for (const key in lang) {
      if (Object.hasOwnProperty.call(lang, key)) {
        keys.push(key)
        expect(Object.keys(en)).to.include(key)
      }
    }
    expect(keys).to.have.members(Object.keys(en))
    expect(keys).to.have.lengthOf(Object.keys(en).length)
  })

  function testCases(
    prepareLang: (preferences: ReadonlyArray<string>, createGenerics?: boolean) => Intl<langType>
  ) {
    it('must format language string', function() {
      const testedLang = prepareLang(['fr-CA'])
      expect(testedLang.hello('me')).to.equal('Allo me')
    })

    it('must fallback to generic types', function() {
      const testedLang = prepareLang(['fr-CA'])
      expect(testedLang.welcome()).to.equal('Bienvenue !')
    })

    it('must not fallback to generic type', function() {
      const testedLang = prepareLang(['fr-CA'], false)
      expect(testedLang.welcome()).to.equal('Welcome!')
    })

    it('must use preferred available message if one preference is given', function() {
      const testedLang = prepareLang(['eo'])
      expect(testedLang.hello('me')).to.equal('Saluton me')
      expect(testedLang.showElementCount(1)).to.equal('There is one element')
    })

    it('must use preferred available message if multiple preferences are given', function() {
      const testedLang = prepareLang(['fr_CA', 'eo', 'fr'], false)
      expect(testedLang.welcome()).to.equal(eo.welcome)
      // eslint-disable-next-line @typescript-eslint/camelcase
      expect(testedLang.$getMessageFunction('hello')).to.equal(fr_ca.hello)
      expect(testedLang.$getMessageFunction('showElementCount').toString()).to.equal(
        fr.showElementCount.toString()
      )
    })

    it('must use preferred available message or fallback to more generic type', function() {
      const testedLang = prepareLang(['eo', 'fr_CA'])
      expect(testedLang.welcome()).to.equal(eo.welcome)
      expect(testedLang.$getMessageFunction('hello')).to.equal(eo.hello)
      expect(testedLang.$getMessageFunction('showElementCount').toString()).to.equal(
        fr.showElementCount.toString()
      )
    })

    it('must forget non existing language in preferences', function() {
      const testedLang = prepareLang(['eo', 'dummy', 'fr'])
      expect(testedLang.$preferences).to.have.ordered.members(['eo', 'fr'])
    })

    it('must format values as defined in language map', function() {
      expect(lang.showElementCount(2)).to.equal('There are 2.00 elements')
      const testedLang = prepareLang(['fr'])
      expect(testedLang.showElementCount(2)).to.equal('Il y a 2,00 éléments')
    })
  }

  describe('creating new object', function() {
    testCases((preferences, createGenerics) => new Intl(lang, preferences, createGenerics))

    it('must be immutable', function() {
      expect(new Intl(lang, ['anything'])).not.to.equal(lang)
    })
  })

  describe('#$changePreferences', function() {
    afterEach('Reset preferences to default', function() {
      lang.$changePreferences([])
    })

    testCases((preferences, createGenerics) => lang.$changePreferences(preferences, createGenerics))

    it('must not be immutable', function() {
      expect(lang.$changePreferences(['anything'])).to.equal(lang)
    })
  })

  describe('MobX integration', function() {
    async function testObservation(
      store: { lang: Intl<langType> },
      name: string,
      update: () => void
    ): Promise<string[]> {
      const result: string[] = []
      const disposer = autorun(() => {
        result.push(store.lang.hello(name))
      })
      update()
      disposer()
      return result
    }

    describe('when available', function() {
      it('must detect preference change', async function() {
        const store = { lang: new Intl(languageMap) }
        const result = await testObservation(store, 'Daenerys', () => {
          store.lang.$changePreferences(['fr'])
        })
        expect(result).to.have.ordered.members(['Hello Daenerys', 'Bonjour Daenerys'])
      })

      it('must detect language change', async function() {
        class Store {
          @observable
          public lang = new Intl(languageMap)
        }
        const store = new Store()
        const result = await testObservation(store, 'Jon', () => {
          runInAction(() => (store.lang = new Intl(languageMap, ['fr'])))
        })
        expect(result).to.have.ordered.members(['Hello Jon', 'Bonjour Jon'])
      })
    })

    describe('when NOT available', function() {
      process.env.INTL_MOBX = 'no'
      delete require.cache[require.resolve('mobx')]
      delete require.cache[require.resolve('./Intl')]
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const NewIntl = require('./Intl').Intl

      it('must NOT detect preference change', async function() {
        const store = { lang: new NewIntl(languageMap) }
        const result = await testObservation(store, 'Sansa', () => {
          store.lang.$changePreferences(['fr'])
        })
        expect(result).to.have.ordered.members(['Hello Sansa'])
      })
    })
  })
})
