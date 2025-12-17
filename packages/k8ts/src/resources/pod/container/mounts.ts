import type { CDK } from "@k8ts/imports"
import { Kind } from "@k8ts/instruments"
import { v1 } from "../../../kinds/default"
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
        readonly kind = v1.Pod.Container.VolumeMount._

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
        kind = v1.Pod.Container.DeviceMount._ satisfies Kind.SubKind
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
