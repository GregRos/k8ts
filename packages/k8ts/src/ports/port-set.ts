import { type ContainerPort } from "@k8s"
import type { PortBase, PortBaseInputs } from "./types"

export class PortSet<Names extends string = never> {
    constructor(private readonly _entries: Map<string, PortBase<Names>>) {}

    private _withMap(f: (entries: Map<string, PortBase<Names>>) => Map<string, PortBase<Names>>) {
        return new PortSet(f(this._entries))
    }
    add<Names2 extends string>(more: PortBaseInputs<Names2>): PortSet<Names | Names2> {}

    addPorts<Names2 extends string>(...entries: FullPortEntry<Names2>[]): PortSet<Names | Names2> {
        return new PortSet<Names | Names2>([...this._entries, ...entries])
    }

    addMap<Names2 extends string>(entries: {
        [K in Names2]: SomePortSpec
    }): PortSet<Names | Names2> {
        const results = []
        for (const [name, value] of Object.entries(entries)) {
            const clone = pasrseIt(name, value as any)
            results.push(clone)
        }
        return this.addPorts(...results) as any
    }

    pick<Names2 extends Names>(...names: Names2[]): PortSet<Names2> {
        return new PortSet<Names2>(
            this._entries.filter(entry => names.includes(entry.name as any)) as any
        )
    }

    has(name: string) {
        return this._entries.some(entry => entry.name === name)
    }

    expose() {
        return new PortMap<Names>(
            this._entries.map(entry => {
                return {
                    ...entry,
                    port: entry.port,
                    targetPort: entry.port
                }
            })
        )
    }

    map(mapping: {
        [K in Names]: number
    }) {
        return new PortMap<Names>(
            this._entries.map(entry => {
                return {
                    ...entry,
                    targetPort: entry.port,
                    port: mapping[entry.name]
                }
            })
        )
    }

    get container(): ContainerPort[] {
        return this._entries.map(entry => {
            return {
                containerPort: entry.port,
                name: entry.name
            }
        })
    }
}

export interface PortMapEntry extends FullPortEntry<Name> {
    targetPort: number
}

export function ports<Names extends string>(record: {
    [K in Names]: SomePortSpec
}) {
    return new PortSet([]).addMap(record)
}
