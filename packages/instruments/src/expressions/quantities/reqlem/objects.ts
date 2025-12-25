import { mapFromObject, mapValues } from "@k8ts/metadata/util"
import { seq } from "doddle"
import { isEmpty, merge } from "lodash"
import { string, type Parjser } from "parjs"
import { mapConst, or } from "parjs/combinators"
import { InstrumentsError } from "../../../error"
import type { UnitParser, UnitValue } from "../units"
import { AnyUnitParser } from "../units/unit-parser"
import { createResourceParser } from "./parser"
import type { ReqLimit, Resources_ReqLimits_Trait, Resources_UnitMap_Trait } from "./types"

export class Resources_UnitMap<const RM extends Resources_UnitMap_Trait<RM>> {
    constructor(private _map: Map<string, ReqLimit>) {}

    toObject() {
        const kubernetesForm = mapValues(this._map, (value, key) => {
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

        return merge({}, ...kubernetesForm.values())
    }
}

export class ResourcesSpec<const RM extends Resources_UnitMap_Trait<RM>> {
    readonly _unitParsers: Map<string, Parjser<UnitValue | undefined>>
    readonly _reqLimitParsers: Map<string, Parjser<ReqLimit>>
    readonly _anyUnitParser = AnyUnitParser.make()
    readonly _anyReqLimitParser = createResourceParser(this._anyUnitParser)
    constructor(_unitMap: Map<string, UnitParser>) {
        const questionMarkParser = string("?").pipe(mapConst(undefined))
        this._unitParsers = mapValues(_unitMap, parser =>
            parser.parser.pipe(or(questionMarkParser))
        )
        this._reqLimitParsers = mapValues(_unitMap, parser => createResourceParser(parser))
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
            return this._anyReqLimitParser.parse(input).value
        }
        return pReqLimit.parse(input).value
    }
    __INPUT__!: Resources_ReqLimits_Trait<RM>

    parse<const R extends Resources_ReqLimits_Trait<RM>>(input: R): Resources_UnitMap<RM> {
        const allKeys = new Set([...Object.keys(input), ...this._unitParsers.keys()])
        const map = seq(allKeys)
            .toMap(key => {
                const getVal = () => {
                    const value = input[key as keyof R]
                    const pUnitValue = this._unitParsers.get(key) ?? this._anyUnitParser.parser
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
        return new Resources_UnitMap(map as Map<string, ReqLimit>)
    }

    static make<const RM extends Resources_UnitMap_Trait<RM>>(unitMap: {
        [K in keyof RM]: UnitParser<RM[K]>
    }) {
        return new ResourcesSpec<RM>(mapFromObject(unitMap as any) as Map<string, UnitParser>)
    }
}
