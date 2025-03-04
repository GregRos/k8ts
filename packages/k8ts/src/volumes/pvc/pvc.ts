import type { KubePersistentVolumeClaimProps } from "@imports"
import type { Meta } from "@k8ts/metadata"
import { parseAccessModes, type InputAccessModes } from "../enums"

export interface LK_PersistentVolumeClaimProps<IsBlock extends boolean = false> {
    accessModes: InputAccessModes
    storage: ReqLimit.Memory.Input
    isBlock?: IsBlock
    name: string
}

export class LK_PersistentVolumeClaim<IsBlock extends boolean = false> {
    kind = "PersistentVolumeClaim" as const

    constructor(
        readonly meta: Meta,
        readonly props: LK_PersistentVolumeClaimProps<IsBlock>
    ) {}

    get name() {
        return this.meta.get("name")
    }
    manifest(): KubePersistentVolumeClaimProps {
        const { storage, accessModes, isBlock } = this.props
        const name = this.name
        const nAccessModes = parseAccessModes(accessModes)
        return {
            metadata: this.meta.expand(),
            spec: {
                accessModes: nAccessModes,
                volumeName: name,
                volumeMode: isBlock ? "Block" : "Filesystem",
                resources: ReqLimit.Storage.parse(storage)
            }
        }
    }
}
