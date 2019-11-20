/**
 * A simple message may be either directly a string or a function.
 */
export type Message = string | ((...args: any[]) => string)

/**
 * A message converted into a function.
 */
export type MessageFunction<T extends Message> = T extends string ? () => string : T

/**
 * The available messages for a given language.
 */
export type Messages = {
  $: string // The language name itself
} & Omit<{ [key: string]: Message }, '$'>

/**
 * The available messages for a given language.
 */
export type PartialMessages<T extends Messages> = {
  $: string
} & Partial<Omit<T, '$'>>
