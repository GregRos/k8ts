import { UnitParser } from "./unit-parser"

export const Data = ["M", "G", "T", "K", "Mi", "Gi", "Ki"]
export const CPU = ["m"]
export const Time = ["m", "h", "d", "s", "ms"]

export const unitParser = new UnitParser({
    data: Data,
    cpu: CPU,
    time: Time
})
