export type StringRecordLike<T = Record<string, string>> = Record<keyof T, string>

export type DeepPartial<T> = T extends Function
    ? T
    : T extends any[]
      ? number extends T["length"]
          ? DeepPartial<T[number]>[] // Regular array
          : { [K in keyof T]?: DeepPartial<T[K]> } // Tuple
      : T extends readonly any[]
        ? number extends T["length"]
            ? readonly DeepPartial<T[number]>[] // Readonly array
            : Readonly<{ [K in keyof T]?: DeepPartial<T[K]> }> // Readonly tuple
        : T extends object
          ? { [K in keyof T]?: DeepPartial<T[K]> }
          : T
