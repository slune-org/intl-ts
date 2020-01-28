import { PartialMessages, createMessages } from 'intl-ts'
import { messages as defLang } from './en'

export const messages = createMessages<PartialMessages<typeof defLang>>({
  $: 'Français (Canada)',
  welcome: 'Bienvenue icitte !',
})
