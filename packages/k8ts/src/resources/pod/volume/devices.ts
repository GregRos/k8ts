import type { CDK } from "@imports"
import type { Base } from "../../../node"
import { dependsOn } from "../../../node/base"
import { SubResource } from "../../../node/sub-resource"
import { Persistent } from "../../persistent"
import { Mount } from "../container/mounts"
export type Device = Device.Device
export namespace Device {
    interface PvcBackend {
        backend: Persistent.Claim<"Block">
        readOnly?: boolean
    }

    export type Backend = PvcBackend
    export class Device extends SubResource {
        override kind = "Device" as const
        constructor(
            parent: Base,
            name: string,
            readonly backend: PvcBackend
        ) {
            super(parent, name)
        }

        override get dependsOn() {
            return dependsOn({
                backend: this.backend.backend
            })
        }

        manifest(): CDK.Volume {
            return {
                name: this.name,
                persistentVolumeClaim: {
                    claimName: this.backend.backend.name,
                    readOnly: this.backend.readOnly
                }
            }
        }

        mount() {
            return new Mount.Device(this)
        }
    }

    export function make(parent: Base, name: string, input: Backend) {
        return new Device(parent, name, input)
    }
}
