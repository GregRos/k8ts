import { mapValues, pick } from "lodash"
import { K8tsNetworkError } from "../error"
import { parsePortInput, portRecordInput } from "./entry"
import { PortMap, PortMapping_Input } from "./mapping"
import type {
    Port_Full,
    Port_Input_Object,
    Port_Input_Protocol,
    Port_Input_Scalar,
    PortExports_Input
} from "./types"

/**
 * An immutable dictionary of named network ports exported by a container. Each port also has an
 * attached configuration.
 *
 * @template Names All exported port names.
 */
export class PortExports<Names extends string = never> {
    private _rec: Record<string, Port_Full>
    constructor(record: PortExports_Input<Names> = {} as PortExports_Input<Names>) {
        this._rec = portRecordInput(record)
    }

    private static _make(rec: Record<string, Port_Full>) {
        const newOne = new PortExports({})
        newOne._rec = rec
        return newOne
    }

    private _apply<NewNames extends string>(
        f: (rec: Record<string, Port_Full>) => Record<string, Port_Full>
    ): PortExports<NewNames> {
        return PortExports._make(f(this._rec)) as any as PortExports<NewNames>
    }

    /**
     * Creates a new PortExports that is the union of this and another PortExports.
     *
     * @param other The other PortExports to merge with.
     * @returns A new PortExports containing ports from both dictionaries. The 2nd dictionary's
     *   ports will overwrite any with the same name from the first.
     */
    union<InNames extends string>(other: PortExports<InNames>): PortExports<Names | InNames> {
        return this._apply<Names | InNames>(rec => Object.assign({}, rec, other._rec))
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
        port: Port_Input_Scalar,
        protocol: Port_Input_Protocol
    ): PortExports<Names | Name>
    /**
     * Adds a port with a name and full port configuration.
     *
     * @param name The unique name for the port.
     * @param entry The port configuration including number and protocol, and optional host
     *   settings.
     */
    add<Name extends string>(name: Name, entry: Port_Input_Object): PortExports<Names | Name>
    /**
     * Adds multiple ports from a record of port configurations.
     *
     * @param input A record mapping port names to their configurations.
     */
    add<InNames extends string>(input?: PortExports_Input<InNames>): PortExports<Names | InNames>
    add(a: any, b?: any, c?: any): any {
        if (!a) {
            return this
        }
        if (c) {
            return this._apply(rec =>
                Object.assign({}, rec, {
                    [a]: {
                        name: a,
                        port: +b,
                        protocol: c.toUpperCase()
                    }
                })
            )
        }
        if (b) {
            return this._apply(rec => Object.assign({}, rec, { [a]: parsePortInput(a, b) }))
        }
        return this._apply(rec => {
            const processed = portRecordInput(a)
            return Object.assign({}, rec, processed)
        })
    }

    /**
     * Creates a new PortExports containing only the specified port names.
     *
     * @param name The port names to include.
     * @returns A new PortExports with only the selected ports.
     */
    pick<InNames extends Names>(...name: InNames[]): PortExports<InNames> {
        return this._apply<InNames>(rec => pick(rec, name as readonly string[]))
    }

    /** An array of all port names in this set. */
    get names() {
        return Object.keys(this._rec) as Names[]
    }

    /**
     * Retrieves a port by name.
     *
     * @param name The name of the port to retrieve.
     * @returns The full port configuration.
     * @throws {K8tsNetworkError} If the port name is not found.
     */
    get(name: Names): Port_Full {
        if (!Object.hasOwn(this._rec, name)) {
            throw new K8tsNetworkError(`Port ${name} not found`)
        }
        return this._rec[name]!
    }

    /** The underlying map of port names to their full configurations. */
    get values() {
        return Object.values(this._rec) as Port_Full[]
    }

    get record() {
        return this._rec as Record<Names, Port_Full>
    }

    /**
     * Creates a PortMap by mapping each port to a frontend port number.
     *
     * @param mapping A record where each port name maps to either a frontend port number or `true`
     *   to use the backend port.
     * @returns A new PortMap with the specified frontend mappings.
     * @throws {K8tsNetworkError} If a port name is missing from the mapping or has an invalid
     *   value.
     */
    map(mapping: PortMapping_Input<Names>): PortMap<Names> {
        return new PortMap(
            new Map(
                Object.entries(
                    mapValues(this._rec, entry => {
                        if (!(entry.name in mapping)) {
                            throw new K8tsNetworkError(`Port ${entry.name} not found in mapping`)
                        }
                        const portIn = mapping[entry.name as keyof typeof mapping]
                        let portVal: number
                        if (typeof portIn === "boolean") {
                            portVal = entry.port
                        } else if (typeof portIn === "number") {
                            portVal = portIn
                        } else {
                            throw new K8tsNetworkError(
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
            )
        )
    }
}
