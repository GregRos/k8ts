import { anyStringOf, int } from "parjs"
import { map, then } from "parjs/combinators"
import type { UnitValue } from "./types"

export function createDimValueParser(units: string[]) {
    const pUnit = anyStringOf(...units)
    const pUnitValue = int().pipe(
        then(pUnit),
        map(arr => {
            const [value, unit] = arr
            return {
                value,
                unit
            } as UnitValue
        })
    )
    return pUnitValue
}
