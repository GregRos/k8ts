import type { CDK } from "@imports"
import type { Device } from "./devices"
import type { Volume } from "./volumes"
export interface MountOptions {
    readOnly: boolean
    subPath?: string
}
export class VolumeMount {
    kind = "VolumeMount" as const
    constructor(
        readonly parent: Volume,
        readonly props: MountOptions
    ) {}

    manifest(mountPath: string): CDK.VolumeMount {
        return {
            name: this.parent.name,
            mountPath: mountPath,
            readOnly: this.props.readOnly,
            subPath: this.props.subPath
        }
    }
}

export class DeviceMount {
    kind = "DeviceMount" as const
    constructor(readonly parent: Device) {}

    manifest(devicePath: string): CDK.VolumeDevice {
        return {
            devicePath: devicePath,
            name: this.parent.name
        }
    }
}
