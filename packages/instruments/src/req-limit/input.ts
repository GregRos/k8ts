import type { Unit } from "../units"

export type ReqLimitInput<Expr extends string> = `${Expr}--->${Expr}`
export namespace ReqLimitInput {
    export type CPU = ReqLimitInput<Unit.Cpu>
    export type Memory = ReqLimitInput<Unit.Data>
    export type Storage = ReqLimitInput<Unit.Data>
}
