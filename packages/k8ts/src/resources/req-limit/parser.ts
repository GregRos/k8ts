import type { Parjser } from "parjs/."
import { manySepBy, map, must } from "parjs/combinators"
import { UnitError } from "../error"
import type { UnitValue } from "../units/unit-parser"
import { unitParser } from "../units/values"

export class ReqLimit {
    constructor(
        readonly request: UnitValue,
        readonly limit: UnitValue
    ) {}
}

export function createReqLimitParser(pUnitValue: Parjser<UnitValue>) {
    return pUnitValue.pipe(
        manySepBy("--->", 2),
        must(x => {
            if (x.length !== 2) {
                return {
                    kind: "Hard",
                    reason: "Expected exactly 2 values"
                }
            }
            return true
        }),
        map(([a, b]) => {
            return new ReqLimit(a, b)
        })
    )
}

function createReqLimitParseFunction(p: Parjser<ReqLimit>) {
    return (input: string) => {
        const result = p.parse(input)
        if (result.kind !== "OK") {
            throw new UnitError(`Failed to parse ${unit} request limit`, {
                trace: result.trace.toString()
            })
        }
        return result.value
    }
}
export const pCpuReqLimit = createReqLimitParser(unitParser.createParser("cpu"))
export const pDataReqLimit = createReqLimitParser(unitParser.createParser("data"))

export const parseCpuReqLimit = createReqLimitParseFunction(pCpuReqLimit)
export const parseDataReqLimit = createReqLimitParseFunction(pDataReqLimit)
