import { Map, Set } from "immutable"
import { isEmpty, merge } from "lodash"
import { string, type Parjser } from "parjs/."
import { mapConst, or } from "parjs/combinators"
import { InstrumentsError } from "../error"
import type { UnitParser, UnitValue } from "../units"
import { createResourceParser } from "./parser"
import type { mt_Resource_Input_Map, mt_Resource_Unit_Map, ReqLimit } from "./types"

export class ResourcesMap<const RM extends mt_Resource_Unit_Map<RM>> {
    constructor(private _map: Map<string, ReqLimit>) {}

    toObject() {
        const kubernetesForm = this._map.map((value, key) => {
            const result = {} as any
            if (value.request) {
                result.requests = {
                    [key]: value.request.str
                }
            }
            if (value.limit) {
                result.limits = {
                    [key]: value.limit.str
                }
            }
            if (!isEmpty(result)) {
                return result
            }
            return undefined
        })

        return merge({}, ...kubernetesForm.values())
    }
}

export class ResourcesSpec<const RM extends mt_Resource_Unit_Map<RM>> {
    readonly _unitParsers: Map<string, Parjser<UnitValue | undefined>>
    readonly _reqLimitParsers: Map<string, Parjser<ReqLimit>>
    constructor(_unitMap: Map<string, UnitParser>) {
        const questionMarkParser = string("?").pipe(mapConst(undefined))
        this._unitParsers = _unitMap.map(parser => parser.parser.pipe(or(questionMarkParser)))
        this._reqLimitParsers = _unitMap.map(parser => createResourceParser(parser))
    }

    private _parseUnitValue(resource: string, input: string): UnitValue | undefined {
        const pUnitValue = this._unitParsers.get(input)
        if (!pUnitValue) {
            throw new InstrumentsError(`No parser found for ${input}`)
        }
        return pUnitValue.parse(input).value
    }

    private _parseReqLimit(resource: string, input: string): ReqLimit {
        const pReqLimit = this._reqLimitParsers.get(resource)
        if (!pReqLimit) {
            throw new InstrumentsError(`No parser found for ${resource}`)
        }
        return pReqLimit.parse(input).value
    }

    parse<const R extends mt_Resource_Input_Map<RM>>(input: R): ResourcesMap<RM> {
        const allKeys = Set([...Object.keys(input), ...this._unitParsers.keys()]).toMap()
        const map = allKeys.map((_, key) => {
            const value = input[key as keyof R]
            const pUnitValue = this._unitParsers.get(key)
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
                return {
                    request: this._parseUnitValue(key as string, value.request),
                    limit: this._parseUnitValue(key as string, value.limit)
                }
            }
        })
        return new ResourcesMap(map as Map<string, ReqLimit>)
    }

    static make<const RM extends mt_Resource_Unit_Map<RM>>(unitMap: {
        [K in keyof RM]: UnitParser<RM[K]>
    }) {
        return new ResourcesSpec<RM>(Map(unitMap) as Map<string, UnitParser>)
    }
}
