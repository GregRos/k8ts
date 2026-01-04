import { K8tsManifest, ManifestSourceEmbedder, ResourceNode, ResourceTop } from "@k8ts/instruments"
import type EventEmitter from "eventemitter3"
import { cloneDeep, cloneDeepWith, isEmpty, unset } from "lodash"
import { version } from "../../version"
export interface ManifesterOptions {
    cwd?: string
    emitter?: EventEmitter<any>
}

export class Engine_Manifester {
    constructor(private readonly _options: ManifesterOptions) {}
    private _cleanSpecificEmptyObjects(manifest: K8tsManifest) {
        const clone = cloneDeepWith(manifest, (value, key) => {
            if (key !== "metadata") {
                return
            }
            for (const k in value) {
                if (["labels", "annotations"].includes(k)) {
                    if (isEmpty(value[k])) {
                        unset(value, k)
                    }
                }
            }
        })
        return clone
    }
    private _cleanNullishValues(manifest: K8tsManifest) {
        const _cleanKeys = (obj: any) => {
            if (typeof obj !== "object") {
                return obj
            }
            for (const [k, v] of Object.entries(obj)) {
                if (v == null) {
                    delete obj[k]
                }
            }
            return undefined
        }
        const clone = cloneDeep(manifest)

        return cloneDeepWith(clone, _cleanKeys)
    }

    private async _generate(resource: ResourceTop): Promise<K8tsManifest> {
        const manifest = await resource["__manifest__"]()

        const noNullish = this._cleanNullishValues(manifest)
        const noEmpty = this._cleanSpecificEmptyObjects(noNullish)
        return noEmpty
    }

    private _attachProductionAnnotations(resource: ResourceNode) {
        const loc = resource.trace.format({
            cwd: this._options.cwd
        })
        resource.meta!.add(`build.k8ts.org/`, {
            "^constructed-at": loc,
            "^produced-by": `k8ts@${version}`
        })
    }

    async generate(res: ResourceNode): Promise<NodeManifest> {
        this._attachProductionAnnotations(res)
        this._options.emitter?.emit("manifest", { resource: res })
        const manifest = await this._generate(res.entity as ResourceTop)
        ManifestSourceEmbedder.add(manifest, res.entity)
        res.origin.entity["__emit__"]("resource/manifested", {
            origin: res.origin.entity,
            manifest,
            resource: res.entity as ResourceTop
        })
        return {
            node: res,
            manifest: manifest
        }
    }
}

export interface NodeManifest {
    node: ResourceNode
    manifest: K8tsManifest
}
export interface ManifesterManifestEvent {
    resource: ResourceNode
}

export interface ManifesterEventsTable {
    manifest: ManifesterManifestEvent
}
