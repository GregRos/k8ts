import {
    Reqs,
    ResourceTop,
    Units,
    type ResourceRef,
    type Resource_Props_Top
} from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { v1 } from "../../../resource-idents/default"
import { storage } from "../../../resource-idents/storage"
import { K8tsResourceError } from "../../errors"
import { parsePvAccessMode, type PvAccessMode_Many } from "../access-mode"
import type { Pv, Pv_Ref } from "../volume"
import type { PvVolumeMode } from "../volume-mode"

const pvc_ResourcesSpec = new Reqs({
    storage: Units.Data
})
export interface Pvc_Props<Mode extends PvVolumeMode>
    extends Resource_Props_Top<CDK.KubePersistentVolumeClaimProps> {
    $accessModes: PvAccessMode_Many
    $mode?: Mode
    $storageClass?: ResourceRef<storage.v1.StorageClass._>
    $bind?: Pv_Ref<Mode>
    $resources: typeof pvc_ResourcesSpec.__INPUT__
}

export class Pvc<Mode extends PvVolumeMode, Name extends string = string> extends ResourceTop<
    Name,
    Pvc_Props<Mode>
> {
    declare name: Name
    get ident() {
        return v1.PersistentVolumeClaim._
    }

    protected __needs__() {
        const self = this
        return {
            bind: self.bound,
            storageClass: self.props.$storageClass
        }
    }
    protected __body__(): CDK.KubePersistentVolumeClaimProps {
        const self = this
        const { $resources, $accessModes, $mode, $storageClass, $bind } = self.props
        const nAccessModes = parsePvAccessMode($accessModes)
        if (!$bind && !$storageClass) {
            throw new K8tsResourceError(
                `While manifesting ${self.vertex.format("source")}, PVC that doesn't have a $bind must have a $storageClass.`
            )
        }
        const spec = {
            accessModes: nAccessModes,
            volumeName: self.props.$bind?.name,
            volumeMode: $mode,
            resources: pvc_ResourcesSpec
                .parse({
                    storage: $resources.storage
                })
                .toObject(),
            storageClassName: self.props.$storageClass?.name ?? "standard"
        } satisfies CDK.PersistentVolumeClaimSpec
        const spec2 = merge(spec, self.props.$overrides)
        return {
            spec: spec2
        }
    }
    get bound() {
        return this.props.$bind as Pv<Mode> | undefined
    }
}
