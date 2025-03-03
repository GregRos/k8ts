import { Map, Set } from "immutable"
import { int, letter } from "parjs"
import { many1, map, stringify, then } from "parjs/combinators"
import { UnitError } from "../error"
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

export class UnitParser {
    private _unitToType: Map<string, Set<string>>
    constructor(unitTypes: Record<string, string[]>) {
        this._unitToType = Map(unitTypes)
            .entrySeq()
            .flatMap(([type, units]) => {
                return units.map(unit => [unit, type] as const)
            })
            .groupBy(([unit, _]) => unit)
            .map(x => {
                return x.map(x => x[1])
            })

            .map(types => {
                return Set(types)
            })
    }

    createParser<Unit extends string>(expectedType: string) {
        return pValueUnit.pipe(
            map(({ value, unit }) => {
                const gotType = this._unitToType.get(unit)
                if (!gotType) {
                    throw new UnitError(`Unit ${unit} is not recognized`)
                }
                if (!gotType.has(expectedType)) {
                    throw new UnitError(
                        `Unit ${unit} is of type ${gotType.join(", ")} not of type ${expectedType}`
                    )
                }
                return new UnitValue<Unit>(unit as any, value, expectedType)
            })
        )
    }
    createParseFunctionFor<Unit extends string>(expectedType: string) {
        const pUnitValue = this.createParser<Unit>(expectedType)
        return (input: string) => {
            const result = pUnitValue.parse(input)
            if (result.kind !== "OK") {
                throw new UnitError(`Expression ${input} did not match the unit pattern`, {
                    more: result.trace.toString()
                })
            }
            return result.value
        }
    }
}
