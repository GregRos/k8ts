import type { Ip4, Ip4_String } from "../ip"

export interface PortSpecObj {
    port: Port
    protocol: Protocol
}

export type Port = number
export type InputPort = Port | `${Port}`
export type InputProtocol = Protocol | Lowercase<Protocol>
export type Protocol = "TCP" | "UDP"
export type InputPortProto = `${Port}/${InputProtocol}`
export interface PortMapEntry {
    name: string
    protocol: Protocol
    frontend: number
}

export interface PortSetEntry {
    name: string
    port: number
    protocol: Protocol
    hostIp?: Ip4
    hostPort?: number
}

export interface InputPortSetEntry {
    port: Port
    protocol: InputProtocol
    hostIp?: Ip4_String
    hostPort?: Port
}

export type InputPortSetSpec = InputPortSetEntry | InputPort | InputPortProto

export type InputPortSetRecord<Names extends string = string> = {
    [K in Names]: InputPortSetSpec
}
export type InputPortMapping<Names extends string = string> = [Names] extends [never]
    ? never
    : {
          [K in Names]: number | true
      }
