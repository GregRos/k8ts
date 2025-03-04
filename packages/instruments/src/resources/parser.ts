import { manySepBy, map, must } from "parjs/combinators"
import type { UnitParser } from "../units/unit-parser"
import type { ReqLimit } from "./types"

export function createResourceParser(pUnitValue: UnitParser) {
    return pUnitValue.parser.pipe(
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
