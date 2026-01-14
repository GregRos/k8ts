import { seq } from "doddle"
import { mapValues } from "lodash"
import { string, type Parjser } from "parjs"
import { mapConst, or } from "parjs/combinators"
import type { StringRecordLike } from "../../../utils/types"

import { K8tsQuantityError } from "../error"
import { UnitDimension } from "../units/dimension"
import type { UnitValue } from "../units/value"
import { createReqsParser } from "./parser"
import type { Reqs_Dictionary, Reqs_ReqLimit } from "./types"
import { Reqs_Values } from "./values"

export class Reqs<const _Dimensions extends StringRecordLike<_Dimensions>> {
    private readonly _unitParsers: Record<string, Parjser<UnitValue | undefined>>
    private readonly _reqLimitParsers: Record<string, Parjser<Reqs_ReqLimit>>
    private readonly _anyUnitParser = new UnitDimension({
        name: "unknown",
        units: "any"
    })
    private readonly _anyReqLimitParser = createReqsParser(this._anyUnitParser)
    constructor(unitMap: {
        [K in keyof _Dimensions]: UnitDimension<_Dimensions[K]>
    }) {
        const questionMarkParser = string("?").pipe(mapConst(undefined))
        this._unitParsers = mapValues(unitMap, parser => parser.parser.pipe(or(questionMarkParser)))
        this._reqLimitParsers = mapValues(unitMap, parser =>
            createReqsParser(parser as UnitDimension)
        )
    }

    private _parseReqLimit(resource: string, input: string): Reqs_ReqLimit {
        const pReqLimit = this._reqLimitParsers[resource]
        if (!pReqLimit) {
            return this._anyReqLimitParser.parse(input).value
        }
        return pReqLimit.parse(input).value
    }
    __INPUT__!: Reqs_Dictionary<_Dimensions>

    parse<const R extends Reqs_Dictionary<_Dimensions>>(input: R): Reqs_Values {
        const allKeys = new Set([...Object.keys(input), ...Object.keys(this._unitParsers)])
        const map = seq(allKeys)
            .toRecord(key => {
                const getVal = () => {
                    const value = input[key as keyof R]
                    const pUnitValue = this._unitParsers[key] ?? this._anyUnitParser.parser
                    if (!pUnitValue) {
                        throw new K8tsQuantityError(`No parser found for ${String(key)}`)
                    }
                    if (!value) {
                        throw new K8tsQuantityError(`No value found for ${String(key)}`)
                    }

                    if (Array.isArray(value)) {
                        // Singleton array is treated as `=X`, i.e. [exactly, exactly]
                        // Pair is treated as `X->Y`, i.e. [request, limit]
                        let [req, limit] = value.map(v => {
                            return pUnitValue.parse(v as any).value
                        })
                        limit ??= req

                        return {
                            request: req,
                            limit: limit
                        }
                    } else if (typeof value === "string") {
                        return this._parseReqLimit(key as string, value)
                    } else if (typeof value == "object") {
                        const { request, limit } = value
                        if (typeof )
                    } else {
                        throw new K8tsQuantityError(`Invalid value for resource ${String(key)}`)
                    }
                }
                return [key, getVal()] as const
            })
            .pull()
        return new Reqs_Values(map)
    }
}
