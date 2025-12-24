import { Kind } from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../../../kinds/default"
import type { Pod_Volume } from "../volume"
import type { Pod_Device } from "../volume/devices"
export type Path_Rooted = `/${string}`
export type Container_Mount_Path = `${"" | "." | ".."}${Path_Rooted}`

export type Container_Mount = Container_Mount_Volume | Container_Mount_Device
export interface Container_Mount_Props<SubPaths extends string = string> {
    readOnly?: boolean
    subPath?: SubPaths
    volume: Pod_Volume
}
export class Container_Mount_Volume {
    get kind() {
        return v1.Pod.Container.VolumeMount._
    }

    constructor(readonly props: Container_Mount_Props) {}

    get volume() {
        return this.props.volume
    }
    protected __submanifest__(mountPath: string): CDK.VolumeMount {
        return {
            name: this.props.volume.name,
            mountPath: mountPath,
            readOnly: this.props.readOnly,
            subPath: this.props.subPath
        }
    }
}

export interface Container_Mount_Device_Props {
    device: Pod_Device
}

export class Container_Mount_Device {
    get kind() {
        return v1.Pod.Container.DeviceMount._ satisfies Kind.SubKind
    }
    get volume() {
        return this.props.device
    }
    constructor(readonly props: Container_Mount_Device_Props) {}
    protected __submanifest__(devicePath: string): CDK.VolumeDevice {
        return {
            devicePath: devicePath,
            name: this.props.device.name
        }
    }
}
