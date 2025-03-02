import { Map } from "immutable"
import type { PortBaseInput, PortSpecObj } from "../../../ports/src/types"
import { parsePortSpec } from "./string"

function portEntry(name: string, value: PortSpecObj) {
    return {
        name,
        port: value.port,
        protocol: value.protocol
    }
}

export function parsePortInput(name: string, input: PortBaseInput) {
    if (typeof input === "string") {
        return portEntry(name, parsePortSpec(name, input))
    }
    if (typeof input === "number") {
        return portEntry(name, {
            port: input,
            protocol: "TCP" as const
        })
    }
    return portEntry(name, input)
}

export function portRecord(record: Record<string, PortBaseInput>) {
    const inputMap = Map(record)
    return inputMap.map(parsePortInput).map((value, key) => portEntry(key, value))
}
