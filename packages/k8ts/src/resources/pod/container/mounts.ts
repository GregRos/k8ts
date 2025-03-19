import type { CDK } from "../../../_imports"
import type { Device } from "../volume/devices"
import type { Volume } from "../volume/volumes"
export type Mount = Mount.ContainerVolumeMount | Mount.ContainerDeviceMount
export namespace Mount {
    type Path_Rooted = `/${string}`
    export type Path = `${"" | "." | ".."}${Path_Rooted}`

    export interface Options {
        readOnly?: boolean
        subPath?: string
    }
    export class ContainerVolumeMount {
        get kind() {
            return this.parent.kind.parent.subkind("ContainerVolumeMount")
        }
        constructor(
            readonly parent: Volume.PodVolume,
            readonly props: Options
        ) {}

        submanifest(mountPath: string): CDK.VolumeMount {
            return {
                name: this.parent.name,
                mountPath: mountPath,
                readOnly: this.props.readOnly,
                subPath: this.props.subPath
            }
        }
    }

    export class ContainerDeviceMount {
        get kind() {
            return this.parent.kind.parent.subkind("ContainerDeviceMount")
        }
        constructor(readonly parent: Device.PodDevice) {}

        submanifest(devicePath: string): CDK.VolumeDevice {
            return {
                devicePath: devicePath,
                name: this.parent.name
            }
        }
    }
}
