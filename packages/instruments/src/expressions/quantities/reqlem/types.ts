import type { UnitValue } from "../units/unit-parser"
export type Resources_sUnitTerm<Unit extends string> = `${number}${Unit}` | "?"

export type ReqLim_Array<Unit extends string> = [
    Resources_sUnitTerm<Unit>,
    Resources_sUnitTerm<Unit>
]
export type Resources_UnitMap_Trait<T> = Record<keyof T, string>
type _Spaces = "" | " " | "  "
export type Resources_sToFrom<Unit extends string> =
    `${Resources_sUnitTerm<Unit>}${_Spaces}->${_Spaces}${Resources_sUnitTerm<Unit>}`
export type Resources_sExactly<U extends string> = `=${Resources_sUnitTerm<U>}`
export interface ReqLimit<Unit extends string = string> {
    readonly request?: UnitValue<Unit>
    readonly limit?: UnitValue<Unit>
}
export type ReqLim_Input_Of<Unit extends string> =
    | Resources_sToFrom<Unit>
    | Resources_sExactly<Unit>
    | ReqLim_Array<Unit>
type CustomResource = `${string}/${string}`

export type Resources_ReqLimits_Trait<ResourceUnit extends Resources_UnitMap_Trait<ResourceUnit>> =
    {
        [K in keyof ResourceUnit]: ReqLim_Input_Of<ResourceUnit[K]>
    } & {
        [K in CustomResource]?: ReqLim_Input_Of<string>
    }
