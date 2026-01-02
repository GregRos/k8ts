import { Reqs, ResourceTop, Units, type ResourceRef } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { MakeError } from "../../../error"
import { v1 } from "../../idents/default"
import { storage } from "../../idents/storage"
import { parsePvAccessMode, type PvAccessMode_Many } from "../access-mode"
import type { Pv, Pv_Ref } from "../volume"
import type { PvVolumeMode } from "../volume-mode"

const pvc_ResourcesSpec = new Reqs({
    storage: Units.Data
})
export interface Pvc_Props<Mode extends PvVolumeMode> {
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
    protected body(): CDK.KubePersistentVolumeClaimProps {
        const self = this
        const { $resources, $accessModes, $mode, $storageClass, $bind } = self.props
        const nAccessModes = parsePvAccessMode($accessModes)
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
                        storage: $resources.storage
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
