import { ResourcePart, type Resource, type ResourceRef } from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../../../idents"

export interface ContainerVolumeMountAttrs<SubPaths extends string = string> {
    subPath?: SubPaths
    readOnly?: boolean
}
export interface ContainerVolumeMountSource extends ContainerVolumeMountAttrs {
    $backend: ResourceRef<v1.Pod.Volume._>
}
export interface ContainerVolumeMountProps extends ContainerVolumeMountSource {
    mountPath: string
}
export class ContainerVolumeMount extends ResourcePart<ContainerVolumeMountProps> {
    constructor(parent: Resource, props: ContainerVolumeMountProps) {
        super(parent, props.$backend.name, props)
    }
    get ident() {
        return v1.Pod.Container.VolumeMount._
    }

    get path() {
        return this.props.mountPath
    }

    get backend() {
        return this.props.$backend
    }
    protected __submanifest__(): CDK.VolumeMount {
        return {
            name: this.props.$backend.name,
            mountPath: this.props.mountPath,
            readOnly: this.props.readOnly,
            subPath: this.props.subPath
        }
    }
}
