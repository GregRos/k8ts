import type { UnitValue } from "../units/unit-parser"
export type _limit_term<Unit extends string> = `${number}${Unit}` | "?"

export interface InputReqLimitObject<Unit extends string> {
    readonly request: _limit_term<Unit>
    readonly limit: _limit_term<Unit>
}
export type InputReqLimitArray<Unit extends string> = [_limit_term<Unit>, _limit_term<Unit>]
export type mt_Resource_Unit_Map<T> = Record<keyof T, string>

export type InputReqLimitString<U extends string> = `${_limit_term<U>}--->${_limit_term<U>}`

export interface ReqLimit<Unit extends string = string> {
    readonly request?: UnitValue<Unit>
    readonly limit?: UnitValue<Unit>
}
export type InputReqLimit<Unit extends string> =
    | InputReqLimitString<Unit>
    | InputReqLimitObject<Unit>
    | InputReqLimitArray<Unit>
export type mt_Resource_Input_Map<ResourceUnit extends mt_Resource_Unit_Map<ResourceUnit>> = {
    [K in keyof ResourceUnit]: InputReqLimit<ResourceUnit[K]>
}
