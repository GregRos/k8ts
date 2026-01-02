import { seq } from "doddle"
import { isEmpty, mapValues, merge } from "lodash"
import { string, type Parjser } from "parjs"
import { mapConst, or } from "parjs/combinators"
import { InstrumentsError } from "../../../error"
import type { StringRecordLike } from "../../../utils/types"
import type { UnitParser, UnitValue } from "../units"
import { AnyUnitParser } from "../units/unit-parser"
import { createRequirementsParser } from "./parser"
import type { Reqs_Dictionary, Reqs_ReqLimit } from "./types"

export class Reqs_Units {
    constructor(private _record: Record<string, Reqs_ReqLimit>) {}

    toObject() {
        const kubernetesForm = mapValues(this._record, (value, key) => {
            const result = {} as any
            if (value.request) {
                result.requests = {
                    [key]: value.request.val
                }
            }
            if (value.limit) {
                result.limits = {
                    [key]: value.limit.val
                }
            }
            if (!isEmpty(result)) {
                return result
            }
            return undefined
        })

        return merge({}, ...Object.values(kubernetesForm).filter(x => x !== undefined))
    }
}

export class ResourcesSpec<const UnitMap extends StringRecordLike<UnitMap>> {
    private readonly _unitParsers: Record<string, Parjser<UnitValue | undefined>>
    private readonly _reqLimitParsers: Record<string, Parjser<Reqs_ReqLimit>>
    private readonly _anyUnitParser = AnyUnitParser.make()
    private readonly _anyReqLimitParser = createRequirementsParser(this._anyUnitParser)
    constructor(unitMap: {
        [K in keyof UnitMap]: UnitParser<UnitMap[K]>
    }) {
        const questionMarkParser = string("?").pipe(mapConst(undefined))
        this._unitParsers = mapValues(unitMap, parser => parser.parser.pipe(or(questionMarkParser)))
        this._reqLimitParsers = mapValues(unitMap, parser =>
            createRequirementsParser(parser as UnitParser)
        )
    }

    private _parseUnitValue(resource: string, input: string): UnitValue | undefined {
        const pUnitValue = this._unitParsers[input]
        if (!pUnitValue) {
            throw new InstrumentsError(`No parser found for ${input}`)
        }
        return pUnitValue.parse(input).value
    }

    private _parseReqLimit(resource: string, input: string): Reqs_ReqLimit {
        const pReqLimit = this._reqLimitParsers[resource]
        if (!pReqLimit) {
            return this._anyReqLimitParser.parse(input).value
        }
        return pReqLimit.parse(input).value
    }
    __INPUT__!: Reqs_Dictionary<UnitMap>

    parse<const R extends Reqs_Dictionary<UnitMap>>(input: R): Reqs_Units {
        const allKeys = new Set([...Object.keys(input), ...Object.keys(this._unitParsers)])
        const map = seq(allKeys)
            .toRecord(key => {
                const getVal = () => {
                    const value = input[key as keyof R]
                    const pUnitValue = this._unitParsers[key] ?? this._anyUnitParser.parser
                    if (!pUnitValue) {
                        throw new InstrumentsError(`No parser found for ${String(key)}`)
                    }
                    if (!value) {
                        throw new InstrumentsError(`No value found for ${String(key)}`)
                    }

                    if (Array.isArray(value)) {
                        const [req, limit] = value.map(v => {
                            return pUnitValue.parse(v as any).value
                        })
                        return {
                            request: req,
                            limit: limit
                        }
                    } else if (typeof value === "string") {
                        return this._parseReqLimit(key as string, value)
                    } else {
                        throw new InstrumentsError(`Invalid value for resource ${String(key)}`)
                    }
                }
                return [key, getVal()] as const
            })
            .pull()
        return new Reqs_Units(map)
    }
}
