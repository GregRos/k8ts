import { mapValues, pickBy } from "lodash"
import { display } from "../../../utils/mixin/display"
import { K8tsNetworkError } from "../error"
import type { PortMap_Item } from "./types"

/**
 * Represents an immutable mapping of named ports to their frontend/backend configuration.
 *
 * Used to define how container ports are exposed through services, mapping backend container ports
 * to frontend service ports.
 *
 * @template Names The union type of all port names in the map.
 */
export interface PortMap<Names extends string> {
    /**
     * Creates a new PortMap containing only the specified port names.
     *
     * @param name The port names to include in the new map.
     * @returns A new PortMap with only the selected ports.
     */
    pick<InNames extends Names>(...name: InNames[]): PortMap<InNames>

    /** The underlying map of port names to their mapping entries. */
    get values(): Record<string, PortMap_Item>

    /**
     * Remaps the frontend ports to new values.
     *
     * @param mapping A record mapping port names to their new frontend port numbers.
     * @returns A new PortMap with updated frontend ports.
     */
    map(mapping: Record<Names, number>): PortMap<Names>

    /**
     * Retrieves a port mapping entry by name.
     *
     * @param name The name of the port to retrieve.
     * @returns The port mapping entry.
     * @throws {K8tsNetworkError} If the port name is not found in the map.
     */
    get(name: Names): PortMap_Item

    /** Converts this PortMap to a standard Map. */
    toMap(): Record<string, PortMap_Item>
}

export function PortMap<Names extends string>(map: Record<string, PortMap_Item>) {
    return new _PortMap(map) as any as PortMap<Names>
}

@display({
    simple(self) {
        return `PortMap(${Object.keys(self._map).join(", ")})`
    }
})
class _PortMap {
    constructor(readonly _map: Record<string, PortMap_Item>) {}

    private _apply(
        f: (map: Record<string, PortMap_Item>) => Record<string, PortMap_Item>
    ): _PortMap {
        return new _PortMap(f(this._map))
    }

    pick(...name: string[]): _PortMap {
        return this._apply(map => pickBy(map, (_, key) => name.includes(key)))
    }

    get values() {
        return this._map
    }

    map(mapping: Record<string, number>): _PortMap {
        return new _PortMap(
            mapValues(this._map, entry => {
                return {
                    ...entry,
                    frontend: mapping[entry.name]
                }
            })
        )
    }

    get(name: string): PortMap_Item {
        if (!(name in this._map)) {
            throw new K8tsNetworkError(`Port ${name} not found`)
        }
        return this._map[name] as PortMap_Item
    }

    toMap() {
        return this._map
    }
}

/**
 * Input type for creating port mappings.
 *
 * Each port name maps to either:
 *
 * - A number specifying the frontend port
 * - `true` to use the same port number as the backend
 *
 * @template Names The union type of port names.
 */
export type PortMapping_Input<Names extends string = string> = {
    [K in Names]: number | true
}
