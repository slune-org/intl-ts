export type Message0 = string
export type Message1<P1> = (arg1: P1) => string
export type Message2<P1, P2> = (arg1: P1, arg2: P2) => string
export type Message3<P1, P2, P3> = (arg1: P1, arg2: P2, arg3: P3) => string
export type Message4<P1, P2, P3, P4> = (
  arg1: P1,
  arg2: P2,
  arg3: P3,
  arg4: P4
) => string
export type Message5<P1, P2, P3, P4, P5> = (
  arg1: P1,
  arg2: P2,
  arg3: P3,
  arg4: P4,
  arg5: P5
) => string
export type Message6<P1, P2, P3, P4, P5, P6> = (
  arg1: P1,
  arg2: P2,
  arg3: P3,
  arg4: P4,
  arg5: P5,
  arg6: P6
) => string

/**
 * The available messages for a given language.
 */
export interface Messages {
  [key: string]:
    | Message0
    | Message1<any>
    | Message2<any, any>
    | Message3<any, any, any>
    | Message4<any, any, any, any>
    | Message5<any, any, any, any, any>
    | Message6<any, any, any, any, any, any>
}
