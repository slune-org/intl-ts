/**
 * A simple message may be either directly a string or a function.
 */
export type Message = string | ((...args: any[]) => string)

/**
 * A message converted into a function.
 */
export type MessageFunction<T extends Message | undefined> = T extends undefined
  ? never
  : T extends string
  ? () => string
  : T

/**
 * The available messages for a given language.
 */
export interface Messages {
  [key: string]: Message | undefined
  $: string // The language name itself
}

/**
 * The available messages for a given language.
 */
export type PartialMessages<T extends Messages> = Partial<T> & {
  $: string
}

/**
 * This identity function can be useful to check that messages have the appropriate type.
 *
 * @param messages - The messages to create.
 * @returns The same messages as input.
 */
export function createMessages<T extends Messages>(messages: T): T {
  return messages
}
