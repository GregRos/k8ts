export type CliKey = `-${string}` | `--${string}`
export type InputCliKey = `${CliKey}=` | `${CliKey} ` | CliKey
export type CliValue = string | number | boolean | null | `${string}` | ` ${string}`
export type CliArgsMapping = Record<InputCliKey, CliValue>
