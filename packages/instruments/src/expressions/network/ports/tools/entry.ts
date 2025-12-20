import { seq } from "doddle"
import { Ip4 } from "../../../_ip"
import { PortSet } from "../set"
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
        protocol: value.protocol.toUpperCase() as Protocol,
        hostIp: value.hostIp ? new Ip4(value.hostIp) : undefined,
        hostPort: value.hostPort
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

export function portRecordInput(
    record: InputPortSetRecord<string> | PortSet<string>
): Map<string, PortSetEntry> {
    if (record instanceof PortSet) {
        return record.values
    }
    const inputMap = seq(Object.entries(record))
        .toMap(([k, v]) => [k, parsePortInput(k, v)])
        .pull()
    return inputMap
}
