import { BaseManifest, ResourceNode } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import Emittery from "emittery"
import { cloneDeep, cloneDeepWith, get, isEmpty, unset } from "lodash"
import { ManifestResource } from "../node"
import { version } from "../version"
export class ManifestGenerator extends Emittery<ManifestGeneratorEventsTable> {
    constructor(options: {}) {
        super()
    }
    private _cleanSpecificEmptyObjects(manifest: BaseManifest) {
        const clone = cloneDeep(manifest)
        const metadataProps = ["labels", "annotations"].map(x => `metadata.${x}`)
        for (const deletableEmpty of ["labels", "annotations"].map(x => `metadata.${x}`)) {
            const value = get(clone, deletableEmpty)
            if (isEmpty(value)) {
                unset(clone, deletableEmpty)
            }
        }
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
        const common = Meta.make().add({
            "^world": origin.root.name,
            "^produced-by": `k8ts@${version}`
        })
        resource.meta!.add(common)
    }

    async generate(res: ResourceNode) {
        this._attachProductionAnnotations(res)
        await this.emit("generating", { resource: res })
        const manifest = this._generate(res.entity as ManifestResource)
        return manifest
    }
}
export interface GeneratingManifestEvent {
    resource: ResourceNode
}

export interface ManifestGeneratorEventsTable {
    generating: GeneratingManifestEvent
}
