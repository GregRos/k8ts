import { Quantity, type KubePersistentVolumeProps, type PersistentVolumeSpec } from "@imports"
import type { Unit } from "@k8ts/instruments"
import type { Meta } from "@k8ts/metadata"
import {
    parseAccessModes,
    type InputAccessModes,
    type VolumeMode,
    type VolumeReclaimPolicy
} from "./enums"
import { parseBackend, PV_Backend_HostPath, PV_Backend_Local } from "./pv-backends"

export interface PV_Props<Mode extends VolumeMode = "Filesystem"> {
    accessModes: InputAccessModes
    storageClassName?: string
    mode?: Mode
    reclaimPolicy?: VolumeReclaimPolicy
    capacity: Unit.Data
    backend: PV_Backend_HostPath | PV_Backend_Local
}

export class PV<Mode extends VolumeMode = "Filesystem"> {
    readonly kind = "PersistentVolume" as const
    constructor(
        readonly meta: Meta,
        readonly props: PV_Props<Mode>
    ) {}

    manifest(): KubePersistentVolumeProps {
        const pvProps = this.props
        const accessModes = parseAccessModes(pvProps.accessModes)
        let base: PersistentVolumeSpec = {
            accessModes,
            storageClassName: pvProps.storageClassName,
            capacity: {
                storage: Quantity.fromString(pvProps.capacity)
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
