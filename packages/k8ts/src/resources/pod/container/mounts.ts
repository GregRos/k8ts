import type { CDK } from "../../../_imports"
import type { Device } from "../volume/devices"
import type { Volume } from "../volume/volumes"
export type Mount = Mount.Volume | Mount.Device
export namespace Mount {
    type Path_Rooted = `/${string}`
    export type Path = `${"" | "." | ".."}${Path_Rooted}`

    export interface Options {
        readOnly?: boolean
        subPath?: string
    }
    export class Volume {
        kind = "VolumeMount" as const
        constructor(
            readonly parent: Volume.Volume,
            readonly props: Options
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

    export class Device {
        kind = "DeviceMount" as const
        constructor(readonly parent: Device.Device) {}

        manifest(devicePath: string): CDK.VolumeDevice {
            return {
                devicePath: devicePath,
                name: this.parent.name
            }
        }
    }
}
