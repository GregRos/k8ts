import { Set } from "immutable"
import { int, letter, type Parjser } from "parjs"
import { many1, map, stringify, then } from "parjs/combinators"
import { InstrumentsError } from "../error"
const pUnit = letter().pipe(many1(2), stringify())

const pValueUnit = int().pipe(
    then(pUnit),
    map(arr => {
        const [value, unit] = arr
        return { value, unit }
    })
)
export class UnitValue<Unit extends string = string> {
    constructor(
        readonly unit: Unit,
        readonly value: number,
        readonly type: string
    ) {}

    get str() {
        return `${this.value}${this.unit}`
    }

    toString() {
        return this.str
    }
}

export class UnitParser<const Unit extends string = string> {
    readonly parser: Parjser<UnitValue<Unit>>
    constructor(
        private readonly unitType: string,
        private readonly _units: Set<Unit>
    ) {
        this.parser = pValueUnit.pipe(
            map(({ value, unit }) => {
                const gotType = this._units.has(unit as any)
                if (!gotType) {
                    throw new InstrumentsError(
                        `Unit ${unit} is not a valid unit of type ${this.unitType}`
                    )
                }
                return new UnitValue<Unit>(unit as any, value, this.unitType)
            })
        )
    }

    parse = (input: `${number}${Unit}`) => {
        const pUnitValue = this.parser
        const result = pUnitValue.parse(input)
        if (result.kind !== "OK") {
            throw new InstrumentsError(`Failed to parse ${this.unitType}`, {
                more: result.trace.toString()
            })
        }
        return result.value
    }

    static make<const Unit extends string>(unitType: string, units: Set<Unit>) {
        return new UnitParser<Unit>(unitType, units)
    }
}
