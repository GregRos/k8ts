import { CDK } from "@imports"
import type { Unit } from "@k8ts/instruments"
import { ManifestResource } from "../../../node/base"
import { v1 } from "../../api-version"
import { K8tsResources } from "../../kind-map"
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

    @K8tsResources.register("PersistentVolume")
    export class Volume<Mode extends DataMode = DataMode> extends ManifestResource<Props<Mode>> {
        readonly api = v1.kind("PersistentVolume")

        manifest(): CDK.KubePersistentVolumeProps {
            const pvProps = this.props
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
                metadata: this.meta.expand(),
                spec: base
            }
        }
    }
}
