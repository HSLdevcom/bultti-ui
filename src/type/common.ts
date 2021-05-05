export interface FunctionMap {
  [name: string]: (...args: any[]) => unknown
}

export type AnyFunction<T = unknown, ReturnT = unknown> = (...args: T[]) => ReturnT
