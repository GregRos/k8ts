import type { Port, Protocol } from "../../base-types"

export interface PortSpecObj {
    port: Port
    protocol: Protocol
}

export type PortSpecRecord<Names extends string> = {
    [K in Names]: PortSpecObj | Port | PortSpecObj
}
export type Port = number
export type Protocol = "TCP" | "UDP" | "tcp" | "udp"
export type PortSpec = `${Port}/${Protocol}`
