import { manifest, relations, ResourcesSpec, Unit } from "@k8ts/instruments"
import { CDK } from "../../../_imports"
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
    type PvcResources = PvcResourceSpec["__INPUT__"]
    export interface Props<Mode extends DataMode> extends PvcResources {
        accessModes: Access
        mode?: Mode
        bind: Pv.AbsPv<Mode>
    }

    @k8ts(api.v1_.PersistentVolumeClaim)
    @equiv_cdk8s(CDK.KubePersistentVolumeClaim)
    @relations({
        needs: self => ({
            bind: self.bound
        })
    })
    @manifest({
        body(self): CDK.KubePersistentVolumeClaimProps {
            const { storage, accessModes, mode } = self.props
            const nAccessModes = Access.parse(accessModes)
            return {
                spec: {
                    accessModes: nAccessModes,
                    volumeName: self.props.bind!.name,
                    volumeMode: mode,
                    resources: pvc_ResourcesSpec
                        .parse({
                            storage
                        })
                        .toObject(),
                    storageClassName: "standard"
                }
            }
        }
    })
    export class Pvc<Mode extends DataMode = DataMode> extends ManifestResource<Props<Mode>> {
        kind = api.v1_.PersistentVolumeClaim

        get bound() {
            return this.props.bind as Pv<Mode>
        }
    }
}
