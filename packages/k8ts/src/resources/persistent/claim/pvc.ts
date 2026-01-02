import { ResourcesSpec, ResourceTop, Unit, type ResourceRef } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { Prefix$ } from "../../../_type/prefix$"
import { MakeError } from "../../../error"
import { v1 } from "../../idents/default"
import { storage } from "../../idents/storage"
import { parsePvAccessMode, type PvAccessModes } from "../access-mode"
import type { PvMode } from "../block-mode"
import type { Pv, PvRef } from "../volume"

const StorageClassKind = storage.v1.StorageClass._

const pvc_ResourcesSpec = ResourcesSpec.make({
    storage: Unit.Data
})
type PvcResources = Prefix$<(typeof pvc_ResourcesSpec)["__INPUT__"]>
export interface PvcProps<Mode extends PvMode> extends PvcResources {
    $accessModes: PvAccessModes
    $mode?: Mode
    $storageClass?: ResourceRef<typeof StorageClassKind>
    $bind?: PvRef<Mode>
}

export class Pvc<Mode extends PvMode, Name extends string = string> extends ResourceTop<
    Name,
    PvcProps<Mode>
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
        const { $storage, $accessModes, $mode, $storageClass, $bind } = self.props
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
