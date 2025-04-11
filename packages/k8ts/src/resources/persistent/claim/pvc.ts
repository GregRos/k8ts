import { manifest, relations, ResourcesSpec, Unit } from "@k8ts/instruments"
import { CDK } from "../../../_imports"
import { Prefix$ } from "../../../_type/prefix$"
import { MakeError } from "../../../error"
import { External } from "../../../external"
import { k8ts } from "../../../kind-map"
import { api } from "../../../kinds"
import { ManifestResource } from "../../../node"
import { equiv_cdk8s } from "../../../node/equiv-cdk8s"
import { Access } from "../access-mode"
import type { DataMode } from "../block-mode"
import { Pv } from "../volume"

export type Pvc<T extends DataMode = DataMode> = Pvc.Pvc<T>
export namespace Pvc {
    const pvc_ResourcesSpec = ResourcesSpec.make({
        storage: Unit.Data
    })
    type PvcResourceSpec = typeof pvc_ResourcesSpec
    type PvcResources = Prefix$<PvcResourceSpec["__INPUT__"]>
    export interface Props<Mode extends DataMode> extends PvcResources {
        $accessModes: Access
        $mode?: Mode
        $storageClass?: External<api.storage_.v1_.StorageClass>
        $bind?: Pv.AbsPv<Mode>
    }

    @k8ts(api.v1_.PersistentVolumeClaim)
    @equiv_cdk8s(CDK.KubePersistentVolumeClaim)
    @relations({
        needs: self => ({
            bind: self.bound,
            storageClass: self.props.$storageClass
        })
    })
    @manifest({
        body(self): CDK.KubePersistentVolumeClaimProps {
            const { $storage, $accessModes, $mode, $storageClass, $bind } = self.props
            const nAccessModes = Access.parse($accessModes)
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
    export class Pvc<Mode extends DataMode = DataMode> extends ManifestResource<Props<Mode>> {
        kind = api.v1_.PersistentVolumeClaim

        get bound() {
            return this.props.$bind as Pv<Mode>
        }
    }
}
