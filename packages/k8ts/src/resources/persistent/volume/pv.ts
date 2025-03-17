import { CDK } from "@imports"
import { connections, manifest, type Unit } from "@k8ts/instruments"
import { v1 } from "../../../api-versions"
import { k8ts } from "../../../kind-map"
import { ManifestResource } from "../../../node/manifest-resource"
import { Access } from "../access-mode"
import type { DataMode } from "../block-mode"
import { Backend as Backend_ } from "./backend"
import { parseBackend } from "./parse-backend"

export type Volume<T extends DataMode = DataMode> = Volume.Volume<T>
export namespace Volume {
    export import Backend = Backend_
    export interface Props<Mode extends DataMode = DataMode> {
        accessModes: Access
        storageClassName?: string
        mode?: Mode
        reclaimPolicy?: Reclaim
        capacity: Unit.Data
        backend: Backend
    }
    export type Reclaim = "Retain" | "Delete" | "Recycle"

    const ident = v1.kind("PersistentVolume")

    @manifest({
        body(self) {
            const pvProps = self.props
            const accessModes = Access.parse(pvProps.accessModes)
            let base: CDK.PersistentVolumeSpec = {
                accessModes,
                storageClassName: pvProps.storageClassName,
                capacity: {
                    storage: CDK.Quantity.fromString(pvProps.capacity)
                },
                volumeMode: pvProps.mode ?? "Filesystem",
                persistentVolumeReclaimPolicy: pvProps.reclaimPolicy ?? "Retain"
            }
            base = {
                ...base,
                ...parseBackend(pvProps.backend)
            }
            return {
                spec: base
            }
        }
    })
    @k8ts(ident)
    @connections("none")
    export class Volume<Mode extends DataMode = DataMode> extends ManifestResource<Props<Mode>> {
        declare readonly kind: typeof ident
    }
}
