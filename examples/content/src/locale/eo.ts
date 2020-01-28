import { PartialMessages, createMessages } from 'intl-ts'
import { messages as defLang } from './en'

export const messages = createMessages<PartialMessages<typeof defLang>>({
  $: 'Esperanto',
  welcome: 'Bonvenon ĉi-tie!',
  displayTime: (date: string, time: string) => `Nun estas ${date} je ${time}.`,
  selectLanguage: 'Elektu lingvon:',
  hello: (name: string) => `Saluton ${name}!`,
  convertDate: (date: Date) => {
    return (
      'la ' +
      ['dimanĉo', 'lundo', 'mardo', 'merkredo', 'ĵaŭdo', 'vendredo', 'sabato'][date.getDay()] +
      ` ${date.getDate()}a de ` +
      [
        'januaro',
        'februaro',
        'marto',
        'aprilo',
        'majo',
        'junio',
        'julio',
        'aŭgusto',
        'septembro',
        'oktobro',
        'novembro',
        'decembro',
      ][date.getMonth()] +
      ` ${date.getFullYear()}`
    )
  },
  convertTime: (date: Date) => {
    let time = ''
    let needSide = false
    let hours = date.getHours()
    if (date.getMinutes() > 30) {
      if (date.getMinutes() === 45) {
        time += 'kvarono'
      } else {
        time += 60 - date.getMinutes()
      }
      time += ' antaŭ '
      hours = (hours + 1) % 24
    }
    if (hours === 0) {
      time += 'noktomezo'
    } else if (hours === 12) {
      time += 'tagmezo'
    } else {
      time += 'la ' + (hours % 12) + 'a'
      needSide = true
    }
    if (date.getMinutes() !== 0 && date.getMinutes() <= 30) {
      time += ' kaj '
      if (date.getMinutes() === 15) {
        time += 'kvarono'
      } else if (date.getMinutes() === 30) {
        time += 'duono'
      } else {
        time += date.getMinutes()
      }
    }
    if (needSide) {
      time += date.getHours() > 12 ? ' posttagmeze' : ' matene'
    }
    if (date.getSeconds() !== 0) {
      time += ` kaj ${date.getSeconds()} sekundo`
      if (date.getSeconds() > 1) {
        time += 'j'
      }
    }
    return time
  },
})
