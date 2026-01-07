import { OriginVertex, ResourceVertex, type ResourceTop, type Vertex } from "@k8ts/instruments"
import type EventEmitter from "eventemitter3"
import { K8tsEngineError } from "../error"
export class Engine_ResourceLoader {
    constructor(private readonly _options: AssemblerRscLoaderOptions) {}

    private _checkNames(resources: ResourceVertex[]) {
        let names = new Map<string, ResourceVertex>()
        const nameRegexp = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/
        for (const resource of resources) {
            const name = [resource.ident.value, resource.namespace, resource.name]
                .filter(Boolean)
                .join("/")
            const existing = names.get(name)
            if (existing) {
                throw new K8tsEngineError(
                    `Duplicate resource designation ${name}. Existing: ${existing.format("source")}, new: ${resource.format("source")}`
                )
            }
            if (!nameRegexp.test(resource.name)) {
                throw new K8tsEngineError(
                    `Invalid resource name ${resource.name}. Must match ${nameRegexp}`
                )
            }
            names.set(name, resource)
        }
    }

    async load(input: OriginVertex) {
        // TODO: Handle ORIGINS that are referenced but not passed to the runner
        let resources = [] as ResourceVertex[]

        const addResource = async (res: Vertex) => {
            if (!(res instanceof ResourceVertex)) {
                throw new K8tsEngineError(`Expected ResourceNode, got ${res.constructor.name}`)
            }
            if (resources.some(r => r.equals(res))) {
                return
            }
            if (!res.isRoot) {
                return
            }
            if (res.noEmit) {
                return
            }
            const origin = res.origin

            if (!origin.isChildOf(input)) {
                return
            }
            const event = {
                isExported: res.metadata!.has(`#k8ts.org/exported`),
                resource: res
            } as const

            this._options.emitter?.emit("load", event)

            origin.entity["__emit__"]("resource/loaded", {
                origin: origin.entity,
                resource: res.entity as ResourceTop
            })
            resources.push(res)
        }

        for (const resource of input.resources) {
            await addResource(resource.vertex)
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
export interface AssemblerRscLoadedEvent {
    isExported: boolean
    resource: ResourceVertex
}

export interface AssemblerRscLoaderEvents {
    load: AssemblerRscLoadedEvent
}

export interface AssemblerRscLoaderOptions {
    emitter?: EventEmitter<any>
}
