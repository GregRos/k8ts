import { ForwardRef } from "@k8ts/instruments"
import Emittery from "emittery"
import { MakeError } from "../error"
import type { File } from "../file"
import { ManifestResource } from "../node"
import { k8ts_namespace } from "./meta"

export class ResourceLoader extends Emittery<ResourceLoaderEvents> {
    constructor(private readonly _options: ResourceLoaderOptions) {
        super()
    }

    private _attachSourceAnnotations(loadEvent: ResourceLoadedEvent) {
        const { resource } = loadEvent
        resource.meta.add(k8ts_namespace, {
            "^constructed-at": "xxx.ts:1:1"
        })
        if (loadEvent.type === "referenced") {
            resource.meta.add(k8ts_namespace, {
                "^referenced-by": loadEvent.broughtBy.name
            })
        } else {
            resource.meta.add(k8ts_namespace, {
                "^declared-in": resource.origin.name
            })
        }
    }

    async load(input: File) {
        let resources = [] as ManifestResource[]
        for (let res of input) {
            if (!res.origin.isChildOf(res.origin)) {
                throw new MakeError(`Resource ${res} is not a child of the input file ${input}`)
            }
            if (ForwardRef.is(res)) {
                throw new MakeError(`Resource ${res} is a forward reference`)
            }
            const event = {
                type: "declared",
                resource: res
            } as const

            this._attachSourceAnnotations(event)
            await this.emit("loaded", event)
            resources.push(res)
        }

        for (const curRes of resources) {
            for (const curDep of curRes.dependencies) {
                if (resources.some(r => r.key === curDep.resource.key)) {
                    continue
                }
                if (ForwardRef.is(curDep.resource)) {
                    continue
                }
                if (!(curDep.resource instanceof ManifestResource)) {
                    throw new MakeError(
                        `Resource ${curRes} cannot depend on ${curDep.resource}, since it is not a manifest resource`
                    )
                }

                const e = {
                    type: "referenced",
                    resource: curDep.resource,
                    broughtBy: curRes
                } as const
                this._attachSourceAnnotations(e)

                await this.emit("loaded", e)

                const depResource = curDep.resource
                resources.push(depResource)
            }
        }
        return resources
    }
}
export interface ResourceLoaded_FromDeclaration {
    type: "declared"
    resource: ManifestResource
}

export interface ResourceLoaded_FromReference {
    type: "referenced"
    resource: ManifestResource
    broughtBy: ManifestResource
}

export type ResourceLoadedEvent = ResourceLoaded_FromDeclaration | ResourceLoaded_FromReference

export interface ResourceLoaderEvents {
    loaded: ResourceLoadedEvent
}

export interface ResourceLoaderOptions {}
