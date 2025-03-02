import { Map } from "immutable"
import type {
    InputPortSetEntry,
    InputPortSetRecord,
    InputPortSetSpec,
    PortSetEntry,
    Protocol
} from "../types"
import { parsePortSpec } from "./parse"

function portSetEntry(name: string, value: InputPortSetEntry): PortSetEntry {
    return {
        name,
        port: value.port,
        protocol: value.protocol.toUpperCase() as Protocol
    }
}

export function parsePortInput(name: string, input: InputPortSetSpec): PortSetEntry {
    if (typeof input === "string") {
        return portSetEntry(name, parsePortSpec(name, input))
    }
    if (typeof input === "number") {
        return portSetEntry(name, {
            port: input,
            protocol: "TCP" as const
        })
    }
    return portSetEntry(name, input)
}

export function portRecordInput(record: InputPortSetRecord<string>): Map<string, PortSetEntry> {
    const inputMap = Map(record)
    return inputMap
        .map((v, k) => parsePortInput(k, v))
        .map((value, key) => portSetEntry(key, value))
}
