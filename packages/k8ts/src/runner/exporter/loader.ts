import { OriginNode, Rsc_Node, type Node, type Rsc_Top } from "@k8ts/instruments"
import Emittery from "emittery"
import { MakeError } from "../../error"
export class Assembler_RscLoader extends Emittery<Assembler_RscLoaderEvents> {
    constructor(private readonly _options: Assembler_RscLoaderOptions) {
        super()
    }

    private _checkNames(resources: Rsc_Node[]) {
        let names = new Map<string, Rsc_Node>()
        const nameRegexp = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/
        for (const resource of resources) {
            const name = [resource.kind.name, resource.namespace, resource.name]
                .filter(Boolean)
                .join("/")
            const existing = names.get(name)
            if (existing) {
                throw new MakeError(
                    `Duplicate resource designation ${name}. Existing: ${existing.format("source")}, new: ${resource.format("source")}`
                )
            }
            if (!nameRegexp.test(resource.name)) {
                throw new MakeError(
                    `Invalid resource name ${resource.name}. Must match ${nameRegexp}`
                )
            }
            names.set(name, resource)
        }
    }

    async load(input: OriginNode) {
        // TODO: Handle ORIGINS that are referenced but not passed to the runner
        let resources = [] as Rsc_Node[]

        const addResource = async (res: Node) => {
            if (!(res instanceof Rsc_Node)) {
                throw new Error(`Expected ResourceNode, got ${res.constructor.name}`)
            }
            if (resources.some(r => r.equals(res))) {
                return
            }
            if (!res.isRoot) {
                return
            }
            const origin = res.origin

            if (!origin.isChildOf(input)) {
                return
            }
            const event = {
                isExported: res.meta!.has(`#k8ts.org/is-exported`),
                resource: res
            } as const

            await this.emit("load", event)

            origin.entity["__emit__"]("resource/loaded", {
                origin: origin.entity,
                resource: res.entity as Rsc_Top
            })
            resources.push(res)
        }

        for (const resource of input.resources) {
            await addResource(resource.node)
        }

        // Some resources might appear as dependencies to sub-resources that
        // haven't loaded. We can acquire them by getting all the needed resources
        for (const resource of resources) {
            for (const relation of resource.recursiveRelationsSubtree) {
                await addResource(relation.needed)
            }
        }

        this._checkNames(resources)
        return [...resources]
    }
}
export interface Assembler_RscLoadedEvent {
    isExported: boolean
    resource: Rsc_Node
}

export interface Assembler_RscLoaderEvents {
    load: Assembler_RscLoadedEvent
}

export interface Assembler_RscLoaderOptions {}
