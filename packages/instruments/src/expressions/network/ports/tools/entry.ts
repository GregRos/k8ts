import lodash from "lodash"
import { Ip4 } from "../../ip/ip4"
import type { PortExports_Input } from "../provider"
import { PortExports } from "../provider"
import type { Port_Full, Port_Input, Port_Input_Object, Port_Protocol } from "../types"
import { parsePortSpec } from "./parse"

function portSetEntry(name: string, value: Port_Input_Object): Port_Full {
    const proto = value.protocol ? (value.protocol.toUpperCase() as Port_Protocol) : "TCP"
    return {
        name,
        port: value.port,
        protocol: proto,
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
    record: PortExports_Input<string> | PortExports<string>
): Record<string, Port_Full> {
    if (record instanceof PortExports) {
        return record.values
    }
    return lodash.mapValues(record, (v, k) => parsePortInput(k, v))
}
