export type Cli_sFlag = `-${string}` | `--${string}`
export type Cli_sArgKey = `${Cli_sFlag}=` | `${Cli_sFlag} ` | Cli_sFlag
export type Cli_Value = string | number | boolean | null | `${string}` | ` ${string}`
export type Cli_Record_ArgMap = Record<Cli_sArgKey, Cli_Value>
