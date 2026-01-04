export type CmdLine_sArg = `-${string}` | `--${string}`
export type CmdLine_sOption = `${CmdLine_sArg}=` | `${CmdLine_sArg} ` | CmdLine_sArg
export type CmdLine_Value = string | number | boolean | null | `${string}` | ` ${string}`
export type CmdLine_Args = Record<CmdLine_sOption, CmdLine_Value>
