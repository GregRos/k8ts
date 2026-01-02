import { int, letter } from "parjs"
import { many, map, stringify, then } from "parjs/combinators"

export const pUnit = letter().pipe(many(), stringify())
export const pValueUnit = int().pipe(
    then(pUnit),
    map(arr => {
        const [value, unit] = arr
        return { value, unit }
    })
)
