import type { StringRecordLike } from "../../../utils/types"
import type { UnitValue } from "../units/unit-parser"
export type Reqs_sUnitTerm<Unit extends string> = `${number}${Unit}` | "?"

export type Reqs_ReqLim_Array_FromTo<Unit extends string> = [
    Reqs_sUnitTerm<Unit>,
    Reqs_sUnitTerm<Unit>
]

export type Reqs_ReqLim_Array_Exactly<Unit extends string> = [Reqs_sUnitTerm<Unit>]

type _Spaces = "" | " " | "  "
export type Reqs_sFromTo<Unit extends string> =
    `${Reqs_sUnitTerm<Unit>}${_Spaces}->${_Spaces}${Reqs_sUnitTerm<Unit>}`
export type Reqs_sExactly<U extends string> = `=${Reqs_sUnitTerm<U>}`
export interface Reqs_ReqLimit<Unit extends string = string> {
    readonly request?: UnitValue<Unit>
    readonly limit?: UnitValue<Unit>
}
export type Reqs_One<Unit extends string> =
    | Reqs_sFromTo<Unit>
    | Reqs_sExactly<Unit>
    | Reqs_ReqLim_Array_FromTo<Unit>
    | Reqs_ReqLim_Array_Exactly<Unit>
type CustomResource = `${string}/${string}`

export type Reqs_Dictionary<UnitDict extends StringRecordLike<UnitDict>> = {
    [K in keyof UnitDict]: Reqs_One<UnitDict[K]>
} & {
    [K in CustomResource]?: Reqs_One<string>
}
