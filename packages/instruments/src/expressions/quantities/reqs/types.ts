import type { StringRecordLike } from "../../../utils/types"
import type { Reqs_sUnitTerm } from "../units/types"
import type { UnitValue } from "../units/value"

export type Reqs_ReqLim_Array_FromTo<_Unit extends string> = [
    Reqs_sUnitTerm<_Unit>,
    Reqs_sUnitTerm<_Unit>
]

export type Reqs_ReqLim_Array_Exactly<_Unit extends string> = [Reqs_sUnitTerm<_Unit>]
type _Spaces = "" | " " | "  "
export type Reqs_sFromTo<_Unit extends string> =
    `${Reqs_sUnitTerm<_Unit>}${_Spaces}->${_Spaces}${Reqs_sUnitTerm<_Unit>}`
export type Reqs_sExactly<_Unit extends string> = `=${Reqs_sUnitTerm<_Unit>}`
export interface Reqs_ReqLimit<_Unit extends string = string> {
    readonly request?: UnitValue<_Unit>
    readonly limit?: UnitValue<_Unit>
}
export type Reqs_One<_Unit extends string> =
    | Reqs_sFromTo<_Unit>
    | Reqs_sExactly<_Unit>
    | Reqs_ReqLim_Array_FromTo<_Unit>
    | Reqs_ReqLim_Array_Exactly<_Unit>
type CustomResource = `${string}/${string}`

export type Reqs_Dictionary<UnitDict extends StringRecordLike<UnitDict>> = {
    [K in keyof UnitDict]: Reqs_One<UnitDict[K]>
} & {
    [K in CustomResource]?: Reqs_One<string>
}
