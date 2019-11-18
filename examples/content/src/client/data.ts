import { LanguageMap } from 'intl-ts'

export function eatLanguageData(
  container?: HTMLElement
): { preferences: string[]; languageMap: LanguageMap<import('../locale').langType> } {
  if (!window.__LANGUAGE__) {
    throw new Error('Data initialization error')
  }
  const preferences = window.__LANGUAGE__.preferences
  const languageMap = new LanguageMap(window.__LANGUAGE__.languageMap)
  delete window.__LANGUAGE__
  container && container.remove()
  return { preferences, languageMap }
}
