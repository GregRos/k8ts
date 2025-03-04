import { CDK } from "@imports"
import type { Unit } from "@k8ts/instruments"
import { BaseNode } from "../../base"
import {
    parseAccessModes,
    type InputAccessModes,
    type VolumeMode,
    type VolumeReclaimPolicy
} from "./enums"
import { parseBackend, PV_Backend_HostPath, PV_Backend_Local } from "./pv-backends"

export interface PvProps<Mode extends VolumeMode = "Filesystem"> {
    accessModes: InputAccessModes
    storageClassName?: string
    mode?: Mode
    reclaimPolicy?: VolumeReclaimPolicy
    capacity: Unit.Data
    backend: PV_Backend_HostPath | PV_Backend_Local
}

export class Pv<Mode extends VolumeMode = "Filesystem"> extends BaseNode<PvProps<Mode>> {
    readonly kind = "PersistentVolume" as const

    manifest(): CDK.KubePersistentVolumeProps {
        const pvProps = this.props
        const accessModes = parseAccessModes(pvProps.accessModes)
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
