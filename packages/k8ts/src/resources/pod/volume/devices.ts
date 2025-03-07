import type { CDK } from "@imports"
import { Persistent } from "../../persistent"
import { DeviceMount } from "./mounts"

interface PvcBackend {
    backend: Persistent.Claim<"Block">
    readOnly?: boolean
}

export type AnyDeviceBackend = PvcBackend
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
        return new DeviceMount(this)
    }

    static make(name: string, input: AnyDeviceBackend) {
        return new Device(name, input)
    }
}
