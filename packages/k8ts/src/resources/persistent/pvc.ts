import type { CDK } from "@imports"
import { ResourcesSpec, Unit } from "@k8ts/instruments"
import { Depends } from "../../graph/base"
import { parseAccessModes, type InputAccessModes, type VolumeMode } from "./enums"
import type { Pv } from "./pv"

const pvc_ResourcesSpec = ResourcesSpec.make({
    storage: Unit.Data
})
type PvcResources = (typeof pvc_ResourcesSpec)["__INPUT__"]
export interface PvcProps<Mode extends VolumeMode = "Filesystem"> extends PvcResources {
    accessModes: InputAccessModes
    mode?: VolumeMode
    name: string
}

export class Pvc<Mode extends VolumeMode = "Filesystem"> extends Depends<PvcProps<Mode>, Pv<Mode>> {
    kind = "PersistentVolumeClaim" as const

    manifest(): CDK.KubePersistentVolumeClaimProps {
        const { storage, accessModes, mode } = this.props
        const name = this.name
        const nAccessModes = parseAccessModes(accessModes)
        return {
            metadata: this.meta.expand(),
            spec: {
                accessModes: nAccessModes,
                volumeName: name,
                volumeMode: mode ? "Block" : "Filesystem",
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
