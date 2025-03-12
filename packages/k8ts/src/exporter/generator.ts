import { Meta } from "@k8ts/metadata/."
import Emittery from "emittery"
import { cloneDeep, cloneDeepWith } from "lodash"
import { MakeError } from "../error"
import { ManifestResource } from "../node"
import { version } from "../version"

export class ManifestGenerator extends Emittery<ManifestGeneratorEvents> {
    constructor(options: {}) {
        super()
    }
    private _cleanManifest(manifest: Record<string, any>) {
        const _cleanKeys = (obj: any) => {
            if (typeof obj !== "object") {
                return obj
            }
            for (const [k, v] of Object.entries(manifest)) {
                if (v === undefined) {
                    delete manifest[k]
                }
                if (v == null) {
                    throw new MakeError(`Null value found in manifest: ${k}`)
                }
            }
            return undefined
        }
        const clone = cloneDeep(manifest)
        return cloneDeepWith(clone, _cleanKeys)
    }
    private _generate(resource: ManifestResource): object {
        const manifest = resource.manifest()
        return this._cleanManifest(manifest)
    }
    private _attachProductionAnnotations(resource: ManifestResource) {
        const origin = resource.origin
        const common = Meta.make().add({
            "^world": origin.root.name,
            "^produced-by": `k8ts@${version}`
        })
        resource.meta.add(common)
    }

    async generate(res: ManifestResource) {
        this._attachProductionAnnotations(res)
        await this.emit("generating", { resource: res })
        const manifest = this._generate(res)
        return manifest
    }
}
export interface GeneratingManifestEvent {
    resource: ManifestResource
}

export interface ManifestGeneratorEvents {
    generating: GeneratingManifestEvent
}
