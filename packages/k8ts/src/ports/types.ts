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
    source: number
    target: number
}

export interface PortSetEntry {
    name: string
    port: number
    protocol: Protocol
}

export interface InputPortSetEntry {
    port: Port
    protocol: InputProtocol
}

export type InputPortSetSpec = InputPortSetEntry | InputPort | InputPortProto

export interface InputPortMapEntry {
    source: Port
    target: Port
    protocol: InputProtocol
}

export type InputPortSetRecord<Names extends string = string> = {
    [K in Names]: InputPortSetSpec
}
export type InputPortMapping<Names extends string = string> = {
    [K in Names]: number
}
