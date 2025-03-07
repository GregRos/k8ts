import { CDK } from "@imports"
import type { Unit } from "@k8ts/instruments"
import { Base } from "../../../node/base"
import { v1 } from "../../api-version"
import { K8tsResources } from "../../kind-map"
import { AccessMode } from "../access-mode"
import type { DataMode } from "../block-mode"
import { parseBackend } from "./parse-backend"
export interface HostPath {
    type: "HostPath"
    path: string
}
export interface Local {
    type: "Local"
    path: string
}

export type Backend = HostPath | Local
export interface Props<Mode extends DataMode = DataMode> {
    accessModes: AccessMode
    storageClassName?: string
    mode?: Mode
    reclaimPolicy?: Reclaim
    capacity: Unit.Data
    backend: Backend
}
export type Reclaim = "Retain" | "Delete" | "Recycle"

@K8tsResources.register("PersistentVolume")
export class Volume<Mode extends DataMode = DataMode> extends Base<Props<Mode>> {
    readonly api = v1.kind("PersistentVolume")

    manifest(): CDK.KubePersistentVolumeProps {
        const pvProps = this.props
        const accessModes = AccessMode.parse(pvProps.accessModes)
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
