import type { CDK } from "@imports"
import { connections, manifest, ResourcesSpec, Unit } from "@k8ts/instruments"
import { v1 } from "../../../api-versions"
import { k8ts } from "../../../kind-map"
import { ManifestResource } from "../../../node"
import { Access } from "../access-mode"
import type { DataMode } from "../block-mode"
import type { Volume } from "../volume"

export type Claim<T extends DataMode = DataMode> = Claim.Claim<T>
export namespace Claim {
    const pvc_ResourcesSpec = ResourcesSpec.make({
        storage: Unit.Data
    })
    type PvcResourceSpec = typeof pvc_ResourcesSpec
    type PvcResources = PvcResourceSpec["__INPUT__"]
    export interface Props<Mode extends DataMode> extends PvcResources {
        accessModes: Access
        mode?: Mode
        bind: Volume.Volume<Mode>
    }

    const ident = v1.kind("PersistentVolumeClaim")
    @k8ts(ident)
    @connections({
        needs: self => ({
            bind: self.props.bind
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
    export class Claim<Mode extends DataMode = DataMode> extends ManifestResource<Props<Mode>> {
        kind = ident
    }
}
