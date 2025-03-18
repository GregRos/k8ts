import { ForwardRef, ResourceNode } from "@k8ts/instruments"
import { seq } from "doddle"
import Emittery from "emittery"
import { List } from "immutable"
import { MakeError } from "../error"
import type { File } from "../file"
import { k8ts_namespace } from "./meta"
export class ResourceLoader extends Emittery<ResourceLoaderEventsTable> {
    constructor(private readonly _options: ResourceLoaderOptions) {
        super()
    }

    private _attachSourceAnnotations(loadEvent: ResourceLoadedEvent) {
        const { resource } = loadEvent
        resource.meta!.add(k8ts_namespace, {
            "^constructed-at": "xxx.ts:1:1"
        })
        if (loadEvent.subtype === "referenced") {
            resource.meta!.add(k8ts_namespace, {
                "^referenced-by": loadEvent.broughtBy.name
            })
        } else {
            resource.meta!.add(k8ts_namespace, {
                "^declared-in": resource.origin.name
            })
        }
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
                subtype: "declared",
                resource: res
            } as const

            this._attachSourceAnnotations(event)
            await this.emit("loading", event)
            resources = resources.push(res)
        }

        return resources.toArray()
    }
}
export interface ResourceLoaded_FromDeclaration {
    subtype: "declared"
    resource: ResourceNode
}

export interface ResourceLoaded_FromReference {
    subtype: "referenced"
    resource: ResourceNode
    broughtBy: ResourceNode
}

export type ResourceLoadedEvent = ResourceLoaded_FromDeclaration | ResourceLoaded_FromReference

export interface ResourceLoaderEventsTable {
    loading: ResourceLoaded_FromDeclaration | ResourceLoaded_FromReference
}

export interface ResourceLoaderOptions {}
