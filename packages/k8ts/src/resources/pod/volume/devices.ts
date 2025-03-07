import type { CDK } from "@imports"
import { Persistent } from "../../persistent"
import { Mount } from "../container/mounts"
export type Device = Device.Device
export namespace Device {
    interface PvcBackend {
        backend: Persistent.Claim<"Block">
        readOnly?: boolean
    }

    export type Backend = PvcBackend
    export class Device {
        constructor(
            readonly name: string,
            readonly backend: PvcBackend
        ) {}

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

    export function make(name: string, input: Backend) {
        return new Device(name, input)
    }
}
