import { LanguageMapDefinition } from 'intl-ts'

declare global {
  interface Window {
    __LANGUAGE__?: {
      preferences: string[]
      languageMap: LanguageMapDefinition<import('./locale').langType>
    }
  }
}
