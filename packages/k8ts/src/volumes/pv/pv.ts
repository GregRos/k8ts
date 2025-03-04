import { KubePersistentVolumeClaimProps, Quantity, type PersistentVolumeSpec } from "@imports"
import type { Unit } from "@k8ts/instruments"
import type { Meta } from "@k8ts/metadata"
import { parseAccessModes, type InputAccessModes, type VolumeReclaimPolicy } from "../enums"
import { parseBackend, PV_Backend_HostPath, PV_Backend_Local } from "./pv-backends"
export interface PV_Props {
    accessModes: InputAccessModes
    storageClassName?: string
    isBlock?: boolean
    reclaimPolicy?: VolumeReclaimPolicy
    capacity: Unit.Data
    backend: PV_Backend_HostPath | PV_Backend_Local
}

export class PV {
    readonly kind = "PersistentVolume" as const
    constructor(
        readonly meta: Meta,
        readonly props: PV_Props
    ) {}

    manifest(): KubePersistentVolumeClaimProps {
        const pvProps = this.props
        const accessModes = parseAccessModes(pvProps.accessModes)
        let base: PersistentVolumeSpec = {
            accessModes,
            storageClassName: pvProps.storageClassName,
            capacity: {
                storage: Quantity.fromString(pvProps.capacity)
            },
            volumeMode: pvProps.isBlock ? "Block" : "Filesystem",
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
