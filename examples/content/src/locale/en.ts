import { createMessages } from 'intl-ts'

export const messages = createMessages({
  $: 'English',
  welcome: 'Welcome here!',
  displayTime: (date: string, time: string) => `We are ${date}, and it is ${time}.`,
  selectLanguage: 'Select a language:',
  enterName: 'Enter you name:',
  hello: (name: string) => `Hello ${name}!`,
  showNameSize: (size: number) => {
    switch (size) {
      case 0: {
        return 'You did not give a name yet.'
      }
      case 1: {
        return 'Your name has one single letter.'
      }
      default: {
        return `Your name has ${size} letters.`
      }
    }
  },
  serverReady: 'Server ready',
  convertDate: (date: Date) => {
    return (
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()] +
      ', ' +
      [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ][date.getMonth()] +
      ` ${date.getDate()}, ${date.getFullYear()}`
    )
  },
  convertTime: (date: Date) => {
    let time = ''
    if (date.getHours() === 0 && date.getMinutes() === 0) {
      time = 'midnight'
    } else if (date.getHours() === 12 && date.getMinutes() === 0) {
      time = 'noon'
    } else {
      time += ((date.getHours() + 11) % 12) + 1
      time += date.getMinutes() === 0 ? '' : ':' + ('0' + date.getMinutes()).slice(-2)
      time += date.getHours() >= 12 ? ' p.m.' : ' a.m.'
    }
    if (date.getSeconds() !== 0) {
      time += ` and ${date.getSeconds()} second`
      if (date.getSeconds() > 1) {
        time += 's'
      }
    }
    return time
  },
})
