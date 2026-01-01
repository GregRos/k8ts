import {
    ResourcePart,
    type Ident_ResourcePart,
    type Resource,
    type ResourceRef
} from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../../../../idents"

export interface Container_Device_Mount_Source {
    $backend: ResourceRef<v1.Pod.Device._>
}

export interface Container_Mount_Device_Props extends Container_Device_Mount_Source {
    mountPath: string
}

export class Container_Device_Mount extends ResourcePart<Container_Mount_Device_Props> {
    constructor(parent: Resource, props: Container_Mount_Device_Props) {
        super(parent, props.$backend.name, props)
    }
    get ident() {
        return v1.Pod.Container.DeviceMount._ satisfies Ident_ResourcePart
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
