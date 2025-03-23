import { manifest, relations, type Unit } from "@k8ts/instruments"
import { CDK } from "../../../_imports"
import { api } from "../../../api-kinds"
import { MakeError } from "../../../error"
import { k8ts } from "../../../kind-map"
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
        accessModes: Access
        storageClassName?: string
        mode?: Mode
        reclaimPolicy?: Reclaim
        capacity: Unit.Data
        backend: Backend
        nodeAffinity?: CDK.VolumeNodeAffinity
    }
    export type Reclaim = "Retain" | "Delete" | "Recycle"

    @equiv_cdk8s(CDK.KubePersistentVolume)
    @manifest({
        body(self) {
            const pvProps = self.props
            const accessModes = Access.parse(pvProps.accessModes)
            if (self.props.backend.type === "Local") {
                if (!pvProps.nodeAffinity) {
                    throw new MakeError(
                        `While manifesting ${self.node.format("source")}, PV with Local backend must have nodeAffinity.`
                    )
                }
            }
            let base: CDK.PersistentVolumeSpec = {
                accessModes,
                storageClassName: pvProps.storageClassName ?? "standard",
                capacity: pvProps.capacity
                    ? {
                          storage: CDK.Quantity.fromString(pvProps.capacity)
                      }
                    : undefined,
                volumeMode: pvProps.mode ?? "Filesystem",
                persistentVolumeReclaimPolicy: pvProps.reclaimPolicy ?? "Retain",
                nodeAffinity: pvProps.nodeAffinity
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
    @k8ts(api.v1_.PersistentVolume)
    @relations("none")
    export class Pv<Mode extends DataMode = DataMode> extends ManifestResource<Props<Mode>> {
        readonly kind = api.v1_.PersistentVolume
    }
}
