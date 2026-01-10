import {
    ResourcePart,
    type Gvk_SubKind,
    type ResourceEntity,
    type ResourceRef,
    type Resource_Props
} from "@k8ts/instruments"
import type { K8S } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { v1 } from "../../../../../gvks"

export interface ContainerDeviceMount_Input extends Resource_Props<K8S.VolumeDevice> {
    $backend: ResourceRef<v1.Pod.Device._>
}

export interface ContainerMountDevice_Props extends ContainerDeviceMount_Input {
    mountPath: string
}

export class ContainerDeviceMount extends ResourcePart<ContainerMountDevice_Props> {
    constructor(parent: ResourceEntity, props: ContainerMountDevice_Props) {
        super(parent, props.$backend.ident.name, props)
    }
    get kind() {
        return v1.Pod.Container.DeviceMount._ satisfies Gvk_SubKind
    }
    get backend() {
        return this.props.$backend
    }

    get path() {
        return this.props.mountPath
    }
    protected __submanifest__(): K8S.VolumeDevice {
        const body = {
            devicePath: this.props.mountPath,
            name: this.props.$backend.ident.name
        }
        return merge(body, this.props.$$manifest)
    }
}
