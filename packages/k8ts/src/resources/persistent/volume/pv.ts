import { CDK } from "@k8ts/imports"
import { manifest, ManifestResource, Refable, relations, type Unit } from "@k8ts/instruments"
import { MakeError } from "../../../error"
import { External } from "../../../external"
import { v1 } from "../../../kinds/default"
import { storage } from "../../../kinds/storage"
import { k8ts } from "../../../world/kind-map"
import { Access } from "../access-mode"
import type { Pv_VolumeMode } from "../block-mode"
import { parseBackend } from "./parse-backend"

const StorageClassKind = storage.v1.StorageClass._

export type Pv<T extends Pv_VolumeMode = Pv_VolumeMode> = Pv.Pv<T>
export namespace Pv {
    export interface Pv_Backend_HostPath {
        type: "HostPath"
        hostpathType: string
        path: string
    }
    export interface Pv_Backend_Local {
        type: "Local"
        path: string
    }
    export interface Pv_Backend_Nfs {
        type: "NFS"
        server: string
        path: string
    }

    export type Backend = Pv_Backend_HostPath | Pv_Backend_Local | Pv_Backend_Nfs
    export interface Pv_Props_K8ts<Mode extends Pv_VolumeMode = Pv_VolumeMode> {
        $accessModes: Access
        $storageClass?: External<storage.v1.StorageClass._>
        $mode?: Mode
        reclaimPolicy?: Reclaim
        $capacity: Unit.Data
        $backend?: Backend
        mountOptions?: string[]
        nodeAffinity?: CDK.VolumeNodeAffinity
    }
    export type Reclaim = "Retain" | "Delete" | "Recycle"
    export type Pv_Ref<Mode extends Pv_VolumeMode = Pv_VolumeMode> =
        Refable<v1.PersistentVolume._> & {
            __MODE__: Mode
        }
    @manifest({
        body(self) {
            const pvProps = self.props
            const accessModes = Access.pv_parseAccessMode(pvProps.$accessModes)
            if (self.props.$backend?.type === "Local") {
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
    })
    @k8ts(v1.PersistentVolume._)
    @relations({
        needs(self) {
            return {
                storageClass: self.props.$storageClass
            }
        }
    })
    export class Pv<Mode extends Pv_VolumeMode = Pv_VolumeMode> extends ManifestResource<
        Pv_Props_K8ts<Mode>
    > {
        __MODE__!: Mode
        readonly kind = v1.PersistentVolume._
    }
}
