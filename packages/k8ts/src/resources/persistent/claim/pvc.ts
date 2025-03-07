import type { CDK } from "@imports"
import { ResourcesSpec, Unit } from "@k8ts/instruments"
import { Base } from "../../../node"
import { v1 } from "../../api-version"
import { K8tsResources } from "../../kind-map"
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

    @K8tsResources.register("PersistentVolumeClaim")
    export class Claim<Mode extends DataMode = DataMode> extends Base<Props<Mode>> {
        api = v1.kind("PersistentVolumeClaim")
        override get dependsOn() {
            return [this.props.bind]
        }
        manifest(): CDK.KubePersistentVolumeClaimProps {
            const { storage, accessModes, mode } = this.props
            const nAccessModes = Access.parse(accessModes)
            return {
                metadata: this.meta.expand(),
                spec: {
                    accessModes: nAccessModes,
                    volumeName: this.props.bind!.name,
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
    }
}
