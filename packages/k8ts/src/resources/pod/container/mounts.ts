import type { CDK } from "@k8ts/imports"
import { api2 } from "../../../kinds"
import { Volume } from "../volume"
import type { Device } from "../volume/devices"
export type Mount = Mount.Container_Mount_Volume | Mount.Container_Mount_Device
export namespace Mount {
    type Path_Rooted = `/${string}`
    export type Path = `${"" | "." | ".."}${Path_Rooted}`

    export interface Container_Mount_Props {
        readOnly?: boolean
        subPath?: string
        volume: Volume
    }
    export class Container_Mount_Volume {
        readonly kind = api2.v1.Pod.Container.VolumeMount._

        constructor(readonly props: Container_Mount_Props) {}

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

    export interface Container_Mount_Device_Props {
        device: Device
    }

    export class Container_Mount_Device {
        kind = api2.v1.Pod.Container.DeviceMount._
        get volume() {
            return this.props.device
        }
        constructor(readonly props: Container_Mount_Device_Props) {}
        submanifest(devicePath: string): CDK.VolumeDevice {
            return {
                devicePath: devicePath,
                name: this.props.device.name
            }
        }
    }
}
