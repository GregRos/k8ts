import {
    ResourcePart,
    type IdentResourcePart,
    type Resource,
    type ResourceRef
} from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../../../../idents"

export interface ContainerDeviceMountSource {
    $backend: ResourceRef<v1.Pod.Device._>
}

export interface ContainerMountDeviceProps extends ContainerDeviceMountSource {
    mountPath: string
}

export class ContainerDeviceMount extends ResourcePart<ContainerMountDeviceProps> {
    constructor(parent: Resource, props: ContainerMountDeviceProps) {
        super(parent, props.$backend.name, props)
    }
    get ident() {
        return v1.Pod.Container.DeviceMount._ satisfies IdentResourcePart
    }
    get backend() {
        return this.props.$backend
    }

    get path() {
        return this.props.mountPath
    }
    protected __submanifest__(): CDK.VolumeDevice {
        return {
            devicePath: this.props.mountPath,
            name: this.props.$backend.name
        }
    }
}
