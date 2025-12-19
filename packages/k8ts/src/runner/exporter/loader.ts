import { ForwardRef, ResourceNode } from "@k8ts/instruments"
import { seq } from "doddle"
import Emittery from "emittery"
import { MakeError } from "../../error"
import type { File } from "../../world/file"
import { k8ts_namespace } from "../../world/world"
export class ResourceLoader extends Emittery<ResourceLoaderEventsTable> {
    constructor(private readonly _options: ResourceLoaderOptions) {
        super()
    }

    private _attachSourceAnnotations(loadEvent: ResourceLoadedEvent) {
        const { resource } = loadEvent

        resource.meta!.add(k8ts_namespace, {
            "^declared-in": `(${resource.origin.root.name}) ${resource.origin.name}`
        })
    }

    private _checkNames(resources: ResourceNode[]) {
        let names = new Map<string, ResourceNode>()
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

    async load(input: File.Input) {
        // TODO: Handle ORIGINS that are referenced but not passed to the runner
        const parentOrigin = input.__node__

        const addResource = async (res: ResourceNode) => {
            if (resources.some(r => r.equals(res))) {
                return
            }
            if (!res.isRoot) {
                return
            }
            const origin = res.origin

            if (!origin.isChildOf(parentOrigin)) {
                return
            }
            const event = {
                isExported: res.meta!.has(`#${k8ts_namespace}is-exported`),
                resource: res
            } as const

            this._attachSourceAnnotations(event)
            await this.emit("load", event)
            resources.push(res)
        }

        let resources = [] as ResourceNode[]
        // We execute the main FILE iterable to load all the resources attached to the origin
        seq(input).toArray().pull()
        for (let res of input.__node__.resources) {
            if (ForwardRef.is(res)) {
                throw new MakeError(`Resource ${res} is a forward reference`)
            }
            await addResource(res)
        }
        // Some resources might appear as dependencies to sub-resources that
        // haven't loaded. We can acquire them by getting all the needed resources
        for (const resource of resources) {
            for (const relation of resource.recursiveRelationsSubtree) {
                await addResource(relation.needed)
            }
        }

        // The lazy sections might have attached more resources to the origin
        for (const resource of parentOrigin.resources) {
            await addResource(resource)
        }

        this._checkNames(resources)
        return [...resources]
    }
}
export interface ResourceLoadedEvent {
    isExported: boolean
    resource: ResourceNode
}

export interface ResourceLoaderEventsTable {
    load: ResourceLoadedEvent
}

export interface ResourceLoaderOptions {}
