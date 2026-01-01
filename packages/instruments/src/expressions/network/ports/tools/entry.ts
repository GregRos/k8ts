import { seq } from "doddle"
import { Ip4 } from "../../ip"
import type { PortExportsInput } from "../set"
import { PortExports } from "../set"
import type { PortFull, PortFullInput, PortInput, PortProtocol } from "../types"
import { parsePortSpec } from "./parse"

function portSetEntry(name: string, value: PortFullInput): PortFull {
    const proto = value.protocol ? (value.protocol.toUpperCase() as PortProtocol) : "TCP"
    return {
        name,
        port: value.port,
        protocol: proto,
        hostIp: value.hostIp ? new Ip4(value.hostIp) : undefined,
        hostPort: value.hostPort
    }
}

export function parsePortInput(name: string, input: PortInput): PortFull {
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

export function portRecordInput(
    record: PortExportsInput<string> | PortExports<string>
): Map<string, PortFull> {
    if (record instanceof PortExports) {
        return record.values
    }
    const inputMap = seq(Object.entries(record))
        .toMap(([k, v]) => [k, parsePortInput(k, v)])
        .pull()
    return inputMap
}
