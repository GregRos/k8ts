export type BuiltIn =
    | Function
    | Error
    | Date
    | {
          readonly [Symbol.toStringTag]: string
      }
    | RegExp
    | Generator

export type WritableDeep<O> = {
    -readonly [K in keyof O]: O[K] extends BuiltIn ? O[K] : WritableDeep<O[K]>
}
