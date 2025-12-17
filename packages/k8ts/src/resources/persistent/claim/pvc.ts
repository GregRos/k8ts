import { CDK } from "@k8ts/imports"
import { manifest, relations, ResourcesSpec, Unit } from "@k8ts/instruments"
import { Prefix$ } from "../../../_type/prefix$"
import { MakeError } from "../../../error"
import { External } from "../../../external"
import { k8ts } from "../../../kind-map"
import { api2 } from "../../../kinds"
import { ManifestResource } from "../../../node"
import { Access } from "../access-mode"
import type { Pv_VolumeMode } from "../block-mode"
import { Pv } from "../volume"

const StorageClassKind = api2.storage.v1.StorageClass._

export type Pvc<T extends Pv_VolumeMode = Pv_VolumeMode> = Pvc.Pvc<T>
export namespace Pvc {
    const pvc_ResourcesSpec = ResourcesSpec.make({
        storage: Unit.Data
    })
    type Pvc_Resources = Prefix$<(typeof pvc_ResourcesSpec)["__INPUT__"]>
    export interface Pvc_Props<Mode extends Pv_VolumeMode> extends Pvc_Resources {
        $accessModes: Access
        $mode?: Mode
        $storageClass?: External<api2.storage.v1.StorageClass._>
        $bind?: Pv.Pv_Ref<Mode>
    }

    @k8ts(api2.v1.PersistentVolumeClaim._)
    @relations({
        needs: self => ({
            bind: self.bound,
            storageClass: self.props.$storageClass
        })
    })
    @manifest({
        body(self): CDK.KubePersistentVolumeClaimProps {
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
    })
    export class Pvc<Mode extends Pv_VolumeMode = Pv_VolumeMode> extends ManifestResource<
        Pvc_Props<Mode>
    > {
        kind = api2.v1.PersistentVolumeClaim._

        get bound() {
            return this.props.$bind as Pv<Mode>
        }
    }
}
