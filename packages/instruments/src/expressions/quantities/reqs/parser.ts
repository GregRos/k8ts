import { space, string } from "parjs"
import { between, many, manySepBy, map, must, or, qthen } from "parjs/combinators"
import type { UnitDimension } from "../units/dimension"
import type { Reqs_ReqLimit } from "./types"

export function createReqsParser(pUnitValue: UnitDimension) {
    const pSpaces = space().pipe(many())
    const rSeparator = string("->").pipe(between(pSpaces))
    const arrowExprParser = pUnitValue.parser.pipe(
        manySepBy(rSeparator, 2),
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
            } as Reqs_ReqLimit
        })
    )
    const equalsExprParser = string("=").pipe(
        qthen(pUnitValue.parser),
        map(x => {
            return {
                request: x,
                limit: x
            } as Reqs_ReqLimit
        })
    )
    return equalsExprParser.pipe(or(arrowExprParser))
}
