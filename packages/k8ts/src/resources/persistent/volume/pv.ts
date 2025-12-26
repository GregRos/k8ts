import { Rsc_Ref, Rsc_Top, type Unit } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { MakeError } from "../../../error"
import { v1 } from "../../../kinds/default"
import { storage } from "../../../kinds/storage"
import type { HostPathType } from "../../hostpath"
import { Access } from "../access-mode"
import type { Pv_VolumeMode } from "../block-mode"
import { parseBackend } from "./parse-backend"

const StorageClassKind = storage.v1.StorageClass._

export interface Pv_Backend_HostPath {
    kind: "HostPath"
    hostpathType: HostPathType
    path: string
}
export interface Pv_Backend_Local {
    kind: "Local"
    path: string
}
export interface Pv_Backend_Nfs {
    kind: "NFS"
    server: string
    path: string
}

export type Pv_Backend = Pv_Backend_HostPath | Pv_Backend_Local | Pv_Backend_Nfs
export interface Pv_Props_K8ts<Mode extends Pv_VolumeMode = Pv_VolumeMode> {
    $accessModes: Access
    $storageClass?: Rsc_Ref<storage.v1.StorageClass._>
    $mode?: Mode
    reclaimPolicy?: Reclaim
    $capacity: Unit.Data
    $backend?: Pv_Backend
    mountOptions?: string[]
    nodeAffinity?: CDK.VolumeNodeAffinity
}
export type Reclaim = "Retain" | "Delete" | "Recycle"
export type Pv_Ref<Mode extends Pv_VolumeMode = Pv_VolumeMode> = Rsc_Ref<v1.PersistentVolume._> & {
    __MODE__: Mode
}

export class Pv<
    Mode extends Pv_VolumeMode = "Filesystem",
    Name extends string = string
> extends Rsc_Top<Name, Pv_Props_K8ts<Mode>> {
    __MODE__!: Mode
    get kind() {
        return v1.PersistentVolume._
    }

    protected __needs__() {
        return {
            storageClass: this.props.$storageClass
        }
    }
    protected body() {
        const self = this
        const pvProps = self.props
        const accessModes = Access.pv_parseAccessMode(pvProps.$accessModes)
        if (self.props.$backend?.kind === "Local") {
            if (!pvProps.nodeAffinity) {
                throw new MakeError(
                    `While manifesting ${self.node.format("source")}, PV with Local backend must have nodeAffinity.`
                )
            }
        }
        if (!self.props.$backend && !self.props.$storageClass) {
            throw new MakeError(
                `While manifesting ${self.node.format("source")}, PV that doesn't have a $backend must have a $storageClass.`
            )
        }
        let base: CDK.PersistentVolumeSpec = {
            accessModes,
            storageClassName: pvProps.$storageClass?.name ?? "standard",
            capacity: pvProps.$capacity
                ? {
                      storage: CDK.Quantity.fromString(pvProps.$capacity)
                  }
                : undefined,
            volumeMode: pvProps.$mode ?? "Filesystem",
            mountOptions: pvProps.mountOptions,
            persistentVolumeReclaimPolicy: pvProps.reclaimPolicy ?? "Retain",
            nodeAffinity: pvProps.nodeAffinity
        }
        base = {
            ...base,
            ...parseBackend(pvProps.$backend)
        }
        return {
            spec: base
        }
    }
}
