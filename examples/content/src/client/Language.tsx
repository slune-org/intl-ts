// eslint-disable-next-line import/no-duplicates
import * as React from 'react'
// eslint-disable-next-line import/no-duplicates
import { ChangeEvent, FunctionComponent, useCallback } from 'react'
import { useLang } from './Store'

const Language: FunctionComponent = () => {
  const lang = useLang()
  const languageMap = lang.$languageMap
  const selected = lang.$preferences.length > 0 ? lang.$preferences[0] : lang.$languageMap.default

  const onChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    console.log(event.target.value)
  }, [])

  return (
    <>
      <label htmlFor="lang-select">{lang.selectLanguage()}</label>&nbsp;
      <select id="lang-select" value={selected} onChange={onChange}>
        {languageMap.availables.sort().map(langCode => (
          <option key={langCode} value={langCode}>
            {languageMap.messages(langCode).$}
          </option>
        ))}
      </select>
    </>
  )
}
export default Language
