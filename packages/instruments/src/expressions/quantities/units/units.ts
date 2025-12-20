import { SetUnitParser } from "./unit-parser"

export type G = `${number}G`
export const G = (n: number) => `${n}G` as G

export type M = `${number}M`
export const M = (n: number) => `${n}M` as M

export type K = `${number}K`
export const K = (n: number) => `${n}K` as K

export type T = `${number}T`
export const T = (n: number) => `${n}T` as T

export type Gi = `${number}Gi`
export const Gi = (n: number) => `${n}Gi` as Gi

export type Mi = `${number}Mi`
export const Mi = (n: number) => `${n}Mi` as Mi

export type Ki = `${number}Ki`
export const Ki = (n: number) => `${n}Ki` as Ki

export type m = `${number}m`
export const m = (n: number) => `${n}m` as m

export type h = `${number}h`
export const h = (n: number) => `${n}h` as h

export type d = `${number}d`
export const d = (n: number) => `${n * 24}h` as d

export type s = `${number}s`
export const s = (n: number) => `${n}s` as s

export type ms = `${number}ms`
export const ms = (n: number) => `${n}ms` as ms

export interface UnitDefinition<Unit extends string> {}

export namespace Unit {
    export type Data = M | G | T | K | Mi | Gi | Ki
    export type Cpu = m
    export type Time = m | h | d | s | ms
    export type Any = Data | Cpu | Time

    export const Cpu = SetUnitParser.make("cpu", new Set(["m"]))

    export const Data = SetUnitParser.make("data", new Set(["M", "G", "T", "K", "Mi", "Gi", "Ki"]))

    export const Time = SetUnitParser.make("time", new Set(["m", "h", "d", "s", "ms"]))
}
