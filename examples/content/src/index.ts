import * as express from 'express'
import Intl from 'intl-ts'
// eslint-disable-next-line import/no-internal-modules
import { renderToString } from 'react-dom/server'
import { createLayout } from './client/Layout'
import { lang } from './locale'

const content = (htmlContent: string, preload: string) => `<html>
<head><meta charset="utf-8" /><title>Intl-ts</title></head>
<body><div id="root">${htmlContent}</div><script id="preload">${preload}</script><script src='/client' type='text/javascript'></script></body>
</html>`

const stringifyLanguage = (language: Intl<any>): string =>
  `window.__LANGUAGE__=${JSON.stringify({
    preferences: language.$preferences,
  }).replace(/</g, '\\u003c')}; window.__LANGUAGE__.languageMap=${language.$languageMap.toString()}`

function calculatePreferredLanguages(languages?: string | string[]): string[] {
  let preferred: string[] = []
  if (languages) {
    if (typeof languages === 'string') {
      preferred = languages.split(',')
    } else {
      preferred = languages
    }
  }
  return preferred.map(prefLang => prefLang.split(';')[0])
}

const app = express()
app.get('/', (req, res) => {
  const preferredLanguages = calculatePreferredLanguages(req.headers['accept-language'])
  const reqLang = new Intl(lang, preferredLanguages, false)
  const htmlContent = renderToString(createLayout(reqLang))
  const preload = stringifyLanguage(reqLang)
  res.status(200).send(content(htmlContent, preload))
})

app.get('/client', (_req, res) => {
  res.status(200).sendFile(__dirname + '/bundle.js')
})

app.listen(8080, () => console.info(lang.serverReady()))
