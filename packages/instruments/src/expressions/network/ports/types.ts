import type { Ip4, Ip4_String } from "../ip"

type Port = number
export type Port_Basic_Input = Port | `${Port}`
export type Port_Protocol_Input = Port_Protocol | Lowercase<Port_Protocol>
export type Port_Protocol = "TCP" | "UDP"
export type Port_WithProto_Input = `${Port}/${Port_Protocol_Input}`
export interface Port_Mapping_Entry {
    name: string
    protocol: Port_Protocol
    frontend: number
}

export interface Port_Full {
    name: string
    port: number
    protocol: Port_Protocol
    hostIp?: Ip4
    hostPort?: number
}

export interface Port_Full_Input {
    port: Port
    protocol: Port_Protocol_Input
    hostIp?: Ip4_String
    hostPort?: Port
}

export type Port_Input = Port_Full_Input | Port_Basic_Input | Port_WithProto_Input
