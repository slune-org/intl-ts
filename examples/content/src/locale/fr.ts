/* eslint-disable no-irregular-whitespace */
import { createMessages } from 'intl-ts'
import { messages as defLang } from './en'

export const messages = createMessages<typeof defLang>({
  $: 'Français',
  welcome: 'Bienvenue ici !',
  displayTime: (date: string, time: string) => `Nous sommes ${date} et il est ${time}.`,
  selectLanguage: 'Choisissez une langue :',
  enterName: 'Tapez votre nom :',
  hello: (name: string) => `Bonjour ${name} !`,
  showNameSize: (size: number) => {
    switch (size) {
      case 0: {
        return 'Vous n’avez pas encore indiqué de nom.'
      }
      case 1: {
        return 'Votre nom n’a qu’une seule lettre.'
      }
      default: {
        return `Votre nom a ${size} lettres.`
      }
    }
  },
  serverReady: 'Serveur prêt',
  convertDate: (date: Date) => {
    return (
      ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][date.getDay()] +
      ` ${date.getDate()} ` +
      [
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'aout',
        'septembre',
        'octobre',
        'novembre',
        'décembre',
      ][date.getMonth()] +
      ` ${date.getFullYear()}`
    )
  },
  convertTime: (date: Date) => {
    let time = `${date.getHours()}h`
    time += ('0' + date.getMinutes()).slice(-2)
    if (date.getSeconds() !== 0) {
      time += ` et ${date.getSeconds()} seconde`
      if (date.getSeconds() > 1) {
        time += 's'
      }
    }
    return time
  },
})
