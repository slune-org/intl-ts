import { PartialMessages } from 'intl-ts'
import { messages as defLang } from './en'

export const messages: PartialMessages<typeof defLang> = {
  $: 'Français (Canada)',
  welcome: 'Bienvenue icitte !',
}
