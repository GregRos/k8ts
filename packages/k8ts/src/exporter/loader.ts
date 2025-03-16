import { ForwardRef } from "@k8ts/instruments"
import Emittery from "emittery"
import { List } from "immutable"
import { MakeError } from "../error"
import type { File } from "../file"
import { ManifestResource } from "../node"
import { k8ts_namespace } from "./meta"

export class ResourceLoader extends Emittery<ResourceLoaderEventsTable> {
    constructor(private readonly _options: ResourceLoaderOptions) {
        super()
    }

    private _attachSourceAnnotations(loadEvent: ResourceLoadedEvent) {
        const { resource } = loadEvent
        resource.meta.add(k8ts_namespace, {
            "^constructed-at": "xxx.ts:1:1"
        })
        if (loadEvent.subtype === "referenced") {
            resource.meta.add(k8ts_namespace, {
                "^referenced-by": loadEvent.broughtBy.name
            })
        } else {
            resource.meta.add(k8ts_namespace, {
                "^declared-in": resource.origin.name
            })
        }
    }

    async load(input: File.Input) {
        let resources = List<ManifestResource>()
        for (let res of input) {
            if (!res.origin.isChildOf(res.origin)) {
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

        for (const curRes of resources) {
            const allDependencies = curRes.node.needsGraph
            for (const curDep of allDependencies) {
                const needed = curDep.needed
                if (resources.map(x => x.node.key).includes(needed.key)) {
                    continue
                }
                if (ForwardRef.is(needed)) {
                    continue
                }
                if (!(needed instanceof ManifestResource)) {
                    throw new MakeError(
                        `Resource ${curRes} cannot depend on ${needed}, since it is not a manifest resource`
                    )
                }

                const e = {
                    subtype: "referenced",
                    resource: needed,
                    broughtBy: curRes
                } as const
                this._attachSourceAnnotations(e)

                await this.emit("loading", e)

                resources = resources.push(needed.entity as ManifestResource)
            }
        }
        return resources.toArray()
    }
}
export interface ResourceLoaded_FromDeclaration {
    subtype: "declared"
    resource: ManifestResource
}

export interface ResourceLoaded_FromReference {
    subtype: "referenced"
    resource: ManifestResource
    broughtBy: ManifestResource
}

export type ResourceLoadedEvent = ResourceLoaded_FromDeclaration | ResourceLoaded_FromReference

export interface ResourceLoaderEventsTable {
    loading: ResourceLoaded_FromDeclaration | ResourceLoaded_FromReference
}

export interface ResourceLoaderOptions {}
