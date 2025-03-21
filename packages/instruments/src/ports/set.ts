import { Map } from "immutable"
import { PortError } from "./error"
import { PortMap } from "./map"
import { parsePortInput, portRecordInput } from "./tools/entry"
import type {
    InputPort,
    InputPortMapping,
    InputPortSetEntry,
    InputPortSetRecord,
    InputProtocol,
    PortSetEntry
} from "./types"

declare const __NAMES__: unique symbol
export class PortSet<Names extends string = never> {
    constructor(private readonly _map: Map<Names, PortSetEntry> = Map()) {}

    private _apply(f: (map: Map<string, PortSetEntry>) => Map<string, PortSetEntry>) {
        return new PortSet(f(this._map))
    }

    union<InNames extends string>(other: PortSet<InNames>): PortSet<Names | InNames> {
        return new PortSet(this._map.merge(other._map))
    }
    add<Name extends string>(
        name: Name,
        port: InputPort,
        protocol: InputProtocol
    ): PortSet<Names | Name>
    add<Name extends string>(name: Name, entry: InputPortSetEntry): PortSet<Names | Name>
    add<InNames extends string>(input?: InputPortSetRecord<InNames>): PortSet<Names | InNames>
    add(a: any, b?: any, c?: any): any {
        if (!a) {
            return this
        }
        if (c) {
            return this._apply(map => map.set(a, { name: a, port: +b, protocol: c.toUpperCase() }))
        }
        if (b) {
            return this._apply(map => map.set(a, parsePortInput(a, b)))
        }
        return this._apply(map => {
            const processed = portRecordInput(a)
            return map.merge(processed)
        })
    }

    pick<InNames extends Names>(...name: InNames[]): PortSet<InNames> {
        return this._apply(map => map.filter((_, key) => name.includes(key as InNames))) as any
    }

    get(name: Names): PortSetEntry {
        if (!this._map.has(name)) {
            throw new PortError(`Port ${name} not found`)
        }
        return this._map.get(name)!
    }

    get values() {
        return this._map
    }

    map(mapping: InputPortMapping<Names>): PortMap<Names> {
        return new PortMap(
            this._map.map(entry => {
                if (!(entry.name in mapping)) {
                    throw new PortError(`Port ${entry.name} not found in mapping`)
                }
                const portIn = mapping[entry.name as keyof typeof mapping]
                let portVal: number
                if (typeof portIn === "boolean") {
                    portVal = entry.port
                } else if (typeof portIn === "number") {
                    portVal = portIn
                } else {
                    throw new PortError(
                        `Port ${entry.name} mapping value must be a number or boolean`
                    )
                }
                return {
                    name: entry.name,
                    protocol: entry.protocol,
                    backend: entry.name,
                    frontend: portVal as any
                }
            })
        )
    }

    static make<Names extends string>(input?: InputPortSetRecord<Names>) {
        return new PortSet().add(input)
    }
}
