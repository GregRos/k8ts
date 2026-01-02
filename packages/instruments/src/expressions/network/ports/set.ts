import { Meta } from "@k8ts/metadata"
import { filterMap, mapValues, merge } from "@k8ts/metadata/util"
import { seq } from "doddle"
import { PortError } from "./error"
import { PortMapping_Input, PortsMapped } from "./map"
import { parsePortInput, portRecordInput } from "./tools/entry"
import type { PortBasicInput, PortFull, PortFullInput, PortInput, PortProtocolInput } from "./types"

/**
 * An immutable dictionary of named network ports exported by a container. Each port also has an
 * attached configuration.
 *
 * @template Names All exported port names.
 */
export class PortsExposed<Names extends string = never> {
    constructor(private readonly _map: Map<Names, PortFull> = new Map()) {
        for (const entry of _map.values()) {
            Meta._checkNameValue(`container port '${entry.name}' (${entry.port})`, entry.name)
        }
    }

    private _apply(f: (map: Map<string, PortFull>) => Map<string, PortFull>) {
        return new PortsExposed(f(this._map))
    }

    /**
     * Creates a new PortExports that is the union of this and another PortExports.
     *
     * @param other The other PortExports to merge with.
     * @returns A new PortExports containing ports from both dictionaries. The 2nd dictionary's
     *   ports will overwrite any with the same name from the first.
     */
    union<InNames extends string>(other: PortsExposed<InNames>): PortsExposed<Names | InNames> {
        return new PortsExposed(merge(this._map, other._map))
    }

    /**
     * Adds a port with explicit name, port number, and protocol.
     *
     * @param name The unique name for the port.
     * @param port The port number.
     * @param protocol The protocol (TCP or UDP).
     */
    add<Name extends string>(
        name: Name,
        port: PortBasicInput,
        protocol: PortProtocolInput
    ): PortsExposed<Names | Name>
    /**
     * Adds a port with a name and full port configuration.
     *
     * @param name The unique name for the port.
     * @param entry The port configuration including number and protocol, and optional host
     *   settings.
     */
    add<Name extends string>(name: Name, entry: PortFullInput): PortsExposed<Names | Name>
    /**
     * Adds multiple ports from a record of port configurations.
     *
     * @param input A record mapping port names to their configurations.
     */
    add<InNames extends string>(input?: PortExportsInput<InNames>): PortsExposed<Names | InNames>
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
            return merge(map, processed)
        })
    }

    /**
     * Creates a new PortExports containing only the specified port names.
     *
     * @param name The port names to include.
     * @returns A new PortExports with only the selected ports.
     */
    pick<InNames extends Names>(...name: InNames[]): PortsExposed<InNames> {
        return this._apply(map => filterMap(map, (_, key) => name.includes(key as InNames))) as any
    }

    /** An array of all port names in this set. */
    get names() {
        return seq(this._map.keys()).toArray().pull() as Names[]
    }

    /**
     * Retrieves a port by name.
     *
     * @param name The name of the port to retrieve.
     * @returns The full port configuration.
     * @throws {PortError} If the port name is not found.
     */
    get(name: Names): PortFull {
        if (!this._map.has(name)) {
            throw new PortError(`Port ${name} not found`)
        }
        return this._map.get(name)!
    }

    /** The underlying map of port names to their full configurations. */
    get values() {
        return this._map
    }

    /**
     * Creates a PortMap by mapping each port to a frontend port number.
     *
     * @param mapping A record where each port name maps to either a frontend port number or `true`
     *   to use the backend port.
     * @returns A new PortMap with the specified frontend mappings.
     * @throws {PortError} If a port name is missing from the mapping or has an invalid value.
     */
    map(mapping: PortMapping_Input<Names>): PortsMapped<Names> {
        return new PortsMapped(
            mapValues(this._map, entry => {
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

    /**
     * Creates a new PortExports from a record of port configurations.
     *
     * @param input A record mapping port names to their configurations.
     * @returns A new PortExports containing the specified ports.
     */
    static make<Names extends string>(input?: PortExportsInput<Names>) {
        return new PortsExposed().add(input)
    }
}

/**
 * Input type for creating PortExports.
 *
 * A record mapping port names to their configurations, which can be:
 *
 * - A port number (uses TCP by default)
 * - A tuple of `[port, protocol]`
 * - A full port configuration object
 *
 * @template Names The union type of port names.
 */
export type PortExportsInput<Names extends string = string> = {
    [K in Names]: PortInput
}
