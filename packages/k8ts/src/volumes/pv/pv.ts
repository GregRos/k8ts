import type { Unit } from "@k8ts/instruments"
import type { Meta } from "@k8ts/metadata"
import type { KubePersistentVolumeClaimProps } from "../../imports/k8s"
import type { InputAccessModes, VolumeReclaimPolicy } from "./enums"
import { PV_Backend_HostPath, PV_Backend_Local } from "./pv-backends"
export interface PV_Props {
    accessModes: InputAccessModes
    storageClassName?: string
    modeBlock?: boolean
    reclaimPolicy?: VolumeReclaimPolicy
    capacity: Unit.Data
    backend: PV_Backend_HostPath | PV_Backend_Local
}

export class PV {
    readonly kind = "PersistentVolume" as const
    constructor(
        private readonly _meta: Meta,
        private readonly _props: PV_Props
    ) {}

    manifest(): KubePersistentVolumeClaimProps {}
}
