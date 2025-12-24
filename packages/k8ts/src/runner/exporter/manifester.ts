import { Manifest, ManifestSourceEmbedder, Resource_Node, Resource_Top } from "@k8ts/instruments"
import Emittery from "emittery"
import { cloneDeep, cloneDeepWith, isEmpty, unset } from "lodash"
import { version } from "../../version"
export interface ManifesterOptions {
    cwd?: string
}

export class Manifester extends Emittery<ManifesterEventsTable> {
    constructor(private readonly _options: ManifesterOptions) {
        super()
    }
    private _cleanSpecificEmptyObjects(manifest: Manifest) {
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
    private _cleanNullishValues(manifest: Manifest) {
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

    private async _generate(resource: Resource_Top): Promise<Manifest> {
        const manifest = await resource["__manifest__"]()

        const noNullish = this._cleanNullishValues(manifest)
        const noEmpty = this._cleanSpecificEmptyObjects(noNullish)
        return noEmpty
    }

    private _attachProductionAnnotations(resource: Resource_Node) {
        const loc = resource.trace.format({
            cwd: this._options.cwd
        })
        resource.meta!.add(`build.k8ts.org/`, {
            "^constructed-at": loc,
            "^produced-by": `k8ts@${version}`
        })
    }

    async generate(res: Resource_Node): Promise<NodeManifest> {
        this._attachProductionAnnotations(res)
        await this.emit("manifest", { resource: res })
        const manifest = await this._generate(res.entity as Resource_Top)
        ManifestSourceEmbedder.add(manifest, res.entity)
        res.origin.entity["__emit__"]("resource/manifested", {
            origin: res.origin.entity,
            manifest,
            resource: res.entity as Resource_Top
        })
        return {
            node: res,
            manifest: manifest
        }
    }
}

export interface NodeManifest {
    node: Resource_Node
    manifest: Manifest
}
export interface ManifesterManifestEvent {
    resource: Resource_Node
}

export interface ManifesterEventsTable {
    manifest: ManifesterManifestEvent
}
