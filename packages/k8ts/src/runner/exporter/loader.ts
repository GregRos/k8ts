import { ForwardRef, ResourceNode } from "@k8ts/instruments"
import { seq } from "doddle"
import Emittery from "emittery"
import { List } from "immutable"
import { MakeError } from "../../error"
import type { File } from "../../file"
import { k8ts_namespace } from "./meta"
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

    async load(input: File.Input) {
        let resources = List<ResourceNode>()
        seq(input).drain().pull()
        for (let res of input.__node__.resources) {
            const origin = res.origin
            if (!origin.isChildOf(origin)) {
                throw new MakeError(`Resource ${res} is not a child of the input file ${input}`)
            }
            if (ForwardRef.is(res)) {
                throw new MakeError(`Resource ${res} is a forward reference`)
            }
            const event = {
                isExported: res.meta!.has(`#${k8ts_namespace}is-exported`),
                resource: res
            } as const

            this._attachSourceAnnotations(event)
            await this.emit("load", event)
            resources = resources.push(res)
        }

        return resources.toArray()
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
