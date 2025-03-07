import type { CDK } from "@imports"
import { ResourcesSpec, Unit } from "@k8ts/instruments"
import { Base } from "../../node/base"
import { v1 } from "../api-version"
import { K8tsResources } from "../kind-map"
import { parseAccessModes, type InputAccessModes, type PvMode } from "./enums"
import type { Pv } from "./pv"

const pvc_ResourcesSpec = ResourcesSpec.make({
    storage: Unit.Data
})
type PvcResources = (typeof pvc_ResourcesSpec)["__INPUT__"]
export interface PvcProps<Mode extends PvMode> extends PvcResources {
    accessModes: InputAccessModes
    mode?: PvMode
    bind: Pv<Mode>
}

@K8tsResources.register("PersistentVolumeClaim")
export class Pvc<Mode extends PvMode = PvMode> extends Base<PvcProps<Mode>> {
    api = v1.kind("PersistentVolumeClaim")
    override get dependsOn() {
        return [this.props.bind]
    }
    manifest(): CDK.KubePersistentVolumeClaimProps {
        const { storage, accessModes, mode } = this.props
        const nAccessModes = parseAccessModes(accessModes)
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
