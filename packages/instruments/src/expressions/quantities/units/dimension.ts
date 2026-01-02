import { type Parjser } from "parjs"
import { map } from "parjs/combinators"
import { K8tsQuantityError } from "../error"
import { pValueUnit } from "./parser"
import type { Reqs_sUnitTerm } from "./types"
import { type Dimension_Validator, getValidator } from "./validator"
import { UnitValue } from "./value"

export interface Dimension_Props_Any {
    name: string
    units: "any"
}

export interface Dimension_Props_Explicit<Units extends string> {
    name: string
    units: [Units, ...Units[]]
}

export type Dimension_Props<Units extends string = string> =
    | Dimension_Props_Any
    | Dimension_Props_Explicit<Units>

export class UnitDimension<const _Units extends string = string> {
    readonly parser: Parjser<UnitValue<_Units>>
    private _validate: Dimension_Validator<_Units>
    constructor(readonly _props: Dimension_Props<_Units>) {
        this._validate = getValidator(_props)
        this.parser = pValueUnit.pipe(
            map(({ value, unit }) => {
                this._validate(unit)

                return new UnitValue<_Units>(unit as any, value, this._props.name)
            })
        )
    }

    parse(input: Reqs_sUnitTerm<_Units>) {
        const pUnitValue = this.parser
        const result = pUnitValue.parse(input)
        if (result.kind !== "OK") {
            throw new K8tsQuantityError(`Failed to parse ${this._props}`, {
                more: result.trace.toString()
            })
        }
        return result.value
    }
}
