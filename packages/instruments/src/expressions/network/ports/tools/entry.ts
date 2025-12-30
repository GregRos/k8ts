import { seq } from "doddle"
import { Ip4 } from "../../ip"
import type { Port_Exports_Input } from "../set"
import { Port_Exports } from "../set"
import type { Port_Full, Port_Full_Input, Port_Input, Port_Protocol } from "../types"
import { parsePortSpec } from "./parse"

function portSetEntry(name: string, value: Port_Full_Input): Port_Full {
    return {
        name,
        port: value.port,
        protocol: (value.protocol?.toUpperCase() as Port_Protocol) ?? "TCP",
        hostIp: value.hostIp ? new Ip4(value.hostIp) : undefined,
        hostPort: value.hostPort
    }
}

export function parsePortInput(name: string, input: Port_Input): Port_Full {
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
    record: Port_Exports_Input<string> | Port_Exports<string>
): Map<string, Port_Full> {
    if (record instanceof Port_Exports) {
        return record.values
    }
    const inputMap = seq(Object.entries(record))
        .toMap(([k, v]) => [k, parsePortInput(k, v)])
        .pull()
    return inputMap
}
