import type { UnitValue } from "../units/unit-parser"
export type Resources_sUnitTerm<Unit extends string> = `${number}${Unit}` | "?"

export type Resources_ReqLim_Array<Unit extends string> = [
    Resources_sUnitTerm<Unit>,
    Resources_sUnitTerm<Unit>
]
export type ResourcesUnitMap_Trait<T> = Record<keyof T, string>
type _Spaces = "" | " " | "  "
export type Resources_sToFrom<Unit extends string> =
    `${Resources_sUnitTerm<Unit>}${_Spaces}->${_Spaces}${Resources_sUnitTerm<Unit>}`
export type Resources_sExactly<U extends string> = `=${Resources_sUnitTerm<U>}`
export interface Resources_ReqLim<Unit extends string = string> {
    readonly request?: UnitValue<Unit>
    readonly limit?: UnitValue<Unit>
}
export type Resources_Input<Unit extends string> =
    | Resources_sToFrom<Unit>
    | Resources_sExactly<Unit>
    | Resources_ReqLim_Array<Unit>
type CustomResource = `${string}/${string}`

export type ResourcesReqLimits_Trait<ResourceUnit extends ResourcesUnitMap_Trait<ResourceUnit>> = {
    [K in keyof ResourceUnit]: Resources_Input<ResourceUnit[K]>
} & {
    [K in CustomResource]?: Resources_Input<string>
}
