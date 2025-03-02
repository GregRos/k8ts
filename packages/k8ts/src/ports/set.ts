import { Map } from "immutable"
import type { PortSpecRecord } from "./input/types"
import type { PortBaseInput } from "./types"

export interface PortSetEntry {
    name: string
    port: number
    protocol: "TCP" | "UDP"
}

declare const __NAMES__: unique symbol
export class PortSet<Names extends string> {
    constructor(private readonly _map: Map<string, PortSetEntry>) {}

    private _apply(f: (map: Map<string, PortSetEntry>) => Map<string, PortSetEntry>) {
        return new PortSet(f(this._map))
    }
    add<Name extends string>(
        name: Name,
        port: number,
        protocol: "TCP" | "UDP"
    ): PortSet<Names | Name>
    add<Name extends string>(name: Name, entry: PortBaseInput): PortSet<Names | Name>
    add<InNames extends string>(input: PortSpecRecord<InNames>): PortSet<Names | InNames>
    add(a: any, b?: any, c?: any): any {
        if (c) {
            return this._apply(map => map.set(a, { name: a, port: b, protocol: c }))
        }
        if (b) {
            return this._apply(map => map.set(a, { name: a, ...b }))
        }
        return this._apply(map => map.merge(a))
    }
}
