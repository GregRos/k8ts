export type Cli_sFlag = `-${string}` | `--${string}`
export type Cli_sArgKey = `${Cli_sFlag}=` | `${Cli_sFlag} ` | Cli_sFlag
export type CliValue = string | number | boolean | null | `${string}` | ` ${string}`
export type CliRecordArgMap = Record<Cli_sArgKey, CliValue>
