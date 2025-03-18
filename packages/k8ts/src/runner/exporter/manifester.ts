import { BaseManifest, ResourceNode, TraceEmbedder } from "@k8ts/instruments"
import Emittery from "emittery"
import { cloneDeep, cloneDeepWith, isEmpty, unset } from "lodash"
import { ManifestResource } from "../../node"
import { version } from "../../version"
import { k8ts_namespace } from "./meta"
export interface ManifesterOptions {
    cwd?: string
}
export class Manifester extends Emittery<ManifesterEventsTable> {
    constructor(private readonly _options: ManifesterOptions) {
        super()
    }
    private _cleanSpecificEmptyObjects(manifest: BaseManifest) {
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
    private _cleanNullishValues(manifest: BaseManifest) {
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
    private _generate(resource: ManifestResource): BaseManifest {
        const manifest = resource["manifest"]()
        const noNullish = this._cleanNullishValues(manifest)
        const noEmpty = this._cleanSpecificEmptyObjects(noNullish)
        return noEmpty
    }

    private _attachProductionAnnotations(resource: ResourceNode) {
        const origin = resource.origin
        const entry = TraceEmbedder.get(resource)
        const loc = resource.trace.format({
            cwd: this._options.cwd
        })
        const exportedPart = resource.isExported ? "(EXP) " : ""
        resource.meta!.add(k8ts_namespace, {
            "^constructed-at": `${exportedPart}${loc}`,
            "^produced-by": `k8ts@${version}`
        })
    }

    async generate(res: ResourceNode) {
        this._attachProductionAnnotations(res)
        await this.emit("manifest", { resource: res })
        const manifest = this._generate(res.entity as ManifestResource)
        return manifest
    }
}
export interface ManifesterManifestEvent {
    resource: ResourceNode
}

export interface ManifesterEventsTable {
    manifest: ManifesterManifestEvent
}
