import { Map } from "immutable"
import { PortError } from "./error"
import type { PortMapEntry } from "./types"
export class PortMap<Names extends string> {
    constructor(private readonly _map: Map<string, PortMapEntry>) {}

    private _apply(f: (map: Map<string, PortMapEntry>) => Map<string, PortMapEntry>): PortMap<any> {
        return new PortMap(f(this._map))
    }

    pick<InNames extends Names>(...name: InNames[]): PortMap<InNames> {
        return this._apply(map => map.filter((_, key) => name.includes(key as InNames)))
    }

    get values() {
        return this._map
    }

    map(mapping: Record<Names, number>): PortMap<Names> {
        return new PortMap(
            this._map.map(entry => {
                return {
                    ...entry,
                    source: entry.target,
                    target: mapping[entry.name as keyof typeof mapping]
                }
            })
        )
    }

    get(name: Names): PortMapEntry {
        if (!this._map.has(name)) {
            throw new PortError(`Port ${name} not found`)
        }
        return this._map.get(name) as PortMapEntry
    }

    toMap() {
        return this._map
    }
}
