import {
    ResourcePart,
    type Resource,
    type Resource_Props,
    type ResourceRef
} from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { v1 } from "../../../../../idents"

export interface ContainerVolumeMount_Input<SubPaths extends string = string>
    extends Resource_Props<CDK.VolumeMount> {
    subPath?: SubPaths
    readOnly?: boolean
}
export interface ContainerVolumeMount_Unbound extends ContainerVolumeMount_Input {
    $backend: ResourceRef<v1.Pod.Volume._>
}
export interface ContainerVolumeMount_Props extends ContainerVolumeMount_Unbound {
    mountPath: string
}
export class ContainerVolumeMount extends ResourcePart<ContainerVolumeMount_Props> {
    constructor(parent: Resource, props: ContainerVolumeMount_Props) {
        super(parent, props.$backend.ident.name, props)
    }
    get kind() {
        return v1.Pod.Container.VolumeMount._
    }

    get path() {
        return this.props.mountPath
    }

    get backend() {
        return this.props.$backend
    }
    protected __submanifest__(): CDK.VolumeMount {
        const body = {
            name: this.props.$backend.ident.name,
            mountPath: this.props.mountPath,
            readOnly: this.props.readOnly,
            subPath: this.props.subPath
        }
        return merge(body, this.props.$overrides)
    }
}
