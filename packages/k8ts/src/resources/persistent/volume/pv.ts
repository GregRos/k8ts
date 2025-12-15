import { CDK } from "@k8ts/imports"
import { manifest, Refable, relations, type Unit } from "@k8ts/instruments"
import { MakeError } from "../../../error"
import { External } from "../../../external"
import { k8ts } from "../../../kind-map"
import { api_ } from "../../../kinds"
import { equiv_cdk8s } from "../../../node/equiv-cdk8s"
import { ManifestResource } from "../../../node/manifest-resource"
import { Access } from "../access-mode"
import type { DataMode } from "../block-mode"
import { Backend as Backend_ } from "./backend"
import { parseBackend } from "./parse-backend"

export type Pv<T extends DataMode = DataMode> = Pv.Pv<T>
export namespace Pv {
    export import Backend = Backend_
    export interface Props<Mode extends DataMode = DataMode> {
        $accessModes: Access
        $storageClass?: External<api_.storage_.v1_.StorageClass>
        $mode?: Mode
        reclaimPolicy?: Reclaim
        $capacity: Unit.Data
        $backend?: Backend
        mountOptions?: string[]
        nodeAffinity?: CDK.VolumeNodeAffinity
    }
    export type Reclaim = "Retain" | "Delete" | "Recycle"
    export type AbsPv<Mode extends DataMode = DataMode> = Refable<api_.v1_.PersistentVolume> & {
        __MODE__: Mode
    }
    @equiv_cdk8s(CDK.KubePersistentVolume)
    @manifest({
        body(self) {
            const pvProps = self.props
            const accessModes = Access.parse(pvProps.$accessModes)
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
    @k8ts(api_.v1_.PersistentVolume)
    @relations({
        needs(self) {
            return {
                storageClass: self.props.$storageClass
            }
        }
    })
    export class Pv<Mode extends DataMode = DataMode> extends ManifestResource<Props<Mode>> {
        __MODE__!: Mode
        readonly kind = api_.v1_.PersistentVolume
    }
}
