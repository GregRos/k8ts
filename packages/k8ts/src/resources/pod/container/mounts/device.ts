import { Resource_Child, type Kind, type Resource_Entity, type Rsc_Ref } from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../../../../kinds"

export interface Container_Device_Mount_Source {
    $backend: Rsc_Ref<v1.Pod.Device._>
}

export interface Container_Mount_Device_Props extends Container_Device_Mount_Source {
    mountPath: string
}

export class Container_Device_Mount extends Resource_Child<Container_Mount_Device_Props> {
    constructor(parent: Resource_Entity, props: Container_Mount_Device_Props) {
        super(parent, props.$backend.name, props)
    }
    get kind() {
        return v1.Pod.Container.DeviceMount._ satisfies Kind.SubKind
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
