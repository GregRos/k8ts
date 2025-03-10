import type { CDK } from "@imports"
import type { ManifestResource } from "../../../node"
import { dependencies } from "../../../node/dependencies"
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
    export class Device extends SubResource<PvcBackend> {
        get api() {
            return this.parent.api.subkind("Device")
        }
        constructor(
            parent: ManifestResource,
            name: string,
            readonly backend: PvcBackend
        ) {
            super(parent, name, backend)
        }

        override get dependencies() {
            return dependencies({
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

    export function make(parent: ManifestResource, name: string, input: Backend) {
        return new Device(parent, name, input)
    }
}
