import type { Ip4, Ip4_String } from "../ip/ip4"

type Port = number
export type Port_Input_Scalar = Port | `${Port}`
export type Port_Input_Protocol = Port_Protocol | Lowercase<Port_Protocol>
export type Port_Protocol = "TCP" | "UDP"
export type Port_Input_WithProtocol = `${Port}/${Port_Input_Protocol}`
export interface PortMap_Item {
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

export interface Port_Input_Object {
    port: Port
    protocol?: Port_Input_Protocol
    hostIp?: Ip4_String
    hostPort?: Port
}

export type Port_Input = Port_Input_Object | Port_Input_Scalar | Port_Input_WithProtocol
