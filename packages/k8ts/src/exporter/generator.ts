import { Meta } from "@k8ts/metadata"
import Emittery from "emittery"
import { assign, cloneDeep, cloneDeepWith, get, isEmpty, unset } from "lodash"
import { MakeError } from "../error"
import { BaseManifest } from "../manifest"
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
                if (v === undefined) {
                    delete obj[k]
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
    private _generate(resource: ManifestResource): BaseManifest {
        const resourceKindIdents = {
            kind: resource.api.name,
            apiVersion: resource.api.version
        }
        const manifest = assign(resource.manifest(), resourceKindIdents)
        assign(manifest, resourceKindIdents)
        const noNullish = this._cleanNullishValues(manifest)
        const noEmpty = this._cleanSpecificEmptyObjects(noNullish)
        return noEmpty
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

export interface ManifestGeneratorEventsTable {
    generating: GeneratingManifestEvent
}
