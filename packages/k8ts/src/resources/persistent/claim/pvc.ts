import {
    K8sResource,
    Reqs,
    Units,
    type ResourceRef,
    type Resource_Props_Top
} from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { v1 } from "../../../gvks/default"
import { storage } from "../../../gvks/storage"
import { parsePvAccessMode, type PvAccessMode_Many } from "../access-mode"
import type { Pv_Ref } from "../volume"
import type { PvVolumeMode } from "../volume-mode"

const pvcReqs = new Reqs({
    storage: Units.Data
})
export interface Pvc_Props<Mode extends PvVolumeMode>
    extends Resource_Props_Top<CDK.KubePersistentVolumeClaimProps> {
    $accessModes: PvAccessMode_Many
    $mode?: Mode
    $storageClass?: ResourceRef<storage.v1.StorageClass._>
    $bind?: Pv_Ref<Mode>
    $resources: typeof pvcReqs.__INPUT__
}

export class Pvc<Mode extends PvVolumeMode, Name extends string = string> extends K8sResource<
    Name,
    Pvc_Props<Mode>
> {
    get kind() {
        return v1.PersistentVolumeClaim._
    }

    protected __needs__() {
        const self = this
        return {
            bind: self.props.$bind,
            storageClass: self.props.$storageClass
        }
    }
    protected __body__(): CDK.KubePersistentVolumeClaimProps {
        const self = this
        const { $resources, $accessModes, $mode, $storageClass, $bind } = self.props
        const nAccessModes = parsePvAccessMode($accessModes)

        const spec = {
            accessModes: nAccessModes,
            volumeName: self.props.$bind?.ident.name,
            volumeMode: $mode,
            resources: pvcReqs
                .parse({
                    storage: $resources.storage
                })
                .toObject(),
            storageClassName: self.props.$storageClass?.ident.name ?? "standard"
        } satisfies CDK.PersistentVolumeClaimSpec
        const spec2 = merge(spec, self.props.$overrides)
        return {
            spec: spec2
        }
    }
}
