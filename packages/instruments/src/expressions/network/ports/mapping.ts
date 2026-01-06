import { filterMap, mapValues } from "../../../../../metadata/dist/utils/map"
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
export class PortMap<Names extends string> {
    constructor(private readonly _map: Map<string, PortMap_Item>) {}

    private _apply(f: (map: Map<string, PortMap_Item>) => Map<string, PortMap_Item>): PortMap<any> {
        return new PortMap(f(this._map))
    }

    /**
     * Creates a new PortMap containing only the specified port names.
     *
     * @param name The port names to include in the new map.
     * @returns A new PortMap with only the selected ports.
     */
    pick<InNames extends Names>(...name: InNames[]): PortMap<InNames> {
        return this._apply(map => filterMap(map, (_, key) => name.includes(key as InNames)))
    }

    /** The underlying map of port names to their mapping entries. */
    get values() {
        return this._map
    }

    /**
     * Remaps the frontend ports to new values.
     *
     * @param mapping A record mapping port names to their new frontend port numbers.
     * @returns A new PortMap with updated frontend ports.
     */
    map(mapping: Record<Names, number>): PortMap<Names> {
        return new PortMap(
            mapValues(this._map, entry => {
                return {
                    ...entry,
                    frontend: mapping[entry.name as keyof typeof mapping]
                }
            })
        )
    }

    /**
     * Retrieves a port mapping entry by name.
     *
     * @param name The name of the port to retrieve.
     * @returns The port mapping entry.
     * @throws {K8tsNetworkError} If the port name is not found in the map.
     */
    get(name: Names): PortMap_Item {
        if (!this._map.has(name)) {
            throw new K8tsNetworkError(`Port ${name} not found`)
        }
        return this._map.get(name) as PortMap_Item
    }

    /** Converts this PortMap to a standard Map. */
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
export type PortMapping_Input<Names extends string = string> = [Names] extends [never]
    ? never
    : {
          [K in Names]: number | true
      }
