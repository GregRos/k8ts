import type { Unit } from "../units"
import type { UnitValue } from "../units/unit-parser"
import {
    createReqLimitParseFunction,
    pCpuReqLimit,
    pMemoryReqLimit,
    pStorageReqLimit
} from "./parser"

export interface ReqLimit {
    readonly resource: string
    readonly request: UnitValue
    readonly limit: UnitValue
}
export namespace ReqLimit {
    export type InputOf<Expr extends string> = `${Expr}--->${Expr}`
    export namespace Cpu {
        export type Input = InputOf<Unit.Cpu>
        const _parseCpu = createReqLimitParseFunction("cpu", pCpuReqLimit)
        export function parse(input: string) {
            return _parseCpu(input)
        }
    }
    export namespace Memory {
        export type Input = InputOf<Unit.Data>
        const _parseData = createReqLimitParseFunction("memory", pMemoryReqLimit)
        export function parse(input: string) {
            return _parseData(input)
        }
    }

    export namespace Storage {
        export type Input = InputOf<Unit.Data>
        const _parseData = createReqLimitParseFunction("data", pStorageReqLimit)
        export function parse(input: string) {
            return _parseData(input)
        }
    }
}
