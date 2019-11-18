import { basename } from 'path'
import { sync } from 'glob'
import Intl, { LanguageMap, PartialMessages } from 'intl-ts'
import { messages as en } from './en'

export type langType = typeof en

const languageMap = sync(`${__dirname}/*.js`)
  .map(file => basename(file, '.js'))
  .filter(language => !['index', 'en'].includes(language))
  .map(language => ({ [language]: require(`./${language}`).messages as PartialMessages<langType> }))
  .reduce((map, language) => map.merge(language), new LanguageMap(en, 'en'))

export const lang = new Intl<langType>(languageMap, [process.env.LANG || ''])
