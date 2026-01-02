import { space, string } from "parjs"
import { between, many, manySepBy, map, must, or, qthen } from "parjs/combinators"
import type { UnitParser } from "../units/unit-parser"
import type { Resources_ReqLim } from "./types"

export function createResourceParser(pUnitValue: UnitParser) {
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
            } as Resources_ReqLim
        })
    )
    const equalsExprParser = string("=").pipe(
        qthen(pUnitValue.parser),
        map(x => {
            return {
                request: x,
                limit: x
            } as Resources_ReqLim
        })
    )
    return equalsExprParser.pipe(or(arrowExprParser))
}
