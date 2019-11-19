/**
 * A message seen as function.
 */
export type MessageFunction<T extends string | ((...args: any[]) => string)> = T extends string
  ? () => string
  : T

/**
 * The available messages for a given language.
 */
export interface Messages {
  $: string // The language name itself
  [key: string]: string | ((...args: any[]) => string)
}

/**
 * The available messages for a given language.
 */
export type PartialMessages<T extends Messages> = {
  $: string
} & Partial<T>
