export type JoinIfNotEmpty<A extends string, J extends string, B extends string> = A extends ""
    ? B
    : B extends ""
      ? A
      : `${A}${J}${B}`
