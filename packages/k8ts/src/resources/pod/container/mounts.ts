import type { CDK } from "../../../_imports"
import { api } from "../../../kinds"
import { Volume } from "../volume"
import type { Device } from "../volume/devices"
export type Mount = Mount.ContainerVolumeMount | Mount.ContainerDeviceMount
export namespace Mount {
    type Path_Rooted = `/${string}`
    export type Path = `${"" | "." | ".."}${Path_Rooted}`

    export interface Props {
        readOnly?: boolean
        subPath?: string
        volume: Volume
    }
    export class ContainerVolumeMount {
        readonly kind = api.v1_.Pod_.VolumeMount

        constructor(readonly props: Props) {}

        get volume() {
            return this.props.volume
        }
        submanifest(mountPath: string): CDK.VolumeMount {
            return {
                name: this.props.volume.name,
                mountPath: mountPath,
                readOnly: this.props.readOnly,
                subPath: this.props.subPath
            }
        }
    }

    export interface DeviceMountProps {
        device: Device
    }

    export class ContainerDeviceMount {
        kind = api.v1_.Pod_.DeviceMount
        get volume() {
            return this.props.device
        }
        constructor(readonly props: DeviceMountProps) {}
        submanifest(devicePath: string): CDK.VolumeDevice {
            return {
                devicePath: devicePath,
                name: this.props.device.name
            }
        }
    }
}
