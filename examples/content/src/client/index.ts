import Intl from 'intl-ts'
import { hydrate } from 'react-dom'

import { eatLanguageData } from './data'
import { createLayout } from './Layout'

document.addEventListener('DOMContentLoaded', () => {
  const { preferences, languageMap } = eatLanguageData(document.getElementById('preload') || undefined)
  const lang = new Intl(languageMap, preferences, false)

  hydrate(createLayout(lang), document.querySelector('#root'))
})
