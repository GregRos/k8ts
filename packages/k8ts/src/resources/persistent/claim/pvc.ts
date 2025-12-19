import { CDK } from "@k8ts/imports"
import {
    ManifestResource,
    ResourcesSpec,
    Unit,
    type Kinded,
    type ResourceEntity
} from "@k8ts/instruments"
import { Prefix$ } from "../../../_type/prefix$"
import { MakeError } from "../../../error"
import { v1 } from "../../../kinds/default"
import { storage } from "../../../kinds/storage"
import { Access } from "../access-mode"
import type { Pv_VolumeMode } from "../block-mode"
import type { Pv, Pv_Ref } from "../volume"

const StorageClassKind = storage.v1.StorageClass._

const pvc_ResourcesSpec = ResourcesSpec.make({
    storage: Unit.Data
})
type Pvc_Resources = Prefix$<(typeof pvc_ResourcesSpec)["__INPUT__"]>
export interface Pvc_Props<Mode extends Pv_VolumeMode> extends Pvc_Resources {
    $accessModes: Access
    $mode?: Mode
    $storageClass?: ResourceEntity & Kinded<typeof StorageClassKind>
    $bind?: Pv_Ref<Mode>
}

export class Pvc<
    Mode extends Pv_VolumeMode = "Filesystem",
    Name extends string = string
> extends ManifestResource<Name, Pvc_Props<Mode>> {
    declare name: Name
    get kind() {
        return v1.PersistentVolumeClaim._
    }

    protected __needs__() {
        const self = this
        return {
            bind: self.bound,
            storageClass: self.props.$storageClass
        }
    }
    protected body(): CDK.KubePersistentVolumeClaimProps {
        const self = this
        const { $storage, $accessModes, $mode, $storageClass, $bind } = self.props
        const nAccessModes = Access.pv_parseAccessMode($accessModes)
        if (!$bind && !$storageClass) {
            throw new MakeError(
                `While manifesting ${self.node.format("source")}, PVC that doesn't have a $bind must have a $storageClass.`
            )
        }
        return {
            spec: {
                accessModes: nAccessModes,
                volumeName: self.props.$bind?.name,
                volumeMode: $mode,
                resources: pvc_ResourcesSpec
                    .parse({
                        storage: $storage
                    })
                    .toObject(),
                storageClassName: self.props.$storageClass?.name ?? "standard"
            }
        }
    }
    get bound() {
        return this.props.$bind as Pv<Mode> | undefined
    }
}
