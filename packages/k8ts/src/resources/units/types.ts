export interface UnitValue {
    value: number
    unit: string
}
declare const MEMORY_KEY: unique symbol
declare const STORAGE_KEY: unique symbol
declare const CPU_KEY: unique symbol
declare const TIME_KEY: unique symbol
export namespace Unit {
    export type Memory = string & {
        [MEMORY_KEY]: "memory"
    }
    export type Storage = string & {
        [STORAGE_KEY]: "storage"
    }
    export type CPU = string & {
        [CPU_KEY]: "cpu"
    }
    export type Time = string & {
        [TIME_KEY]: "time"
    }
}
