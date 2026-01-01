import { ResourcePart, type Resource, type ResourceRef } from "@k8ts/instruments"
import type { CDK } from "@k8ts/sample-interfaces"
import { v1 } from "../../../../idents"

export interface Container_Volume_Mount_Attrs<SubPaths extends string = string> {
    subPath?: SubPaths
    readOnly?: boolean
}
export interface Container_Volume_Mount_Source extends Container_Volume_Mount_Attrs {
    $backend: ResourceRef<v1.Pod.Volume._>
}
export interface Container_Volume_Mount_Props extends Container_Volume_Mount_Source {
    mountPath: string
}
export class Container_Volume_Mount extends ResourcePart<Container_Volume_Mount_Props> {
    constructor(parent: Resource, props: Container_Volume_Mount_Props) {
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
