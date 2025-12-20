import { int, letter, type Parjser } from "parjs"
import { many, map, stringify, then } from "parjs/combinators"
import { InstrumentsError } from "../../../error"
const pUnit = letter().pipe(many(), stringify())

const pValueUnit = int().pipe(
    then(pUnit),
    map(arr => {
        const [value, unit] = arr
        return { value, unit }
    })
)
// TODO: Simplify unit parser to allow for arbitrary resources/units
export class UnitValue<Unit extends string = string> {
    constructor(
        readonly unit: Unit,
        readonly value: number,
        readonly type: string
    ) {}

    get str() {
        return `${this.value}${this.unit}`
    }

    get val() {
        if (!this.unit) {
            return +this.value
        }
        return this.str
    }

    toString() {
        return this.str
    }
}

export abstract class UnitParser<const Unit extends string = string> {
    readonly parser: Parjser<UnitValue<Unit>>
    protected abstract _validate(unit: string): asserts unit is Unit
    constructor(protected readonly _unitType: string) {
        this.parser = pValueUnit.pipe(
            map(({ value, unit }) => {
                this._validate(unit)

                return new UnitValue<Unit>(unit as any, value, this._unitType)
            })
        )
    }

    parse = (input: `${number}${Unit}`) => {
        const pUnitValue = this.parser
        const result = pUnitValue.parse(input)
        if (result.kind !== "OK") {
            throw new InstrumentsError(`Failed to parse ${this._unitType}`, {
                more: result.trace.toString()
            })
        }
        return result.value
    }
}

export class AnyUnitParser extends UnitParser<string> {
    constructor() {
        super("any")
    }

    _validate(_unit: string): void {
        // Accept any unit
    }

    static make() {
        return new AnyUnitParser()
    }
}

export class SetUnitParser<const Unit extends string = string> extends UnitParser<Unit> {
    constructor(
        unitType: string,
        private readonly _units: Set<Unit>
    ) {
        super(unitType)
    }

    _validate(unit: string): asserts unit is Unit {
        if (!this._units.has(unit as Unit)) {
            throw new InstrumentsError(`Unit ${unit} is not a valid unit of type ${this._unitType}`)
        }
    }

    static make<const Unit extends string>(unitType: string, units: Set<Unit>) {
        return new SetUnitParser<Unit>(unitType, units)
    }
}
