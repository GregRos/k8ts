import type { Parjser } from "parjs/."
import { manySepBy, map, must } from "parjs/combinators"
import { InstrumentsError } from "../error"
import type { UnitValue } from "../units/unit-parser"
import { unitParser } from "../units/values"
import type { ReqLimit } from "./namespaces"

export function createReqLimitParser(resource: string, pUnitValue: Parjser<UnitValue>) {
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
                resource: resource,
                request: a,
                limit: b
            } as ReqLimit
        })
    )
}

export function createReqLimitParseFunction(unit: string, p: Parjser<ReqLimit>) {
    return (input: string) => {
        const result = p.parse(input)
        if (result.kind !== "OK") {
            throw new InstrumentsError(`Failed to parse ${unit} request limit`, {
                trace: result.trace.toString()
            })
        }
        return result.value
    }
}
export const pCpuReqLimit = createReqLimitParser("cpu", unitParser.createParser("cpu"))
export const pStorageReqLimit = createReqLimitParser("storage", unitParser.createParser("data"))
export const pMemoryReqLimit = createReqLimitParser("memory", unitParser.createParser("data"))
