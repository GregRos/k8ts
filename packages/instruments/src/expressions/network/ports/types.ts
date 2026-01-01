import type { Ip4, Ip4_String } from "../ip"

type Port = number
export type PortBasicInput = Port | `${Port}`
export type PortProtocolInput = PortProtocol | Lowercase<PortProtocol>
export type PortProtocol = "TCP" | "UDP"
export type PortWithProto_Input = `${Port}/${PortProtocolInput}`
export interface PortMappingEntry {
    name: string
    protocol: PortProtocol
    frontend: number
}

export interface PortFull {
    name: string
    port: number
    protocol: PortProtocol
    hostIp?: Ip4
    hostPort?: number
}

export interface PortFullInput {
    port: Port
    protocol?: PortProtocolInput
    hostIp?: Ip4_String
    hostPort?: Port
}

export type PortInput = PortFullInput | PortBasicInput | PortWithProto_Input
