import type { Parjser } from "parjs/."
import { manySepBy, map, must } from "parjs/combinators"
import { MakeError } from "../error"
import type { UnitValue } from "../units/unit-parser"
import { unitParser } from "../units/values"

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
            return {
                request: a,
                limit: b
            } as ReqLimit
        })
    )
}

function createReqLimitParseFunction(unit: string, p: Parjser<ReqLimit>) {
    return (input: string) => {
        const result = p.parse(input)
        if (result.kind !== "OK") {
            throw new MakeError(`Failed to parse ${unit} request limit`, {
                trace: result.trace.toString()
            })
        }
        return result.value
    }
}
export const pCpuReqLimit = createReqLimitParser(unitParser.createParser("cpu"))
export const pDataReqLimit = createReqLimitParser(unitParser.createParser("data"))
export interface ReqLimit {
    readonly request: UnitValue
    readonly limit: UnitValue
}
export namespace ReqLimit {
    export namespace Cpu {
        const _parseCpu = createReqLimitParseFunction("cpu", pCpuReqLimit)
        export function parse(input: string) {
            return _parseCpu(input)
        }
    }
    export namespace Data {
        const _parseData = createReqLimitParseFunction("data", pDataReqLimit)
        export function parse(input: string) {
            return _parseData(input)
        }
    }
}
