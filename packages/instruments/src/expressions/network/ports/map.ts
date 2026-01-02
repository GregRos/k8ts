import { filterMap, mapValues } from "@k8ts/metadata/util"
import { PortError } from "./error"
import type { PortMappingEntry } from "./types"

/**
 * Represents an immutable mapping of named ports to their frontend/backend configuration.
 *
 * Used to define how container ports are exposed through services, mapping backend container ports
 * to frontend service ports.
 *
 * @template Names The union type of all port names in the map.
 */
export class PortsMapped<Names extends string> {
    constructor(private readonly _map: Map<string, PortMappingEntry>) {}

    private _apply(
        f: (map: Map<string, PortMappingEntry>) => Map<string, PortMappingEntry>
    ): PortsMapped<any> {
        return new PortsMapped(f(this._map))
    }

    /**
     * Creates a new PortMap containing only the specified port names.
     *
     * @param name The port names to include in the new map.
     * @returns A new PortMap with only the selected ports.
     */
    pick<InNames extends Names>(...name: InNames[]): PortsMapped<InNames> {
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
    map(mapping: Record<Names, number>): PortsMapped<Names> {
        return new PortsMapped(
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
     * @throws {PortError} If the port name is not found in the map.
     */
    get(name: Names): PortMappingEntry {
        if (!this._map.has(name)) {
            throw new PortError(`Port ${name} not found`)
        }
        return this._map.get(name) as PortMappingEntry
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
