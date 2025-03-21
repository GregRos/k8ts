import { manifest, relations, type Unit } from "@k8ts/instruments"
import { CDK } from "../../../_imports"
import { v1 } from "../../../api-versions"
import { MakeError } from "../../../error"
import { k8ts } from "../../../kind-map"
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

    const ident = v1.kind("PersistentVolume")

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
                storageClassName: pvProps.storageClassName,
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
    @k8ts(ident)
    @relations("none")
    export class Pv<Mode extends DataMode = DataMode> extends ManifestResource<Props<Mode>> {
        declare readonly kind: typeof ident
    }
}
